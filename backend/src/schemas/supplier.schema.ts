import { z } from 'zod';

export const createSupplierProfileSchema = z.object({
  companyName: z.string().min(2, 'اسم الشركة يجب أن يكون حرفين على الأقل'),
  contactName: z.string().optional(),
  contactPhone: z.string().min(10).optional(),
  contactEmail: z.string().email().optional(),
  categories: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
});

export const updateSupplierProfileSchema = z.object({
  companyName: z.string().min(2).optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().min(10).optional(),
  contactEmail: z.string().email().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  categories: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
});

export const catalogItemSchema = z.object({
  partNumber: z.string().min(1, 'رقم القطعة مطلوب'),
  partName: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
  stock: z.number().min(0).default(0),
  leadTimeDays: z.number().min(1).max(90).default(7),
  isActive: z.boolean().default(true),
});

export const updateCatalogItemSchema = z.object({
  partName: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  leadTimeDays: z.number().min(1).max(90).optional(),
  isActive: z.boolean().optional(),
});

export const bulkUploadCatalogSchema = z.object({
  items: z.array(catalogItemSchema).min(1).max(1000),
  replaceExisting: z.boolean().default(false),
});

export const supplierFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  category: z.string().optional(),
  region: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
});

export const marketplaceSearchSchema = z.object({
  partNumber: z.string().optional(),
  partName: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
});

export type CreateSupplierProfileInput = z.infer<typeof createSupplierProfileSchema>;
export type UpdateSupplierProfileInput = z.infer<typeof updateSupplierProfileSchema>;
export type CatalogItemInput = z.infer<typeof catalogItemSchema>;
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>;
export type BulkUploadCatalogInput = z.infer<typeof bulkUploadCatalogSchema>;
export type SupplierFilterInput = z.infer<typeof supplierFilterSchema>;
export type MarketplaceSearchInput = z.infer<typeof marketplaceSearchSchema>;
