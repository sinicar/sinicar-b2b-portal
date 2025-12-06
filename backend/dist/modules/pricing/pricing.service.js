"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingService = exports.PricingService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const currency_service_1 = require("../currency/currency.service");
class PricingService {
    async getEffectiveMargin(supplierId) {
        const supplier = await prisma_1.default.supplierProfile.findUnique({
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
        const globalMarginSetting = await prisma_1.default.globalSetting.findUnique({
            where: { key: 'pricing.defaultMargin' }
        });
        return globalMarginSetting ? parseFloat(globalMarginSetting.value) : 15;
    }
    async getQualityMarginAdjustment(qualityCodeId) {
        if (!qualityCodeId)
            return 0;
        const qualityCode = await prisma_1.default.qualityCode.findUnique({
            where: { id: qualityCodeId }
        });
        return qualityCode?.defaultMarginAdjust || 0;
    }
    async calculateSellPrice(input) {
        const { supplierId, supplierCurrency, supplierPrice, customerCurrency, qualityCodeId } = input;
        const breakdown = [];
        breakdown.push({
            step: 'supplier_price',
            value: supplierPrice,
            description: `Supplier price in ${supplierCurrency}`
        });
        const baseCurrency = await currency_service_1.currencyService.getBaseCurrency();
        if (!baseCurrency) {
            throw new Error('Base currency not configured');
        }
        const conversionToBase = await currency_service_1.currencyService.convertToBase(supplierPrice, supplierCurrency);
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
            const conversionToCustomer = await currency_service_1.currencyService.convertFromBase(sellPriceBase, targetCurrency);
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
    async calculateShippingCost(params) {
        const { shippingMethodCode, weightKg, destinationCountry, currency } = params;
        const shippingMethod = await prisma_1.default.shippingMethod.findUnique({
            where: { code: shippingMethodCode }
        });
        if (!shippingMethod) {
            throw new Error(`Shipping method not found: ${shippingMethodCode}`);
        }
        const zone = await prisma_1.default.shippingZone.findFirst({
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
        const baseCurrency = await currency_service_1.currencyService.getBaseCurrency();
        let finalCurrency = baseCurrency?.code || 'SAR';
        let finalCost = totalCost;
        if (currency && currency !== finalCurrency) {
            const conversion = await currency_service_1.currencyService.convertFromBase(totalCost, currency);
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
    async getSupplierGroups() {
        return prisma_1.default.supplierGroup.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async createSupplierGroup(data) {
        return prisma_1.default.supplierGroup.create({ data });
    }
    async updateSupplierGroup(id, data) {
        return prisma_1.default.supplierGroup.update({
            where: { id },
            data
        });
    }
    async deleteSupplierGroup(id) {
        await prisma_1.default.supplierGroup.update({ where: { id }, data: { isActive: false } });
    }
    async getQualityCodes() {
        return prisma_1.default.qualityCode.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async createQualityCode(data) {
        return prisma_1.default.qualityCode.create({ data });
    }
    async updateQualityCode(id, data) {
        return prisma_1.default.qualityCode.update({ where: { id }, data });
    }
    async deleteQualityCode(id) {
        await prisma_1.default.qualityCode.update({ where: { id }, data: { isActive: false } });
    }
    async getBrandCodes() {
        return prisma_1.default.brandCode.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async createBrandCode(data) {
        return prisma_1.default.brandCode.create({ data });
    }
    async updateBrandCode(id, data) {
        return prisma_1.default.brandCode.update({ where: { id }, data });
    }
    async deleteBrandCode(id) {
        await prisma_1.default.brandCode.update({ where: { id }, data: { isActive: false } });
    }
    async getShippingMethods() {
        return prisma_1.default.shippingMethod.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async createShippingMethod(data) {
        return prisma_1.default.shippingMethod.create({ data });
    }
    async updateShippingMethod(id, data) {
        return prisma_1.default.shippingMethod.update({ where: { id }, data });
    }
    async deleteShippingMethod(id) {
        await prisma_1.default.shippingMethod.update({ where: { id }, data: { isActive: false } });
    }
    async getShippingZones() {
        return prisma_1.default.shippingZone.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async createShippingZone(data) {
        return prisma_1.default.shippingZone.create({ data });
    }
    async updateShippingZone(id, data) {
        return prisma_1.default.shippingZone.update({ where: { id }, data });
    }
    async deleteShippingZone(id) {
        await prisma_1.default.shippingZone.update({ where: { id }, data: { isActive: false } });
    }
    async getRoles() {
        return prisma_1.default.role.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
    }
    async createRole(data) {
        return prisma_1.default.role.create({ data });
    }
    async updateRole(id, data) {
        return prisma_1.default.role.update({ where: { id }, data });
    }
    async deleteRole(id) {
        const role = await prisma_1.default.role.findUnique({ where: { id } });
        if (role?.isSystem) {
            throw new Error('Cannot delete system roles');
        }
        await prisma_1.default.role.update({ where: { id }, data: { isActive: false } });
    }
}
exports.PricingService = PricingService;
exports.pricingService = new PricingService();
//# sourceMappingURL=pricing.service.js.map