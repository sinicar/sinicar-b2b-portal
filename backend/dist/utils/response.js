"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.paginatedResponse = paginatedResponse;
exports.createdResponse = createdResponse;
exports.errorResponse = errorResponse;
exports.notFoundResponse = notFoundResponse;
exports.unauthorizedResponse = unauthorizedResponse;
exports.forbiddenResponse = forbiddenResponse;
exports.validationError = validationError;
function successResponse(res, data, message, meta) {
    const response = {
        success: true,
        data,
        ...(message && { message }),
        ...(meta && { meta })
    };
    return res.json(response);
}
function paginatedResponse(res, result, message) {
    return res.status(200).json({
        success: true,
        message,
        data: result.data,
        pagination: result.pagination,
    });
}
function createdResponse(res, data, message) {
    return res.status(201).json({
        success: true,
        message: message || 'تم الإنشاء بنجاح',
        data,
    });
}
function errorResponse(res, error, statusCode = 400) {
    const response = {
        success: false,
        error
    };
    return res.status(statusCode).json(response);
}
function notFoundResponse(res, entity = 'المورد') {
    return errorResponse(res, `${entity} غير موجود`, 404);
}
function unauthorizedResponse(res, message = 'غير مصرح') {
    return errorResponse(res, message, 401);
}
function forbiddenResponse(res, message = 'لا تملك الصلاحية') {
    return errorResponse(res, message, 403);
}
function validationError(res, errors) {
    return res.status(422).json({
        success: false,
        error: 'بيانات غير صالحة',
        validationErrors: errors
    });
}
//# sourceMappingURL=response.js.map