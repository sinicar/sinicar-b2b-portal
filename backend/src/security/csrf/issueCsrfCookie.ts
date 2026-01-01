/**
 * Issue CSRF Cookie Helper
 * Sets XSRF-TOKEN cookie on login/session creation
 * 
 * ⚠️ Feature-flagged: Only issues cookie when ENABLE_CSRF_COOKIE=true
 */

import type { Response } from 'express';
import crypto from 'crypto';
import { CSRF_COOKIE_NAME, getCsrfCookieOptions } from './csrfConfig';

/**
 * Check if CSRF cookie is enabled
 */
const isCsrfCookieEnabled = () => process.env.ENABLE_CSRF_COOKIE === 'true';

/**
 * Generate a cryptographically random CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Issue CSRF cookie to response
 * Only sets cookie if ENABLE_CSRF_COOKIE env is true
 * 
 * @param res - Express response object
 * @returns The generated token (or null if disabled)
 */
export function issueCsrfCookie(res: Response): string | null {
  // Debug: log env var value
  console.log('[CSRF] ENABLE_CSRF_COOKIE =', process.env.ENABLE_CSRF_COOKIE);
  
  if (!isCsrfCookieEnabled()) {
    console.log('[CSRF] Cookie issuance DISABLED');
    return null;
  }

  const token = generateCsrfToken();
  const options = getCsrfCookieOptions();

  res.cookie(CSRF_COOKIE_NAME, token, options);

  if (process.env.NODE_ENV === 'development') {
    console.debug('[CSRF] Issued XSRF-TOKEN cookie');
  }

  return token;
}
