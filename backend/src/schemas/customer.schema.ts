import { z } from 'zod';

export const createCustomerSchema = z.object({
  clientId: z.string().min(3, 'معرف العميل يجب أن يكون 3 أحرف على الأقل'),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional(),
  phone: z.string().min(10, 'رقم الجوال غير صالح').optional(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['CUSTOMER_OWNER', 'CUSTOMER_STAFF']).default('CUSTOMER_OWNER'),
  profile: z.object({
    companyName: z.string().min(2, 'اسم الشركة مطلوب'),
    phone: z.string().min(10),
    region: z.string().min(1),
    city: z.string().min(1),
    crNumber: z.string().min(1, 'رقم السجل التجاري مطلوب'),
    taxNumber: z.string().min(1, 'الرقم الضريبي مطلوب'),
    nationalAddress: z.string().optional(),
    customerType: z.enum(['PARTS_STORE', 'INSURANCE', 'RENTAL', 'REPRESENTATIVE', 'MAINTENANCE']).default('PARTS_STORE'),
    businessCustomerType: z.enum(['SMALL_STORE', 'MEDIUM_STORE', 'LARGE_STORE', 'CHAIN_STORE', 'INSURANCE_COMPANY', 'RENTAL_COMPANY', 'MAINTENANCE_CENTER', 'SALES_REP']).optional(),
  }),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED', 'PENDING']).optional(),
  searchLimit: z.number().min(0).optional(),
  profile: z.object({
    companyName: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    nationalAddress: z.string().optional(),
    customerType: z.enum(['PARTS_STORE', 'INSURANCE', 'RENTAL', 'REPRESENTATIVE', 'MAINTENANCE']).optional(),
    assignedPriceLevel: z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'VIP']).optional(),
    priceVisibility: z.enum(['VISIBLE', 'HIDDEN']).optional(),
    isApproved: z.boolean().optional(),
    searchPointsTotal: z.number().min(0).optional(),
    staffLimit: z.number().min(0).optional(),
    canActAsSupplier: z.boolean().optional(),
    internalNotes: z.string().optional(),
  }).optional(),
});

export const customerFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED', 'PENDING']).optional(),
  customerType: z.enum(['PARTS_STORE', 'INSURANCE', 'RENTAL', 'REPRESENTATIVE', 'MAINTENANCE']).optional(),
  priceLevel: z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'VIP']).optional(),
  isApproved: z.coerce.boolean().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
