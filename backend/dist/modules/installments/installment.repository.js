"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installmentRepository = exports.InstallmentRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const pagination_1 = require("../../utils/pagination");
class InstallmentRepository {
    async findMany(filters, pagination) {
        const where = {};
        if (filters.customerId)
            where.customerId = filters.customerId;
        if (filters.status)
            where.status = filters.status;
        if (filters.minValue || filters.maxValue) {
            where.totalRequestedValue = {};
            if (filters.minValue)
                where.totalRequestedValue.gte = filters.minValue;
            if (filters.maxValue)
                where.totalRequestedValue.lte = filters.maxValue;
        }
        if (filters.fromDate || filters.toDate) {
            where.createdAt = {};
            if (filters.fromDate)
                where.createdAt.gte = filters.fromDate;
            if (filters.toDate)
                where.createdAt.lte = filters.toDate;
        }
        const [data, total] = await Promise.all([
            prisma_1.default.installmentRequest.findMany({
                where,
                include: {
                    customer: {
                        select: { id: true, name: true, clientId: true, profile: { select: { companyName: true } } }
                    },
                    items: true,
                    offers: {
                        orderBy: { createdAt: 'desc' }
                    }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.installmentRequest.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        return prisma_1.default.installmentRequest.findUnique({
            where: { id },
            include: {
                customer: {
                    include: { profile: true }
                },
                items: true,
                offers: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }
    async findByCustomerId(customerId, pagination) {
        const where = { customerId };
        const [data, total] = await Promise.all([
            prisma_1.default.installmentRequest.findMany({
                where,
                include: {
                    items: true,
                    offers: { orderBy: { createdAt: 'desc' }, take: 5 }
                },
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.installmentRequest.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async create(data) {
        return prisma_1.default.installmentRequest.create({
            data: {
                customerId: data.customerId,
                customerName: data.customerName,
                totalRequestedValue: data.totalRequestedValue,
                paymentFrequency: data.paymentFrequency,
                requestedDurationMonths: data.requestedDurationMonths,
                status: 'PENDING_SINICAR_REVIEW',
                sinicarDecision: 'PENDING',
                items: {
                    create: data.items
                }
            },
            include: { items: true }
        });
    }
    async adminReview(id, data) {
        let status;
        switch (data.sinicarDecision) {
            case 'APPROVED_FULL':
                status = 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR';
                break;
            case 'APPROVED_PARTIAL':
                status = 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR';
                break;
            case 'REJECTED':
                status = 'REJECTED_BY_SINICAR';
                break;
            default:
                status = 'PENDING_SINICAR_REVIEW';
        }
        return prisma_1.default.installmentRequest.update({
            where: { id },
            data: {
                sinicarDecision: data.sinicarDecision,
                adminNotes: data.adminNotes,
                allowedForSuppliers: data.allowedForSuppliers ?? false,
                reviewedBy: data.reviewedBy,
                reviewedAt: new Date(),
                status
            }
        });
    }
    async forwardToSuppliers(id, supplierIds) {
        return prisma_1.default.installmentRequest.update({
            where: { id },
            data: {
                status: 'FORWARDED_TO_SUPPLIERS',
                forwardedToSupplierIds: JSON.stringify(supplierIds)
            }
        });
    }
    async createOffer(requestId, data) {
        const offer = await prisma_1.default.installmentOffer.create({
            data: {
                requestId,
                sourceType: data.sourceType,
                supplierId: data.supplierId,
                supplierName: data.supplierName,
                type: data.type,
                itemsApproved: data.itemsApproved ? JSON.stringify(data.itemsApproved) : null,
                totalApprovedValue: data.totalApprovedValue,
                schedule: data.schedule ? JSON.stringify(data.schedule) : null,
                notes: data.notes,
                createdBy: data.createdBy,
                status: 'WAITING_FOR_CUSTOMER'
            }
        });
        await prisma_1.default.installmentRequest.update({
            where: { id: requestId },
            data: { status: 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER' }
        });
        return offer;
    }
    async customerOfferResponse(offerId, accept, reason) {
        const offer = await prisma_1.default.installmentOffer.findUnique({
            where: { id: offerId },
            include: { request: true }
        });
        if (!offer)
            return null;
        const offerStatus = accept ? 'ACCEPTED_BY_CUSTOMER' : 'REJECTED_BY_CUSTOMER';
        const requestStatus = accept ? 'ACTIVE_CONTRACT' : 'WAITING_FOR_SUPPLIER_OFFERS';
        await prisma_1.default.$transaction([
            prisma_1.default.installmentOffer.update({
                where: { id: offerId },
                data: { status: offerStatus }
            }),
            prisma_1.default.installmentRequest.update({
                where: { id: offer.requestId },
                data: {
                    status: requestStatus,
                    ...(accept && { acceptedOfferId: offerId })
                }
            })
        ]);
        return prisma_1.default.installmentOffer.findUnique({
            where: { id: offerId },
            include: { request: true }
        });
    }
    async updateStatus(id, status, closedReason) {
        return prisma_1.default.installmentRequest.update({
            where: { id },
            data: {
                status,
                ...(status === 'CLOSED' || status === 'CANCELLED' ? {
                    closedAt: new Date(),
                    closedReason
                } : {})
            }
        });
    }
    async getSettings() {
        return prisma_1.default.installmentSettings.findFirst({
            where: { key: 'global' }
        });
    }
    async updateSettings(data) {
        return prisma_1.default.installmentSettings.upsert({
            where: { key: 'global' },
            update: data,
            create: {
                key: 'global',
                ...data
            }
        });
    }
}
exports.InstallmentRepository = InstallmentRepository;
exports.installmentRepository = new InstallmentRepository();
//# sourceMappingURL=installment.repository.js.map