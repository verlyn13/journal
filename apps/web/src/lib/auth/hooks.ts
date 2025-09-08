// Authentication React Hooks

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthenticationOrchestrator } from './orchestrator';
import { AuthEventType } from './types';
import type {
  AuthError,
  AuthEvent,
  AuthProvider,
  AuthResult,
  AuthSession,
  AuthState,
  AuthUser,
  PasskeyCredential,
} from './types';

// Main authentication hook
export function useAuth(apiBaseUrl?: string) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    error: null,
  });

  const orchestratorRef = useRef<AuthenticationOrchestrator>();
  const eventListenersRef = useRef<Map<AuthEventType, Set<(event: AuthEvent) => void>>>(new Map());

  // Initialize orchestrator
  useEffect(() => {
    orchestratorRef.current = new AuthenticationOrchestrator(apiBaseUrl);

    // Check existing session
    checkSession();

    return () => {
      orchestratorRef.current?.destroy();
    };
  }, [apiBaseUrl]);

  // Check existing session
  const checkSession = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const sessionData = localStorage.getItem('auth_session');
      if (sessionData) {
        const session: AuthSession = JSON.parse(sessionData);
        if (new Date(session.expiresAt) > new Date()) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: session.user,
            session,
            error: null,
          });
          emitEvent({ type: AuthEventType.SESSION_REFRESH, timestamp: new Date() });
          return;
        } else {
          // Session expired
          localStorage.removeItem('auth_session');
          emitEvent({ type: AuthEventType.SESSION_EXPIRED, timestamp: new Date() });
        }
      }
    } catch (error) {
      console.error('Failed to check session', error);
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  // Login
  const login = useCallback(async (): Promise<AuthResult> => {
    if (!orchestratorRef.current) {
      return {
        success: false,
        error: { code: 'UNKNOWN_ERROR' as any, message: 'Orchestrator not initialized' },
        method: 'session',
      };
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    emitEvent({ type: AuthEventType.LOGIN_STARTED, timestamp: new Date() });

    try {
      const result = await orchestratorRef.current.authenticate();

      if (result.success && result.user) {
        const session: AuthSession = {
          user: result.user,
          token: result.token!,
          refreshToken: result.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          method: result.method,
        };

        localStorage.setItem('auth_session', JSON.stringify(session));

        setState({
          isAuthenticated: true,
          isLoading: false,
          user: result.user,
          session,
          error: null,
        });

        emitEvent({
          type: AuthEventType.LOGIN_SUCCESS,
          timestamp: new Date(),
          data: result,
        });

        return result;
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || null,
        }));

        emitEvent({
          type: AuthEventType.LOGIN_FAILED,
          timestamp: new Date(),
          data: result.error,
        });

        return result;
      }
    } catch (error) {
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR' as any,
        message: 'Authentication failed',
        details: error,
      };

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: authError,
      }));

      emitEvent({
        type: AuthEventType.LOGIN_FAILED,
        timestamp: new Date(),
        data: authError,
      });

      return {
        success: false,
        error: authError,
        method: 'session',
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    localStorage.removeItem('auth_session');
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      error: null,
    });
    emitEvent({ type: AuthEventType.LOGOUT, timestamp: new Date() });
  }, []);

  // Register passkey
  const registerPasskey = useCallback(
    async (name: string): Promise<boolean> => {
      if (!orchestratorRef.current || !state.user) {
        return false;
      }

      try {
        const result = await orchestratorRef.current.registerPasskey(state.user, name);

        if (result.success) {
          // Update user with new passkey
          setState((prev) => ({
            ...prev,
            user: result.user || prev.user,
          }));

          emitEvent({
            type: AuthEventType.PASSKEY_REGISTERED,
            timestamp: new Date(),
            data: { name },
          });

          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to register passkey', error);
        return false;
      }
    },
    [state.user],
  );

  // Event emitter
  const emitEvent = useCallback((event: AuthEvent) => {
    const listeners = eventListenersRef.current.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }, []);

  // Subscribe to events
  const on = useCallback((type: AuthEventType, listener: (event: AuthEvent) => void) => {
    if (!eventListenersRef.current.has(type)) {
      eventListenersRef.current.set(type, new Set());
    }
    eventListenersRef.current.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      eventListenersRef.current.get(type)?.delete(listener);
    };
  }, []);

  return {
    ...state,
    login,
    logout,
    registerPasskey,
    checkSession,
    on,
  };
}

// Hook for checking passkey support
export function usePasskeySupport() {
  const [supported, setSupported] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (
          typeof window !== 'undefined' &&
          'credentials' in navigator &&
          'PublicKeyCredential' in window
        ) {
          const available =
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setSupported(available);
        }
      } catch (error) {
        console.error('Failed to check passkey support', error);
      } finally {
        setChecking(false);
      }
    };

    checkSupport();
  }, []);

  return { supported, checking };
}

// Hook for managing user passkeys
export function usePasskeys(user: AuthUser | null) {
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's passkeys
  const fetchPasskeys = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/passkeys?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPasskeys(data.passkeys);
      } else {
        throw new Error('Failed to fetch passkeys');
      }
    } catch (error) {
      setError('Failed to load passkeys');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete a passkey
  const deletePasskey = useCallback(
    async (passkeyId: string): Promise<boolean> => {
      if (!user) return false;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/auth/passkeys/${passkeyId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          setPasskeys((prev) => prev.filter((p) => p.id !== passkeyId));
          return true;
        } else {
          throw new Error('Failed to delete passkey');
        }
      } catch (error) {
        setError('Failed to delete passkey');
        console.error(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // Rename a passkey
  const renamePasskey = useCallback(
    async (passkeyId: string, newName: string): Promise<boolean> => {
      if (!user) return false;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/auth/passkeys/${passkeyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, name: newName }),
        });

        if (response.ok) {
          setPasskeys((prev) =>
            prev.map((p) => (p.id === passkeyId ? { ...p, name: newName } : p)),
          );
          return true;
        } else {
          throw new Error('Failed to rename passkey');
        }
      } catch (error) {
        setError('Failed to rename passkey');
        console.error(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  return {
    passkeys,
    loading,
    error,
    fetchPasskeys,
    deletePasskey,
    renamePasskey,
  };
}

// Hook for OAuth provider status
export function useOAuthProviders() {
  const [providers, setProviders] = useState<
    {
      provider: AuthProvider;
      available: boolean;
      connected: boolean;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProviders = async () => {
      const providerList: AuthProvider[] = ['google', 'github', 'apple'];
      const results = await Promise.all(
        providerList.map(async (provider) => {
          try {
            const response = await fetch(`/api/auth/oauth/${provider}/status`);
            const data = await response.json();
            return {
              provider,
              available: data.available || false,
              connected: data.connected || false,
            };
          } catch {
            return {
              provider,
              available: false,
              connected: false,
            };
          }
        }),
      );
      setProviders(results);
      setLoading(false);
    };

    checkProviders();
  }, []);

  const connectProvider = useCallback(async (provider: AuthProvider): Promise<boolean> => {
    try {
      const response = await fetch(`/api/auth/oauth/${provider}/connect`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
        return true;
      }
      return false;
    } catch (error) {
      // TODO: Implement proper error logging service
      return false;
    }
  }, []);

  const disconnectProvider = useCallback(async (provider: AuthProvider): Promise<boolean> => {
    try {
      const response = await fetch(`/api/auth/oauth/${provider}/disconnect`, {
        method: 'POST',
      });

      if (response.ok) {
        setProviders((prev) =>
          prev.map((p) => (p.provider === provider ? { ...p, connected: false } : p)),
        );
        return true;
      }
      return false;
    } catch (error) {
      // TODO: Implement proper error logging service
      return false;
    }
  }, []);

  return {
    providers,
    loading,
    connectProvider,
    disconnectProvider,
  };
}

// Session refresh hook
export function useSessionRefresh(session: AuthSession | null) {
  const [refreshing, setRefreshing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const refreshSession = useCallback(async (): Promise<AuthSession | null> => {
    if (!session?.refreshToken) return null;

    setRefreshing(true);
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSession: AuthSession = {
          ...session,
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt: new Date(data.expiresAt),
        };

        localStorage.setItem('auth_session', JSON.stringify(newSession));
        return newSession;
      }
      return null;
    } catch (error) {
      // TODO: Implement proper error logging service
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [session]);

  // Auto-refresh before expiry
  useEffect(() => {
    if (!session) return;

    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000;

    if (refreshTime > 0) {
      timeoutRef.current = setTimeout(() => {
        refreshSession();
      }, refreshTime);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, refreshSession]);

  return { refreshing, refreshSession };
}
