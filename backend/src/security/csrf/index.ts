/**
 * CSRF Protection Utilities
 * Double-Submit Cookie Pattern
 * 
 * ⚠️ COPY ONLY - Not wired to routes yet
 * 
 * Exports:
 * - validateCsrf: Middleware to validate CSRF tokens
 * - generateCsrfToken: Generate new CSRF token
 * - CSRF_COOKIE_NAME: Cookie name constant
 * - CSRF_HEADER_NAME: Header name constant
 * - getCsrfCookieOptions: Cookie configuration
 */

// Config
export {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_PROTECTED_METHODS,
  CSRF_EXEMPT_ROUTES,
  getCsrfCookieOptions,
} from './csrfConfig';

// Middleware
export {
  validateCsrf,
  validateCsrfToken,
  generateCsrfToken,
} from './csrfMiddleware';

// Types
export type { CsrfMiddleware, CsrfValidationResult } from './types';
