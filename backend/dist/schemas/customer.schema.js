"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerFilterSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(3, 'معرف العميل يجب أن يكون 3 أحرف على الأقل'),
    name: zod_1.z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
    email: zod_1.z.string().email('البريد الإلكتروني غير صالح').optional(),
    phone: zod_1.z.string().min(10, 'رقم الجوال غير صالح').optional(),
    password: zod_1.z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    role: zod_1.z.enum(['CUSTOMER_OWNER', 'CUSTOMER_STAFF']).default('CUSTOMER_OWNER'),
    profile: zod_1.z.object({
        companyName: zod_1.z.string().min(2, 'اسم الشركة مطلوب'),
        phone: zod_1.z.string().min(10),
        region: zod_1.z.string().min(1),
        city: zod_1.z.string().min(1),
        crNumber: zod_1.z.string().min(1, 'رقم السجل التجاري مطلوب'),
        taxNumber: zod_1.z.string().min(1, 'الرقم الضريبي مطلوب'),
        nationalAddress: zod_1.z.string().optional(),
        customerType: zod_1.z.enum(['PARTS_STORE', 'INSURANCE', 'RENTAL', 'REPRESENTATIVE', 'MAINTENANCE']).default('PARTS_STORE'),
        businessCustomerType: zod_1.z.enum(['SMALL_STORE', 'MEDIUM_STORE', 'LARGE_STORE', 'CHAIN_STORE', 'INSURANCE_COMPANY', 'RENTAL_COMPANY', 'MAINTENANCE_CENTER', 'SALES_REP']).optional(),
    }),
});
exports.updateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(10).optional(),
    isActive: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED', 'PENDING']).optional(),
    searchLimit: zod_1.z.number().min(0).optional(),
    profile: zod_1.z.object({
        companyName: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().min(10).optional(),
        region: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        nationalAddress: zod_1.z.string().optional(),
        customerType: zod_1.z.enum(['PARTS_STORE', 'INSURANCE', 'RENTAL', 'REPRESENTATIVE', 'MAINTENANCE']).optional(),
        assignedPriceLevel: zod_1.z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'VIP']).optional(),
        priceVisibility: zod_1.z.enum(['VISIBLE', 'HIDDEN']).optional(),
        isApproved: zod_1.z.boolean().optional(),
        searchPointsTotal: zod_1.z.number().min(0).optional(),
        staffLimit: zod_1.z.number().min(0).optional(),
        canActAsSupplier: zod_1.z.boolean().optional(),
        internalNotes: zod_1.z.string().optional(),
    }).optional(),
});
exports.customerFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED', 'PENDING']).optional(),
    customerType: zod_1.z.enum(['PARTS_STORE', 'INSURANCE', 'RENTAL', 'REPRESENTATIVE', 'MAINTENANCE']).optional(),
    priceLevel: zod_1.z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'VIP']).optional(),
    isApproved: zod_1.z.coerce.boolean().optional(),
    region: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
});
//# sourceMappingURL=customer.schema.js.map