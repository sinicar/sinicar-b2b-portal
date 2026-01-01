/**
 * Auth Cookie Configuration
 * HttpOnly cookie for secure token storage
 * 
 * ⚠️ Feature-flagged: Only active when ENABLE_AUTH_COOKIE=true
 */

/**
 * Get auth cookie name from env or default
 */
export function getAuthCookieName(): string {
  return process.env.AUTH_COOKIE_NAME || 'AUTH_TOKEN';
}

/**
 * Get auth cookie options
 * Note: httpOnly MUST be true - JS should NOT read this cookie
 */
export function getAuthCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax';
  path: string;
  maxAge: number;
} {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // MUST be true - security!
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? 'strict' as const : 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
}

/**
 * Check if auth cookie feature is enabled
 */
export function isAuthCookieEnabled(): boolean {
  return process.env.ENABLE_AUTH_COOKIE === 'true';
}
