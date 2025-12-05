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
export declare const registerSchema: z.ZodObject<{
    clientId: z.ZodString;
    name: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["CUSTOMER_OWNER", "CUSTOMER_STAFF"]>>;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    name: string;
    password: string;
    role: "CUSTOMER_STAFF" | "CUSTOMER_OWNER";
    email?: string | undefined;
    phone?: string | undefined;
}, {
    clientId: string;
    name: string;
    password: string;
    email?: string | undefined;
    phone?: string | undefined;
    role?: "CUSTOMER_STAFF" | "CUSTOMER_OWNER" | undefined;
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