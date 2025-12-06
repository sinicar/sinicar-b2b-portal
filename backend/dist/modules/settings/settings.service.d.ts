import { GlobalSetting, FeatureFlag, QualityCode, BrandCode, ShippingMethod, ShippingZone, ExcelImportTemplate } from '@prisma/client';
export declare class SettingsService {
    getAllSettings(category?: string): Promise<GlobalSetting[]>;
    getSetting(key: string): Promise<GlobalSetting | null>;
    getSettingValue(key: string, defaultValue?: string): Promise<string>;
    getSettingTyped<T>(key: string, defaultValue: T): Promise<T>;
    setSetting(key: string, value: string, updatedBy?: string): Promise<GlobalSetting>;
    setSettingBulk(settings: {
        key: string;
        value: string;
    }[], updatedBy?: string): Promise<void>;
    createSetting(data: {
        key: string;
        value: string;
        valueType?: string;
        category?: string;
        label?: string;
        labelAr?: string;
        description?: string;
        isEditable?: boolean;
        isVisible?: boolean;
    }): Promise<GlobalSetting>;
    getAllFeatureFlags(): Promise<FeatureFlag[]>;
    getFeatureFlag(key: string): Promise<FeatureFlag | null>;
    isFeatureEnabled(key: string, userId?: string): Promise<boolean>;
    setFeatureFlag(key: string, isEnabled: boolean, enabledFor?: string[]): Promise<FeatureFlag>;
    getAllQualityCodes(): Promise<QualityCode[]>;
    createQualityCode(data: {
        code: string;
        label: string;
        labelAr?: string;
        labelEn?: string;
        labelHi?: string;
        labelZh?: string;
        description?: string;
        defaultMarginAdjust?: number;
    }): Promise<QualityCode>;
    updateQualityCode(id: string, data: Partial<{
        label: string;
        labelAr: string;
        labelEn: string;
        description: string;
        defaultMarginAdjust: number;
        isActive: boolean;
    }>): Promise<QualityCode>;
    getAllBrandCodes(): Promise<BrandCode[]>;
    createBrandCode(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        logoUrl?: string;
        country?: string;
        description?: string;
    }): Promise<BrandCode>;
    updateBrandCode(id: string, data: Partial<{
        name: string;
        nameAr: string;
        nameEn: string;
        logoUrl: string;
        country: string;
        description: string;
        isActive: boolean;
    }>): Promise<BrandCode>;
    getAllShippingMethods(): Promise<ShippingMethod[]>;
    createShippingMethod(data: {
        code: string;
        name: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
        baseRate: number;
        perKgRate: number;
        minCharge?: number;
        deliveryDays?: number;
    }): Promise<ShippingMethod>;
    updateShippingMethod(id: string, data: Partial<{
        name: string;
        nameAr: string;
        description: string;
        baseRate: number;
        perKgRate: number;
        minCharge: number;
        deliveryDays: number;
        isActive: boolean;
    }>): Promise<ShippingMethod>;
    getAllShippingZones(): Promise<ShippingZone[]>;
    createShippingZone(data: {
        code: string;
        name: string;
        nameAr?: string;
        countries: string[];
        extraRatePerKg?: number;
    }): Promise<ShippingZone>;
    updateShippingZone(id: string, data: Partial<{
        name: string;
        nameAr: string;
        countries: string[];
        extraRatePerKg: number;
        isActive: boolean;
    }>): Promise<ShippingZone>;
    getAllExcelTemplates(): Promise<ExcelImportTemplate[]>;
    getExcelTemplate(id: string): Promise<ExcelImportTemplate | null>;
    createExcelTemplate(data: {
        name: string;
        nameAr?: string;
        nameEn?: string;
        description?: string;
        templateType?: string;
        languageHint?: string;
        instructionsText?: string;
        instructionsTextAr?: string;
    }): Promise<ExcelImportTemplate>;
}
export declare const settingsService: SettingsService;
//# sourceMappingURL=settings.service.d.ts.map