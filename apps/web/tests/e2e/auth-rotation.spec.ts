import { test, expect } from '@playwright/test';

test.describe('Auth rotation & cross-tab', () => {
  test('401 → refresh → retry succeeds, rotated refresh persisted', async ({ page }) => {
    await page.goto('/');

    // Assume backend has a test user created by API; perform login via API
    const apiUrl = (process.env.VITE_API_URL as string) || 'http://localhost:5000/api';
    const resp = await page.request.post(`${apiUrl}/v1/auth/login`, {
      data: { email: 'rot@example.com', password: 'CorrectHorse9!' },
    });
    expect(resp.ok()).toBeTruthy();
    const data = await resp.json();

    await page.addInitScript((tokens) => {
      localStorage.setItem('refresh_token', tokens.refresh);
    }, { refresh: data.refresh_token });

    await page.reload();

    // Force one 401 for entries then allow
    let first = true;
    await page.route('**/api/v1/entries*', async (route) => {
      if (first) {
        first = false;
        return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'expired' }) });
      }
      return route.fallback();
    });

    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/v1/entries') && r.status() !== 401),
      page.evaluate((api) => fetch(`${api}/v1/entries`, { headers: { 'x-require-auth': '1' } }), apiUrl),
    ]);
    expect(res.ok()).toBeTruthy();

    const rt = await page.evaluate(() => localStorage.getItem('refresh_token'));
    expect(rt).not.toBe(data.refresh_token);
  });

  test('logout in tab A logs out tab B via BroadcastChannel', async ({ browser }) => {
    const ctx = await browser.newContext();
    const a = await ctx.newPage();
    const b = await ctx.newPage();
    await a.goto('/');
    await b.goto('/');

    await a.evaluate(() => localStorage.setItem('refresh_token', 'dummy'));
    await b.evaluate(() => localStorage.setItem('refresh_token', 'dummy'));

    await a.evaluate(() => {
      const bc = new BroadcastChannel('auth');
      bc.postMessage({ type: 'logout' });
    });

    await b.waitForFunction(() => !localStorage.getItem('refresh_token'));
    await ctx.close();
  });
});

