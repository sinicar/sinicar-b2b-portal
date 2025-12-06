import { z } from 'zod';
export declare const createSupplierProfileSchema: z.ZodObject<{
    companyName: z.ZodString;
    contactName: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    companyName: string;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
    categories?: string[] | undefined;
    regions?: string[] | undefined;
}, {
    companyName: string;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
    categories?: string[] | undefined;
    regions?: string[] | undefined;
}>;
export declare const updateSupplierProfileSchema: z.ZodObject<{
    companyName: z.ZodOptional<z.ZodString>;
    contactName: z.ZodOptional<z.ZodString>;
    contactPhone: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]>>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED" | undefined;
    companyName?: string | undefined;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
    categories?: string[] | undefined;
    regions?: string[] | undefined;
}, {
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED" | undefined;
    companyName?: string | undefined;
    contactName?: string | undefined;
    contactPhone?: string | undefined;
    contactEmail?: string | undefined;
    categories?: string[] | undefined;
    regions?: string[] | undefined;
}>;
export declare const catalogItemSchema: z.ZodObject<{
    partNumber: z.ZodString;
    partName: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    stock: z.ZodDefault<z.ZodNumber>;
    leadTimeDays: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive: boolean;
    partNumber: string;
    stock: number;
    price: number;
    leadTimeDays: number;
    partName?: string | undefined;
    brand?: string | undefined;
}, {
    partNumber: string;
    price: number;
    isActive?: boolean | undefined;
    partName?: string | undefined;
    brand?: string | undefined;
    stock?: number | undefined;
    leadTimeDays?: number | undefined;
}>;
export declare const updateCatalogItemSchema: z.ZodObject<{
    partName: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodOptional<z.ZodNumber>;
    leadTimeDays: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    partName?: string | undefined;
    brand?: string | undefined;
    stock?: number | undefined;
    price?: number | undefined;
    leadTimeDays?: number | undefined;
}, {
    isActive?: boolean | undefined;
    partName?: string | undefined;
    brand?: string | undefined;
    stock?: number | undefined;
    price?: number | undefined;
    leadTimeDays?: number | undefined;
}>;
export declare const bulkUploadCatalogSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        partNumber: z.ZodString;
        partName: z.ZodOptional<z.ZodString>;
        brand: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
        stock: z.ZodDefault<z.ZodNumber>;
        leadTimeDays: z.ZodDefault<z.ZodNumber>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        isActive: boolean;
        partNumber: string;
        stock: number;
        price: number;
        leadTimeDays: number;
        partName?: string | undefined;
        brand?: string | undefined;
    }, {
        partNumber: string;
        price: number;
        isActive?: boolean | undefined;
        partName?: string | undefined;
        brand?: string | undefined;
        stock?: number | undefined;
        leadTimeDays?: number | undefined;
    }>, "many">;
    replaceExisting: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    items: {
        isActive: boolean;
        partNumber: string;
        stock: number;
        price: number;
        leadTimeDays: number;
        partName?: string | undefined;
        brand?: string | undefined;
    }[];
    replaceExisting: boolean;
}, {
    items: {
        partNumber: string;
        price: number;
        isActive?: boolean | undefined;
        partName?: string | undefined;
        brand?: string | undefined;
        stock?: number | undefined;
        leadTimeDays?: number | undefined;
    }[];
    replaceExisting?: boolean | undefined;
}>;
export declare const supplierFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]>>;
    category: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    minRating: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED" | undefined;
    region?: string | undefined;
    category?: string | undefined;
    minRating?: number | undefined;
}, {
    search?: string | undefined;
    status?: "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED" | undefined;
    region?: string | undefined;
    category?: string | undefined;
    minRating?: number | undefined;
}>;
export declare const marketplaceSearchSchema: z.ZodObject<{
    partNumber: z.ZodOptional<z.ZodString>;
    partName: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    inStock: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    partNumber?: string | undefined;
    partName?: string | undefined;
    brand?: string | undefined;
    category?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inStock?: boolean | undefined;
}, {
    partNumber?: string | undefined;
    partName?: string | undefined;
    brand?: string | undefined;
    category?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inStock?: boolean | undefined;
}>;
export type CreateSupplierProfileInput = z.infer<typeof createSupplierProfileSchema>;
export type UpdateSupplierProfileInput = z.infer<typeof updateSupplierProfileSchema>;
export type CatalogItemInput = z.infer<typeof catalogItemSchema>;
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>;
export type BulkUploadCatalogInput = z.infer<typeof bulkUploadCatalogSchema>;
export type SupplierFilterInput = z.infer<typeof supplierFilterSchema>;
export type MarketplaceSearchInput = z.infer<typeof marketplaceSearchSchema>;
//# sourceMappingURL=supplier.schema.d.ts.map