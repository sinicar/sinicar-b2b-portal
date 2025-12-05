import { Prisma } from '@prisma/client';
import { SupplierStatus } from '../../types/enums';
import { PaginationParams } from '../../utils/pagination';
export interface SupplierFilters {
    search?: string;
    status?: SupplierStatus;
    category?: string;
    region?: string;
    minRating?: number;
}
export interface MarketplaceFilters {
    partNumber?: string;
    partName?: string;
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
}
export declare class SupplierRepository {
    findMany(filters: SupplierFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            catalogItems: number;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        companyName: string;
        customerId: string;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        categories: string | null;
        regions: string | null;
        rating: number;
        totalRevenue: number;
    }>>;
    findById(id: string): Promise<({
        catalogItems: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            partNumber: string;
            partName: string | null;
            brand: string | null;
            stock: number;
            supplierId: string;
            price: number;
            leadTimeDays: number;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        companyName: string;
        customerId: string;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        categories: string | null;
        regions: string | null;
        rating: number;
        totalRevenue: number;
    }) | null>;
    findByCustomerId(customerId: string): Promise<({
        catalogItems: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            partNumber: string;
            partName: string | null;
            brand: string | null;
            stock: number;
            supplierId: string;
            price: number;
            leadTimeDays: number;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        companyName: string;
        customerId: string;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        categories: string | null;
        regions: string | null;
        rating: number;
        totalRevenue: number;
    }) | null>;
    create(data: {
        customerId: string;
        companyName: string;
        contactName?: string;
        contactPhone?: string;
        contactEmail?: string;
        categories?: string[];
        regions?: string[];
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        companyName: string;
        customerId: string;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        categories: string | null;
        regions: string | null;
        rating: number;
        totalRevenue: number;
    }>;
    update(id: string, data: Prisma.SupplierProfileUpdateInput): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        companyName: string;
        customerId: string;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        categories: string | null;
        regions: string | null;
        rating: number;
        totalRevenue: number;
    }>;
    delete(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        companyName: string;
        customerId: string;
        contactName: string | null;
        contactPhone: string | null;
        contactEmail: string | null;
        categories: string | null;
        regions: string | null;
        rating: number;
        totalRevenue: number;
    }>;
    addCatalogItem(supplierId: string, data: {
        partNumber: string;
        partName?: string;
        brand?: string;
        price: number;
        stock?: number;
        leadTimeDays?: number;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partNumber: string;
        partName: string | null;
        brand: string | null;
        stock: number;
        supplierId: string;
        price: number;
        leadTimeDays: number;
    }>;
    updateCatalogItem(id: string, data: Prisma.SupplierCatalogItemUpdateInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partNumber: string;
        partName: string | null;
        brand: string | null;
        stock: number;
        supplierId: string;
        price: number;
        leadTimeDays: number;
    }>;
    deleteCatalogItem(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partNumber: string;
        partName: string | null;
        brand: string | null;
        stock: number;
        supplierId: string;
        price: number;
        leadTimeDays: number;
    }>;
    getCatalogItems(supplierId: string, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partNumber: string;
        partName: string | null;
        brand: string | null;
        stock: number;
        supplierId: string;
        price: number;
        leadTimeDays: number;
    }>>;
    bulkUpsertCatalog(supplierId: string, items: Array<{
        partNumber: string;
        partName?: string;
        brand?: string;
        price: number;
        stock?: number;
        leadTimeDays?: number;
    }>, replaceExisting?: boolean): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partNumber: string;
        partName: string | null;
        brand: string | null;
        stock: number;
        supplierId: string;
        price: number;
        leadTimeDays: number;
    }[]>;
    searchMarketplace(filters: MarketplaceFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        supplier: {
            id: string;
            companyName: string;
            rating: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        partNumber: string;
        partName: string | null;
        brand: string | null;
        stock: number;
        supplierId: string;
        price: number;
        leadTimeDays: number;
    }>>;
    getSettings(): Promise<{
        id: string;
        key: string;
        enableMarketplace: boolean;
        hideRealSupplierFromCustomer: boolean;
        markupPercentage: number;
    } | null>;
    updateSettings(data: Prisma.SupplierMarketplaceSettingsUpdateInput): Promise<{
        id: string;
        key: string;
        enableMarketplace: boolean;
        hideRealSupplierFromCustomer: boolean;
        markupPercentage: number;
    }>;
}
export declare const supplierRepository: SupplierRepository;
//# sourceMappingURL=supplier.repository.d.ts.map