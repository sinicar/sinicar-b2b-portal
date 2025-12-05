import { z } from 'zod';

export const createAdvertiserSchema = z.object({
  name: z.string().min(2, 'اسم المعلن يجب أن يكون حرفين على الأقل'),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).optional(),
});

export const updateAdvertiserSchema = z.object({
  name: z.string().min(2).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
});

export const addBalanceSchema = z.object({
  amount: z.number().min(1, 'المبلغ يجب أن يكون موجباً'),
  paymentMethod: z.string().optional(),
  transactionId: z.string().optional(),
});

export const createAdSlotSchema = z.object({
  name: z.string().min(2, 'اسم الموقع مطلوب'),
  location: z.string().min(1, 'مكان الإعلان مطلوب'),
  width: z.number().min(1),
  height: z.number().min(1),
  pricePerDay: z.number().min(0),
  pricePerWeek: z.number().min(0),
  pricePerMonth: z.number().min(0),
  isActive: z.boolean().default(true),
});

export const updateAdSlotSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().optional(),
  width: z.number().min(1).optional(),
  height: z.number().min(1).optional(),
  pricePerDay: z.number().min(0).optional(),
  pricePerWeek: z.number().min(0).optional(),
  pricePerMonth: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createCampaignSchema = z.object({
  advertiserId: z.string().uuid('معرف المعلن غير صالح'),
  slotId: z.string().uuid('معرف الموقع غير صالح'),
  title: z.string().min(2, 'عنوان الحملة مطلوب'),
  imageUrl: z.string().url().optional(),
  targetUrl: z.string().url().optional(),
  budget: z.number().min(0),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const updateCampaignSchema = z.object({
  title: z.string().min(2).optional(),
  imageUrl: z.string().url().optional(),
  targetUrl: z.string().url().optional(),
  budget: z.number().min(0).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const campaignFilterSchema = z.object({
  advertiserId: z.string().uuid().optional(),
  slotId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type CreateAdvertiserInput = z.infer<typeof createAdvertiserSchema>;
export type UpdateAdvertiserInput = z.infer<typeof updateAdvertiserSchema>;
export type AddBalanceInput = z.infer<typeof addBalanceSchema>;
export type CreateAdSlotInput = z.infer<typeof createAdSlotSchema>;
export type UpdateAdSlotInput = z.infer<typeof updateAdSlotSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignFilterInput = z.infer<typeof campaignFilterSchema>;
