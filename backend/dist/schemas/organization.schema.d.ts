import { z } from 'zod';
export declare const createOrganizationSchema: z.ZodObject<{
    type: z.ZodEnum<["CUSTOMER", "SUPPLIER", "ADVERTISER", "AFFILIATE", "PLATFORM"]>;
    name: z.ZodString;
    maxEmployees: z.ZodDefault<z.ZodNumber>;
    allowCustomPermissions: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "SUPPLIER" | "CUSTOMER" | "ADVERTISER" | "AFFILIATE" | "PLATFORM";
    maxEmployees: number;
    allowCustomPermissions: boolean;
}, {
    name: string;
    type: "SUPPLIER" | "CUSTOMER" | "ADVERTISER" | "AFFILIATE" | "PLATFORM";
    maxEmployees?: number | undefined;
    allowCustomPermissions?: boolean | undefined;
}>;
export declare const updateOrganizationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "SUSPENDED", "PENDING"]>>;
    maxEmployees: z.ZodOptional<z.ZodNumber>;
    allowCustomPermissions: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "SUSPENDED" | undefined;
    maxEmployees?: number | undefined;
    allowCustomPermissions?: boolean | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "SUSPENDED" | undefined;
    maxEmployees?: number | undefined;
    allowCustomPermissions?: boolean | undefined;
}>;
export declare const addMemberSchema: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["OWNER", "MANAGER", "STAFF", "READONLY"]>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    jobTitle: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role: "OWNER" | "MANAGER" | "STAFF" | "READONLY";
    userId: string;
    permissions?: string[] | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
}, {
    userId: string;
    role?: "OWNER" | "MANAGER" | "STAFF" | "READONLY" | undefined;
    permissions?: string[] | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
}>;
export declare const updateMemberSchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<["OWNER", "MANAGER", "STAFF", "READONLY"]>>;
    permissions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "PENDING"]>>;
    jobTitle: z.ZodOptional<z.ZodString>;
    department: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    role?: "OWNER" | "MANAGER" | "STAFF" | "READONLY" | undefined;
    status?: "ACTIVE" | "PENDING" | "INACTIVE" | undefined;
    permissions?: string[] | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
}, {
    role?: "OWNER" | "MANAGER" | "STAFF" | "READONLY" | undefined;
    status?: "ACTIVE" | "PENDING" | "INACTIVE" | undefined;
    permissions?: string[] | undefined;
    jobTitle?: string | undefined;
    department?: string | undefined;
}>;
export declare const createInvitationSchema: z.ZodObject<{
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<["OWNER", "MANAGER", "STAFF", "READONLY"]>>;
    expiresInDays: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    email: string;
    role: "OWNER" | "MANAGER" | "STAFF" | "READONLY";
    expiresInDays: number;
    phone?: string | undefined;
}, {
    email: string;
    phone?: string | undefined;
    role?: "OWNER" | "MANAGER" | "STAFF" | "READONLY" | undefined;
    expiresInDays?: number | undefined;
}>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
//# sourceMappingURL=organization.schema.d.ts.map