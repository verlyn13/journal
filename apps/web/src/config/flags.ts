export const FLAGS = {
  USER_MGMT_ENABLED:
    (import.meta as any).env?.VITE_USER_MGMT_ENABLED === 'true' ||
    (typeof process !== 'undefined' && (process as any).env?.VITE_USER_MGMT_ENABLED === 'true'),
  AUTH_COOKIE_REFRESH:
    (import.meta as any).env?.VITE_AUTH_COOKIE_REFRESH === 'true' ||
    (typeof process !== 'undefined' && (process as any).env?.VITE_AUTH_COOKIE_REFRESH === 'true'),
};
