import { Response } from 'express';
import { PaginatedResult } from './pagination';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export function successResponse<T>(res: Response, data: T, message?: string, meta?: ApiResponse['meta']) {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta })
  };
  
  return res.json(response);
}

export function paginatedResponse<T>(res: Response, result: PaginatedResult<T>, message?: string) {
  return res.status(200).json({
    success: true,
    message,
    data: result.data,
    pagination: result.pagination,
  });
}

export function createdResponse<T>(res: Response, data: T, message?: string) {
  return res.status(201).json({
    success: true,
    message: message || 'تم الإنشاء بنجاح',
    data,
  });
}

export function errorResponse(res: Response, error: string, statusCode: number = 400) {
  const response: ApiResponse = {
    success: false,
    error
  };
  
  return res.status(statusCode).json(response);
}

export function notFoundResponse(res: Response, entity: string = 'المورد') {
  return errorResponse(res, `${entity} غير موجود`, 404);
}

export function unauthorizedResponse(res: Response, message: string = 'غير مصرح') {
  return errorResponse(res, message, 401);
}

export function forbiddenResponse(res: Response, message: string = 'لا تملك الصلاحية') {
  return errorResponse(res, message, 403);
}

export function validationError(res: Response, errors: Record<string, string> | Record<string, string[]>) {
  return res.status(422).json({
    success: false,
    error: 'بيانات غير صالحة',
    validationErrors: errors
  });
}
