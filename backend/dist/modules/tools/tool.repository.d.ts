import { Prisma } from '@prisma/client';
import { MarketerStatus } from '../../types/enums';
import { PaginationParams } from '../../utils/pagination';
export interface MarketerFilters {
    status?: MarketerStatus;
    search?: string;
    minEarnings?: number;
    minReferrals?: number;
}
export declare class ToolRepository {
    findToolConfigs(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        toolKey: string;
        displayName: string;
        isEnabled: boolean;
        dailyLimit: number | null;
        monthlyLimit: number | null;
        requiredPriceLevel: string | null;
        allowedCustomerTypes: string | null;
    }[]>;
    findToolConfigByKey(toolKey: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        toolKey: string;
        displayName: string;
        isEnabled: boolean;
        dailyLimit: number | null;
        monthlyLimit: number | null;
        requiredPriceLevel: string | null;
        allowedCustomerTypes: string | null;
    } | null>;
    createToolConfig(data: {
        toolKey: string;
        displayName: string;
        description?: string;
        isEnabled?: boolean;
        dailyLimit?: number;
        monthlyLimit?: number;
        requiredPriceLevel?: string;
        allowedCustomerTypes?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        toolKey: string;
        displayName: string;
        isEnabled: boolean;
        dailyLimit: number | null;
        monthlyLimit: number | null;
        requiredPriceLevel: string | null;
        allowedCustomerTypes: string | null;
    }>;
    updateToolConfig(toolKey: string, data: Prisma.ToolConfigUpdateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        toolKey: string;
        displayName: string;
        isEnabled: boolean;
        dailyLimit: number | null;
        monthlyLimit: number | null;
        requiredPriceLevel: string | null;
        allowedCustomerTypes: string | null;
    }>;
    deleteToolConfig(toolKey: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        toolKey: string;
        displayName: string;
        isEnabled: boolean;
        dailyLimit: number | null;
        monthlyLimit: number | null;
        requiredPriceLevel: string | null;
        allowedCustomerTypes: string | null;
    }>;
    getCustomerToolOverrides(customerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        overrides: string;
    } | null>;
    upsertCustomerToolOverrides(customerId: string, overrides: object): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        customerId: string;
        overrides: string;
    }>;
    recordToolUsage(customerId: string, toolKey: string, metadata?: object): Promise<{
        id: string;
        metadata: string | null;
        customerId: string;
        toolKey: string;
        usageDate: Date;
    }>;
    getToolUsageCount(customerId: string, toolKey: string, since: Date): Promise<number>;
    savePriceComparison(data: {
        customerId: string;
        partNumbers: string[];
        supplierIds?: string[];
        results?: object;
    }): Promise<{
        id: string;
        createdAt: Date;
        customerId: string;
        supplierIds: string | null;
        partNumbers: string;
        results: string | null;
    }>;
    saveVinExtraction(data: {
        customerId: string;
        vinNumber: string;
        extractedData: object;
    }): Promise<{
        id: string;
        createdAt: Date;
        customerId: string;
        vinNumber: string;
        extractedData: string;
    }>;
    saveSupplierPriceRecord(data: {
        customerId: string;
        fileName?: string;
        supplierName?: string;
        data: object[];
    }): Promise<{
        id: string;
        createdAt: Date;
        data: string;
        fileName: string | null;
        customerId: string;
        supplierName: string | null;
    }>;
    findMarketers(filters: MarketerFilters, pagination: PaginationParams): Promise<import("../../utils/pagination").PaginatedResult<{
        _count: {
            referrals: number;
            commissions: number;
        };
    } & {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        paymentMethod: string | null;
        bankDetails: string | null;
        commissionRate: number;
        referralCode: string;
        referralUrl: string | null;
        referralCount: number;
        totalEarnings: number;
        pendingPayouts: number;
        paidAmount: number;
        approvedAt: Date | null;
    }>>;
    findMarketerById(id: string): Promise<({
        referrals: {
            id: string;
            status: string;
            createdAt: Date;
            customerId: string;
            customerName: string | null;
            convertedAt: Date | null;
            marketerId: string;
        }[];
        commissions: {
            id: string;
            status: string;
            createdAt: Date;
            orderId: string;
            customerId: string;
            customerName: string | null;
            commissionRate: number;
            approvedAt: Date | null;
            marketerId: string;
            orderAmount: number;
            commissionAmount: number;
            paidAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        paymentMethod: string | null;
        bankDetails: string | null;
        commissionRate: number;
        referralCode: string;
        referralUrl: string | null;
        referralCount: number;
        totalEarnings: number;
        pendingPayouts: number;
        paidAmount: number;
        approvedAt: Date | null;
    }) | null>;
    findMarketerByReferralCode(referralCode: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        paymentMethod: string | null;
        bankDetails: string | null;
        commissionRate: number;
        referralCode: string;
        referralUrl: string | null;
        referralCount: number;
        totalEarnings: number;
        pendingPayouts: number;
        paidAmount: number;
        approvedAt: Date | null;
    } | null>;
    createMarketer(data: {
        userId?: string;
        name: string;
        email: string;
        phone: string;
        paymentMethod?: string;
        bankDetails?: object;
        commissionRate?: number;
        referralCode: string;
        referralUrl?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        paymentMethod: string | null;
        bankDetails: string | null;
        commissionRate: number;
        referralCode: string;
        referralUrl: string | null;
        referralCount: number;
        totalEarnings: number;
        pendingPayouts: number;
        paidAmount: number;
        approvedAt: Date | null;
    }>;
    updateMarketer(id: string, data: Prisma.MarketerUpdateInput): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        paymentMethod: string | null;
        bankDetails: string | null;
        commissionRate: number;
        referralCode: string;
        referralUrl: string | null;
        referralCount: number;
        totalEarnings: number;
        pendingPayouts: number;
        paidAmount: number;
        approvedAt: Date | null;
    }>;
    deleteMarketer(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        paymentMethod: string | null;
        bankDetails: string | null;
        commissionRate: number;
        referralCode: string;
        referralUrl: string | null;
        referralCount: number;
        totalEarnings: number;
        pendingPayouts: number;
        paidAmount: number;
        approvedAt: Date | null;
    }>;
    createReferral(marketerId: string, customerId: string, customerName?: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        customerId: string;
        customerName: string | null;
        convertedAt: Date | null;
        marketerId: string;
    }>;
    convertReferral(referralId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        customerId: string;
        customerName: string | null;
        convertedAt: Date | null;
        marketerId: string;
    }>;
    createCommission(data: {
        marketerId: string;
        orderId: string;
        customerId: string;
        customerName?: string;
        orderAmount: number;
        commissionRate: number;
        commissionAmount: number;
    }): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        orderId: string;
        customerId: string;
        customerName: string | null;
        commissionRate: number;
        approvedAt: Date | null;
        marketerId: string;
        orderAmount: number;
        commissionAmount: number;
        paidAt: Date | null;
    }>;
    approveCommission(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        orderId: string;
        customerId: string;
        customerName: string | null;
        commissionRate: number;
        approvedAt: Date | null;
        marketerId: string;
        orderAmount: number;
        commissionAmount: number;
        paidAt: Date | null;
    }>;
    payCommission(id: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        orderId: string;
        customerId: string;
        customerName: string | null;
        commissionRate: number;
        approvedAt: Date | null;
        marketerId: string;
        orderAmount: number;
        commissionAmount: number;
        paidAt: Date | null;
    } | null>;
    getMarketerSettings(): Promise<{
        id: string;
        key: string;
        enableMarketing: boolean;
        defaultCommissionRate: number;
        minPayoutAmount: number;
        payoutFrequency: string;
    } | null>;
    updateMarketerSettings(data: Prisma.MarketerSettingsUpdateInput): Promise<{
        id: string;
        key: string;
        enableMarketing: boolean;
        defaultCommissionRate: number;
        minPayoutAmount: number;
        payoutFrequency: string;
    }>;
}
export declare const toolRepository: ToolRepository;
//# sourceMappingURL=tool.repository.d.ts.map