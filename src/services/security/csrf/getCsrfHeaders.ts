/**
 * Get CSRF Headers Utility
 * Returns header map for CSRF protection
 * 
 * ⚠️ COPY ONLY - Not wired to apiClient yet
 */

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrfConfig';
import { readCookie } from './readCookie';

/**
 * Get CSRF header map for fetch requests
 * Returns empty object if no CSRF token is available
 * 
 * Usage (when ready to wire):
 *   fetch(url, {
 *     headers: {
 *       ...getCsrfHeaders(),
 *       'Content-Type': 'application/json',
 *     }
 *   })
 * 
 * @returns Header map with X-CSRF-Token if token exists, empty object otherwise
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = readCookie(CSRF_COOKIE_NAME);
  
  if (!token) {
    return {};
  }
  
  return {
    [CSRF_HEADER_NAME]: token,
  };
}
