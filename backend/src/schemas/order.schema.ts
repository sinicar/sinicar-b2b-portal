import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'معرف المنتج مطلوب'), // Accept any string, not just UUID
  partNumber: z.string().min(1, 'رقم القطعة مطلوب'),
  name: z.string().min(1, 'اسم القطعة مطلوب'),
  quantity: z.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
  unitPrice: z.number().min(0, 'السعر يجب أن يكون موجباً'),
});

export const createOrderSchema = z.object({
  branchId: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  note: z.string().optional(),
});

export const updateInternalStatusSchema = z.object({
  internalStatus: z.enum([
    'NEW',
    'SENT_TO_WAREHOUSE',
    'WAITING_PAYMENT',
    'PAYMENT_CONFIRMED',
    'SALES_INVOICE_CREATED',
    'READY_FOR_SHIPMENT',
    'COMPLETED_INTERNAL',
    'CANCELLED_INTERNAL'
  ]),
  internalNotes: z.string().optional(),
});

export const orderFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  internalStatus: z.string().optional(),
  userId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

export const quoteItemSchema = z.object({
  partNumber: z.string().min(1, 'رقم القطعة مطلوب'),
  partName: z.string().optional(),
  requestedQty: z.number().min(1, 'الكمية المطلوبة يجب أن تكون 1 على الأقل'),
  notes: z.string().optional(),
});

export const createQuoteRequestSchema = z.object({
  items: z.array(quoteItemSchema).min(1, 'يجب إضافة قطعة واحدة على الأقل'),
  priceType: z.string().optional(),
});

export const updateQuoteStatusSchema = z.object({
  status: z.enum(['NEW', 'UNDER_REVIEW', 'PROCESSED', 'EXPIRED', 'CANCELLED']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateInternalStatusInput = z.infer<typeof updateInternalStatusSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;
