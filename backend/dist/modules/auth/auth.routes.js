"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const auth_schema_1 = require("../../schemas/auth.schema");
const router = (0, express_1.Router)();
router.post('/login', (0, validate_middleware_1.validate)(auth_schema_1.loginSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.authService.login(req.body);
    (0, response_1.successResponse)(res, result, 'تم تسجيل الدخول بنجاح');
}));
router.post('/register', (0, validate_middleware_1.validate)(auth_schema_1.registerSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.authService.register(req.body);
    (0, response_1.createdResponse)(res, result, result.message);
}));
router.post('/logout', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.authService.logout(req.user.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/me', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const user = await auth_service_1.authService.getMe(req.user.id);
    (0, response_1.successResponse)(res, user);
}));
router.post('/refresh-token', (0, validate_middleware_1.validate)(auth_schema_1.refreshTokenSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.authService.refreshToken(req.body.refreshToken);
    (0, response_1.successResponse)(res, result, 'تم تجديد رمز الدخول');
}));
router.post('/change-password', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(auth_schema_1.changePasswordSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.post('/forgot-password', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { identifier } = req.body;
    const genericMessage = 'إذا كان الحساب موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور';
    if (!identifier) {
        return (0, response_1.successResponse)(res, { success: true }, genericMessage);
    }
    await auth_service_1.authService.forgotPassword(identifier);
    (0, response_1.successResponse)(res, { success: true }, genericMessage);
}));
router.post('/reset-password', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
        return (0, response_1.errorResponse)(res, 'يرجى إدخال رمز إعادة التعيين وكلمة المرور الجديدة', 400);
    }
    const result = await auth_service_1.authService.resetPassword(resetToken, newPassword);
    (0, response_1.successResponse)(res, result, result.message);
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map