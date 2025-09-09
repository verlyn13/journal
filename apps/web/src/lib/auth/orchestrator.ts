// Authentication Orchestrator - Central authentication coordination

import type {
  AuthError,
  AuthMethod,
  AuthProvider,
  AuthResult,
  AuthUser,
  MagicLinkConfig,
  OAuthConfig,
  OAuthTokenResponse,
  PasskeyOptions,
  PasskeyRegistrationOptions,
} from './types';
import { AuthErrorCode } from './types';

export class AuthenticationOrchestrator {
  private readonly passkeysSupported: boolean;
  private readonly apiBaseUrl: string;
  private abortController: AbortController | null = null;

  constructor(apiBaseUrl: string = '/api/auth') {
    this.apiBaseUrl = apiBaseUrl;
    this.passkeysSupported = this.checkPasskeySupport();
  }

  // Main authentication entry point
  async authenticate(): Promise<AuthResult> {
    try {
      // Try passkey first if supported
      if (this.passkeysSupported) {
        try {
          const result = await this.passkeyAuth();
          if (result.success) return result;
        } catch (_error) {
          }
      }

      // Try OAuth providers
      const providers: AuthProvider[] = ['apple', 'google', 'github'];
      for (const provider of providers) {
        if (await this.checkProviderAvailable(provider)) {
          return this.oauthFlow(provider);
        }
      }

      // Ultimate fallback to magic link
      return this.magicLinkFlow();
    } catch (error) {
      return {
        success: false,
        error: this.createError('UNKNOWN_ERROR', error),
        method: 'session',
      };
    }
  }

  // Register a new passkey
  async registerPasskey(user: AuthUser, name: string): Promise<AuthResult> {
    if (!this.passkeysSupported) {
      return {
        success: false,
        error: this.createError('PASSKEY_NOT_SUPPORTED'),
        method: 'passkey',
      };
    }

    try {
      // Get registration options from server
      const options = await this.getPasskeyRegistrationOptions(user);

      // Create credential
      const credential = (await navigator.credentials.create({
        publicKey: options,
      })) as PublicKeyCredential;

      // Verify with server
      const result = await this.verifyPasskeyRegistration(credential, name);

      return {
        success: true,
        user: result.user,
        method: 'passkey',
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError('PASSKEY_REGISTRATION_FAILED', error),
        method: 'passkey',
      };
    }
  }

  // Passkey authentication
  private async passkeyAuth(): Promise<AuthResult> {
    try {
      const options = await this.getPasskeyOptions();

      const assertion = (await navigator.credentials.get({
        publicKey: options,
      })) as PublicKeyCredential;

      return this.verifyAssertion(assertion);
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err?.name === 'NotAllowedError') {
        throw this.createError('USER_CANCELLED', error);
      }
      throw this.createError('PASSKEY_AUTHENTICATION_FAILED', error);
    }
  }

  // OAuth flow
  private async oauthFlow(provider: AuthProvider): Promise<AuthResult> {
    try {
      const config = await this.getOAuthConfig(provider);
      const authUrl = this.buildOAuthUrl(config);

      // Open OAuth popup or redirect
      const authCode = await this.openOAuthWindow(authUrl);

      // Exchange code for tokens
      const tokens = await this.exchangeOAuthCode(authCode, provider);

      // Get user info
      const user = await this.fetchOAuthUser(tokens.accessToken, provider);

      return {
        success: true,
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        method: `oauth-${provider}` as AuthMethod,
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError('OAUTH_PROVIDER_ERROR', error),
        method: `oauth-${provider}` as AuthMethod,
      };
    }
  }

  // Magic link flow
  private async magicLinkFlow(email?: string): Promise<AuthResult> {
    try {
      // If no email provided, prompt user
      if (!email) {
        email = await this.promptForEmail();
        if (!email) {
          return {
            success: false,
            error: this.createError('USER_CANCELLED'),
            method: 'magic-link',
          };
        }
      }

      // Send magic link
      await this.sendMagicLink({ email });

      // Wait for verification (polling or websocket)
      const verification = await this.waitForMagicLinkVerification(email);

      // Exchange for session
      const result = await this.verifyMagicLink(verification);

      return {
        ...result,
        method: 'magic-link',
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError('MAGIC_LINK_EXPIRED', error),
        method: 'magic-link',
      };
    }
  }

  // Helper: Check passkey support
  private checkPasskeySupport(): boolean {
    return (
      typeof window !== 'undefined' &&
      'credentials' in navigator &&
      'PublicKeyCredential' in window &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    );
  }

  // Helper: Check if OAuth provider is available
  private async checkProviderAvailable(provider: AuthProvider): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/oauth/${provider}/available`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Helper: Get passkey options from server
  private async getPasskeyOptions(): Promise<PasskeyOptions> {
    const response = await fetch(`${this.apiBaseUrl}/webauthn/authenticate/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to get passkey options');
    }

    const data = await response.json();
    return this.convertServerOptions(data);
  }

  // Helper: Get passkey registration options
  private async getPasskeyRegistrationOptions(user: AuthUser): Promise<PasskeyRegistrationOptions> {
    const response = await fetch(`${this.apiBaseUrl}/webauthn/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!response.ok) {
      throw new Error('Failed to get registration options');
    }

    const data = await response.json();
    return this.convertServerRegistrationOptions(data);
  }

  // Helper: Verify passkey assertion
  private async verifyAssertion(credential: PublicKeyCredential): Promise<AuthResult> {
    const response = await fetch(`${this.apiBaseUrl}/webauthn/authenticate/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.credentialToJSON(credential)),
    });

    if (!response.ok) {
      throw new Error('Failed to verify assertion');
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
      method: 'passkey',
    };
  }

  // Helper: Verify passkey registration
  private async verifyPasskeyRegistration(
    credential: PublicKeyCredential,
    name: string,
  ): Promise<{ user: AuthUser }> {
    const response = await fetch(`${this.apiBaseUrl}/webauthn/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: this.credentialToJSON(credential),
        name,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify registration');
    }

    return response.json();
  }

  // Helper: Convert credential to JSON
  private credentialToJSON(credential: PublicKeyCredential): unknown {
    const response = credential.response as AuthenticatorAssertionResponse;
    return {
      id: credential.id,
      rawId: this.bufferToBase64(credential.rawId),
      response: {
        clientDataJSON: this.bufferToBase64(response.clientDataJSON),
        authenticatorData: this.bufferToBase64(response.authenticatorData),
        signature: this.bufferToBase64(response.signature),
        userHandle: response.userHandle ? this.bufferToBase64(response.userHandle) : null,
      },
      type: credential.type,
    };
  }

  // Helper: Buffer to base64
  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Helper: Base64 to buffer
  private base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Helper: Convert server options
  private convertServerOptions(data: unknown): PasskeyOptions {
    type Cred = { id: string } & Record<string, unknown>;
    type ServerData = { challenge: string; allowCredentials?: Cred[] } & Record<string, unknown>;
    const d = data as ServerData;
    return {
      ...(d as Record<string, unknown>),
      challenge: this.base64ToBuffer(d.challenge),
      allowCredentials: d.allowCredentials?.map((cred: Cred) => ({
        ...cred,
        id: this.base64ToBuffer(cred.id),
      })),
    } as unknown as PasskeyOptions;
  }

  // Helper: Convert server registration options
  private convertServerRegistrationOptions(data: unknown): PasskeyRegistrationOptions {
    type User = { id: string } & Record<string, unknown>;
    type ServerData = { challenge: string; user: User } & Record<string, unknown>;
    const d = data as ServerData;
    return {
      ...(d as Record<string, unknown>),
      challenge: this.base64ToBuffer(d.challenge),
      user: {
        ...d.user,
        id: this.base64ToBuffer(d.user.id),
      },
    } as unknown as PasskeyRegistrationOptions;
  }

  // OAuth helpers
  private async getOAuthConfig(provider: AuthProvider): Promise<OAuthConfig> {
    const response = await fetch(`${this.apiBaseUrl}/oauth/${provider}/config`);
    if (!response.ok) throw new Error('Failed to get OAuth config');
    return response.json();
  }

  private buildOAuthUrl(config: OAuthConfig): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(' '),
      response_type: 'code',
      state: config.state || crypto.randomUUID(),
    });

    const baseUrls = {
      google: 'https://accounts.google.com/o/oauth2/v2/auth',
      github: 'https://github.com/login/oauth/authorize',
      apple: 'https://appleid.apple.com/auth/authorize',
    };

    return `${baseUrls[config.provider]}?${params}`;
  }

  private async openOAuthWindow(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const popup = window.open(url, 'oauth', 'width=500,height=600');
      if (!popup) {
        reject(new Error('Popup blocked'));
        return;
      }

      const interval = setInterval(() => {
        try {
          if (popup.location.href.includes('code=')) {
            const urlParams = new URLSearchParams(popup.location.search);
            const code = urlParams.get('code');
            clearInterval(interval);
            popup.close();
            if (code) resolve(code);
            else reject(new Error('No auth code received'));
          }
        } catch (_e) {
          // Cross-origin, ignore
        }
      }, 500);
    });
  }

  private async exchangeOAuthCode(
    code: string,
    provider: AuthProvider,
  ): Promise<OAuthTokenResponse> {
    const response = await fetch(`${this.apiBaseUrl}/oauth/${provider}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) throw new Error('Failed to exchange OAuth code');
    return response.json();
  }

  private async fetchOAuthUser(token: string, provider: AuthProvider): Promise<AuthUser> {
    const response = await fetch(`${this.apiBaseUrl}/oauth/${provider}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch OAuth user');
    return response.json();
  }

  // Magic link helpers
  private async promptForEmail(): Promise<string | undefined> {
    // This would be replaced with a proper UI component
    const email = prompt('Enter your email for magic link:');
    return email ?? undefined;
  }

  private async sendMagicLink(config: MagicLinkConfig): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/magic-link/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Failed to send magic link');
  }

  private async waitForMagicLinkVerification(email: string): Promise<unknown> {
    // Poll or use WebSocket for real-time verification
    // This is a simplified polling implementation
    const maxAttempts = 60; // 5 minutes
    const pollInterval = 5000; // 5 seconds

    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`${this.apiBaseUrl}/magic-link/status?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        if (data.verified) return data.verification;
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
    throw new Error('Magic link verification timeout');
  }

  private async verifyMagicLink(verification: unknown): Promise<AuthResult> {
    const response = await fetch(`${this.apiBaseUrl}/magic-link/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verification),
    });
    if (!response.ok) throw new Error('Failed to verify magic link');
    const data = await response.json();
    return {
      success: true,
      user: data.user,
      token: data.token,
      refreshToken: data.refreshToken,
      method: 'magic-link',
    };
  }

  // Error helper
  private createError(code: string, details?: unknown): AuthError {
    const messages: Record<string, string> = {
      PASSKEY_NOT_SUPPORTED: 'Passkeys are not supported on this device',
      PASSKEY_REGISTRATION_FAILED: 'Failed to register passkey',
      PASSKEY_AUTHENTICATION_FAILED: 'Failed to authenticate with passkey',
      OAUTH_PROVIDER_ERROR: 'OAuth provider error',
      MAGIC_LINK_EXPIRED: 'Magic link has expired',
      NETWORK_ERROR: 'Network error occurred',
      INVALID_CREDENTIALS: 'Invalid credentials',
      USER_CANCELLED: 'Authentication cancelled by user',
      UNKNOWN_ERROR: 'An unknown error occurred',
    };

    const known = (Object.keys(messages) as Array<keyof typeof messages>).includes(
      code as keyof typeof messages,
    );
    const finalCode = (known ? (code as keyof typeof messages) : 'UNKNOWN_ERROR') as keyof typeof messages;
    return {
      code: AuthErrorCode[finalCode],
      message: messages[finalCode],
      details,
    };
  }

  // Cleanup
  destroy(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
