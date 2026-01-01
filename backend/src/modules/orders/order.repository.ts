import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { OrderStatus, OrderInternalStatus, QuoteStatus } from '../../types/enums';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  internalStatus?: OrderInternalStatus;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export class OrderRepository {
  async findMany(filters: OrderFilters, pagination: PaginationParams) {
    const where: Prisma.OrderWhereInput = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.internalStatus) where.internalStatus = filters.internalStatus;
    if (filters.minAmount || filters.maxAmount) {
      where.totalAmount = {};
      if (filters.minAmount) where.totalAmount.gte = filters.minAmount;
      if (filters.maxAmount) where.totalAmount.lte = filters.maxAmount;
    }
    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) where.createdAt.gte = filters.fromDate;
      if (filters.toDate) where.createdAt.lte = filters.toDate;
    }

    const [data, total] = await Promise.all([
      prisma.order.findMany({
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
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.order.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findById(id: string) {
    return prisma.order.findUnique({
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

  async findByUserId(userId: string, pagination: PaginationParams) {
    const where: Prisma.OrderWhereInput = { userId };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          statusHistory: { orderBy: { changedAt: 'desc' }, take: 5 }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.order.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async create(data: {
    userId: string;
    businessId?: string;
    branchId?: string;
    totalAmount: number;
    items: Array<{
      productId?: string; // Optional: products may not exist in DB
      partNumber: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }) {
    return prisma.order.create({
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

  async updateStatus(id: string, status: OrderStatus, changedBy: string, note?: string) {
    return prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          status,
          ...(status === 'CANCELLED' && {
            cancelledBy: changedBy,
            cancelledAt: new Date()
          })
        }
      }),
      prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          changedBy,
          note
        }
      })
    ]);
  }

  async updateInternalStatus(id: string, internalStatus: OrderInternalStatus, internalNotes?: string) {
    return prisma.order.update({
      where: { id },
      data: { internalStatus, internalNotes }
    });
  }

  async delete(id: string) {
    return prisma.order.delete({ where: { id } });
  }

  async findQuoteRequests(filters: { userId?: string; status?: QuoteStatus }, pagination: PaginationParams) {
    const where: Prisma.QuoteRequestWhereInput = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, clientId: true } },
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.quoteRequest.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findQuoteById(id: string) {
    return prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        items: { include: { product: true } }
      }
    });
  }

  async createQuoteRequest(data: {
    userId: string;
    userName?: string;
    companyName?: string;
    priceType?: string;
    items: Array<{
      partNumber: string;
      partName?: string;
      requestedQty: number;
      notes?: string;
    }>;
  }) {
    return prisma.quoteRequest.create({
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

  async updateQuoteStatus(id: string, status: QuoteStatus) {
    return prisma.quoteRequest.update({
      where: { id },
      data: {
        status,
        ...(status === 'PROCESSED' && { processedAt: new Date(), resultReady: true })
      }
    });
  }

  async updateQuoteItem(itemId: string, data: Prisma.QuoteItemUpdateInput) {
    return prisma.quoteItem.update({
      where: { id: itemId },
      data
    });
  }

  async findProducts(search: string, limit: number = 20) {
    return prisma.product.findMany({
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

  async findProductByPartNumber(partNumber: string) {
    return prisma.product.findUnique({
      where: { partNumber }
    });
  }
}

export const orderRepository = new OrderRepository();
