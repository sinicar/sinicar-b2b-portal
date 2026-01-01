/**
 * CSRF Middleware
 * Double-Submit Cookie Validation
 * 
 * ⚠️ COPY ONLY - Not attached to routes yet
 * 
 * Strategy:
 * 1. Read CSRF token from cookie (XSRF-TOKEN)
 * 2. Read CSRF token from header (X-CSRF-Token)
 * 3. Compare values - if they match, request is valid
 * 
 * Why this works:
 * - Attacker cannot read cookies from our domain (Same-Origin Policy)
 * - Attacker cannot forge headers with matching cookie value
 * - Only legitimate frontend can read cookie and send matching header
 */

import type { Request, Response, NextFunction } from 'express';
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_PROTECTED_METHODS,
  CSRF_EXEMPT_ROUTES,
} from './csrfConfig';
import type { CsrfValidationResult } from './types';

/**
 * Validate CSRF token (internal helper)
 * Compares cookie value with header value
 */
export function validateCsrfToken(req: Request): CsrfValidationResult {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!cookieToken) {
    return { valid: false, reason: 'missing_cookie' };
  }

  if (!headerToken) {
    return { valid: false, reason: 'missing_header' };
  }

  if (cookieToken !== headerToken) {
    return { valid: false, reason: 'mismatch' };
  }

  return { valid: true };
}

/**
 * Check if request method requires CSRF validation
 */
function requiresCsrfValidation(method: string): boolean {
  return CSRF_PROTECTED_METHODS.includes(method.toUpperCase());
}

/**
 * Check if route is exempt from CSRF validation
 */
function isExemptRoute(path: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((route) => path.startsWith(route));
}

/**
 * CSRF Validation Middleware
 * 
 * Usage (when ready to wire):
 *   router.post('/protected', validateCsrf, handler);
 * 
 * ⚠️ NOT APPLIED YET - Export only
 */
export function validateCsrf(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Skip safe methods (GET, HEAD, OPTIONS)
  if (!requiresCsrfValidation(req.method)) {
    return next();
  }

  // Skip exempt routes (login, register)
  if (isExemptRoute(req.path)) {
    return next();
  }

  // Validate CSRF token
  const result = validateCsrfToken(req);

  if (!result.valid) {
    res.status(403).json({
      error: 'CSRF validation failed',
      code: 'CSRF_INVALID',
      reason: result.reason,
    });
    return;
  }

  next();
}

/**
 * Generate CSRF token (cryptographically random)
 * Call this after successful login to set the cookie
 * 
 * ⚠️ NOT APPLIED YET - Export only
 */
export function generateCsrfToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}
