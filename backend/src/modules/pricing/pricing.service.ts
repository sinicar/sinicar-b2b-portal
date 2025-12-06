import prisma from '../../lib/prisma';
import { currencyService } from '../currency/currency.service';
import { SupplierProfile, SupplierGroup, QualityCode } from '@prisma/client';

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

export class PricingService {
  async getEffectiveMargin(supplierId: string): Promise<number> {
    const supplier = await prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      include: { group: true }
    });

    if (!supplier) {
      throw new Error('Supplier not found');
    }

    if (supplier.customMarginPercent !== null) {
      return supplier.customMarginPercent;
    }

    if (supplier.group) {
      return supplier.group.defaultMarginPercent;
    }

    const globalMarginSetting = await prisma.globalSetting.findUnique({
      where: { key: 'pricing.defaultMargin' }
    });

    return globalMarginSetting ? parseFloat(globalMarginSetting.value) : 15;
  }

  async getQualityMarginAdjustment(qualityCodeId?: string): Promise<number> {
    if (!qualityCodeId) return 0;

    const qualityCode = await prisma.qualityCode.findUnique({
      where: { id: qualityCodeId }
    });

    return qualityCode?.defaultMarginAdjust || 0;
  }

  async calculateSellPrice(input: PricingInput): Promise<PricingResult> {
    const { supplierId, supplierCurrency, supplierPrice, customerCurrency, qualityCodeId } = input;

    const breakdown: PricingResult['breakdown'] = [];

    breakdown.push({
      step: 'supplier_price',
      value: supplierPrice,
      description: `Supplier price in ${supplierCurrency}`
    });

    const baseCurrency = await currencyService.getBaseCurrency();
    if (!baseCurrency) {
      throw new Error('Base currency not configured');
    }

    const conversionToBase = await currencyService.convertToBase(supplierPrice, supplierCurrency);
    const basePriceInSystemCurrency = conversionToBase.convertedAmount;

    breakdown.push({
      step: 'base_price',
      value: basePriceInSystemCurrency,
      description: `Converted to ${baseCurrency.code} (rate: ${conversionToBase.exchangeRate})`
    });

    const marginPercent = await this.getEffectiveMargin(supplierId);
    breakdown.push({
      step: 'margin_percent',
      value: marginPercent,
      description: `Supplier margin: ${marginPercent}%`
    });

    const qualityMarginAdjust = await this.getQualityMarginAdjustment(qualityCodeId);
    breakdown.push({
      step: 'quality_margin_adjust',
      value: qualityMarginAdjust,
      description: `Quality code adjustment: ${qualityMarginAdjust}%`
    });

    const totalMargin = marginPercent + qualityMarginAdjust;
    const sellPriceBase = basePriceInSystemCurrency * (1 + totalMargin / 100);

    breakdown.push({
      step: 'sell_price_base',
      value: Math.round(sellPriceBase * 100) / 100,
      description: `Sell price in ${baseCurrency.code} with ${totalMargin}% total margin`
    });

    const targetCurrency = customerCurrency || baseCurrency.code;
    let sellPriceCustomer = sellPriceBase;
    let exchangeRateUsed = 1;

    if (targetCurrency !== baseCurrency.code) {
      const conversionToCustomer = await currencyService.convertFromBase(sellPriceBase, targetCurrency);
      sellPriceCustomer = conversionToCustomer.convertedAmount;
      exchangeRateUsed = conversionToCustomer.exchangeRate;

      breakdown.push({
        step: 'sell_price_customer',
        value: sellPriceCustomer,
        description: `Final price in ${targetCurrency} (rate: ${exchangeRateUsed})`
      });
    }

    return {
      supplierPrice,
      supplierCurrency,
      basePriceInSystemCurrency: Math.round(basePriceInSystemCurrency * 100) / 100,
      marginPercent,
      qualityMarginAdjust,
      sellPriceBase: Math.round(sellPriceBase * 100) / 100,
      customerCurrency: targetCurrency,
      sellPriceCustomer: Math.round(sellPriceCustomer * 100) / 100,
      exchangeRateUsed,
      breakdown
    };
  }

  async calculateShippingCost(params: {
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
  }> {
    const { shippingMethodCode, weightKg, destinationCountry, currency } = params;

    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { code: shippingMethodCode }
    });

    if (!shippingMethod) {
      throw new Error(`Shipping method not found: ${shippingMethodCode}`);
    }

    const zone = await prisma.shippingZone.findFirst({
      where: {
        countries: { has: destinationCountry },
        isActive: true
      }
    });

    const baseCost = shippingMethod.baseRate;
    const weightCost = weightKg * shippingMethod.perKgRate;
    const zoneSurcharge = zone ? weightKg * zone.extraRatePerKg : 0;

    let totalCost = baseCost + weightCost + zoneSurcharge;
    totalCost = Math.max(totalCost, shippingMethod.minCharge);

    const baseCurrency = await currencyService.getBaseCurrency();
    let finalCurrency = baseCurrency?.code || 'SAR';
    let finalCost = totalCost;

    if (currency && currency !== finalCurrency) {
      const conversion = await currencyService.convertFromBase(totalCost, currency);
      finalCost = conversion.convertedAmount;
      finalCurrency = currency;
    }

    return {
      shippingMethod: shippingMethod.name,
      baseCost,
      weightCost,
      zoneSurcharge,
      totalCost: Math.round(finalCost * 100) / 100,
      currency: finalCurrency,
      estimatedDays: shippingMethod.deliveryDays
    };
  }

  async getSupplierGroups(): Promise<SupplierGroup[]> {
    return prisma.supplierGroup.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createSupplierGroup(data: {
    name: string;
    nameAr?: string;
    nameEn?: string;
    description?: string;
    defaultMarginPercent: number;
  }): Promise<SupplierGroup> {
    return prisma.supplierGroup.create({ data });
  }

  async updateSupplierGroup(id: string, data: Partial<{
    name: string;
    nameAr: string;
    nameEn: string;
    description: string;
    defaultMarginPercent: number;
    isActive: boolean;
  }>): Promise<SupplierGroup> {
    return prisma.supplierGroup.update({
      where: { id },
      data
    });
  }

  async deleteSupplierGroup(id: string): Promise<void> {
    await prisma.supplierGroup.update({ where: { id }, data: { isActive: false } });
  }

  async getQualityCodes() {
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
    description?: string;
    defaultMarginAdjust?: number;
  }) {
    return prisma.qualityCode.create({ data });
  }

  async updateQualityCode(id: string, data: Partial<{
    code: string;
    label: string;
    labelAr: string;
    labelEn: string;
    description: string;
    defaultMarginAdjust: number;
    isActive: boolean;
    sortOrder: number;
  }>) {
    return prisma.qualityCode.update({ where: { id }, data });
  }

  async deleteQualityCode(id: string): Promise<void> {
    await prisma.qualityCode.update({ where: { id }, data: { isActive: false } });
  }

  async getBrandCodes() {
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
  }) {
    return prisma.brandCode.create({ data });
  }

  async updateBrandCode(id: string, data: Partial<{
    code: string;
    name: string;
    nameAr: string;
    nameEn: string;
    logoUrl: string;
    country: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
  }>) {
    return prisma.brandCode.update({ where: { id }, data });
  }

  async deleteBrandCode(id: string): Promise<void> {
    await prisma.brandCode.update({ where: { id }, data: { isActive: false } });
  }

  async getShippingMethods() {
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
    baseRate?: number;
    perKgRate?: number;
    minCharge?: number;
    deliveryDays?: number;
  }) {
    return prisma.shippingMethod.create({ data });
  }

  async updateShippingMethod(id: string, data: Partial<{
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
  }>) {
    return prisma.shippingMethod.update({ where: { id }, data });
  }

  async deleteShippingMethod(id: string): Promise<void> {
    await prisma.shippingMethod.update({ where: { id }, data: { isActive: false } });
  }

  async getShippingZones() {
    return prisma.shippingZone.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createShippingZone(data: {
    code: string;
    name: string;
    nameAr?: string;
    countries?: string[];
    extraRatePerKg?: number;
  }) {
    return prisma.shippingZone.create({ data });
  }

  async updateShippingZone(id: string, data: Partial<{
    code: string;
    name: string;
    nameAr: string;
    countries: string[];
    extraRatePerKg: number;
    isActive: boolean;
    sortOrder: number;
  }>) {
    return prisma.shippingZone.update({ where: { id }, data });
  }

  async deleteShippingZone(id: string): Promise<void> {
    await prisma.shippingZone.update({ where: { id }, data: { isActive: false } });
  }

  async getRoles() {
    return prisma.role.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async createRole(data: {
    code: string;
    name: string;
    nameAr?: string;
    nameEn?: string;
    description?: string;
    isSystem?: boolean;
  }) {
    return prisma.role.create({ data });
  }

  async updateRole(id: string, data: Partial<{
    code: string;
    name: string;
    nameAr: string;
    nameEn: string;
    description: string;
    isActive: boolean;
    sortOrder: number;
  }>) {
    return prisma.role.update({ where: { id }, data });
  }

  async deleteRole(id: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.isSystem) {
      throw new Error('Cannot delete system roles');
    }
    await prisma.role.update({ where: { id }, data: { isActive: false } });
  }
}

export const pricingService = new PricingService();
