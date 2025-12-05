"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adRepository = exports.AdRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const pagination_1 = require("../../utils/pagination");
class AdRepository {
    async findAdvertisers(filters, pagination) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { contactName: { contains: filters.search } },
                { contactEmail: { contains: filters.search } }
            ];
        }
        const [data, total] = await Promise.all([
            prisma_1.default.advertiser.findMany({
                where,
                include: {
                    _count: { select: { campaigns: true } }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.advertiser.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findAdvertiserById(id) {
        return prisma_1.default.advertiser.findUnique({
            where: { id },
            include: {
                campaigns: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    async createAdvertiser(data) {
        return prisma_1.default.advertiser.create({ data });
    }
    async updateAdvertiser(id, data) {
        return prisma_1.default.advertiser.update({
            where: { id },
            data
        });
    }
    async deleteAdvertiser(id) {
        return prisma_1.default.advertiser.delete({ where: { id } });
    }
    async addBalance(id, amount) {
        return prisma_1.default.advertiser.update({
            where: { id },
            data: {
                balance: { increment: amount }
            }
        });
    }
    async findSlots(isActive, pagination) {
        const where = {};
        if (isActive !== undefined)
            where.isActive = isActive;
        if (pagination) {
            const [data, total] = await Promise.all([
                prisma_1.default.adSlot.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip: (pagination.page - 1) * pagination.limit,
                    take: pagination.limit
                }),
                prisma_1.default.adSlot.count({ where })
            ]);
            return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
        }
        return prisma_1.default.adSlot.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findSlotById(id) {
        return prisma_1.default.adSlot.findUnique({
            where: { id },
            include: {
                campaigns: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
    }
    async createSlot(data) {
        return prisma_1.default.adSlot.create({ data });
    }
    async updateSlot(id, data) {
        return prisma_1.default.adSlot.update({
            where: { id },
            data
        });
    }
    async deleteSlot(id) {
        return prisma_1.default.adSlot.delete({ where: { id } });
    }
    async findCampaigns(filters, pagination) {
        const where = {};
        if (filters.advertiserId)
            where.advertiserId = filters.advertiserId;
        if (filters.slotId)
            where.slotId = filters.slotId;
        if (filters.status)
            where.status = filters.status;
        if (filters.fromDate || filters.toDate) {
            where.startDate = {};
            if (filters.fromDate)
                where.startDate.gte = filters.fromDate;
            if (filters.toDate)
                where.startDate.lte = filters.toDate;
        }
        const [data, total] = await Promise.all([
            prisma_1.default.adCampaign.findMany({
                where,
                include: {
                    advertiser: { select: { id: true, name: true } },
                    slot: { select: { id: true, name: true, location: true } }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.adCampaign.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findCampaignById(id) {
        return prisma_1.default.adCampaign.findUnique({
            where: { id },
            include: {
                advertiser: true,
                slot: true
            }
        });
    }
    async createCampaign(data) {
        return prisma_1.default.adCampaign.create({
            data: {
                ...data,
                status: 'PENDING'
            },
            include: {
                advertiser: true,
                slot: true
            }
        });
    }
    async updateCampaign(id, data) {
        return prisma_1.default.adCampaign.update({
            where: { id },
            data,
            include: {
                advertiser: true,
                slot: true
            }
        });
    }
    async deleteCampaign(id) {
        return prisma_1.default.adCampaign.delete({ where: { id } });
    }
    async recordImpression(id) {
        return prisma_1.default.adCampaign.update({
            where: { id },
            data: { impressions: { increment: 1 } }
        });
    }
    async recordClick(id) {
        return prisma_1.default.adCampaign.update({
            where: { id },
            data: { clicks: { increment: 1 } }
        });
    }
    async getActiveCampaignsForSlot(slotId) {
        const now = new Date();
        return prisma_1.default.adCampaign.findMany({
            where: {
                slotId,
                status: 'ACTIVE',
                startDate: { lte: now },
                endDate: { gte: now }
            },
            include: {
                advertiser: { select: { id: true, name: true } }
            }
        });
    }
}
exports.AdRepository = AdRepository;
exports.adRepository = new AdRepository();
//# sourceMappingURL=ad.repository.js.map