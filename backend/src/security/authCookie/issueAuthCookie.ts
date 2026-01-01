/**
 * Issue Auth Cookie Helper
 * Sets HttpOnly AUTH_TOKEN cookie on login/session creation
 * 
 * ⚠️ Feature-flagged: Only issues cookie when ENABLE_AUTH_COOKIE=true
 */

import type { Response } from 'express';
import { getAuthCookieName, getAuthCookieOptions, isAuthCookieEnabled } from './authCookieConfig';

/**
 * Issue auth cookie to response
 * Only sets cookie if ENABLE_AUTH_COOKIE env is true
 * 
 * @param res - Express response object
 * @param accessToken - The JWT access token to store in cookie
 */
export function issueAuthCookie(res: Response, accessToken: string): void {
  if (!isAuthCookieEnabled()) {
    return; // No-op when flag is off
  }

  const name = getAuthCookieName();
  const options = getAuthCookieOptions();

  res.cookie(name, accessToken, options);

  if (process.env.NODE_ENV === 'development') {
    console.debug('[AuthCookie] Issued HttpOnly auth cookie');
  }
}

/**
 * Clear auth cookie
 * Used on logout
 */
export function clearAuthCookie(res: Response): void {
  if (!isAuthCookieEnabled()) {
    return;
  }

  const name = getAuthCookieName();
  res.clearCookie(name, { path: '/' });

  if (process.env.NODE_ENV === 'development') {
    console.debug('[AuthCookie] Cleared auth cookie');
  }
}
