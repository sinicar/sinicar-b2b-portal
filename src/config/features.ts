/**
 * Feature flags (safe defaults)
 * IMPORTANT: keep all features disabled by default.
 * 
 * Enable in dev via:
 *   VITE_ENABLE_SESSION_REFRESH=true
 *   VITE_ENABLE_CSRF_HEADERS=true
 */
export const features = {
  enableSessionRefresh: import.meta.env.VITE_ENABLE_SESSION_REFRESH === 'true',
  enableCsrfHeaders: import.meta.env.VITE_ENABLE_CSRF_HEADERS === 'true',
} as const;


