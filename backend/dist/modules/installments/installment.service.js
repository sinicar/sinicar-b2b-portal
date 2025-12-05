"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installmentService = exports.InstallmentService = void 0;
const installment_repository_1 = require("./installment.repository");
const errors_1 = require("../../utils/errors");
class InstallmentService {
    async list(filters, pagination) {
        return installment_repository_1.installmentRepository.findMany(filters, pagination);
    }
    async getById(id) {
        const request = await installment_repository_1.installmentRepository.findById(id);
        if (!request) {
            throw new errors_1.NotFoundError('طلب التقسيط غير موجود');
        }
        return request;
    }
    async getByCustomer(customerId, pagination) {
        return installment_repository_1.installmentRepository.findByCustomerId(customerId, pagination);
    }
    async create(customerId, customerName, input) {
        const settings = await installment_repository_1.installmentRepository.getSettings();
        if (settings && !settings.enableInstallments) {
            throw new errors_1.BadRequestError('خدمة التقسيط غير متاحة حالياً');
        }
        if (settings) {
            if (input.totalRequestedValue < settings.minInstallmentValue) {
                throw new errors_1.BadRequestError(`الحد الأدنى للتقسيط ${settings.minInstallmentValue} ريال`);
            }
            if (input.totalRequestedValue > settings.maxInstallmentValue) {
                throw new errors_1.BadRequestError(`الحد الأقصى للتقسيط ${settings.maxInstallmentValue} ريال`);
            }
            if (input.requestedDurationMonths < settings.minDurationMonths) {
                throw new errors_1.BadRequestError(`الحد الأدنى للمدة ${settings.minDurationMonths} أشهر`);
            }
            if (input.requestedDurationMonths > settings.maxDurationMonths) {
                throw new errors_1.BadRequestError(`الحد الأقصى للمدة ${settings.maxDurationMonths} شهر`);
            }
        }
        return installment_repository_1.installmentRepository.create({
            customerId,
            customerName,
            totalRequestedValue: input.totalRequestedValue,
            paymentFrequency: input.paymentFrequency,
            requestedDurationMonths: input.requestedDurationMonths,
            items: input.items
        });
    }
    async adminReview(requestId, reviewedBy, input) {
        const request = await this.getById(requestId);
        if (request.status !== 'PENDING_SINICAR_REVIEW') {
            throw new errors_1.BadRequestError('لا يمكن مراجعة هذا الطلب في حالته الحالية');
        }
        return installment_repository_1.installmentRepository.adminReview(requestId, {
            sinicarDecision: input.sinicarDecision,
            adminNotes: input.adminNotes,
            allowedForSuppliers: input.allowedForSuppliers,
            reviewedBy
        });
    }
    async forwardToSuppliers(requestId, input) {
        const request = await this.getById(requestId);
        const settings = await installment_repository_1.installmentRepository.getSettings();
        if (settings && !settings.allowSupplierOffers) {
            throw new errors_1.BadRequestError('تحويل الطلبات للموردين غير متاح');
        }
        if (!request.allowedForSuppliers) {
            throw new errors_1.BadRequestError('هذا الطلب غير مسموح بتحويله للموردين');
        }
        if (!['WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR', 'WAITING_FOR_SUPPLIER_OFFERS'].includes(request.status)) {
            throw new errors_1.BadRequestError('لا يمكن تحويل الطلب في هذه الحالة');
        }
        return installment_repository_1.installmentRepository.forwardToSuppliers(requestId, input.supplierIds);
    }
    async createOffer(requestId, createdBy, input) {
        const request = await this.getById(requestId);
        if (!['FORWARDED_TO_SUPPLIERS', 'WAITING_FOR_SUPPLIER_OFFERS', 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR'].includes(request.status)) {
            throw new errors_1.BadRequestError('لا يمكن إضافة عرض في هذه الحالة');
        }
        const schedule = input.schedule || this.generatePaymentSchedule(input.totalApprovedValue, request.requestedDurationMonths, request.paymentFrequency);
        return installment_repository_1.installmentRepository.createOffer(requestId, {
            sourceType: input.sourceType,
            supplierId: input.supplierId,
            supplierName: input.supplierName,
            type: input.type,
            itemsApproved: input.itemsApproved,
            totalApprovedValue: input.totalApprovedValue,
            schedule,
            notes: input.notes,
            createdBy
        });
    }
    async customerOfferResponse(offerId, customerId, input) {
        const result = await installment_repository_1.installmentRepository.customerOfferResponse(offerId, input.action === 'accept');
        if (!result) {
            throw new errors_1.NotFoundError('العرض غير موجود');
        }
        if (result.request.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك الرد على هذا العرض');
        }
        return result;
    }
    async cancel(requestId, customerId, reason) {
        const request = await this.getById(requestId);
        if (request.customerId !== customerId) {
            throw new errors_1.ForbiddenError('لا يمكنك إلغاء هذا الطلب');
        }
        if (['ACTIVE_CONTRACT', 'COMPLETED', 'CANCELLED', 'CLOSED'].includes(request.status)) {
            throw new errors_1.BadRequestError('لا يمكن إلغاء الطلب في هذه الحالة');
        }
        return installment_repository_1.installmentRepository.updateStatus(requestId, 'CANCELLED', reason);
    }
    async close(requestId, reason) {
        return installment_repository_1.installmentRepository.updateStatus(requestId, 'CLOSED', reason);
    }
    async complete(requestId) {
        const request = await this.getById(requestId);
        if (request.status !== 'ACTIVE_CONTRACT') {
            throw new errors_1.BadRequestError('لا يمكن إكمال طلب غير نشط');
        }
        return installment_repository_1.installmentRepository.updateStatus(requestId, 'COMPLETED');
    }
    async getSettings() {
        return installment_repository_1.installmentRepository.getSettings();
    }
    async updateSettings(data) {
        return installment_repository_1.installmentRepository.updateSettings(data);
    }
    async getStats(customerId) {
        const filters = customerId ? { customerId } : {};
        const allRequests = await installment_repository_1.installmentRepository.findMany(filters, { page: 1, limit: 1000 });
        const stats = {
            total: allRequests.pagination.total,
            pending: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
            totalValue: 0
        };
        allRequests.data.forEach(req => {
            if (req.status.includes('PENDING') || req.status.includes('WAITING')) {
                stats.pending++;
            }
            else if (req.status === 'ACTIVE_CONTRACT') {
                stats.active++;
            }
            else if (req.status === 'COMPLETED') {
                stats.completed++;
            }
            else if (req.status === 'CANCELLED' || req.status === 'CLOSED' || req.status.includes('REJECTED')) {
                stats.cancelled++;
            }
            stats.totalValue += req.totalRequestedValue;
        });
        return stats;
    }
    generatePaymentSchedule(totalAmount, durationMonths, frequency) {
        const schedule = [];
        const payments = frequency === 'MONTHLY' ? durationMonths : durationMonths * 4;
        const paymentAmount = Math.ceil(totalAmount / payments);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 30);
        for (let i = 0; i < payments; i++) {
            const dueDate = new Date(startDate);
            if (frequency === 'MONTHLY') {
                dueDate.setMonth(dueDate.getMonth() + i);
            }
            else {
                dueDate.setDate(dueDate.getDate() + (i * 7));
            }
            schedule.push({
                paymentNumber: i + 1,
                dueDate: dueDate.toISOString().split('T')[0],
                amount: i === payments - 1 ? totalAmount - (paymentAmount * (payments - 1)) : paymentAmount,
                status: 'PENDING'
            });
        }
        return schedule;
    }
}
exports.InstallmentService = InstallmentService;
exports.installmentService = new InstallmentService();
//# sourceMappingURL=installment.service.js.map