"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolService = exports.ToolService = void 0;
const uuid_1 = require("uuid");
const tool_repository_1 = require("./tool.repository");
const errors_1 = require("../../utils/errors");
class ToolService {
    async getToolConfigs() {
        return tool_repository_1.toolRepository.findToolConfigs();
    }
    async getToolConfig(toolKey) {
        const config = await tool_repository_1.toolRepository.findToolConfigByKey(toolKey);
        if (!config) {
            throw new errors_1.NotFoundError('الأداة غير موجودة');
        }
        return config;
    }
    async createToolConfig(input) {
        const existing = await tool_repository_1.toolRepository.findToolConfigByKey(input.toolKey);
        if (existing) {
            throw new errors_1.BadRequestError('الأداة موجودة بالفعل');
        }
        return tool_repository_1.toolRepository.createToolConfig(input);
    }
    async updateToolConfig(toolKey, input) {
        await this.getToolConfig(toolKey);
        const { allowedCustomerTypes, ...data } = input;
        return tool_repository_1.toolRepository.updateToolConfig(toolKey, {
            ...data,
            ...(allowedCustomerTypes && { allowedCustomerTypes: JSON.stringify(allowedCustomerTypes) })
        });
    }
    async deleteToolConfig(toolKey) {
        await this.getToolConfig(toolKey);
        await tool_repository_1.toolRepository.deleteToolConfig(toolKey);
        return { message: 'تم حذف الأداة بنجاح' };
    }
    async getCustomerToolOverrides(customerId) {
        const overrides = await tool_repository_1.toolRepository.getCustomerToolOverrides(customerId);
        if (!overrides)
            return null;
        return {
            ...overrides,
            overrides: JSON.parse(overrides.overrides)
        };
    }
    async setCustomerToolOverrides(input) {
        return tool_repository_1.toolRepository.upsertCustomerToolOverrides(input.customerId, input.overrides);
    }
    async canUseTool(customerId, toolKey) {
        const config = await tool_repository_1.toolRepository.findToolConfigByKey(toolKey);
        if (!config || !config.isEnabled) {
            return { allowed: false, reason: 'الأداة غير متاحة' };
        }
        const overrides = await this.getCustomerToolOverrides(customerId);
        const toolOverride = overrides?.overrides?.[toolKey];
        if (toolOverride?.isEnabled === false) {
            return { allowed: false, reason: 'الأداة معطلة لحسابك' };
        }
        const dailyLimit = toolOverride?.dailyLimit ?? config.dailyLimit;
        const monthlyLimit = toolOverride?.monthlyLimit ?? config.monthlyLimit;
        if (dailyLimit) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dailyUsage = await tool_repository_1.toolRepository.getToolUsageCount(customerId, toolKey, today);
            if (dailyUsage >= dailyLimit) {
                return { allowed: false, reason: 'تم الوصول للحد اليومي' };
            }
        }
        if (monthlyLimit) {
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            const monthlyUsage = await tool_repository_1.toolRepository.getToolUsageCount(customerId, toolKey, monthStart);
            if (monthlyUsage >= monthlyLimit) {
                return { allowed: false, reason: 'تم الوصول للحد الشهري' };
            }
        }
        return { allowed: true };
    }
    async recordToolUsage(customerId, toolKey, metadata) {
        const canUse = await this.canUseTool(customerId, toolKey);
        if (!canUse.allowed) {
            throw new errors_1.BadRequestError(canUse.reason || 'لا يمكن استخدام الأداة');
        }
        return tool_repository_1.toolRepository.recordToolUsage(customerId, toolKey, metadata);
    }
    async comparePrices(customerId, input) {
        await this.recordToolUsage(customerId, 'price_comparison', { partNumbers: input.partNumbers });
        const results = [];
        return tool_repository_1.toolRepository.savePriceComparison({
            customerId,
            partNumbers: input.partNumbers,
            supplierIds: input.supplierIds,
            results
        });
    }
    async extractVin(customerId, input) {
        await this.recordToolUsage(customerId, 'vin_extraction', { vinNumber: input.vinNumber });
        const extractedData = {
            vin: input.vinNumber,
            manufacturer: 'Unknown',
            model: 'Unknown',
            year: 'Unknown',
            engine: 'Unknown',
            transmission: 'Unknown',
            parts: []
        };
        return tool_repository_1.toolRepository.saveVinExtraction({
            customerId,
            vinNumber: input.vinNumber,
            extractedData
        });
    }
    async uploadSupplierPrices(customerId, input) {
        await this.recordToolUsage(customerId, 'supplier_price_upload', {
            fileName: input.fileName,
            itemsCount: input.data.length
        });
        return tool_repository_1.toolRepository.saveSupplierPriceRecord({
            customerId,
            fileName: input.fileName,
            supplierName: input.supplierName,
            data: input.data
        });
    }
    async listMarketers(filters, pagination) {
        return tool_repository_1.toolRepository.findMarketers(filters, pagination);
    }
    async getMarketerById(id) {
        const marketer = await tool_repository_1.toolRepository.findMarketerById(id);
        if (!marketer) {
            throw new errors_1.NotFoundError('المسوق غير موجود');
        }
        return marketer;
    }
    async getMarketerByReferralCode(referralCode) {
        const marketer = await tool_repository_1.toolRepository.findMarketerByReferralCode(referralCode);
        if (!marketer) {
            throw new errors_1.NotFoundError('رمز الإحالة غير صالح');
        }
        return marketer;
    }
    async createMarketer(input) {
        const referralCode = (0, uuid_1.v4)().split('-')[0].toUpperCase();
        const referralUrl = `https://sinicar.com/ref/${referralCode}`;
        return tool_repository_1.toolRepository.createMarketer({
            ...input,
            referralCode,
            referralUrl,
            bankDetails: input.bankDetails
        });
    }
    async updateMarketer(id, input) {
        await this.getMarketerById(id);
        const { bankDetails, ...data } = input;
        return tool_repository_1.toolRepository.updateMarketer(id, {
            ...data,
            ...(bankDetails && { bankDetails: JSON.stringify(bankDetails) })
        });
    }
    async approveMarketer(id) {
        await this.getMarketerById(id);
        return tool_repository_1.toolRepository.updateMarketer(id, {
            status: 'ACTIVE',
            approvedAt: new Date()
        });
    }
    async suspendMarketer(id) {
        await this.getMarketerById(id);
        return tool_repository_1.toolRepository.updateMarketer(id, { status: 'SUSPENDED' });
    }
    async deleteMarketer(id) {
        await this.getMarketerById(id);
        await tool_repository_1.toolRepository.deleteMarketer(id);
        return { message: 'تم حذف المسوق بنجاح' };
    }
    async createReferral(referralCode, customerId, customerName) {
        const marketer = await this.getMarketerByReferralCode(referralCode);
        if (marketer.status !== 'ACTIVE') {
            throw new errors_1.BadRequestError('المسوق غير نشط');
        }
        return tool_repository_1.toolRepository.createReferral(marketer.id, customerId, customerName);
    }
    async recordCommission(marketerId, orderId, customerId, customerName, orderAmount) {
        const marketer = await this.getMarketerById(marketerId);
        const commissionAmount = (orderAmount * marketer.commissionRate) / 100;
        return tool_repository_1.toolRepository.createCommission({
            marketerId,
            orderId,
            customerId,
            customerName,
            orderAmount,
            commissionRate: marketer.commissionRate,
            commissionAmount
        });
    }
    async approveCommission(commissionId) {
        return tool_repository_1.toolRepository.approveCommission(commissionId);
    }
    async payCommission(commissionId) {
        return tool_repository_1.toolRepository.payCommission(commissionId);
    }
    async getMarketerSettings() {
        return tool_repository_1.toolRepository.getMarketerSettings();
    }
    async updateMarketerSettings(data) {
        return tool_repository_1.toolRepository.updateMarketerSettings(data);
    }
    async getMarketerStats(marketerId) {
        const filters = {};
        const allMarketers = await tool_repository_1.toolRepository.findMarketers(filters, { page: 1, limit: 1000 });
        if (marketerId) {
            const marketer = await this.getMarketerById(marketerId);
            return {
                totalEarnings: marketer.totalEarnings,
                pendingPayouts: marketer.pendingPayouts,
                paidAmount: marketer.paidAmount,
                referralCount: marketer.referralCount,
                referrals: marketer.referrals,
                commissions: marketer.commissions
            };
        }
        const stats = {
            totalMarketers: allMarketers.pagination.total,
            activeMarketers: 0,
            pendingMarketers: 0,
            totalReferrals: 0,
            totalCommissions: 0,
            totalPaid: 0
        };
        allMarketers.data.forEach(marketer => {
            if (marketer.status === 'ACTIVE')
                stats.activeMarketers++;
            if (marketer.status === 'PENDING')
                stats.pendingMarketers++;
            stats.totalReferrals += marketer.referralCount;
            stats.totalCommissions += marketer.totalEarnings;
            stats.totalPaid += marketer.paidAmount;
        });
        return stats;
    }
}
exports.ToolService = ToolService;
exports.toolService = new ToolService();
//# sourceMappingURL=tool.service.js.map