import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface PassphraseLoginProps {
  onSuccess: () => void;
}

export function PassphraseLogin({ onSuccess }: PassphraseLoginProps) {
  const [passphrase, setPassphrase] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setIsAuthenticating(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/passphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ passphrase: passphrase.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          // Store token and update auth state
          localStorage.setItem('token', data.access_token);
          await api.checkAuthStatus();
          onSuccess();
        }
      } else {
        setError('Invalid passphrase');
        setPassphrase('');
      }
    } catch (err) {
      setError('Authentication failed');
      setPassphrase('');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative">
        {/* Animated Quill with Flames */}
        <div className="mb-12 relative">
          <svg
            width="80"
            height="120"
            viewBox="0 0 120 160"
            className="mx-auto"
            aria-label="Authentication quill"
          >
            {/* Hand holding quill */}
            <g className="hand" fill="#e5e5e5" opacity="0.9">
              <path d="M 45,120 C 40,115 35,110 35,100 C 35,95 40,93 45,95 L 50,98 L 55,95 C 60,93 65,95 65,100 C 65,110 60,115 55,120 Z" />
              <rect x="47" y="95" width="6" height="25" rx="3" />
            </g>

            {/* Quill */}
            <g className="quill">
              <path
                d="M 50,95 Q 48,70 45,50 Q 42,30 38,15 Q 35,5 30,0"
                stroke="#d4d4d4"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx="30" cy="0" rx="4" ry="2" fill="#f5f5f5" transform="rotate(-30 30 0)" />
            </g>

            {/* Animated Flames */}
            <g className="flames">
              <path className="flame flame-1" d="M 28,-2 Q 25,-8 28,-12 Q 30,-8 32,-2" fill="#ff6b35" opacity="0">
                <animate attributeName="opacity" values="0;1;0.5;1;0" dur="1.5s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="translate" values="0,0; -1,-2; 1,-1; 0,-3; 0,0" dur="1.5s" repeatCount="indefinite" />
              </path>
              <path className="flame flame-2" d="M 30,-2 Q 28,-10 30,-14 Q 32,-10 34,-2" fill="#ff9558" opacity="0">
                <animate attributeName="opacity" values="0;0.8;1;0.6;0" dur="2s" repeatCount="indefinite" begin="0.3s" />
                <animateTransform attributeName="transform" type="translate" values="0,0; 1,-1; -1,-2; 0,-4; 0,0" dur="2s" repeatCount="indefinite" begin="0.3s" />
              </path>
              <path className="flame flame-3" d="M 32,-2 Q 30,-7 32,-10 Q 34,-7 36,-2" fill="#ffd23f" opacity="0">
                <animate attributeName="opacity" values="0;0.6;0.9;0.4;0" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
                <animateTransform attributeName="transform" type="translate" values="0,0; -1,-1; 1,-3; 0,-2; 0,0" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
              </path>
            </g>

            {/* Glow effect for flames */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        {/* Minimalist Form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className={`
              w-80 px-4 py-3
              bg-transparent
              border-b border-gray-800
              text-gray-300
              placeholder-gray-800
              focus:outline-none
              focus:border-gray-600
              transition-colors duration-300
              ${isAuthenticating ? 'opacity-50' : ''}
              ${error ? 'border-red-900' : ''}
            `}
            placeholder=""
            disabled={isAuthenticating}
            autoFocus
            autoComplete="off"
          />

          {/* Subtle hint line */}
          {!passphrase && !error && (
            <div className="absolute -bottom-6 left-0 right-0 text-center">
              <span className="text-gray-900 text-xs tracking-wider">PASSPHRASE</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute -bottom-6 left-0 right-0 text-center">
              <span className="text-red-900 text-xs tracking-wider">{error.toUpperCase()}</span>
            </div>
          )}
        </form>

        {/* Loading indicator */}
        {isAuthenticating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-gray-800">Authenticating...</div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes flicker {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .flames {
          filter: url(#glow);
          animation: flicker 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default PassphraseLogin;