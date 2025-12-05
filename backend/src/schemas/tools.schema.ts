import { z } from 'zod';

export const toolConfigSchema = z.object({
  toolKey: z.string().min(1, 'معرف الأداة مطلوب'),
  displayName: z.string().min(2, 'اسم الأداة مطلوب'),
  description: z.string().optional(),
  isEnabled: z.boolean().default(true),
  dailyLimit: z.number().min(0).optional(),
  monthlyLimit: z.number().min(0).optional(),
  requiredPriceLevel: z.string().optional(),
  allowedCustomerTypes: z.array(z.string()).optional(),
});

export const updateToolConfigSchema = z.object({
  displayName: z.string().min(2).optional(),
  description: z.string().optional(),
  isEnabled: z.boolean().optional(),
  dailyLimit: z.number().min(0).optional(),
  monthlyLimit: z.number().min(0).optional(),
  requiredPriceLevel: z.string().optional(),
  allowedCustomerTypes: z.array(z.string()).optional(),
});

export const customerToolsOverrideSchema = z.object({
  customerId: z.string().uuid('معرف العميل غير صالح'),
  overrides: z.record(z.string(), z.object({
    isEnabled: z.boolean().optional(),
    dailyLimit: z.number().min(0).optional(),
    monthlyLimit: z.number().min(0).optional(),
  })),
});

export const priceComparisonSchema = z.object({
  partNumbers: z.array(z.string()).min(1, 'يجب تحديد رقم قطعة واحد على الأقل'),
  supplierIds: z.array(z.string().uuid()).optional(),
});

export const vinExtractionSchema = z.object({
  vinNumber: z.string().length(17, 'رقم الهيكل يجب أن يكون 17 حرفاً'),
});

export const supplierPriceUploadSchema = z.object({
  supplierName: z.string().optional(),
  fileName: z.string().optional(),
  data: z.array(z.object({
    partNumber: z.string(),
    partName: z.string().optional(),
    price: z.number(),
    stock: z.number().optional(),
  })),
});

export const createMarketerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().min(10, 'رقم الجوال غير صالح'),
  paymentMethod: z.string().optional(),
  bankDetails: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    iban: z.string(),
  }).optional(),
  commissionRate: z.number().min(0).max(50).default(5),
});

export const updateMarketerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  paymentMethod: z.string().optional(),
  bankDetails: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    iban: z.string(),
  }).optional(),
  commissionRate: z.number().min(0).max(50).optional(),
});

export const marketerFilterSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  search: z.string().optional(),
  minEarnings: z.coerce.number().optional(),
  minReferrals: z.coerce.number().optional(),
});

export type ToolConfigInput = z.infer<typeof toolConfigSchema>;
export type UpdateToolConfigInput = z.infer<typeof updateToolConfigSchema>;
export type CustomerToolsOverrideInput = z.infer<typeof customerToolsOverrideSchema>;
export type PriceComparisonInput = z.infer<typeof priceComparisonSchema>;
export type VinExtractionInput = z.infer<typeof vinExtractionSchema>;
export type SupplierPriceUploadInput = z.infer<typeof supplierPriceUploadSchema>;
export type CreateMarketerInput = z.infer<typeof createMarketerSchema>;
export type UpdateMarketerInput = z.infer<typeof updateMarketerSchema>;
export type MarketerFilterInput = z.infer<typeof marketerFilterSchema>;
