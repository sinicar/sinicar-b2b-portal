import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'معرف العميل مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  loginType: z.enum(['owner', 'staff']).default('owner'),
});

export const registerSchema = z.object({
  clientId: z.string().min(3, 'معرف العميل يجب أن يكون 3 أحرف على الأقل'),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional(),
  phone: z.string().min(10, 'رقم الجوال غير صالح').optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['CUSTOMER_OWNER', 'CUSTOMER_STAFF']).default('CUSTOMER_OWNER'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'رمز التجديد مطلوب'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'رمز إعادة التعيين مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
