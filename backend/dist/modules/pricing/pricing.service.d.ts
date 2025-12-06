import { SupplierGroup } from '@prisma/client';
export interface PricingInput {
    supplierId: string;
    supplierCurrency: string;
    supplierPrice: number;
    customerCurrency?: string;
    qualityCodeId?: string;
}
export interface PricingResult {
    supplierPrice: number;
    supplierCurrency: string;
    basePriceInSystemCurrency: number;
    marginPercent: number;
    qualityMarginAdjust: number;
    sellPriceBase: number;
    customerCurrency: string;
    sellPriceCustomer: number;
    exchangeRateUsed: number;
    breakdown: {
        step: string;
        value: number;
        description: string;
    }[];
}
export declare class PricingService {
    getEffectiveMargin(supplierId: string): Promise<number>;
    getQualityMarginAdjustment(qualityCodeId?: string): Promise<number>;
    calculateSellPrice(input: PricingInput): Promise<PricingResult>;
    calculateShippingCost(params: {
        shippingMethodCode: string;
        weightKg: number;
        destinationCountry: string;
        currency?: string;
    }): Promise<{
        shippingMethod: string;
        baseCost: number;
        weightCost: number;
        zoneSurcharge: number;
        totalCost: number;
        currency: string;
        estimatedDays: number;
    }>;
    getSupplierGroups(): Promise<SupplierGroup[]>;
    createSupplierGroup(data: {
        name: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
        defaultMarginPercent: number;
    }): Promise<SupplierGroup>;
    updateSupplierGroup(id: string, data: Partial<{
        name: string;
        nameAr: string;
        nameEn: string;
        description: string;
        defaultMarginPercent: number;
        isActive: boolean;
    }>): Promise<SupplierGroup>;
    deleteSupplierGroup(id: string): Promise<void>;
    getQualityCodes(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        label: string;
        labelAr: string | null;
        labelEn: string | null;
        labelHi: string | null;
        labelZh: string | null;
        defaultMarginAdjust: number;
    }[]>;
    createQualityCode(data: {
        code: string;
        label: string;
        labelAr?: string;
        labelEn?: string;
        description?: string;
        defaultMarginAdjust?: number;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        label: string;
        labelAr: string | null;
        labelEn: string | null;
        labelHi: string | null;
        labelZh: string | null;
        defaultMarginAdjust: number;
    }>;
    updateQualityCode(id: string, data: Partial<{
        code: string;
        label: string;
        labelAr: string;
        labelEn: string;
        description: string;
        defaultMarginAdjust: number;
        isActive: boolean;
        sortOrder: number;
    }>): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        label: string;
        labelAr: string | null;
        labelEn: string | null;
        labelHi: string | null;
        labelZh: string | null;
        defaultMarginAdjust: number;
    }>;
    deleteQualityCode(id: string): Promise<void>;
    getBrandCodes(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        country: string | null;
        logoUrl: string | null;
    }[]>;
    createBrandCode(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        logoUrl?: string;
        country?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        country: string | null;
        logoUrl: string | null;
    }>;
    updateBrandCode(id: string, data: Partial<{
        code: string;
        name: string;
        nameAr: string;
        nameEn: string;
        logoUrl: string;
        country: string;
        description: string;
        isActive: boolean;
        sortOrder: number;
    }>): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        country: string | null;
        logoUrl: string | null;
    }>;
    deleteBrandCode(id: string): Promise<void>;
    getShippingMethods(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        baseRate: number;
        perKgRate: number;
        minCharge: number;
        deliveryDays: number;
    }[]>;
    createShippingMethod(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
        baseRate?: number;
        perKgRate?: number;
        minCharge?: number;
        deliveryDays?: number;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        baseRate: number;
        perKgRate: number;
        minCharge: number;
        deliveryDays: number;
    }>;
    updateShippingMethod(id: string, data: Partial<{
        code: string;
        name: string;
        nameAr: string;
        nameEn: string;
        description: string;
        baseRate: number;
        perKgRate: number;
        minCharge: number;
        deliveryDays: number;
        isActive: boolean;
        sortOrder: number;
    }>): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        baseRate: number;
        perKgRate: number;
        minCharge: number;
        deliveryDays: number;
    }>;
    deleteShippingMethod(id: string): Promise<void>;
    getShippingZones(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        sortOrder: number;
        nameAr: string | null;
        countries: string[];
        extraRatePerKg: number;
    }[]>;
    createShippingZone(data: {
        code: string;
        name: string;
        nameAr?: string;
        countries?: string[];
        extraRatePerKg?: number;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        sortOrder: number;
        nameAr: string | null;
        countries: string[];
        extraRatePerKg: number;
    }>;
    updateShippingZone(id: string, data: Partial<{
        code: string;
        name: string;
        nameAr: string;
        countries: string[];
        extraRatePerKg: number;
        isActive: boolean;
        sortOrder: number;
    }>): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        sortOrder: number;
        nameAr: string | null;
        countries: string[];
        extraRatePerKg: number;
    }>;
    deleteShippingZone(id: string): Promise<void>;
    getRoles(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystem: boolean;
    }[]>;
    createRole(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
        isSystem?: boolean;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystem: boolean;
    }>;
    updateRole(id: string, data: Partial<{
        code: string;
        name: string;
        nameAr: string;
        nameEn: string;
        description: string;
        isActive: boolean;
        sortOrder: number;
    }>): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        code: string;
        sortOrder: number;
        nameEn: string | null;
        nameAr: string | null;
        isSystem: boolean;
    }>;
    deleteRole(id: string): Promise<void>;
}
export declare const pricingService: PricingService;
//# sourceMappingURL=pricing.service.d.ts.map