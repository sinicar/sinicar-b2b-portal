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
export declare function successResponse<T>(res: Response, data: T, message?: string, meta?: ApiResponse['meta']): Response<any, Record<string, any>>;
export declare function paginatedResponse<T>(res: Response, result: PaginatedResult<T>, message?: string): Response<any, Record<string, any>>;
export declare function createdResponse<T>(res: Response, data: T, message?: string): Response<any, Record<string, any>>;
export declare function errorResponse(res: Response, error: string, statusCode?: number): Response<any, Record<string, any>>;
export declare function notFoundResponse(res: Response, entity?: string): Response<any, Record<string, any>>;
export declare function unauthorizedResponse(res: Response, message?: string): Response<any, Record<string, any>>;
export declare function forbiddenResponse(res: Response, message?: string): Response<any, Record<string, any>>;
export declare function validationError(res: Response, errors: Record<string, string> | Record<string, string[]>): Response<any, Record<string, any>>;
//# sourceMappingURL=response.d.ts.map