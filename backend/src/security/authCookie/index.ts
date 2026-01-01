/**
 * Auth Cookie Module
 * HttpOnly cookie authentication support
 * 
 * ⚠️ Feature-flagged: All functions are no-op when ENABLE_AUTH_COOKIE=false
 */

export { getAuthCookieName, getAuthCookieOptions, isAuthCookieEnabled } from './authCookieConfig';
export { issueAuthCookie, clearAuthCookie } from './issueAuthCookie';
