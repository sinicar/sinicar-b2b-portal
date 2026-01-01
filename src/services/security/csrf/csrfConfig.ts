/**
 * CSRF Configuration (Frontend)
 * Double-Submit Cookie Pattern
 * 
 * ⚠️ COPY ONLY - Not wired to apiClient yet
 */

/**
 * Cookie name for CSRF token (set by backend)
 */
export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';

/**
 * Header name for sending CSRF token
 */
export const CSRF_HEADER_NAME = 'X-CSRF-Token';
