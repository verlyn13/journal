export const FLAGS = {
  // Use Vite/Bun environment only (no Node typings needed)
  USER_MGMT_ENABLED: (import.meta as any).env?.VITE_USER_MGMT_ENABLED === 'true',
  AUTH_COOKIE_REFRESH: (import.meta as any).env?.VITE_AUTH_COOKIE_REFRESH === 'true',
};
