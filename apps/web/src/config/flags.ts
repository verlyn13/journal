export const FLAGS = {
  USER_MGMT_ENABLED:
    (import.meta as any).env?.VITE_USER_MGMT_ENABLED === 'true' ||
    (typeof process !== 'undefined' && (process as any).env?.VITE_USER_MGMT_ENABLED === 'true'),
};

