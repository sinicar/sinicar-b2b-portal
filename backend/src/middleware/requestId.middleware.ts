/**
 * Request ID Middleware
 * 
 * Adds unique request IDs to all requests for tracing.
 * - Sets X-Request-Id response header
 * - Attaches requestId to req object
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Generate and attach unique request ID
 */
export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  // Use incoming header or generate new
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  
  // Attach to request
  req.requestId = requestId;
  
  // Set response header
  res.setHeader('X-Request-Id', requestId);
  
  next();
}

/**
 * Structured logger utility
 * Includes timestamp, level, requestId, and message
 */
export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...meta
    }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...meta
    }));
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      ...meta
    }));
  }
};
