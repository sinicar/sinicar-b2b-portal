"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketplaceSearchSchema = exports.supplierFilterSchema = exports.bulkUploadCatalogSchema = exports.updateCatalogItemSchema = exports.catalogItemSchema = exports.updateSupplierProfileSchema = exports.createSupplierProfileSchema = void 0;
const zod_1 = require("zod");
exports.createSupplierProfileSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2, 'اسم الشركة يجب أن يكون حرفين على الأقل'),
    contactName: zod_1.z.string().optional(),
    contactPhone: zod_1.z.string().min(10).optional(),
    contactEmail: zod_1.z.string().email().optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    regions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateSupplierProfileSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(2).optional(),
    contactName: zod_1.z.string().optional(),
    contactPhone: zod_1.z.string().min(10).optional(),
    contactEmail: zod_1.z.string().email().optional(),
    status: zod_1.z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    regions: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.catalogItemSchema = zod_1.z.object({
    partNumber: zod_1.z.string().min(1, 'رقم القطعة مطلوب'),
    partName: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    price: zod_1.z.number().min(0, 'السعر يجب أن يكون موجباً'),
    stock: zod_1.z.number().min(0).default(0),
    leadTimeDays: zod_1.z.number().min(1).max(90).default(7),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateCatalogItemSchema = zod_1.z.object({
    partName: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    price: zod_1.z.number().min(0).optional(),
    stock: zod_1.z.number().min(0).optional(),
    leadTimeDays: zod_1.z.number().min(1).max(90).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.bulkUploadCatalogSchema = zod_1.z.object({
    items: zod_1.z.array(exports.catalogItemSchema).min(1).max(1000),
    replaceExisting: zod_1.z.boolean().default(false),
});
exports.supplierFilterSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
    category: zod_1.z.string().optional(),
    region: zod_1.z.string().optional(),
    minRating: zod_1.z.coerce.number().min(0).max(5).optional(),
});
exports.marketplaceSearchSchema = zod_1.z.object({
    partNumber: zod_1.z.string().optional(),
    partName: zod_1.z.string().optional(),
    brand: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    inStock: zod_1.z.coerce.boolean().optional(),
});
//# sourceMappingURL=supplier.schema.js.map