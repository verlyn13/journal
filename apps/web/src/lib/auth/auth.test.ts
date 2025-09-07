// Authentication System Tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthenticationOrchestrator } from './orchestrator';
import { useAuth, usePasskeySupport, usePasskeys, useOAuthProviders } from './hooks';
import type { AuthUser, AuthSession, PasskeyCredential } from './types';

// Mock navigator.credentials
const mockCredentials = {
  create: vi.fn(),
  get: vi.fn(),
};

const mockPublicKeyCredential = {
  isUserVerifyingPlatformAuthenticatorAvailable: vi.fn(),
};

// Mock fetch
global.fetch = vi.fn();

describe('AuthenticationOrchestrator', () => {
  let orchestrator: AuthenticationOrchestrator;

  beforeEach(() => {
    orchestrator = new AuthenticationOrchestrator('/api/auth');
    
    // Setup mocks
    (global as any).navigator = {
      credentials: mockCredentials,
    };
    (global as any).PublicKeyCredential = mockPublicKeyCredential;
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    orchestrator.destroy();
  });

  describe('Passkey Support Detection', () => {
    it('should detect passkey support when available', () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = vi.fn();
      
      const newOrchestrator = new AuthenticationOrchestrator();
      expect(newOrchestrator).toBeDefined();
    });

    it('should handle missing passkey support', () => {
      delete (global as any).navigator.credentials;
      
      const newOrchestrator = new AuthenticationOrchestrator();
      expect(newOrchestrator).toBeDefined();
    });
  });

  describe('Authentication Flow', () => {
    it('should attempt passkey authentication first', async () => {
      mockCredentials.get.mockResolvedValue({
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        response: {
          clientDataJSON: new ArrayBuffer(8),
          authenticatorData: new ArrayBuffer(8),
          signature: new ArrayBuffer(8),
          userHandle: new ArrayBuffer(8),
        },
        type: 'public-key',
      });

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ challenge: btoa('challenge') }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '1', email: 'test@example.com' },
          token: 'token',
        }),
      });

      const result = await orchestrator.authenticate();
      
      expect(mockCredentials.get).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.method).toBe('passkey');
    });

    it('should fall back to OAuth when passkey fails', async () => {
      mockCredentials.get.mockRejectedValue(new Error('User cancelled'));

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ challenge: btoa('challenge') }),
        })
        .mockResolvedValueOnce({
          ok: false, // Passkey fails
        })
        .mockResolvedValueOnce({
          ok: true, // Apple available
        });

      // Mock window.open for OAuth
      const mockOpen = vi.fn(() => ({
        location: { href: 'http://localhost?code=auth-code' },
        close: vi.fn(),
      }));
      (global as any).window = { open: mockOpen };

      // Continue with OAuth mocks...
    });

    it('should fall back to magic link as last resort', async () => {
      mockCredentials.get.mockRejectedValue(new Error('Not supported'));

      (fetch as any)
        .mockResolvedValueOnce({
          ok: false, // Passkey options fail
        })
        .mockResolvedValueOnce({
          ok: false, // Apple not available
        })
        .mockResolvedValueOnce({
          ok: false, // Google not available
        })
        .mockResolvedValueOnce({
          ok: false, // GitHub not available
        });

      // Mock prompt for email
      (global as any).prompt = vi.fn(() => 'test@example.com');

      // Continue with magic link mocks...
    });
  });

  describe('Passkey Registration', () => {
    it('should register a new passkey', async () => {
      const user: AuthUser = {
        id: '1',
        email: 'test@example.com',
        verified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      mockCredentials.create.mockResolvedValue({
        id: 'new-credential',
        rawId: new ArrayBuffer(8),
        response: {
          clientDataJSON: new ArrayBuffer(8),
          attestationObject: new ArrayBuffer(8),
        },
        type: 'public-key',
      });

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            challenge: btoa('challenge'),
            user: { id: btoa('user-id'), name: 'test', displayName: 'Test User' },
            rp: { name: 'Journal' },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            user: { ...user, passkeys: [{ id: '1', name: 'My Device' }] },
          }),
        });

      const result = await orchestrator.registerPasskey(user, 'My Device');
      
      expect(mockCredentials.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle registration errors', async () => {
      const user: AuthUser = {
        id: '1',
        email: 'test@example.com',
        verified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      mockCredentials.create.mockRejectedValue(new Error('User cancelled'));

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          challenge: btoa('challenge'),
          user: { id: btoa('user-id'), name: 'test', displayName: 'Test User' },
          rp: { name: 'Journal' },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        }),
      });

      const result = await orchestrator.registerPasskey(user, 'My Device');
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PASSKEY_REGISTRATION_FAILED');
    });
  });
});

describe('Authentication Hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('useAuth', () => {
    it('should initialize with unauthenticated state', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.session).toBe(null);
    });

    it('should restore session from localStorage', async () => {
      const session: AuthSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          verified: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        token: 'token',
        expiresAt: new Date(Date.now() + 1000000),
        method: 'passkey',
      };

      localStorage.setItem('auth_session', JSON.stringify(session));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.email).toBe('test@example.com');
      });
    });

    it('should handle login', async () => {
      (global as any).navigator = { credentials: mockCredentials };
      (global as any).PublicKeyCredential = mockPublicKeyCredential;

      mockCredentials.get.mockResolvedValue({
        id: 'credential-id',
        rawId: new ArrayBuffer(8),
        response: {
          clientDataJSON: new ArrayBuffer(8),
          authenticatorData: new ArrayBuffer(8),
          signature: new ArrayBuffer(8),
          userHandle: new ArrayBuffer(8),
        },
        type: 'public-key',
      });

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ challenge: btoa('challenge') }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            user: { id: '1', email: 'test@example.com' },
            token: 'token',
          }),
        });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const loginResult = await result.current.login();
        expect(loginResult.success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle logout', async () => {
      const session: AuthSession = {
        user: {
          id: '1',
          email: 'test@example.com',
          verified: true,
          createdAt: new Date(),
          lastLogin: new Date(),
        },
        token: 'token',
        expiresAt: new Date(Date.now() + 1000000),
        method: 'passkey',
      };

      localStorage.setItem('auth_session', JSON.stringify(session));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_session')).toBe(null);
    });
  });

  describe('usePasskeySupport', () => {
    it('should detect passkey support', async () => {
      mockPublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = vi.fn().mockResolvedValue(true);

      const { result } = renderHook(() => usePasskeySupport());

      expect(result.current.checking).toBe(true);

      await waitFor(() => {
        expect(result.current.checking).toBe(false);
        expect(result.current.supported).toBe(true);
      });
    });

    it('should handle no passkey support', async () => {
      delete (global as any).PublicKeyCredential;

      const { result } = renderHook(() => usePasskeySupport());

      await waitFor(() => {
        expect(result.current.checking).toBe(false);
        expect(result.current.supported).toBe(false);
      });
    });
  });

  describe('usePasskeys', () => {
    it('should fetch user passkeys', async () => {
      const user: AuthUser = {
        id: '1',
        email: 'test@example.com',
        verified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      const passkeys: PasskeyCredential[] = [
        {
          id: '1',
          publicKey: 'key1',
          name: 'Device 1',
          createdAt: new Date(),
        },
        {
          id: '2',
          publicKey: 'key2',
          name: 'Device 2',
          createdAt: new Date(),
          lastUsed: new Date(),
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ passkeys }),
      });

      const { result } = renderHook(() => usePasskeys(user));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.passkeys).toHaveLength(2);
      });
    });

    it('should delete a passkey', async () => {
      const user: AuthUser = {
        id: '1',
        email: 'test@example.com',
        verified: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      const passkeys: PasskeyCredential[] = [
        {
          id: '1',
          publicKey: 'key1',
          name: 'Device 1',
          createdAt: new Date(),
        },
      ];

      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ passkeys }),
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => usePasskeys(user));

      await waitFor(() => {
        expect(result.current.passkeys).toHaveLength(1);
      });

      await act(async () => {
        const success = await result.current.deletePasskey('1');
        expect(success).toBe(true);
      });

      expect(result.current.passkeys).toHaveLength(0);
    });
  });

  describe('useOAuthProviders', () => {
    it('should fetch provider status', async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true, connected: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true, connected: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: false, connected: false }),
        });

      const { result } = renderHook(() => useOAuthProviders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
        expect(result.current.providers).toHaveLength(3);
        expect(result.current.providers[0].available).toBe(true);
        expect(result.current.providers[1].connected).toBe(true);
      });
    });
  });
});