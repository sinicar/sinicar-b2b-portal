import { SupplierFilters, MarketplaceFilters } from './supplier.repository';
import { PaginationParams } from '../../utils/pagination';
import { CreateSupplierProfileInput, UpdateSupplierProfileInput, CatalogItemInput, BulkUploadCatalogInput } from '../../schemas/supplier.schema';
export declare class SupplierService {
    list(filters: SupplierFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
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
    getById(id: string): Promise<{
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
    }>;
    getByCustomerId(customerId: string): Promise<({
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
    create(customerId: string, input: CreateSupplierProfileInput): Promise<{
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
    update(id: string, customerId: string, input: UpdateSupplierProfileInput): Promise<{
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
    updateStatus(id: string, status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED'): Promise<{
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
    delete(id: string, customerId: string): Promise<{
        message: string;
    }>;
    addCatalogItem(supplierId: string, customerId: string, input: CatalogItemInput): Promise<{
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
    updateCatalogItem(itemId: string, supplierId: string, customerId: string, data: any): Promise<{
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
    deleteCatalogItem(itemId: string, supplierId: string, customerId: string): Promise<{
        message: string;
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
    bulkUploadCatalog(supplierId: string, customerId: string, input: BulkUploadCatalogInput): Promise<{
        message: string;
        itemsCount: number;
    }>;
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
    updateSettings(data: any): Promise<{
        id: string;
        key: string;
        enableMarketplace: boolean;
        hideRealSupplierFromCustomer: boolean;
        markupPercentage: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        pending: number;
        suspended: number;
        totalProducts: number;
        totalRevenue: number;
    }>;
}
export declare const supplierService: SupplierService;
//# sourceMappingURL=supplier.service.d.ts.map