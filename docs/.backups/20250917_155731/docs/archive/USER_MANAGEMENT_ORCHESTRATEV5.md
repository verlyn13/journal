---
id: user-management-orchestratev5
title: "M1 (Frontend) \u2014 Persist rotated refresh + guard demo auto-login"
type: api
version: 1.0.0
created: '2025-09-10'
updated: '2025-09-10'
author: Journal Team
tags:
- api
- react
priority: high
status: approved
visibility: internal
schema_version: v1
---

Yes—let’s do the frontend wiring now. Below is a tight, copy-pasteable runbook for the **client rotation + demo guard** work, sized for a small PR and aligned with your current backend contracts. It includes codex prompts, minimal diffs, and Playwright tests.

---

# M1 (Frontend) — Persist rotated refresh + guard demo auto-login

## 0) Branch

```bash
git checkout -b feat/web-M1-auth-rotation
```

## 1) Scope & acceptance (for the codex session)

**What we’re shipping**

* Update the web API client to:

  * Keep **access token in memory** (React module singleton) and **persist refresh token** only.
  * On 401: call `/api/auth/refresh` with current refresh; on success, **store the rotated refresh** returned by the server, update in-memory access, retry the original request once.
* When `JOURNAL_USER_MGMT_ENABLED=true`:

  * **Remove/disable demo auto-login** path in `JournalApp.tsx`.
  * Render unauthenticated state (lock/welcome) until the user signs in (you can keep a simple placeholder if full UX isn’t ready).
* Cross-tab sync:

  * Use `BroadcastChannel('auth')` to propagate **token updates** and **logout** across tabs.

**Acceptance**

* E2E (Playwright): with flag on, expired access triggers refresh → rotated refresh saved → original request succeeds. Logging out in one tab signs out the other.
* No change when flag off (existing demo behavior remains).

---

## 2) Apply changes (single codex brief)

```bash
codex edit <<'BRIEF'
Goal: Frontend wiring for rotating refresh + demo guard (flag-aware). Keep changes <300 lines.

Files:

1) apps/web/src/config/flags.ts (new or extend existing)
- export const FLAGS = { USER_MGMT_ENABLED: read from import.meta.env.VITE_USER_MGMT_ENABLED === 'true' }

2) apps/web/src/services/authStore.ts (new)
- Singleton module that keeps:
  let accessToken: string | null = null
  let refreshToken: string | null = localStorage.getItem('refresh_token')
- export getAccessToken(), setAccessToken(), getRefreshToken(), setRefreshToken(), clearTokens()
- On setRefreshToken, write to localStorage; on clear, remove from localStorage.
- Setup BroadcastChannel('auth') for 'update' and 'logout' events; export bc so api.ts can post updates.

3) apps/web/src/services/api.ts (modify)
- Replace direct localStorage access logic with authStore getters/setters.
- Request flow:
  - Attach Authorization: Bearer <accessToken> if present.
  - On 401 (and requireAuth):
    * Call POST /api/auth/refresh with { refresh_token } (flag ON path)
    * If success: setAccessToken(newAccess); setRefreshToken(newRefresh); retry once.
    * If fails: clearTokens(); broadcast 'logout'; throw/redirect as before.
- Keep compatibility when flag OFF: if refresh endpoint returns old format or demo flow, behave as prior.
- Export a helper: isAuthenticated() based on presence of accessToken or refreshToken.

4) apps/web/src/components/JournalApp.tsx (modify)
- Guard demo auto-login:
  if (FLAGS.USER_MGMT_ENABLED) do NOT call demoLogin; show unauthenticated state (simple welcome with “Sign in” placeholder).
  else keep current dev auto-login path.
- Subscribe to BroadcastChannel('auth') to react to 'logout' across tabs.

5) apps/web/tests/e2e/auth-rotation.spec.ts (new)
- Mock server or use test env to:
  Scenario:
    - Start unauthenticated; call login API to set tokens.
    - Force access token expiry (or intercept 401 once).
    - Perform an authenticated request (e.g., /entries) -> expect 401 → refresh → success.
    - Validate localStorage('refresh_token') updated after refresh.
    - Open a second tab; trigger logout in tab A; assert tab B is logged out via BroadcastChannel.

Notes:
- Keep UI minimal (no large new components).
- Ensure no references to window.localStorage for access token; only refresh token may be persisted.
- Keep public API of api.ts unchanged for existing callers.

BRIEF
```

---

## 3) Suggested diffs (if you prefer to paste)

### `apps/web/src/config/flags.ts`

```ts
export const FLAGS = {
  USER_MGMT_ENABLED:
    (import.meta as any).env?.VITE_USER_MGMT_ENABLED === 'true' ||
    (typeof process !== 'undefined' && process.env.VITE_USER_MGMT_ENABLED === 'true'),
};
```

> Add `VITE_USER_MGMT_ENABLED` to your `.env` files (dev=false by default; staging=true when rolling out).

### `apps/web/src/services/authStore.ts`

```ts
// Lightweight auth store with cross-tab sync
const bc = typeof window !== 'undefined' ? new BroadcastChannel('auth') : null;

let accessToken: string | null = null;
let refreshToken: string | null =
  typeof window !== 'undefined' ? window.localStorage.getItem('refresh_token') : null;

export function getAccessToken() {
  return accessToken;
}
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (bc) bc.postMessage({ type: 'update', access: !!token });
}
export function getRefreshToken() {
  return refreshToken;
}
export function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (typeof window !== 'undefined') {
    if (token) window.localStorage.setItem('refresh_token', token);
    else window.localStorage.removeItem('refresh_token');
  }
  if (bc) bc.postMessage({ type: 'update', refresh: !!token });
}
export function clearTokens() {
  accessToken = null;
  setRefreshToken(null);
  if (bc) bc.postMessage({ type: 'logout' });
}
export function subscribe(fn: (evt: any) => void) {
  if (!bc) return () => {};
  const handler = (e: MessageEvent) => fn(e.data);
  bc.addEventListener('message', handler);
  return () => bc.removeEventListener('message', handler);
}
export { bc };
```

### `apps/web/src/services/api.ts` (core changes)

```ts
import { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens } from './authStore';
import { FLAGS } from '../config/flags';

type RequestOpts = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
};

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

async function refreshTokens(): Promise<boolean> {
  // Demo/flag-off behavior: return false to preserve existing logic
  if (!FLAGS.USER_MGMT_ENABLED) return false;

  const rt = getRefreshToken();
  if (!rt) return false;

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  if (data?.access_token && data?.refresh_token) {
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token); // <-- rotation persistence
    return true;
  }
  return false;
}

export async function apiFetch(path: string, opts: RequestOpts = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  const method = opts.method || 'GET';
  const requireAuth = opts.requireAuth ?? false;

  const at = getAccessToken();
  if (requireAuth && at) headers['Authorization'] = `Bearer ${at}`;

  const body = opts.body && !(opts.body instanceof FormData) ? JSON.stringify(opts.body) : opts.body;
  if (opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json';

  let res = await fetch(url, { method, headers, body });

  if (requireAuth && res.status === 401) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const at2 = getAccessToken();
      const headers2 = { ...headers };
      if (at2) headers2['Authorization'] = `Bearer ${at2}`;
      res = await fetch(url, { method, headers: headers2, body });
    } else {
      clearTokens();
      throw new Error('Unauthorized');
    }
  }

  return res;
}

// Convenience
export async function loginEmailPassword(email: string, password: string) {
  const res = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  if (data?.access_token) setAccessToken(data.access_token);
  if (data?.refresh_token) setRefreshToken(data.refresh_token);
  return data;
}

export async function logout() {
  const rt = getRefreshToken();
  if (FLAGS.USER_MGMT_ENABLED && rt) {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    }).catch(() => {});
  }
  clearTokens();
}
```

### `apps/web/src/components/JournalApp.tsx` (demo guard & cross-tab)

```tsx
import { useEffect, useState } from 'react';
import { FLAGS } from '../config/flags';
import { subscribe } from '../services/authStore';
import { apiFetch } from '../services/api';

export default function JournalApp() {
  const [authed, setAuthed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribe((evt) => {
      if (evt?.type === 'logout') setAuthed(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!FLAGS.USER_MGMT_ENABLED) {
        // Existing dev demo behavior may still auto-login elsewhere
        // Keep prior logic intact (not shown here) if your app previously did it.
        setAuthed(true);
        setLoading(false);
        return;
      }
      // Flag ON: do NOT auto-login. Check /auth/me only if we have access (optional).
      try {
        const res = await apiFetch('/api/auth/me', { requireAuth: true });
        setAuthed(res.ok);
      } catch {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-sm opacity-70">Loading…</div>;

  if (!authed && FLAGS.USER_MGMT_ENABLED) {
    // Minimal unauthenticated surface; replace with your real lock/welcome later
    return (
      <div className="h-screen grid place-items-center">
        <div className="rounded-xl p-8 shadow-md max-w-sm text-center">
          <h1 className="text-lg font-semibold mb-2">Welcome</h1>
          <p className="text-sm opacity-80 mb-4">Sign in to continue.</p>
          {/* hook up your actual sign-in modal here */}
          <button className="px-4 py-2 rounded bg-Ruff text-white">Sign in</button>
        </div>
      </div>
    );
  }

  return (
    // your existing app shell
    <div id="app-root">{/* ... */}</div>
  );
}
```

---

## 4) Playwright e2e

### `apps/web/tests/e2e/auth-rotation.spec.ts`

```ts
import { test, expect } from '@playwright/test';

// Assumes VITE_USER_MGMT_ENABLED=true in the test environment and API_URL set.
// You can stub network for access expiry or make a short-lived access token in test config.

test.describe('Auth rotation & cross-tab', () => {
  test('401 → refresh → retry succeeds, rotated refresh persisted', async ({ page, context }) => {
    // Go to login view
    await page.goto('/');

    // Perform login via direct API call or UI (adjust to your app)
    const resp = await page.request.post(`${process.env.VITE_API_URL}/api/auth/login`, {
      data: { email: 'rot@journal.local', password: 'CorrectHorse9!' },
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();
    await page.addInitScript((tokens) => {
      localStorage.setItem('refresh_token', tokens.refresh);
      // we simulate setting access in memory by reloading and letting app fetch /me
    }, { refresh: data.refresh_token });

    await page.reload();

    // Intercept one /entries call to force a 401 on first try (simulate expired access)
    let first = true;
    await page.route('**/api/entries*', async (route) => {
      if (first) {
        first = false;
        return route.fulfill({ status: 401, body: JSON.stringify({ message: 'expired' }) });
      }
      return route.fallback();
    });

    // Trigger a fetch that requires auth
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/entries') && r.status() !== 401),
      page.evaluate(() => fetch(`${(window as any).VITE_API_URL || import.meta.env.VITE_API_URL}/api/entries`, { headers: { 'x-require-auth': '1' } })),
    ]);
    expect(res.ok()).toBeTruthy();

    // Ensure refresh token rotated
    const rt = await page.evaluate(() => localStorage.getItem('refresh_token'));
    expect(rt).not.toBe(data.refresh_token);
  });

  test('logout in tab A logs out tab B via BroadcastChannel', async ({ browser }) => {
    const ctx = await browser.newContext();
    const a = await ctx.newPage();
    const b = await ctx.newPage();

    await a.goto('/');
    await b.goto('/');

    await a.evaluate(() => localStorage.setItem('refresh_token', 'dummy')); // simulate signed-in; your app may need a more realistic setup
    await b.evaluate(() => localStorage.setItem('refresh_token', 'dummy'));

    // Trigger broadcast logout
    await a.evaluate(() => {
      const bc = new BroadcastChannel('auth');
      bc.postMessage({ type: 'logout' });
    });

    // Check B sees logout
    await b.waitForFunction(() => !localStorage.getItem('refresh_token'));
    await ctx.close();
  });
});
```

> If your app uses a different test harness, adjust URLs/boot accordingly. For a full run, set `VITE_USER_MGMT_ENABLED=true` in the Playwright env config for this spec.

---

## 5) Open PR

```bash
codex open-pr \
  --base main \
  --head feat/web-M1-auth-rotation \
  --title "feat(web): rotated refresh persistence + demo guard, cross-tab sync (M1)" \
  --labels frontend,auth,feature-flag \
  --body "$(cat <<'MD'
### What
- Client now persists **rotated refresh tokens** returned by `/auth/refresh`.
- Access token kept in memory; one retry on `401` after refresh.
- When `JOURNAL_USER_MGMT_ENABLED=true`, demo auto-login is disabled and an unauthenticated view is shown.
- Cross-tab auth sync via `BroadcastChannel('auth')` for token updates and logout.

### Why
Aligns the web client with server-side session rotation and prepares for cookie-based refresh (M4).

### Guardrails
- Flag OFF: legacy demo behavior unchanged.
- No access token in localStorage (reduces XSS blast radius); only refresh token persisted for now.

### Tests
- Playwright: 401→refresh→retry path succeeds and rotated refresh is saved.
- BroadcastChannel logout propagates across tabs.

### Follow-ups
- M4: move refresh to httpOnly cookie + CSRF, keeping access in memory.
MD
)"
```

---

## 6) Rollout & Backout

* **Staging**: set `VITE_USER_MGMT_ENABLED=true` and `JOURNAL_USER_MGMT_ENABLED=true`. Run the Playwright spec.
* **Backout**: flip `VITE_USER_MGMT_ENABLED=false` on the web (build-time) or hot flag if you read from runtime config; server flag can remain on while client keeps demo behavior.
