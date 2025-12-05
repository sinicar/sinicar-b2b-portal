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

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(async (req: any, res: any) => {
  const result = await authService.login(req.body);
  successResponse(res, result, 'تم تسجيل الدخول بنجاح');
}));

router.post('/register', validate(registerSchema), asyncHandler(async (req: any, res: any) => {
  const result = await authService.register(req.body);
  createdResponse(res, result, result.message);
}));

router.post('/logout', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await authService.logout(req.user!.id);
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
  successResponse(res, null, 'إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين');
}));

router.post('/reset-password', asyncHandler(async (req: any, res: any) => {
  successResponse(res, null, 'تم إعادة تعيين كلمة المرور بنجاح');
}));

export default router;
