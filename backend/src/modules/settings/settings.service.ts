import prisma from '../../lib/prisma';
import { GlobalSetting, FeatureFlag, QualityCode, BrandCode, ShippingMethod, ShippingZone, ExcelImportTemplate } from '@prisma/client';

export class SettingsService {
  /**
   * Get all settings as SiteSettings format for Frontend compatibility
   * يُرجع جميع الإعدادات بتنسيق SiteSettings المتوافق مع الـ Frontend
   */
  async getSiteSettings(): Promise<any> {
    const settings = await prisma.globalSetting.findMany();
    
    // Convert key-value pairs to SiteSettings object
    const settingsMap: Record<string, any> = {};
    for (const setting of settings) {
      try {
        // Try to parse JSON values
        if (setting.valueType === 'JSON') {
          settingsMap[setting.key] = JSON.parse(setting.value);
        } else if (setting.valueType === 'BOOLEAN') {
          settingsMap[setting.key] = setting.value === 'true';
        } else if (setting.valueType === 'NUMBER') {
          settingsMap[setting.key] = Number(setting.value);
        } else {
          settingsMap[setting.key] = setting.value;
        }
      } catch {
        settingsMap[setting.key] = setting.value;
      }
    }

    // Build SiteSettings object with defaults
    return {
      siteName: settingsMap['app_name'] || settingsMap['siteName'] || 'SINI CAR',
      description: settingsMap['app_description'] || settingsMap['description'] || '',
      supportPhone: settingsMap['contact_phone'] || settingsMap['supportPhone'] || '',
      supportWhatsapp: settingsMap['whatsapp_number'] || settingsMap['supportWhatsapp'] || '',
      supportEmail: settingsMap['contact_email'] || settingsMap['supportEmail'] || '',
      announcementBarColor: settingsMap['announcementBarColor'] || '#1e3a5f',
      fontFamily: settingsMap['fontFamily'] || 'Almarai',
      maintenanceMode: settingsMap['is_maintenance_mode'] || settingsMap['maintenanceMode'] || false,
      primaryColor: settingsMap['primary_color'] || settingsMap['primaryColor'] || '#1e40af',
      logoUrl: settingsMap['app_logo'] || settingsMap['logoUrl'] || '',
      tickerEnabled: settingsMap['tickerEnabled'] ?? false,
      tickerText: settingsMap['tickerText'] || '',
      tickerSpeed: settingsMap['tickerSpeed'] || 3,
      tickerBgColor: settingsMap['tickerBgColor'] || '#1e3a5f',
      tickerTextColor: settingsMap['tickerTextColor'] || '#ffffff',
      guestModeEnabled: settingsMap['guestModeEnabled'] ?? false,
      minVisibleQty: settingsMap['min_order_amount'] || settingsMap['minVisibleQty'] || 1,
      stockThreshold: settingsMap['stockThreshold'] || 0,
      uiTexts: settingsMap['uiTexts'] || {},
      statusLabels: settingsMap['statusLabels'] || null,
      whySiniCarFeatures: settingsMap['whySiniCarFeatures'] || [],
      guestSettings: settingsMap['guestSettings'] || null,
      orderStatusPointsConfig: settingsMap['orderStatusPointsConfig'] || null,
      authPageTexts: settingsMap['authPageTexts'] || null,
      quantityModalSettings: settingsMap['quantityModalSettings'] || null,
      productImagesSettings: settingsMap['productImagesSettings'] || null,
      // ApiConfig with defaults
      apiConfig: settingsMap['apiConfig'] || {
        baseUrl: '',
        authToken: '',
        enableLiveSync: false,
        endpoints: { products: '', orders: '', customers: '' },
        environment: 'PRODUCTION',
        syncInterval: 'HOURLY',
        syncEntities: { products: false, inventory: false, prices: false, customers: false, orders: false },
        webhooks: [],
        fieldMapping: '{}',
        debugMode: false,
        rateLimit: '100'
      }
    };
  }

  async getAllSettings(category?: string): Promise<GlobalSetting[]> {
    return prisma.globalSetting.findMany({
      where: category ? { category, isVisible: true } : { isVisible: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }]
    });
  }

  async getSetting(key: string): Promise<GlobalSetting | null> {
    return prisma.globalSetting.findUnique({ where: { key } });
  }

  async getSettingValue(key: string, defaultValue?: string): Promise<string> {
    const setting = await this.getSetting(key);
    return setting?.value ?? defaultValue ?? '';
  }

  async getSettingTyped<T>(key: string, defaultValue: T): Promise<T> {
    const setting = await this.getSetting(key);
    if (!setting) return defaultValue;

    try {
      switch (setting.valueType) {
        case 'NUMBER': return Number(setting.value) as T;
        case 'BOOLEAN': return (setting.value === 'true') as T;
        case 'JSON': return JSON.parse(setting.value) as T;
        default: return setting.value as T;
      }
    } catch {
      return defaultValue;
    }
  }

  async setSetting(key: string, value: string, updatedBy?: string): Promise<GlobalSetting> {
    const existing = await this.getSetting(key);
    
    if (existing) {
      if (!existing.isEditable) {
        throw new Error(`Setting ${key} is not editable`);
      }
      return prisma.globalSetting.update({
        where: { key },
        data: { value, updatedBy }
      });
    }

    return prisma.globalSetting.create({
      data: { key, value, updatedBy }
    });
  }

  async setSettingBulk(settings: { key: string; value: string }[], updatedBy?: string): Promise<void> {
    await prisma.$transaction(
      settings.map(s => 
        prisma.globalSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, updatedBy },
          create: { key: s.key, value: s.value, updatedBy }
        })
      )
    );
  }

  async createSetting(data: {
    key: string;
    value: string;
    valueType?: string;
    category?: string;
    label?: string;
    labelAr?: string;
    description?: string;
    isEditable?: boolean;
    isVisible?: boolean;
  }): Promise<GlobalSetting> {
    return prisma.globalSetting.create({ data });
  }

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return prisma.featureFlag.findMany({
      orderBy: { key: 'asc' }
    });
  }

  async getFeatureFlag(key: string): Promise<FeatureFlag | null> {
    return prisma.featureFlag.findUnique({ where: { key } });
  }

  async isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
    const flag = await this.getFeatureFlag(key);
    if (!flag) return false;
    if (!flag.isEnabled) return false;
    if (flag.enabledFor.length === 0) return true;
    if (userId && flag.enabledFor.includes(userId)) return true;
    return false;
  }

  async setFeatureFlag(key: string, isEnabled: boolean, enabledFor?: string[]): Promise<FeatureFlag> {
    return prisma.featureFlag.upsert({
      where: { key },
      update: { isEnabled, enabledFor: enabledFor ?? [] },
      create: { key, name: key, isEnabled, enabledFor: enabledFor ?? [] }
    });
  }

  async getAllQualityCodes(): Promise<QualityCode[]> {
    return prisma.qualityCode.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createQualityCode(data: {
    code: string;
    label: string;
    labelAr?: string;
    labelEn?: string;
    labelHi?: string;
    labelZh?: string;
    description?: string;
    defaultMarginAdjust?: number;
  }): Promise<QualityCode> {
    return prisma.qualityCode.create({ data });
  }

  async updateQualityCode(id: string, data: Partial<{
    label: string;
    labelAr: string;
    labelEn: string;
    description: string;
    defaultMarginAdjust: number;
    isActive: boolean;
  }>): Promise<QualityCode> {
    return prisma.qualityCode.update({ where: { id }, data });
  }

  async getAllBrandCodes(): Promise<BrandCode[]> {
    return prisma.brandCode.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createBrandCode(data: {
    code: string;
    name: string;
    nameAr?: string;
    nameEn?: string;
    logoUrl?: string;
    country?: string;
    description?: string;
  }): Promise<BrandCode> {
    return prisma.brandCode.create({ data });
  }

  async updateBrandCode(id: string, data: Partial<{
    name: string;
    nameAr: string;
    nameEn: string;
    logoUrl: string;
    country: string;
    description: string;
    isActive: boolean;
  }>): Promise<BrandCode> {
    return prisma.brandCode.update({ where: { id }, data });
  }

  async getAllShippingMethods(): Promise<ShippingMethod[]> {
    return prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createShippingMethod(data: {
    code: string;
    name: string;
    nameAr?: string;
    nameEn?: string;
    description?: string;
    baseRate: number;
    perKgRate: number;
    minCharge?: number;
    deliveryDays?: number;
  }): Promise<ShippingMethod> {
    return prisma.shippingMethod.create({ data });
  }

  async updateShippingMethod(id: string, data: Partial<{
    name: string;
    nameAr: string;
    description: string;
    baseRate: number;
    perKgRate: number;
    minCharge: number;
    deliveryDays: number;
    isActive: boolean;
  }>): Promise<ShippingMethod> {
    return prisma.shippingMethod.update({ where: { id }, data });
  }

  async getAllShippingZones(): Promise<ShippingZone[]> {
    return prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createShippingZone(data: {
    code: string;
    name: string;
    nameAr?: string;
    countries: string[];
    extraRatePerKg?: number;
  }): Promise<ShippingZone> {
    return prisma.shippingZone.create({ data });
  }

  async updateShippingZone(id: string, data: Partial<{
    name: string;
    nameAr: string;
    countries: string[];
    extraRatePerKg: number;
    isActive: boolean;
  }>): Promise<ShippingZone> {
    return prisma.shippingZone.update({ where: { id }, data });
  }

  async getAllExcelTemplates(): Promise<ExcelImportTemplate[]> {
    return prisma.excelImportTemplate.findMany({
      where: { isActive: true },
      include: { columns: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getExcelTemplate(id: string): Promise<ExcelImportTemplate | null> {
    return prisma.excelImportTemplate.findUnique({
      where: { id },
      include: { columns: true }
    });
  }

  async createExcelTemplate(data: {
    name: string;
    nameAr?: string;
    nameEn?: string;
    description?: string;
    templateType?: string;
    languageHint?: string;
    instructionsText?: string;
    instructionsTextAr?: string;
  }): Promise<ExcelImportTemplate> {
    return prisma.excelImportTemplate.create({ data });
  }
}

export const settingsService = new SettingsService();
