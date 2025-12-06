"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = exports.SettingsService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class SettingsService {
    async getAllSettings(category) {
        return prisma_1.default.globalSetting.findMany({
            where: category ? { category, isVisible: true } : { isVisible: true },
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }]
        });
    }
    async getSetting(key) {
        return prisma_1.default.globalSetting.findUnique({ where: { key } });
    }
    async getSettingValue(key, defaultValue) {
        const setting = await this.getSetting(key);
        return setting?.value ?? defaultValue ?? '';
    }
    async getSettingTyped(key, defaultValue) {
        const setting = await this.getSetting(key);
        if (!setting)
            return defaultValue;
        try {
            switch (setting.valueType) {
                case 'NUMBER': return Number(setting.value);
                case 'BOOLEAN': return (setting.value === 'true');
                case 'JSON': return JSON.parse(setting.value);
                default: return setting.value;
            }
        }
        catch {
            return defaultValue;
        }
    }
    async setSetting(key, value, updatedBy) {
        const existing = await this.getSetting(key);
        if (existing) {
            if (!existing.isEditable) {
                throw new Error(`Setting ${key} is not editable`);
            }
            return prisma_1.default.globalSetting.update({
                where: { key },
                data: { value, updatedBy }
            });
        }
        return prisma_1.default.globalSetting.create({
            data: { key, value, updatedBy }
        });
    }
    async setSettingBulk(settings, updatedBy) {
        await prisma_1.default.$transaction(settings.map(s => prisma_1.default.globalSetting.upsert({
            where: { key: s.key },
            update: { value: s.value, updatedBy },
            create: { key: s.key, value: s.value, updatedBy }
        })));
    }
    async createSetting(data) {
        return prisma_1.default.globalSetting.create({ data });
    }
    async getAllFeatureFlags() {
        return prisma_1.default.featureFlag.findMany({
            orderBy: { key: 'asc' }
        });
    }
    async getFeatureFlag(key) {
        return prisma_1.default.featureFlag.findUnique({ where: { key } });
    }
    async isFeatureEnabled(key, userId) {
        const flag = await this.getFeatureFlag(key);
        if (!flag)
            return false;
        if (!flag.isEnabled)
            return false;
        if (flag.enabledFor.length === 0)
            return true;
        if (userId && flag.enabledFor.includes(userId))
            return true;
        return false;
    }
    async setFeatureFlag(key, isEnabled, enabledFor) {
        return prisma_1.default.featureFlag.upsert({
            where: { key },
            update: { isEnabled, enabledFor: enabledFor ?? [] },
            create: { key, name: key, isEnabled, enabledFor: enabledFor ?? [] }
        });
    }
    async getAllQualityCodes() {
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
    async getAllBrandCodes() {
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
    async getAllShippingMethods() {
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
    async getAllShippingZones() {
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
    async getAllExcelTemplates() {
        return prisma_1.default.excelImportTemplate.findMany({
            where: { isActive: true },
            include: { columns: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getExcelTemplate(id) {
        return prisma_1.default.excelImportTemplate.findUnique({
            where: { id },
            include: { columns: true }
        });
    }
    async createExcelTemplate(data) {
        return prisma_1.default.excelImportTemplate.create({ data });
    }
}
exports.SettingsService = SettingsService;
exports.settingsService = new SettingsService();
//# sourceMappingURL=settings.service.js.map