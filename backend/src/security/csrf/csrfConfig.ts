/**
 * CSRF Configuration
 * Double-Submit Cookie Strategy
 * 
 * ⚠️ COPY ONLY - Not wired to routes yet
 */

/**
 * Cookie name for CSRF token (readable by JavaScript)
 */
export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';

/**
 * Header name for CSRF token (sent by frontend)
 */
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Cookie options for CSRF token
 * Note: httpOnly MUST be false for double-submit pattern
 */
export const getCsrfCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: false, // MUST be false - JS needs to read this cookie
    secure: isProd, // Only require HTTPS in production
    sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax', // Lax in dev for cross-port
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
};

/**
 * Methods that require CSRF validation
 * Safe methods (GET, HEAD, OPTIONS) are exempt
 */
export const CSRF_PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Routes exempt from CSRF validation
 * Login establishes session, so no CSRF token exists yet
 */
export const CSRF_EXEMPT_ROUTES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
];
