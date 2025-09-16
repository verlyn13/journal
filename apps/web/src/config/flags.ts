interface JournalEnv extends ImportMetaEnv {
  readonly VITE_USER_MGMT_ENABLED?: string;
  readonly VITE_AUTH_COOKIE_REFRESH?: string;
}

export const FLAGS = {
  // Use Vite/Bun environment only (no Node typings needed)
  USER_MGMT_ENABLED: (import.meta.env as JournalEnv).VITE_USER_MGMT_ENABLED === 'true',
  AUTH_COOKIE_REFRESH: (import.meta.env as JournalEnv).VITE_AUTH_COOKIE_REFRESH === 'true',
};
