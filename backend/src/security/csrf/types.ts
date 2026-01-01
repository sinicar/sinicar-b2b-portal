/**
 * CSRF Types
 * Type definitions for CSRF protection utilities
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * CSRF Middleware function signature
 */
export type CsrfMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * CSRF Validation Result
 */
export interface CsrfValidationResult {
  valid: boolean;
  reason?: 'missing_cookie' | 'missing_header' | 'mismatch';
}
