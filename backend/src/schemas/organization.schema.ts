import { z } from 'zod';

export const createOrganizationSchema = z.object({
  type: z.enum(['CUSTOMER', 'SUPPLIER', 'ADVERTISER', 'AFFILIATE', 'PLATFORM']),
  name: z.string().min(2, 'اسم المنظمة يجب أن يكون حرفين على الأقل'),
  maxEmployees: z.number().min(1).max(100).default(10),
  allowCustomPermissions: z.boolean().default(false),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  maxEmployees: z.number().min(1).max(100).optional(),
  allowCustomPermissions: z.boolean().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid('معرف المستخدم غير صالح'),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'READONLY']).default('STAFF'),
  permissions: z.array(z.string()).optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

export const updateMemberSchema = z.object({
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'READONLY']).optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

export const createInvitationSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(10).optional(),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'READONLY']).default('STAFF'),
  expiresInDays: z.number().min(1).max(30).default(7),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
