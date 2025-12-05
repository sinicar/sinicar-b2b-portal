"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvitationSchema = exports.updateMemberSchema = exports.addMemberSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.createOrganizationSchema = zod_1.z.object({
    type: zod_1.z.enum(['CUSTOMER', 'SUPPLIER', 'ADVERTISER', 'AFFILIATE', 'PLATFORM']),
    name: zod_1.z.string().min(2, 'اسم المنظمة يجب أن يكون حرفين على الأقل'),
    maxEmployees: zod_1.z.number().min(1).max(100).default(10),
    allowCustomPermissions: zod_1.z.boolean().default(false),
});
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).optional(),
    maxEmployees: zod_1.z.number().min(1).max(100).optional(),
    allowCustomPermissions: zod_1.z.boolean().optional(),
});
exports.addMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('معرف المستخدم غير صالح'),
    role: zod_1.z.enum(['OWNER', 'MANAGER', 'STAFF', 'READONLY']).default('STAFF'),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    jobTitle: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
});
exports.updateMemberSchema = zod_1.z.object({
    role: zod_1.z.enum(['OWNER', 'MANAGER', 'STAFF', 'READONLY']).optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
    jobTitle: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
});
exports.createInvitationSchema = zod_1.z.object({
    email: zod_1.z.string().email('البريد الإلكتروني غير صالح'),
    phone: zod_1.z.string().min(10).optional(),
    role: zod_1.z.enum(['OWNER', 'MANAGER', 'STAFF', 'READONLY']).default('STAFF'),
    expiresInDays: zod_1.z.number().min(1).max(30).default(7),
});
//# sourceMappingURL=organization.schema.js.map