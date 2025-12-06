import { Prisma } from '@prisma/client';
import { OrderStatus, OrderInternalStatus, QuoteStatus } from '../../types/enums';
import { PaginationParams } from '../../utils/pagination';
export interface OrderFilters {
    search?: string;
    status?: OrderStatus;
    internalStatus?: OrderInternalStatus;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
    minAmount?: number;
    maxAmount?: number;
}
export declare class OrderRepository {
    findMany(filters: OrderFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        user: {
            id: string;
            clientId: string;
            name: string;
            profile: {
                companyName: string | null;
            } | null;
        };
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                partNumber: string;
                nameEn: string | null;
                nameAr: string | null;
                nameZh: string | null;
                brand: string | null;
                category: string | null;
                imageUrl: string | null;
                imageGallery: string[];
                priceRetail: number;
                priceWholesale: number;
                priceVip: number;
                stock: number;
                qualityCodeId: string | null;
                brandCodeId: string | null;
            } | null;
        } & {
            qualityCode: string | null;
            id: string;
            name: string;
            createdAt: Date;
            orderId: string;
            productId: string | null;
            partNumber: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
        statusHistory: {
            id: string;
            status: string;
            changedAt: Date;
            orderId: string;
            changedBy: string;
            note: string | null;
        }[];
    } & {
        currency: string;
        id: string;
        status: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        internalNotes: string | null;
        branchId: string | null;
        internalStatus: string;
        totalAmount: number;
        cancelledBy: string | null;
        cancelledAt: Date | null;
    }>>;
    findById(id: string): Promise<({
        user: {
            profile: {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                companyName: string | null;
                region: string | null;
                city: string | null;
                crNumber: string | null;
                taxNumber: string | null;
                nationalAddress: string | null;
                customerType: string;
                businessCustomerType: string | null;
                assignedPriceLevel: string;
                priceVisibility: string;
                isApproved: boolean;
                searchPointsTotal: number;
                searchPointsRemaining: number;
                suspendedUntil: Date | null;
                internalNotes: string | null;
            } | null;
        } & {
            role: string;
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            password: string | null;
            employeeRole: string | null;
            status: string;
            isActive: boolean;
            parentId: string | null;
            businessId: string | null;
            activationCode: string | null;
            passwordResetToken: string | null;
            passwordResetExpiry: Date | null;
            searchLimit: number;
            searchUsed: number;
            failedLoginAttempts: number;
            lastLoginAt: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            isCustomer: boolean;
            isSupplier: boolean;
            completionPercent: number;
            whatsapp: string | null;
            clientCode: string | null;
            preferredCurrency: string | null;
            preferredLanguage: string;
        };
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                partNumber: string;
                nameEn: string | null;
                nameAr: string | null;
                nameZh: string | null;
                brand: string | null;
                category: string | null;
                imageUrl: string | null;
                imageGallery: string[];
                priceRetail: number;
                priceWholesale: number;
                priceVip: number;
                stock: number;
                qualityCodeId: string | null;
                brandCodeId: string | null;
            } | null;
        } & {
            qualityCode: string | null;
            id: string;
            name: string;
            createdAt: Date;
            orderId: string;
            productId: string | null;
            partNumber: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
        statusHistory: {
            id: string;
            status: string;
            changedAt: Date;
            orderId: string;
            changedBy: string;
            note: string | null;
        }[];
    } & {
        currency: string;
        id: string;
        status: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        internalNotes: string | null;
        branchId: string | null;
        internalStatus: string;
        totalAmount: number;
        cancelledBy: string | null;
        cancelledAt: Date | null;
    }) | null>;
    findByUserId(userId: string, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        items: {
            qualityCode: string | null;
            id: string;
            name: string;
            createdAt: Date;
            orderId: string;
            productId: string | null;
            partNumber: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[];
        statusHistory: {
            id: string;
            status: string;
            changedAt: Date;
            orderId: string;
            changedBy: string;
            note: string | null;
        }[];
    } & {
        currency: string;
        id: string;
        status: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        internalNotes: string | null;
        branchId: string | null;
        internalStatus: string;
        totalAmount: number;
        cancelledBy: string | null;
        cancelledAt: Date | null;
    }>>;
    create(data: {
        userId: string;
        businessId?: string;
        branchId?: string;
        totalAmount: number;
        items: Array<{
            productId: string;
            partNumber: string;
            name: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }>;
    }): Promise<{
        items: {
            qualityCode: string | null;
            id: string;
            name: string;
            createdAt: Date;
            orderId: string;
            productId: string | null;
            partNumber: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        }[];
        statusHistory: {
            id: string;
            status: string;
            changedAt: Date;
            orderId: string;
            changedBy: string;
            note: string | null;
        }[];
    } & {
        currency: string;
        id: string;
        status: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        internalNotes: string | null;
        branchId: string | null;
        internalStatus: string;
        totalAmount: number;
        cancelledBy: string | null;
        cancelledAt: Date | null;
    }>;
    updateStatus(id: string, status: OrderStatus, changedBy: string, note?: string): Promise<[{
        currency: string;
        id: string;
        status: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        internalNotes: string | null;
        branchId: string | null;
        internalStatus: string;
        totalAmount: number;
        cancelledBy: string | null;
        cancelledAt: Date | null;
    }, {
        id: string;
        status: string;
        changedAt: Date;
        orderId: string;
        changedBy: string;
        note: string | null;
    }]>;
    updateInternalStatus(id: string, internalStatus: OrderInternalStatus, internalNotes?: string): Promise<{
        currency: string;
        id: string;
        status: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        internalNotes: string | null;
        branchId: string | null;
        internalStatus: string;
        totalAmount: number;
        cancelledBy: string | null;
        cancelledAt: Date | null;
    }>;
    delete(id: string): Promise<{
        currency: string;
        id: string;
        status: string;
        businessId: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        internalNotes: string | null;
        branchId: string | null;
        internalStatus: string;
        totalAmount: number;
        cancelledBy: string | null;
        cancelledAt: Date | null;
    }>;
    findQuoteRequests(filters: {
        userId?: string;
        status?: QuoteStatus;
    }, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        user: {
            id: string;
            clientId: string;
            name: string;
        };
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                partNumber: string;
                nameEn: string | null;
                nameAr: string | null;
                nameZh: string | null;
                brand: string | null;
                category: string | null;
                imageUrl: string | null;
                imageGallery: string[];
                priceRetail: number;
                priceWholesale: number;
                priceVip: number;
                stock: number;
                qualityCodeId: string | null;
                brandCodeId: string | null;
            } | null;
        } & {
            qualityCode: string | null;
            id: string;
            status: string;
            productId: string | null;
            partNumber: string;
            quoteId: string;
            partName: string | null;
            requestedQty: number;
            matchedPrice: number | null;
            notes: string | null;
        })[];
    } & {
        qualityCode: string | null;
        id: string;
        status: string;
        createdAt: Date;
        userName: string | null;
        userId: string;
        companyName: string | null;
        priceType: string | null;
        resultReady: boolean;
        processedAt: Date | null;
    }>>;
    findQuoteById(id: string): Promise<({
        user: {
            profile: {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                companyName: string | null;
                region: string | null;
                city: string | null;
                crNumber: string | null;
                taxNumber: string | null;
                nationalAddress: string | null;
                customerType: string;
                businessCustomerType: string | null;
                assignedPriceLevel: string;
                priceVisibility: string;
                isApproved: boolean;
                searchPointsTotal: number;
                searchPointsRemaining: number;
                suspendedUntil: Date | null;
                internalNotes: string | null;
            } | null;
        } & {
            role: string;
            id: string;
            clientId: string;
            name: string;
            email: string | null;
            phone: string | null;
            password: string | null;
            employeeRole: string | null;
            status: string;
            isActive: boolean;
            parentId: string | null;
            businessId: string | null;
            activationCode: string | null;
            passwordResetToken: string | null;
            passwordResetExpiry: Date | null;
            searchLimit: number;
            searchUsed: number;
            failedLoginAttempts: number;
            lastLoginAt: Date | null;
            lastActiveAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            isCustomer: boolean;
            isSupplier: boolean;
            completionPercent: number;
            whatsapp: string | null;
            clientCode: string | null;
            preferredCurrency: string | null;
            preferredLanguage: string;
        };
        items: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                partNumber: string;
                nameEn: string | null;
                nameAr: string | null;
                nameZh: string | null;
                brand: string | null;
                category: string | null;
                imageUrl: string | null;
                imageGallery: string[];
                priceRetail: number;
                priceWholesale: number;
                priceVip: number;
                stock: number;
                qualityCodeId: string | null;
                brandCodeId: string | null;
            } | null;
        } & {
            qualityCode: string | null;
            id: string;
            status: string;
            productId: string | null;
            partNumber: string;
            quoteId: string;
            partName: string | null;
            requestedQty: number;
            matchedPrice: number | null;
            notes: string | null;
        })[];
    } & {
        qualityCode: string | null;
        id: string;
        status: string;
        createdAt: Date;
        userName: string | null;
        userId: string;
        companyName: string | null;
        priceType: string | null;
        resultReady: boolean;
        processedAt: Date | null;
    }) | null>;
    createQuoteRequest(data: {
        userId: string;
        userName?: string;
        companyName?: string;
        priceType?: string;
        items: Array<{
            partNumber: string;
            partName?: string;
            requestedQty: number;
            notes?: string;
        }>;
    }): Promise<{
        items: {
            qualityCode: string | null;
            id: string;
            status: string;
            productId: string | null;
            partNumber: string;
            quoteId: string;
            partName: string | null;
            requestedQty: number;
            matchedPrice: number | null;
            notes: string | null;
        }[];
    } & {
        qualityCode: string | null;
        id: string;
        status: string;
        createdAt: Date;
        userName: string | null;
        userId: string;
        companyName: string | null;
        priceType: string | null;
        resultReady: boolean;
        processedAt: Date | null;
    }>;
    updateQuoteStatus(id: string, status: QuoteStatus): Promise<{
        qualityCode: string | null;
        id: string;
        status: string;
        createdAt: Date;
        userName: string | null;
        userId: string;
        companyName: string | null;
        priceType: string | null;
        resultReady: boolean;
        processedAt: Date | null;
    }>;
    updateQuoteItem(itemId: string, data: Prisma.QuoteItemUpdateInput): Promise<{
        qualityCode: string | null;
        id: string;
        status: string;
        productId: string | null;
        partNumber: string;
        quoteId: string;
        partName: string | null;
        requestedQty: number;
        matchedPrice: number | null;
        notes: string | null;
    }>;
    findProducts(search: string, limit?: number): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        partNumber: string;
        nameEn: string | null;
        nameAr: string | null;
        nameZh: string | null;
        brand: string | null;
        category: string | null;
        imageUrl: string | null;
        imageGallery: string[];
        priceRetail: number;
        priceWholesale: number;
        priceVip: number;
        stock: number;
        qualityCodeId: string | null;
        brandCodeId: string | null;
    }[]>;
    findProductByPartNumber(partNumber: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        partNumber: string;
        nameEn: string | null;
        nameAr: string | null;
        nameZh: string | null;
        brand: string | null;
        category: string | null;
        imageUrl: string | null;
        imageGallery: string[];
        priceRetail: number;
        priceWholesale: number;
        priceVip: number;
        stock: number;
        qualityCodeId: string | null;
        brandCodeId: string | null;
    } | null>;
}
export declare const orderRepository: OrderRepository;
//# sourceMappingURL=order.repository.d.ts.map