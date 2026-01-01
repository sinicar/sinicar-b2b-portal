/**
 * Auth Cookie Bridge Middleware
 * 
 * Reads AUTH_TOKEN cookie and sets Authorization header if missing.
 * This allows the same auth logic to work with both:
 * - Bearer token in Authorization header (current)
 * - HttpOnly cookie (new, more secure)
 * 
 * ⚠️ Feature-flagged: Only active when ENABLE_AUTH_COOKIE=true
 */

import type { Request, Response, NextFunction } from 'express';
import { getAuthCookieName, isAuthCookieEnabled } from '../security/authCookie';

/**
 * Middleware that bridges auth cookie to Authorization header.
 * 
 * If ENABLE_AUTH_COOKIE=true and no Authorization header exists,
 * reads the auth cookie and sets the header automatically.
 */
export function authCookieBridge(req: Request, _res: Response, next: NextFunction): void {
  // Skip if feature is disabled
  if (!isAuthCookieEnabled()) {
    return next();
  }

  // Skip if Authorization header already exists (header takes priority)
  if (req.headers.authorization) {
    return next();
  }

  // Safely read cookies (may be undefined if cookie-parser not used)
  const cookies = req.cookies;
  if (!cookies) {
    return next();
  }

  // Read auth token from cookie
  const cookieName = getAuthCookieName();
  const token = cookies[cookieName];

  // If token exists in cookie, set Authorization header
  if (token && typeof token === 'string') {
    req.headers.authorization = `Bearer ${token}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.debug('[AuthCookieBridge] Set Authorization header from cookie');
    }
  }

  next();
}

export default authCookieBridge;
