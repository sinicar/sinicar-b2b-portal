"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignFilterSchema = exports.updateCampaignSchema = exports.createCampaignSchema = exports.updateAdSlotSchema = exports.createAdSlotSchema = exports.addBalanceSchema = exports.updateAdvertiserSchema = exports.createAdvertiserSchema = void 0;
const zod_1 = require("zod");
exports.createAdvertiserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'اسم المعلن يجب أن يكون حرفين على الأقل'),
    contactName: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email().optional(),
    contactPhone: zod_1.z.string().min(10).optional(),
});
exports.updateAdvertiserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    contactName: zod_1.z.string().optional(),
    contactEmail: zod_1.z.string().email().optional(),
    contactPhone: zod_1.z.string().min(10).optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE']).optional(),
});
exports.addBalanceSchema = zod_1.z.object({
    amount: zod_1.z.number().min(1, 'المبلغ يجب أن يكون موجباً'),
    paymentMethod: zod_1.z.string().optional(),
    transactionId: zod_1.z.string().optional(),
});
exports.createAdSlotSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'اسم الموقع مطلوب'),
    location: zod_1.z.string().min(1, 'مكان الإعلان مطلوب'),
    width: zod_1.z.number().min(1),
    height: zod_1.z.number().min(1),
    pricePerDay: zod_1.z.number().min(0),
    pricePerWeek: zod_1.z.number().min(0),
    pricePerMonth: zod_1.z.number().min(0),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateAdSlotSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    location: zod_1.z.string().optional(),
    width: zod_1.z.number().min(1).optional(),
    height: zod_1.z.number().min(1).optional(),
    pricePerDay: zod_1.z.number().min(0).optional(),
    pricePerWeek: zod_1.z.number().min(0).optional(),
    pricePerMonth: zod_1.z.number().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createCampaignSchema = zod_1.z.object({
    advertiserId: zod_1.z.string().uuid('معرف المعلن غير صالح'),
    slotId: zod_1.z.string().uuid('معرف الموقع غير صالح'),
    title: zod_1.z.string().min(2, 'عنوان الحملة مطلوب'),
    imageUrl: zod_1.z.string().url().optional(),
    targetUrl: zod_1.z.string().url().optional(),
    budget: zod_1.z.number().min(0),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
});
exports.updateCampaignSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).optional(),
    imageUrl: zod_1.z.string().url().optional(),
    targetUrl: zod_1.z.string().url().optional(),
    budget: zod_1.z.number().min(0).optional(),
    status: zod_1.z.enum(['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED']).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
exports.campaignFilterSchema = zod_1.z.object({
    advertiserId: zod_1.z.string().uuid().optional(),
    slotId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED']).optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=ad.schema.js.map