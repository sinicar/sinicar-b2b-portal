"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const auth_schema_1 = require("../../schemas/auth.schema");
const password_reset_service_1 = require("./password-reset.service");
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
router.post('/request-password-reset', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { whatsapp, email } = req.body;
    const identifier = whatsapp || email;
    if (!identifier) {
        return (0, response_1.errorResponse)(res, 'يرجى إدخال رقم الواتساب أو البريد الإلكتروني', 400);
    }
    const user = await (0, password_reset_service_1.findUserByWhatsappOrEmail)(identifier);
    if (!user) {
        return (0, response_1.successResponse)(res, {
            success: true,
            message: 'إذا كان الحساب موجوداً، سيتم توليد رمز إعادة التعيين'
        });
    }
    const resetCode = (0, password_reset_service_1.generateResetCode)();
    const expiresAt = (0, password_reset_service_1.getResetCodeExpiry)(15);
    await (0, password_reset_service_1.storeResetCode)(user.id, resetCode, expiresAt);
    (0, response_1.successResponse)(res, {
        success: true,
        message: 'تم توليد رمز إعادة التعيين',
        resetCode,
        expiresIn: '15 minutes'
    });
}));
router.post('/reset-password-with-code', (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { whatsapp, email, resetCode, newPassword } = req.body;
    const identifier = whatsapp || email;
    if (!identifier || !resetCode || !newPassword) {
        return (0, response_1.errorResponse)(res, 'يرجى إدخال جميع الحقول المطلوبة', 400);
    }
    if (newPassword.length < 6) {
        return (0, response_1.errorResponse)(res, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 400);
    }
    const validation = await (0, password_reset_service_1.validateResetCode)(identifier, resetCode);
    if (!validation.valid) {
        return (0, response_1.errorResponse)(res, validation.error || 'رمز غير صالح', 400);
    }
    await (0, password_reset_service_1.updatePassword)(validation.userId, newPassword);
    (0, response_1.successResponse)(res, {
        success: true,
        message: 'تم إعادة تعيين كلمة المرور بنجاح'
    });
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map