import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { MarketerStatus, ReferralStatus, CommissionStatus } from '../../types/enums';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';

export interface MarketerFilters {
  status?: MarketerStatus;
  search?: string;
  minEarnings?: number;
  minReferrals?: number;
}

export class ToolRepository {
  async findToolConfigs() {
    return prisma.toolConfig.findMany({
      orderBy: { toolKey: 'asc' }
    });
  }

  async findToolConfigByKey(toolKey: string) {
    return prisma.toolConfig.findUnique({
      where: { toolKey }
    });
  }

  async createToolConfig(data: {
    toolKey: string;
    displayName: string;
    description?: string;
    isEnabled?: boolean;
    dailyLimit?: number;
    monthlyLimit?: number;
    requiredPriceLevel?: string;
    allowedCustomerTypes?: string[];
  }) {
    return prisma.toolConfig.create({
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

  async updateToolConfig(toolKey: string, data: Prisma.ToolConfigUpdateInput) {
    return prisma.toolConfig.update({
      where: { toolKey },
      data
    });
  }

  async deleteToolConfig(toolKey: string) {
    return prisma.toolConfig.delete({ where: { toolKey } });
  }

  async getCustomerToolOverrides(customerId: string) {
    return prisma.customerToolsOverride.findUnique({
      where: { customerId }
    });
  }

  async upsertCustomerToolOverrides(customerId: string, overrides: object) {
    return prisma.customerToolsOverride.upsert({
      where: { customerId },
      update: { overrides: JSON.stringify(overrides) },
      create: {
        customerId,
        overrides: JSON.stringify(overrides)
      }
    });
  }

  async recordToolUsage(customerId: string, toolKey: string, metadata?: object) {
    return prisma.toolUsageRecord.create({
      data: {
        customerId,
        toolKey,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }

  async getToolUsageCount(customerId: string, toolKey: string, since: Date) {
    return prisma.toolUsageRecord.count({
      where: {
        customerId,
        toolKey,
        usageDate: { gte: since }
      }
    });
  }

  async savePriceComparison(data: {
    customerId: string;
    partNumbers: string[];
    supplierIds?: string[];
    results?: object;
  }) {
    return prisma.priceComparisonSession.create({
      data: {
        customerId: data.customerId,
        partNumbers: JSON.stringify(data.partNumbers),
        supplierIds: data.supplierIds ? JSON.stringify(data.supplierIds) : null,
        results: data.results ? JSON.stringify(data.results) : null
      }
    });
  }

  async saveVinExtraction(data: {
    customerId: string;
    vinNumber: string;
    extractedData: object;
  }) {
    return prisma.vinExtractionRecord.create({
      data: {
        customerId: data.customerId,
        vinNumber: data.vinNumber,
        extractedData: JSON.stringify(data.extractedData)
      }
    });
  }

  async saveSupplierPriceRecord(data: {
    customerId: string;
    fileName?: string;
    supplierName?: string;
    data: object[];
  }) {
    return prisma.supplierPriceRecord.create({
      data: {
        customerId: data.customerId,
        fileName: data.fileName,
        supplierName: data.supplierName,
        data: JSON.stringify(data.data)
      }
    });
  }

  async findMarketers(filters: MarketerFilters, pagination: PaginationParams) {
    const where: Prisma.MarketerWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } }
      ];
    }
    if (filters.minEarnings) where.totalEarnings = { gte: filters.minEarnings };
    if (filters.minReferrals) where.referralCount = { gte: filters.minReferrals };

    const [data, total] = await Promise.all([
      prisma.marketer.findMany({
        where,
        include: {
          _count: { select: { referrals: true, commissions: true } }
        },
        orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.marketer.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findMarketerById(id: string) {
    return prisma.marketer.findUnique({
      where: { id },
      include: {
        referrals: { orderBy: { createdAt: 'desc' }, take: 20 },
        commissions: { orderBy: { createdAt: 'desc' }, take: 20 }
      }
    });
  }

  async findMarketerByReferralCode(referralCode: string) {
    return prisma.marketer.findUnique({
      where: { referralCode }
    });
  }

  async createMarketer(data: {
    userId?: string;
    name: string;
    email: string;
    phone: string;
    paymentMethod?: string;
    bankDetails?: object;
    commissionRate?: number;
    referralCode: string;
    referralUrl?: string;
  }) {
    return prisma.marketer.create({
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

  async updateMarketer(id: string, data: Prisma.MarketerUpdateInput) {
    return prisma.marketer.update({
      where: { id },
      data
    });
  }

  async deleteMarketer(id: string) {
    return prisma.marketer.delete({ where: { id } });
  }

  async createReferral(marketerId: string, customerId: string, customerName?: string) {
    const referral = await prisma.customerReferral.create({
      data: {
        marketerId,
        customerId,
        customerName,
        status: 'PENDING'
      }
    });

    await prisma.marketer.update({
      where: { id: marketerId },
      data: { referralCount: { increment: 1 } }
    });

    return referral;
  }

  async convertReferral(referralId: string) {
    return prisma.customerReferral.update({
      where: { id: referralId },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date()
      }
    });
  }

  async createCommission(data: {
    marketerId: string;
    orderId: string;
    customerId: string;
    customerName?: string;
    orderAmount: number;
    commissionRate: number;
    commissionAmount: number;
  }) {
    const commission = await prisma.marketerCommission.create({ data });

    await prisma.marketer.update({
      where: { id: data.marketerId },
      data: {
        totalEarnings: { increment: data.commissionAmount },
        pendingPayouts: { increment: data.commissionAmount }
      }
    });

    return commission;
  }

  async approveCommission(id: string) {
    return prisma.marketerCommission.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });
  }

  async payCommission(id: string) {
    const commission = await prisma.marketerCommission.findUnique({ where: { id } });
    if (!commission) return null;

    await prisma.$transaction([
      prisma.marketerCommission.update({
        where: { id },
        data: { status: 'PAID', paidAt: new Date() }
      }),
      prisma.marketer.update({
        where: { id: commission.marketerId },
        data: {
          pendingPayouts: { decrement: commission.commissionAmount },
          paidAmount: { increment: commission.commissionAmount }
        }
      })
    ]);

    return prisma.marketerCommission.findUnique({ where: { id } });
  }

  async getMarketerSettings() {
    return prisma.marketerSettings.findFirst({
      where: { key: 'global' }
    });
  }

  async updateMarketerSettings(data: Prisma.MarketerSettingsUpdateInput) {
    return prisma.marketerSettings.upsert({
      where: { key: 'global' },
      update: data,
      create: {
        key: 'global',
        ...data as any
      }
    });
  }
}

export const toolRepository = new ToolRepository();
