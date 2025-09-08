// Authentication Button Component

import type React from 'react';
import { useState } from 'react';
import { useAuth, usePasskeySupport } from '../hooks';
import type { AuthProvider } from '../types';

interface AuthButtonProps {
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  preferredMethod?: 'passkey' | 'oauth' | 'magic-link';
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  className = '',
  onSuccess,
  onError,
  preferredMethod,
}) => {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  const { supported: passkeysSupported } = usePasskeySupport();
  const [showOptions, setShowOptions] = useState(false);
  // const [selectedProvider, setSelectedProvider] = useState<AuthProvider | null>(null);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      try {
        const result = await login();
        if (result.success) {
          onSuccess?.();
        } else {
          onError?.(result.error);
        }
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-label="Loading">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }

    if (passkeysSupported && preferredMethod === 'passkey') {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        </svg>
      );
    }

    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
        />
      </svg>
    );
  };

  return (
    <div className="relative">
      <button type="button"
        onClick={handleAuth}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-2 px-4 py-2
          bg-primary-600 text-white
          hover:bg-primary-700 active:bg-primary-800
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-lg font-medium
          transition-colors duration-200
          ${className}
        `}
      >
        {getButtonIcon()}
        <span>{isAuthenticated ? 'Sign Out' : 'Sign In'}</span>
      </button>

      {isAuthenticated && user && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
          <div className="px-3 py-2 border-b">
            <p className="font-medium">{user.name || user.email}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button onClick={logout} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
            Sign Out
          </button>
        </div>
      )}

      {!isAuthenticated && showOptions && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg p-2 min-w-[250px]">
          {passkeysSupported && (
            <button type="button"
              onClick={() => {
                setShowOptions(false);
                handleAuth();
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Sign in with Passkey
            </button>
          )}

          <div className="my-2 border-t" />

          <button type="button"
            onClick={() => handleAuth()}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <img src="/icons/google.svg" alt="Google" className="h-5 w-5" />
            Continue with Google
          </button>

          <button type="button"
            onClick={() => handleAuth()}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <img src="/icons/github.svg" alt="GitHub" className="h-5 w-5" />
            Continue with GitHub
          </button>

          <button type="button"
            onClick={() => handleAuth()}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <img src="/icons/apple.svg" alt="Apple" className="h-5 w-5" />
            Continue with Apple
          </button>

          <div className="my-2 border-t" />

          <button type="button"
            onClick={() => {
              setShowOptions(false);
              handleAuth();
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Mail">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Sign in with Email
          </button>
        </div>
      )}
    </div>
  );
};
