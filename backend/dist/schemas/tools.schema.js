"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketerFilterSchema = exports.updateMarketerSchema = exports.createMarketerSchema = exports.supplierPriceUploadSchema = exports.vinExtractionSchema = exports.priceComparisonSchema = exports.customerToolsOverrideSchema = exports.updateToolConfigSchema = exports.toolConfigSchema = void 0;
const zod_1 = require("zod");
exports.toolConfigSchema = zod_1.z.object({
    toolKey: zod_1.z.string().min(1, 'معرف الأداة مطلوب'),
    displayName: zod_1.z.string().min(2, 'اسم الأداة مطلوب'),
    description: zod_1.z.string().optional(),
    isEnabled: zod_1.z.boolean().default(true),
    dailyLimit: zod_1.z.number().min(0).optional(),
    monthlyLimit: zod_1.z.number().min(0).optional(),
    requiredPriceLevel: zod_1.z.string().optional(),
    allowedCustomerTypes: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateToolConfigSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    isEnabled: zod_1.z.boolean().optional(),
    dailyLimit: zod_1.z.number().min(0).optional(),
    monthlyLimit: zod_1.z.number().min(0).optional(),
    requiredPriceLevel: zod_1.z.string().optional(),
    allowedCustomerTypes: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.customerToolsOverrideSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('معرف العميل غير صالح'),
    overrides: zod_1.z.record(zod_1.z.string(), zod_1.z.object({
        isEnabled: zod_1.z.boolean().optional(),
        dailyLimit: zod_1.z.number().min(0).optional(),
        monthlyLimit: zod_1.z.number().min(0).optional(),
    })),
});
exports.priceComparisonSchema = zod_1.z.object({
    partNumbers: zod_1.z.array(zod_1.z.string()).min(1, 'يجب تحديد رقم قطعة واحد على الأقل'),
    supplierIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
exports.vinExtractionSchema = zod_1.z.object({
    vinNumber: zod_1.z.string().length(17, 'رقم الهيكل يجب أن يكون 17 حرفاً'),
});
exports.supplierPriceUploadSchema = zod_1.z.object({
    supplierName: zod_1.z.string().optional(),
    fileName: zod_1.z.string().optional(),
    data: zod_1.z.array(zod_1.z.object({
        partNumber: zod_1.z.string(),
        partName: zod_1.z.string().optional(),
        price: zod_1.z.number(),
        stock: zod_1.z.number().optional(),
    })),
});
exports.createMarketerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: zod_1.z.string().email('البريد الإلكتروني غير صالح'),
    phone: zod_1.z.string().min(10, 'رقم الجوال غير صالح'),
    paymentMethod: zod_1.z.string().optional(),
    bankDetails: zod_1.z.object({
        bankName: zod_1.z.string(),
        accountNumber: zod_1.z.string(),
        iban: zod_1.z.string(),
    }).optional(),
    commissionRate: zod_1.z.number().min(0).max(50).default(5),
});
exports.updateMarketerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(10).optional(),
    status: zod_1.z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
    paymentMethod: zod_1.z.string().optional(),
    bankDetails: zod_1.z.object({
        bankName: zod_1.z.string(),
        accountNumber: zod_1.z.string(),
        iban: zod_1.z.string(),
    }).optional(),
    commissionRate: zod_1.z.number().min(0).max(50).optional(),
});
exports.marketerFilterSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
    search: zod_1.z.string().optional(),
    minEarnings: zod_1.z.coerce.number().optional(),
    minReferrals: zod_1.z.coerce.number().optional(),
});
//# sourceMappingURL=tools.schema.js.map