// Authentication System Types

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
  error?: AuthError;
  method: AuthMethod;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verified: boolean;
  passkeys?: PasskeyCredential[];
  providers?: AuthProvider[];
  createdAt: Date;
  lastLogin: Date;
}

export interface PasskeyCredential {
  id: string;
  publicKey: string;
  name: string;
  lastUsed?: Date;
  createdAt: Date;
}

export type AuthMethod = 
  | 'passkey' 
  | 'oauth-apple' 
  | 'oauth-google' 
  | 'oauth-github' 
  | 'magic-link'
  | 'session';

export type AuthProvider = 'apple' | 'google' | 'github';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: unknown;
}

export enum AuthErrorCode {
  PASSKEY_NOT_SUPPORTED = 'PASSKEY_NOT_SUPPORTED',
  PASSKEY_REGISTRATION_FAILED = 'PASSKEY_REGISTRATION_FAILED',
  PASSKEY_AUTHENTICATION_FAILED = 'PASSKEY_AUTHENTICATION_FAILED',
  OAUTH_PROVIDER_ERROR = 'OAUTH_PROVIDER_ERROR',
  MAGIC_LINK_EXPIRED = 'MAGIC_LINK_EXPIRED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_CANCELLED = 'USER_CANCELLED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// WebAuthn Types
export interface PasskeyOptions {
  challenge: ArrayBuffer;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
  allowCredentials?: PublicKeyCredentialDescriptor[];
}

export interface PasskeyRegistrationOptions {
  challenge: ArrayBuffer;
  user: {
    id: ArrayBuffer;
    name: string;
    displayName: string;
  };
  rp: {
    name: string;
    id?: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
}

// OAuth Types
export interface OAuthConfig {
  provider: AuthProvider;
  clientId: string;
  redirectUri: string;
  scope: string[];
  state?: string;
  nonce?: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

// Magic Link Types
export interface MagicLinkConfig {
  email: string;
  redirectUrl?: string;
  expiresIn?: number; // seconds
  metadata?: Record<string, unknown>;
}

export interface MagicLinkVerification {
  token: string;
  email: string;
  timestamp: number;
}

// Session Types
export interface AuthSession {
  user: AuthUser;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  method: AuthMethod;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: AuthError | null;
}

// Authentication Flow Events
export interface AuthEvent {
  type: AuthEventType;
  timestamp: Date;
  data?: unknown;
}

export enum AuthEventType {
  LOGIN_STARTED = 'LOGIN_STARTED',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_REFRESH = 'SESSION_REFRESH',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PASSKEY_REGISTERED = 'PASSKEY_REGISTERED',
  PASSKEY_REMOVED = 'PASSKEY_REMOVED',
}