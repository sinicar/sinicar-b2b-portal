import { z } from 'zod';

export const installmentItemSchema = z.object({
  partNumber: z.string().min(1, 'رقم القطعة مطلوب'),
  partName: z.string().optional(),
  quantity: z.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
  estimatedPrice: z.number().min(0, 'السعر يجب أن يكون موجباً'),
});

export const createInstallmentRequestSchema = z.object({
  totalRequestedValue: z.number().min(1000, 'الحد الأدنى للتقسيط 1000'),
  paymentFrequency: z.enum(['WEEKLY', 'MONTHLY']).default('MONTHLY'),
  requestedDurationMonths: z.number().min(1).max(24, 'مدة التقسيط 1-24 شهر'),
  items: z.array(installmentItemSchema).min(1, 'يجب إضافة قطعة واحدة على الأقل'),
});

export const adminReviewSchema = z.object({
  sinicarDecision: z.enum(['APPROVED_FULL', 'APPROVED_PARTIAL', 'REJECTED']),
  adminNotes: z.string().optional(),
  allowedForSuppliers: z.boolean().default(false),
});

export const forwardToSuppliersSchema = z.object({
  supplierIds: z.array(z.string().uuid()).min(1, 'يجب اختيار مورد واحد على الأقل'),
});

export const createOfferSchema = z.object({
  sourceType: z.enum(['SINICAR', 'SUPPLIER']).default('SINICAR'),
  supplierId: z.string().uuid().optional(),
  supplierName: z.string().optional(),
  type: z.enum(['FULL', 'PARTIAL']).default('FULL'),
  itemsApproved: z.array(z.object({
    partNumber: z.string(),
    quantity: z.number(),
    approvedPrice: z.number(),
  })).optional(),
  totalApprovedValue: z.number().min(0),
  schedule: z.array(z.object({
    paymentNumber: z.number(),
    dueDate: z.string(),
    amount: z.number(),
    status: z.enum(['PENDING', 'PAID', 'OVERDUE']).default('PENDING'),
  })).optional(),
  notes: z.string().optional(),
});

export const offerResponseSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().optional(),
});

export const installmentFilterSchema = z.object({
  status: z.enum([
    'PENDING_SINICAR_REVIEW',
    'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR',
    'REJECTED_BY_SINICAR',
    'FORWARDED_TO_SUPPLIERS',
    'WAITING_FOR_SUPPLIER_OFFERS',
    'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER',
    'ACTIVE_CONTRACT',
    'COMPLETED',
    'CANCELLED',
    'CLOSED'
  ]).optional(),
  customerId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  minValue: z.coerce.number().optional(),
  maxValue: z.coerce.number().optional(),
});

export type CreateInstallmentRequestInput = z.infer<typeof createInstallmentRequestSchema>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
export type ForwardToSuppliersInput = z.infer<typeof forwardToSuppliersSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type OfferResponseInput = z.infer<typeof offerResponseSchema>;
export type InstallmentFilterInput = z.infer<typeof installmentFilterSchema>;
