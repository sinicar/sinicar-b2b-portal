import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'معرف العميل مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  loginType: z.enum(['owner', 'staff']).default('owner'),
});

export const PUBLIC_ROLES = ['CUSTOMER', 'SUPPLIER_LOCAL', 'SUPPLIER_INTERNATIONAL', 'MARKETER'] as const;
export type PublicRole = typeof PUBLIC_ROLES[number];

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  whatsapp: z.string().min(10, 'رقم الواتساب مطلوب ويجب أن يكون 10 أرقام على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(PUBLIC_ROLES, {
    errorMap: () => ({ message: 'نوع الحساب غير صالح. يجب أن يكون: عميل، مورد محلي، مورد دولي، أو مسوق' })
  }),
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
