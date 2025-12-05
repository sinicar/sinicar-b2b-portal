"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    if (err instanceof errors_1.ValidationError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            errors: err.errors
        });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err;
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
    const message = env_1.env.isProduction
        ? 'حدث خطأ في الخادم'
        : err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(env_1.env.isDevelopment && { stack: err.stack })
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: 'المسار غير موجود'
    });
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=error.middleware.js.map