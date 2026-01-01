import { Router } from 'express';
import { authService } from './auth.service';
import { authMiddleware, AuthRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, errorResponse } from '../../utils/response';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema
} from '../../schemas/auth.schema';
import {
  generateResetCode,
  getResetCodeExpiry,
  storeResetCode,
  findUserByWhatsappOrEmail,
  validateResetCode,
  updatePassword
} from './password-reset.service';
import { issueCsrfCookie } from '../../security/csrf';
import { issueAuthCookie, clearAuthCookie } from '../../security/authCookie';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(async (req: any, res: any) => {
  const result = await authService.login(req.body);
  
  // Issue CSRF cookie on successful login (if enabled)
  issueCsrfCookie(res);
  
  // Issue HttpOnly auth cookie on successful login (if ENABLE_AUTH_COOKIE=true)
  issueAuthCookie(res, result.accessToken);
  
  successResponse(res, result, 'تم تسجيل الدخول بنجاح');
}));

router.post('/register', validate(registerSchema), asyncHandler(async (req: any, res: any) => {
  const result = await authService.register(req.body);
  createdResponse(res, result, result.message);
}));

router.post('/logout', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await authService.logout(req.user!.id);
  
  // Clear auth cookie on logout (if ENABLE_AUTH_COOKIE=true)
  clearAuthCookie(res);
  
  successResponse(res, result, result.message);
}));

router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const user = await authService.getMe(req.user!.id);
  successResponse(res, user);
}));

router.post('/refresh-token', validate(refreshTokenSchema), asyncHandler(async (req: any, res: any) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  successResponse(res, result, 'تم تجديد رمز الدخول');
}));

router.post('/change-password', authMiddleware, validate(changePasswordSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await authService.changePassword(
    req.user!.id,
    req.body.currentPassword,
    req.body.newPassword
  );
  successResponse(res, result, result.message);
}));

router.post('/forgot-password', asyncHandler(async (req: any, res: any) => {
  const { identifier } = req.body;
  const genericMessage = 'إذا كان الحساب موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور';
  
  if (!identifier) {
    return successResponse(res, { success: true }, genericMessage);
  }
  
  await authService.forgotPassword(identifier);
  successResponse(res, { success: true }, genericMessage);
}));

router.post('/reset-password', asyncHandler(async (req: any, res: any) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return errorResponse(res, 'يرجى إدخال رمز إعادة التعيين وكلمة المرور الجديدة', 400);
  }
  const result = await authService.resetPassword(resetToken, newPassword);
  successResponse(res, result, result.message);
}));

router.post('/request-password-reset', asyncHandler(async (req: any, res: any) => {
  const { whatsapp, email } = req.body;
  const identifier = whatsapp || email;
  
  if (!identifier) {
    return errorResponse(res, 'يرجى إدخال رقم الواتساب أو البريد الإلكتروني', 400);
  }

  const user = await findUserByWhatsappOrEmail(identifier);
  
  if (!user) {
    return successResponse(res, { 
      success: true, 
      message: 'إذا كان الحساب موجوداً، سيتم توليد رمز إعادة التعيين' 
    });
  }

  const resetCode = generateResetCode();
  const expiresAt = getResetCodeExpiry(15);
  
  await storeResetCode(user.id, resetCode, expiresAt);

  successResponse(res, {
    success: true,
    message: 'تم توليد رمز إعادة التعيين',
    resetCode,
    expiresIn: '15 minutes'
  });
}));

router.post('/reset-password-with-code', asyncHandler(async (req: any, res: any) => {
  const { whatsapp, email, resetCode, newPassword } = req.body;
  const identifier = whatsapp || email;

  if (!identifier || !resetCode || !newPassword) {
    return errorResponse(res, 'يرجى إدخال جميع الحقول المطلوبة', 400);
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 400);
  }

  const validation = await validateResetCode(identifier, resetCode);
  
  if (!validation.valid) {
    return errorResponse(res, validation.error || 'رمز غير صالح', 400);
  }

  await updatePassword(validation.userId!, newPassword);

  successResponse(res, { 
    success: true,
    message: 'تم إعادة تعيين كلمة المرور بنجاح'
  });
}));

export default router;
