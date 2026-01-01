/**
 * Rate Limiting Middleware
 * 
 * Provides global and per-route rate limiting to protect against DoS.
 * Feature-flagged: OFF by default (RATE_LIMIT_ENABLED=false)
 * 
 * Usage:
 *   RATE_LIMIT_ENABLED=true
 *   RATE_LIMIT_WINDOW_MS=900000 (15 minutes)
 *   RATE_LIMIT_MAX=300 (general API)
 *   RATE_LIMIT_MAX_LOGIN=10 (auth endpoints)
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

// ============ Configuration ============

export const rateLimitConfig = {
  enabled: process.env.RATE_LIMIT_ENABLED === 'true',
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  maxGeneral: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  maxLogin: parseInt(process.env.RATE_LIMIT_MAX_LOGIN || '10', 10),
  maxSearch: parseInt(process.env.RATE_LIMIT_MAX_SEARCH || '60', 10),
};

// ============ Limiters ============

/**
 * General API rate limiter
 * 300 requests per 15 minutes per IP (default)
 */
export const generalLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.maxGeneral,
  message: {
    success: false,
    error: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.',
    retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !rateLimitConfig.enabled,
});

/**
 * Strict limiter for auth endpoints (login/register)
 * 10 requests per 15 minutes per IP (default)
 */
export const authLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.maxLogin,
  message: {
    success: false,
    error: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى الانتظار.',
    retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !rateLimitConfig.enabled,
});

/**
 * Search/heavy query limiter
 * 60 requests per 15 minutes per IP (default)
 */
export const searchLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.maxSearch,
  message: {
    success: false,
    error: 'تم تجاوز الحد الأقصى لعمليات البحث. يرجى المحاولة لاحقاً.',
    retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !rateLimitConfig.enabled,
});

/**
 * Log rate limit status on startup
 */
export function logRateLimitStatus(): void {
  if (rateLimitConfig.enabled) {
    console.log(`[RateLimit] ENABLED - Window: ${rateLimitConfig.windowMs}ms, Max: ${rateLimitConfig.maxGeneral}, Login: ${rateLimitConfig.maxLogin}`);
  } else {
    console.log('[RateLimit] DISABLED - Set RATE_LIMIT_ENABLED=true to enable');
  }
}
