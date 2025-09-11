// Lightweight auth store with cross-tab sync via BroadcastChannel

import { FLAGS } from '../config/flags';

const bc: BroadcastChannel | null =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('auth')
    : null;

let accessToken: string | null = null;
let refreshToken: string | null = (() => {
  if (FLAGS.AUTH_COOKIE_REFRESH) return null;
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('refresh_token');
})();

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (bc) bc.postMessage({ type: 'update', access: !!token });
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setRefreshToken(token: string | null): void {
  refreshToken = token;
  if (!FLAGS.AUTH_COOKIE_REFRESH && typeof window !== 'undefined') {
    if (token) window.localStorage.setItem('refresh_token', token);
    else window.localStorage.removeItem('refresh_token');
  }
  if (bc) bc.postMessage({ type: 'update', refresh: !!token });
}

export function clearTokens(): void {
  accessToken = null;
  setRefreshToken(null);
  if (bc) bc.postMessage({ type: 'logout' });
}

export function subscribe(fn: (evt: unknown) => void): () => void {
  if (!bc) return () => {};
  const handler = (e: MessageEvent) => fn(e.data);
  bc.addEventListener('message', handler);
  return () => bc.removeEventListener('message', handler);
}

export { bc };
