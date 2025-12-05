"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const pagination_1 = require("../../utils/pagination");
class OrderRepository {
    async findMany(filters, pagination) {
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.status)
            where.status = filters.status;
        if (filters.internalStatus)
            where.internalStatus = filters.internalStatus;
        if (filters.minAmount || filters.maxAmount) {
            where.totalAmount = {};
            if (filters.minAmount)
                where.totalAmount.gte = filters.minAmount;
            if (filters.maxAmount)
                where.totalAmount.lte = filters.maxAmount;
        }
        if (filters.fromDate || filters.toDate) {
            where.createdAt = {};
            if (filters.fromDate)
                where.createdAt.gte = filters.fromDate;
            if (filters.toDate)
                where.createdAt.lte = filters.toDate;
        }
        const [data, total] = await Promise.all([
            prisma_1.default.order.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, clientId: true, profile: { select: { companyName: true } } }
                    },
                    items: {
                        include: { product: true }
                    },
                    statusHistory: {
                        orderBy: { changedAt: 'desc' }
                    }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.order.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        return prisma_1.default.order.findUnique({
            where: { id },
            include: {
                user: {
                    include: { profile: true }
                },
                items: {
                    include: { product: true }
                },
                statusHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });
    }
    async findByUserId(userId, pagination) {
        const where = { userId };
        const [data, total] = await Promise.all([
            prisma_1.default.order.findMany({
                where,
                include: {
                    items: true,
                    statusHistory: { orderBy: { changedAt: 'desc' }, take: 5 }
                },
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.order.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async create(data) {
        return prisma_1.default.order.create({
            data: {
                userId: data.userId,
                businessId: data.businessId,
                branchId: data.branchId,
                totalAmount: data.totalAmount,
                status: 'PENDING',
                internalStatus: 'NEW',
                items: {
                    create: data.items
                },
                statusHistory: {
                    create: {
                        status: 'PENDING',
                        changedBy: data.userId,
                        note: 'تم إنشاء الطلب'
                    }
                }
            },
            include: {
                items: true,
                statusHistory: true
            }
        });
    }
    async updateStatus(id, status, changedBy, note) {
        return prisma_1.default.$transaction([
            prisma_1.default.order.update({
                where: { id },
                data: {
                    status,
                    ...(status === 'CANCELLED' && {
                        cancelledBy: changedBy,
                        cancelledAt: new Date()
                    })
                }
            }),
            prisma_1.default.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status,
                    changedBy,
                    note
                }
            })
        ]);
    }
    async updateInternalStatus(id, internalStatus, internalNotes) {
        return prisma_1.default.order.update({
            where: { id },
            data: { internalStatus, internalNotes }
        });
    }
    async delete(id) {
        return prisma_1.default.order.delete({ where: { id } });
    }
    async findQuoteRequests(filters, pagination) {
        const where = {};
        if (filters.userId)
            where.userId = filters.userId;
        if (filters.status)
            where.status = filters.status;
        const [data, total] = await Promise.all([
            prisma_1.default.quoteRequest.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, clientId: true } },
                    items: {
                        include: { product: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.quoteRequest.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findQuoteById(id) {
        return prisma_1.default.quoteRequest.findUnique({
            where: { id },
            include: {
                user: { include: { profile: true } },
                items: { include: { product: true } }
            }
        });
    }
    async createQuoteRequest(data) {
        return prisma_1.default.quoteRequest.create({
            data: {
                userId: data.userId,
                userName: data.userName,
                companyName: data.companyName,
                priceType: data.priceType,
                status: 'NEW',
                items: {
                    create: data.items
                }
            },
            include: { items: true }
        });
    }
    async updateQuoteStatus(id, status) {
        return prisma_1.default.quoteRequest.update({
            where: { id },
            data: {
                status,
                ...(status === 'PROCESSED' && { processedAt: new Date(), resultReady: true })
            }
        });
    }
    async updateQuoteItem(itemId, data) {
        return prisma_1.default.quoteItem.update({
            where: { id: itemId },
            data
        });
    }
    async findProducts(search, limit = 20) {
        return prisma_1.default.product.findMany({
            where: {
                OR: [
                    { partNumber: { contains: search } },
                    { name: { contains: search } },
                    { brand: { contains: search } }
                ]
            },
            take: limit
        });
    }
    async findProductByPartNumber(partNumber) {
        return prisma_1.default.product.findUnique({
            where: { partNumber }
        });
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
//# sourceMappingURL=order.repository.js.map