import prisma from '../../lib/prisma';
import { Prisma, InstallmentStatus, SinicarDecision, OfferStatus, OfferSource, OfferType } from '@prisma/client';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';

export interface InstallmentFilters {
  status?: InstallmentStatus;
  customerId?: string;
  fromDate?: Date;
  toDate?: Date;
  minValue?: number;
  maxValue?: number;
}

export class InstallmentRepository {
  async findMany(filters: InstallmentFilters, pagination: PaginationParams) {
    const where: Prisma.InstallmentRequestWhereInput = {};

    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.status) where.status = filters.status;
    if (filters.minValue || filters.maxValue) {
      where.totalRequestedValue = {};
      if (filters.minValue) where.totalRequestedValue.gte = filters.minValue;
      if (filters.maxValue) where.totalRequestedValue.lte = filters.maxValue;
    }
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [data, total] = await Promise.all([
      prisma.installmentRequest.findMany({
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
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.installmentRequest.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findById(id: string) {
    return prisma.installmentRequest.findUnique({
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

  async findByCustomerId(customerId: string, pagination: PaginationParams) {
    const where: Prisma.InstallmentRequestWhereInput = { customerId };

    const [data, total] = await Promise.all([
      prisma.installmentRequest.findMany({
        where,
        include: {
          items: true,
          offers: { orderBy: { createdAt: 'desc' }, take: 5 }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.installmentRequest.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async create(data: {
    customerId: string;
    customerName?: string;
    totalRequestedValue: number;
    paymentFrequency: 'WEEKLY' | 'MONTHLY';
    requestedDurationMonths: number;
    items: Array<{
      partNumber: string;
      partName?: string;
      quantity: number;
      estimatedPrice: number;
    }>;
  }) {
    return prisma.installmentRequest.create({
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

  async adminReview(id: string, data: {
    sinicarDecision: SinicarDecision;
    adminNotes?: string;
    allowedForSuppliers?: boolean;
    reviewedBy: string;
  }) {
    let status: InstallmentStatus;
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

    return prisma.installmentRequest.update({
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

  async forwardToSuppliers(id: string, supplierIds: string[]) {
    return prisma.installmentRequest.update({
      where: { id },
      data: {
        status: 'FORWARDED_TO_SUPPLIERS',
        forwardedToSupplierIds: JSON.stringify(supplierIds)
      }
    });
  }

  async createOffer(requestId: string, data: {
    sourceType: OfferSource;
    supplierId?: string;
    supplierName?: string;
    type: OfferType;
    itemsApproved?: object;
    totalApprovedValue: number;
    schedule?: object;
    notes?: string;
    createdBy?: string;
  }) {
    const offer = await prisma.installmentOffer.create({
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

    await prisma.installmentRequest.update({
      where: { id: requestId },
      data: { status: 'WAITING_FOR_CUSTOMER_DECISION_ON_SUPPLIER_OFFER' }
    });

    return offer;
  }

  async customerOfferResponse(offerId: string, accept: boolean, reason?: string) {
    const offer = await prisma.installmentOffer.findUnique({
      where: { id: offerId },
      include: { request: true }
    });

    if (!offer) return null;

    const offerStatus: OfferStatus = accept ? 'ACCEPTED_BY_CUSTOMER' : 'REJECTED_BY_CUSTOMER';
    const requestStatus: InstallmentStatus = accept ? 'ACTIVE_CONTRACT' : 'WAITING_FOR_SUPPLIER_OFFERS';

    await prisma.$transaction([
      prisma.installmentOffer.update({
        where: { id: offerId },
        data: { status: offerStatus }
      }),
      prisma.installmentRequest.update({
        where: { id: offer.requestId },
        data: {
          status: requestStatus,
          ...(accept && { acceptedOfferId: offerId })
        }
      })
    ]);

    return prisma.installmentOffer.findUnique({
      where: { id: offerId },
      include: { request: true }
    });
  }

  async updateStatus(id: string, status: InstallmentStatus, closedReason?: string) {
    return prisma.installmentRequest.update({
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
    return prisma.installmentSettings.findFirst({
      where: { key: 'global' }
    });
  }

  async updateSettings(data: Prisma.InstallmentSettingsUpdateInput) {
    return prisma.installmentSettings.upsert({
      where: { key: 'global' },
      update: data,
      create: {
        key: 'global',
        ...data as any
      }
    });
  }
}

export const installmentRepository = new InstallmentRepository();
