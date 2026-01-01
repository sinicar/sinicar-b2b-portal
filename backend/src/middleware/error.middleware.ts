import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, AccountStatusError } from '../utils/errors';
import { env } from '../config/env';
import { RequestWithId, logger } from './requestId.middleware';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = (req as RequestWithId).requestId || 'unknown';
  
  // Structured error logging
  logger.error('Request error', {
    requestId,
    path: req.path,
    method: req.method,
    error: err.message,
    stack: env.isDevelopment ? err.stack : undefined
  });

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errors: err.errors
    });
  }

  if (err instanceof AccountStatusError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.errorCode,
      message: err.message
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'هذا السجل موجود بالفعل'
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'السجل غير موجود'
      });
    }
  }

  const statusCode = 500;
  const message = env.isProduction
    ? 'حدث خطأ في الخادم'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.isDevelopment && { stack: err.stack })
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'المسار غير موجود'
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
