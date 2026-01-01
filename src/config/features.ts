/**
 * Feature flags (safe defaults)
 * IMPORTANT: keep refresh disabled by default.
 * Enable in dev via: VITE_ENABLE_SESSION_REFRESH=true
 */
export const features = {
  enableSessionRefresh: import.meta.env.VITE_ENABLE_SESSION_REFRESH === 'true',
} as const;

