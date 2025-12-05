"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installmentFilterSchema = exports.offerResponseSchema = exports.createOfferSchema = exports.forwardToSuppliersSchema = exports.adminReviewSchema = exports.createInstallmentRequestSchema = exports.installmentItemSchema = void 0;
const zod_1 = require("zod");
exports.installmentItemSchema = zod_1.z.object({
    partNumber: zod_1.z.string().min(1, 'رقم القطعة مطلوب'),
    partName: zod_1.z.string().optional(),
    quantity: zod_1.z.number().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
    estimatedPrice: zod_1.z.number().min(0, 'السعر يجب أن يكون موجباً'),
});
exports.createInstallmentRequestSchema = zod_1.z.object({
    totalRequestedValue: zod_1.z.number().min(1000, 'الحد الأدنى للتقسيط 1000'),
    paymentFrequency: zod_1.z.enum(['WEEKLY', 'MONTHLY']).default('MONTHLY'),
    requestedDurationMonths: zod_1.z.number().min(1).max(24, 'مدة التقسيط 1-24 شهر'),
    items: zod_1.z.array(exports.installmentItemSchema).min(1, 'يجب إضافة قطعة واحدة على الأقل'),
});
exports.adminReviewSchema = zod_1.z.object({
    sinicarDecision: zod_1.z.enum(['APPROVED_FULL', 'APPROVED_PARTIAL', 'REJECTED']),
    adminNotes: zod_1.z.string().optional(),
    allowedForSuppliers: zod_1.z.boolean().default(false),
});
exports.forwardToSuppliersSchema = zod_1.z.object({
    supplierIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, 'يجب اختيار مورد واحد على الأقل'),
});
exports.createOfferSchema = zod_1.z.object({
    sourceType: zod_1.z.enum(['SINICAR', 'SUPPLIER']).default('SINICAR'),
    supplierId: zod_1.z.string().uuid().optional(),
    supplierName: zod_1.z.string().optional(),
    type: zod_1.z.enum(['FULL', 'PARTIAL']).default('FULL'),
    itemsApproved: zod_1.z.array(zod_1.z.object({
        partNumber: zod_1.z.string(),
        quantity: zod_1.z.number(),
        approvedPrice: zod_1.z.number(),
    })).optional(),
    totalApprovedValue: zod_1.z.number().min(0),
    schedule: zod_1.z.array(zod_1.z.object({
        paymentNumber: zod_1.z.number(),
        dueDate: zod_1.z.string(),
        amount: zod_1.z.number(),
        status: zod_1.z.enum(['PENDING', 'PAID', 'OVERDUE']).default('PENDING'),
    })).optional(),
    notes: zod_1.z.string().optional(),
});
exports.offerResponseSchema = zod_1.z.object({
    action: zod_1.z.enum(['accept', 'reject']),
    reason: zod_1.z.string().optional(),
});
exports.installmentFilterSchema = zod_1.z.object({
    status: zod_1.z.enum([
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
    customerId: zod_1.z.string().uuid().optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
    minValue: zod_1.z.coerce.number().optional(),
    maxValue: zod_1.z.coerce.number().optional(),
});
//# sourceMappingURL=installment.schema.js.map