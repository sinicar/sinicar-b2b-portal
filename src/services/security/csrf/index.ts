/**
 * Frontend CSRF Utilities
 * Double-Submit Cookie Pattern
 * 
 * ⚠️ COPY ONLY - Not wired to apiClient yet
 * 
 * Exports:
 * - getCsrfHeaders: Get header map for CSRF protection
 * - readCookie: Read cookie value by name
 * - CSRF_COOKIE_NAME: Cookie name constant
 * - CSRF_HEADER_NAME: Header name constant
 */

// Config
export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrfConfig';

// Utilities
export { readCookie } from './readCookie';
export { getCsrfHeaders } from './getCsrfHeaders';
