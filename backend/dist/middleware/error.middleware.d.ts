import { Request, Response, NextFunction } from 'express';
export declare function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function notFoundHandler(req: Request, res: Response): void;
export declare function asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map