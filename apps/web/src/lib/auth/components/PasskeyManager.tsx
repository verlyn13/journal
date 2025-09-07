// Passkey Management Component

import React, { useState } from 'react';
import { useAuth, usePasskeys, usePasskeySupport } from '../hooks';
import type { PasskeyCredential } from '../types';

export const PasskeyManager: React.FC = () => {
  const { user, registerPasskey } = useAuth();
  const { passkeys, loading, error, deletePasskey, renamePasskey } = usePasskeys(user);
  const { supported: passkeysSupported, checking } = usePasskeySupport();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleRegisterPasskey = async () => {
    if (!newPasskeyName.trim()) return;

    setIsRegistering(true);
    try {
      const success = await registerPasskey(newPasskeyName);
      if (success) {
        setNewPasskeyName('');
        // Passkeys will be refreshed automatically
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeletePasskey = async (passkey: PasskeyCredential) => {
    if (confirm(`Are you sure you want to delete "${passkey.name}"?`)) {
      await deletePasskey(passkey.id);
    }
  };

  const handleRenamePasskey = async (passkeyId: string) => {
    if (!editingName.trim()) return;

    const success = await renamePasskey(passkeyId, editingName);
    if (success) {
      setEditingId(null);
      setEditingName('');
    }
  };

  if (checking) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!passkeysSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Passkeys are not supported on this device or browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Passkeys</h3>
        <p className="text-sm text-gray-600 mb-4">
          Passkeys provide a secure, password-free way to sign in using your device's biometric authentication.
        </p>
      </div>

      {/* Add new passkey */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Add a new passkey</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPasskeyName}
            onChange={(e) => setNewPasskeyName(e.target.value)}
            placeholder="Enter a name for this device"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isRegistering}
          />
          <button
            onClick={handleRegisterPasskey}
            disabled={isRegistering || !newPasskeyName.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? 'Registering...' : 'Add Passkey'}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Passkeys list */}
      <div className="space-y-2">
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : passkeys.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">No passkeys registered yet.</p>
          </div>
        ) : (
          passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingId === passkey.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onBlur={() => handleRenamePasskey(passkey.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenamePasskey(passkey.id);
                          } else if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditingName('');
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div>
                      <h5 className="font-medium">{passkey.name}</h5>
                      <p className="text-sm text-gray-500">
                        Added {new Date(passkey.createdAt).toLocaleDateString()}
                        {passkey.lastUsed && (
                          <span> • Last used {new Date(passkey.lastUsed).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(passkey.id);
                      setEditingName(passkey.name);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    title="Rename"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeletePasskey(passkey)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};