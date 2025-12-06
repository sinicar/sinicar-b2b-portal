import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
    loginType: z.ZodDefault<z.ZodEnum<["owner", "staff"]>>;
}, "strip", z.ZodTypeAny, {
    password: string;
    identifier: string;
    loginType: "owner" | "staff";
}, {
    password: string;
    identifier: string;
    loginType?: "owner" | "staff" | undefined;
}>;
export declare const PUBLIC_ROLES: readonly ["CUSTOMER", "SUPPLIER_LOCAL", "SUPPLIER_INTERNATIONAL", "MARKETER"];
export type PublicRole = typeof PUBLIC_ROLES[number];
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    whatsapp: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    password: z.ZodString;
    role: z.ZodEnum<["CUSTOMER", "SUPPLIER_LOCAL", "SUPPLIER_INTERNATIONAL", "MARKETER"]>;
}, "strip", z.ZodTypeAny, {
    role: "CUSTOMER" | "SUPPLIER_LOCAL" | "SUPPLIER_INTERNATIONAL" | "MARKETER";
    name: string;
    password: string;
    whatsapp: string;
    email?: string | undefined;
}, {
    role: "CUSTOMER" | "SUPPLIER_LOCAL" | "SUPPLIER_INTERNATIONAL" | "MARKETER";
    name: string;
    password: string;
    whatsapp: string;
    email?: string | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    token: string;
}, {
    password: string;
    token: string;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
//# sourceMappingURL=auth.schema.d.ts.map