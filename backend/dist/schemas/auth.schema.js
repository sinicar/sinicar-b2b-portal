"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.registerSchema = exports.PUBLIC_ROLES = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'معرف العميل مطلوب'),
    password: zod_1.z.string().min(1, 'كلمة المرور مطلوبة'),
    loginType: zod_1.z.enum(['owner', 'staff']).default('owner'),
});
exports.PUBLIC_ROLES = ['CUSTOMER', 'SUPPLIER_LOCAL', 'SUPPLIER_INTERNATIONAL', 'MARKETER'];
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    whatsapp: zod_1.z.string().min(10, 'رقم الواتساب مطلوب ويجب أن يكون 10 أرقام على الأقل'),
    email: zod_1.z.string().email('البريد الإلكتروني غير صالح').optional().or(zod_1.z.literal('')),
    password: zod_1.z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    role: zod_1.z.enum(exports.PUBLIC_ROLES, {
        errorMap: () => ({ message: 'نوع الحساب غير صالح. يجب أن يكون: عميل، مورد محلي، مورد دولي، أو مسوق' })
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'رمز التجديد مطلوب'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('البريد الإلكتروني غير صالح'),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'رمز إعادة التعيين مطلوب'),
    password: zod_1.z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
    newPassword: zod_1.z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
});
//# sourceMappingURL=auth.schema.js.map