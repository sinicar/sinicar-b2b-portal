import { installmentRepository, InstallmentFilters } from './installment.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';
import {
  CreateInstallmentRequestInput,
  AdminReviewInput,
  ForwardToSuppliersInput,
  CreateOfferInput,
  OfferResponseInput
} from '../../schemas/installment.schema';
import { InstallmentStatus, SinicarDecision } from '@prisma/client';

export class InstallmentService {
  async list(filters: InstallmentFilters, pagination: PaginationParams) {
    return installmentRepository.findMany(filters, pagination);
  }

  async getById(id: string) {
    const request = await installmentRepository.findById(id);
    if (!request) {
      throw new NotFoundError('طلب التقسيط غير موجود');
    }
    return request;
  }

  async getByCustomer(customerId: string, pagination: PaginationParams) {
    return installmentRepository.findByCustomerId(customerId, pagination);
  }

  async create(customerId: string, customerName: string, input: CreateInstallmentRequestInput) {
    const settings = await installmentRepository.getSettings();
    
    if (settings && !settings.enableInstallments) {
      throw new BadRequestError('خدمة التقسيط غير متاحة حالياً');
    }

    if (settings) {
      if (input.totalRequestedValue < settings.minInstallmentValue) {
        throw new BadRequestError(`الحد الأدنى للتقسيط ${settings.minInstallmentValue} ريال`);
      }
      if (input.totalRequestedValue > settings.maxInstallmentValue) {
        throw new BadRequestError(`الحد الأقصى للتقسيط ${settings.maxInstallmentValue} ريال`);
      }
      if (input.requestedDurationMonths < settings.minDurationMonths) {
        throw new BadRequestError(`الحد الأدنى للمدة ${settings.minDurationMonths} أشهر`);
      }
      if (input.requestedDurationMonths > settings.maxDurationMonths) {
        throw new BadRequestError(`الحد الأقصى للمدة ${settings.maxDurationMonths} شهر`);
      }
    }

    return installmentRepository.create({
      customerId,
      customerName,
      totalRequestedValue: input.totalRequestedValue,
      paymentFrequency: input.paymentFrequency,
      requestedDurationMonths: input.requestedDurationMonths,
      items: input.items
    });
  }

  async adminReview(requestId: string, reviewedBy: string, input: AdminReviewInput) {
    const request = await this.getById(requestId);

    if (request.status !== 'PENDING_SINICAR_REVIEW') {
      throw new BadRequestError('لا يمكن مراجعة هذا الطلب في حالته الحالية');
    }

    return installmentRepository.adminReview(requestId, {
      sinicarDecision: input.sinicarDecision,
      adminNotes: input.adminNotes,
      allowedForSuppliers: input.allowedForSuppliers,
      reviewedBy
    });
  }

  async forwardToSuppliers(requestId: string, input: ForwardToSuppliersInput) {
    const request = await this.getById(requestId);
    
    const settings = await installmentRepository.getSettings();
    if (settings && !settings.allowSupplierOffers) {
      throw new BadRequestError('تحويل الطلبات للموردين غير متاح');
    }

    if (!request.allowedForSuppliers) {
      throw new BadRequestError('هذا الطلب غير مسموح بتحويله للموردين');
    }

    if (!['WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR', 'WAITING_FOR_SUPPLIER_OFFERS'].includes(request.status)) {
      throw new BadRequestError('لا يمكن تحويل الطلب في هذه الحالة');
    }

    return installmentRepository.forwardToSuppliers(requestId, input.supplierIds);
  }

  async createOffer(requestId: string, createdBy: string, input: CreateOfferInput) {
    const request = await this.getById(requestId);

    if (!['FORWARDED_TO_SUPPLIERS', 'WAITING_FOR_SUPPLIER_OFFERS', 'WAITING_FOR_CUSTOMER_DECISION_ON_PARTIAL_SINICAR'].includes(request.status)) {
      throw new BadRequestError('لا يمكن إضافة عرض في هذه الحالة');
    }

    const schedule = input.schedule || this.generatePaymentSchedule(
      input.totalApprovedValue,
      request.requestedDurationMonths,
      request.paymentFrequency
    );

    return installmentRepository.createOffer(requestId, {
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

  async customerOfferResponse(offerId: string, customerId: string, input: OfferResponseInput) {
    const result = await installmentRepository.customerOfferResponse(
      offerId,
      input.action === 'accept'
    );

    if (!result) {
      throw new NotFoundError('العرض غير موجود');
    }

    if (result.request.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك الرد على هذا العرض');
    }

    return result;
  }

  async cancel(requestId: string, customerId: string, reason?: string) {
    const request = await this.getById(requestId);

    if (request.customerId !== customerId) {
      throw new ForbiddenError('لا يمكنك إلغاء هذا الطلب');
    }

    if (['ACTIVE_CONTRACT', 'COMPLETED', 'CANCELLED', 'CLOSED'].includes(request.status)) {
      throw new BadRequestError('لا يمكن إلغاء الطلب في هذه الحالة');
    }

    return installmentRepository.updateStatus(requestId, 'CANCELLED', reason);
  }

  async close(requestId: string, reason: string) {
    return installmentRepository.updateStatus(requestId, 'CLOSED', reason);
  }

  async complete(requestId: string) {
    const request = await this.getById(requestId);

    if (request.status !== 'ACTIVE_CONTRACT') {
      throw new BadRequestError('لا يمكن إكمال طلب غير نشط');
    }

    return installmentRepository.updateStatus(requestId, 'COMPLETED');
  }

  async getSettings() {
    return installmentRepository.getSettings();
  }

  async updateSettings(data: any) {
    return installmentRepository.updateSettings(data);
  }

  async getStats(customerId?: string) {
    const filters: InstallmentFilters = customerId ? { customerId } : {};
    const allRequests = await installmentRepository.findMany(filters, { page: 1, limit: 1000 });

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
      } else if (req.status === 'ACTIVE_CONTRACT') {
        stats.active++;
      } else if (req.status === 'COMPLETED') {
        stats.completed++;
      } else if (req.status === 'CANCELLED' || req.status === 'CLOSED' || req.status.includes('REJECTED')) {
        stats.cancelled++;
      }
      stats.totalValue += req.totalRequestedValue;
    });

    return stats;
  }

  private generatePaymentSchedule(
    totalAmount: number,
    durationMonths: number,
    frequency: 'WEEKLY' | 'MONTHLY'
  ) {
    const schedule = [];
    const payments = frequency === 'MONTHLY' ? durationMonths : durationMonths * 4;
    const paymentAmount = Math.ceil(totalAmount / payments);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);

    for (let i = 0; i < payments; i++) {
      const dueDate = new Date(startDate);
      if (frequency === 'MONTHLY') {
        dueDate.setMonth(dueDate.getMonth() + i);
      } else {
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

export const installmentService = new InstallmentService();
