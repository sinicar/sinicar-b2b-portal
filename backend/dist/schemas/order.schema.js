"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuoteStatusSchema = exports.createQuoteRequestSchema = exports.quoteItemSchema = exports.orderFilterSchema = exports.updateInternalStatusSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.orderItemSchema = void 0;
const zod_1 = require("zod");
exports.orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('معرف المنتج غير صالح'),
    partNumber: zod_1.z.string().min(1, 'رقم القطعة مطلوب'),
    name: zod_1.z.string().min(1, 'اسم القطعة مطلوب'),
    quantity: zod_1.z.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
    unitPrice: zod_1.z.number().min(0, 'السعر يجب أن يكون موجباً'),
});
exports.createOrderSchema = zod_1.z.object({
    branchId: zod_1.z.string().uuid().optional(),
    items: zod_1.z.array(exports.orderItemSchema).min(1, 'يجب إضافة منتج واحد على الأقل'),
    notes: zod_1.z.string().optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    note: zod_1.z.string().optional(),
});
exports.updateInternalStatusSchema = zod_1.z.object({
    internalStatus: zod_1.z.enum([
        'NEW',
        'SENT_TO_WAREHOUSE',
        'WAITING_PAYMENT',
        'PAYMENT_CONFIRMED',
        'SALES_INVOICE_CREATED',
        'READY_FOR_SHIPMENT',
        'COMPLETED_INTERNAL',
        'CANCELLED_INTERNAL'
    ]),
    internalNotes: zod_1.z.string().optional(),
});
exports.orderFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
    internalStatus: zod_1.z.string().optional(),
    userId: zod_1.z.string().uuid().optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
    minAmount: zod_1.z.coerce.number().optional(),
    maxAmount: zod_1.z.coerce.number().optional(),
});
exports.quoteItemSchema = zod_1.z.object({
    partNumber: zod_1.z.string().min(1, 'رقم القطعة مطلوب'),
    partName: zod_1.z.string().optional(),
    requestedQty: zod_1.z.number().min(1, 'الكمية المطلوبة يجب أن تكون 1 على الأقل'),
    notes: zod_1.z.string().optional(),
});
exports.createQuoteRequestSchema = zod_1.z.object({
    items: zod_1.z.array(exports.quoteItemSchema).min(1, 'يجب إضافة قطعة واحدة على الأقل'),
    priceType: zod_1.z.string().optional(),
});
exports.updateQuoteStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['NEW', 'UNDER_REVIEW', 'PROCESSED', 'EXPIRED', 'CANCELLED']),
});
//# sourceMappingURL=order.schema.js.map