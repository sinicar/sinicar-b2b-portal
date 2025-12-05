"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRepository = exports.ToolRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const pagination_1 = require("../../utils/pagination");
class ToolRepository {
    async findToolConfigs() {
        return prisma_1.default.toolConfig.findMany({
            orderBy: { toolKey: 'asc' }
        });
    }
    async findToolConfigByKey(toolKey) {
        return prisma_1.default.toolConfig.findUnique({
            where: { toolKey }
        });
    }
    async createToolConfig(data) {
        return prisma_1.default.toolConfig.create({
            data: {
                toolKey: data.toolKey,
                displayName: data.displayName,
                description: data.description,
                isEnabled: data.isEnabled ?? true,
                dailyLimit: data.dailyLimit,
                monthlyLimit: data.monthlyLimit,
                requiredPriceLevel: data.requiredPriceLevel,
                allowedCustomerTypes: data.allowedCustomerTypes ? JSON.stringify(data.allowedCustomerTypes) : null
            }
        });
    }
    async updateToolConfig(toolKey, data) {
        return prisma_1.default.toolConfig.update({
            where: { toolKey },
            data
        });
    }
    async deleteToolConfig(toolKey) {
        return prisma_1.default.toolConfig.delete({ where: { toolKey } });
    }
    async getCustomerToolOverrides(customerId) {
        return prisma_1.default.customerToolsOverride.findUnique({
            where: { customerId }
        });
    }
    async upsertCustomerToolOverrides(customerId, overrides) {
        return prisma_1.default.customerToolsOverride.upsert({
            where: { customerId },
            update: { overrides: JSON.stringify(overrides) },
            create: {
                customerId,
                overrides: JSON.stringify(overrides)
            }
        });
    }
    async recordToolUsage(customerId, toolKey, metadata) {
        return prisma_1.default.toolUsageRecord.create({
            data: {
                customerId,
                toolKey,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    }
    async getToolUsageCount(customerId, toolKey, since) {
        return prisma_1.default.toolUsageRecord.count({
            where: {
                customerId,
                toolKey,
                usageDate: { gte: since }
            }
        });
    }
    async savePriceComparison(data) {
        return prisma_1.default.priceComparisonSession.create({
            data: {
                customerId: data.customerId,
                partNumbers: JSON.stringify(data.partNumbers),
                supplierIds: data.supplierIds ? JSON.stringify(data.supplierIds) : null,
                results: data.results ? JSON.stringify(data.results) : null
            }
        });
    }
    async saveVinExtraction(data) {
        return prisma_1.default.vinExtractionRecord.create({
            data: {
                customerId: data.customerId,
                vinNumber: data.vinNumber,
                extractedData: JSON.stringify(data.extractedData)
            }
        });
    }
    async saveSupplierPriceRecord(data) {
        return prisma_1.default.supplierPriceRecord.create({
            data: {
                customerId: data.customerId,
                fileName: data.fileName,
                supplierName: data.supplierName,
                data: JSON.stringify(data.data)
            }
        });
    }
    async findMarketers(filters, pagination) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { email: { contains: filters.search } },
                { phone: { contains: filters.search } }
            ];
        }
        if (filters.minEarnings)
            where.totalEarnings = { gte: filters.minEarnings };
        if (filters.minReferrals)
            where.referralCount = { gte: filters.minReferrals };
        const [data, total] = await Promise.all([
            prisma_1.default.marketer.findMany({
                where,
                include: {
                    _count: { select: { referrals: true, commissions: true } }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.marketer.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findMarketerById(id) {
        return prisma_1.default.marketer.findUnique({
            where: { id },
            include: {
                referrals: { orderBy: { createdAt: 'desc' }, take: 20 },
                commissions: { orderBy: { createdAt: 'desc' }, take: 20 }
            }
        });
    }
    async findMarketerByReferralCode(referralCode) {
        return prisma_1.default.marketer.findUnique({
            where: { referralCode }
        });
    }
    async createMarketer(data) {
        return prisma_1.default.marketer.create({
            data: {
                userId: data.userId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                paymentMethod: data.paymentMethod,
                bankDetails: data.bankDetails ? JSON.stringify(data.bankDetails) : null,
                commissionRate: data.commissionRate ?? 5,
                referralCode: data.referralCode,
                referralUrl: data.referralUrl,
                status: 'PENDING'
            }
        });
    }
    async updateMarketer(id, data) {
        return prisma_1.default.marketer.update({
            where: { id },
            data
        });
    }
    async deleteMarketer(id) {
        return prisma_1.default.marketer.delete({ where: { id } });
    }
    async createReferral(marketerId, customerId, customerName) {
        const referral = await prisma_1.default.customerReferral.create({
            data: {
                marketerId,
                customerId,
                customerName,
                status: 'PENDING'
            }
        });
        await prisma_1.default.marketer.update({
            where: { id: marketerId },
            data: { referralCount: { increment: 1 } }
        });
        return referral;
    }
    async convertReferral(referralId) {
        return prisma_1.default.customerReferral.update({
            where: { id: referralId },
            data: {
                status: 'CONVERTED',
                convertedAt: new Date()
            }
        });
    }
    async createCommission(data) {
        const commission = await prisma_1.default.marketerCommission.create({ data });
        await prisma_1.default.marketer.update({
            where: { id: data.marketerId },
            data: {
                totalEarnings: { increment: data.commissionAmount },
                pendingPayouts: { increment: data.commissionAmount }
            }
        });
        return commission;
    }
    async approveCommission(id) {
        return prisma_1.default.marketerCommission.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date()
            }
        });
    }
    async payCommission(id) {
        const commission = await prisma_1.default.marketerCommission.findUnique({ where: { id } });
        if (!commission)
            return null;
        await prisma_1.default.$transaction([
            prisma_1.default.marketerCommission.update({
                where: { id },
                data: { status: 'PAID', paidAt: new Date() }
            }),
            prisma_1.default.marketer.update({
                where: { id: commission.marketerId },
                data: {
                    pendingPayouts: { decrement: commission.commissionAmount },
                    paidAmount: { increment: commission.commissionAmount }
                }
            })
        ]);
        return prisma_1.default.marketerCommission.findUnique({ where: { id } });
    }
    async getMarketerSettings() {
        return prisma_1.default.marketerSettings.findFirst({
            where: { key: 'global' }
        });
    }
    async updateMarketerSettings(data) {
        return prisma_1.default.marketerSettings.upsert({
            where: { key: 'global' },
            update: data,
            create: {
                key: 'global',
                ...data
            }
        });
    }
}
exports.ToolRepository = ToolRepository;
exports.toolRepository = new ToolRepository();
//# sourceMappingURL=tool.repository.js.map