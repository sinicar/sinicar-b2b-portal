import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { AdvertiserStatus, CampaignStatus } from '../../types/enums';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';

export interface AdvertiserFilters {
  status?: AdvertiserStatus;
  search?: string;
}

export interface CampaignFilters {
  advertiserId?: string;
  slotId?: string;
  status?: CampaignStatus;
  fromDate?: Date;
  toDate?: Date;
}

export class AdRepository {
  async findAdvertisers(filters: AdvertiserFilters, pagination: PaginationParams) {
    const where: Prisma.AdvertiserWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { contactName: { contains: filters.search } },
        { contactEmail: { contains: filters.search } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.advertiser.findMany({
        where,
        include: {
          _count: { select: { campaigns: true } }
        },
        orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.advertiser.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findAdvertiserById(id: string) {
    return prisma.advertiser.findUnique({
      where: { id },
      include: {
        campaigns: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async createAdvertiser(data: {
    name: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  }) {
    return prisma.advertiser.create({ data });
  }

  async updateAdvertiser(id: string, data: Prisma.AdvertiserUpdateInput) {
    return prisma.advertiser.update({
      where: { id },
      data
    });
  }

  async deleteAdvertiser(id: string) {
    return prisma.advertiser.delete({ where: { id } });
  }

  async addBalance(id: string, amount: number) {
    return prisma.advertiser.update({
      where: { id },
      data: {
        balance: { increment: amount }
      }
    });
  }

  async findSlots(isActive?: boolean, pagination?: PaginationParams) {
    const where: Prisma.AdSlotWhereInput = {};
    if (isActive !== undefined) where.isActive = isActive;

    if (pagination) {
      const [data, total] = await Promise.all([
        prisma.adSlot.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pagination.page! - 1) * pagination.limit!,
          take: pagination.limit
        }),
        prisma.adSlot.count({ where })
      ]);
      return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
    }

    return prisma.adSlot.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findSlotById(id: string) {
    return prisma.adSlot.findUnique({
      where: { id },
      include: {
        campaigns: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  async createSlot(data: {
    name: string;
    location: string;
    width: number;
    height: number;
    pricePerDay: number;
    pricePerWeek: number;
    pricePerMonth: number;
    isActive?: boolean;
  }) {
    return prisma.adSlot.create({ data });
  }

  async updateSlot(id: string, data: Prisma.AdSlotUpdateInput) {
    return prisma.adSlot.update({
      where: { id },
      data
    });
  }

  async deleteSlot(id: string) {
    return prisma.adSlot.delete({ where: { id } });
  }

  async findCampaigns(filters: CampaignFilters, pagination: PaginationParams) {
    const where: Prisma.AdCampaignWhereInput = {};

    if (filters.advertiserId) where.advertiserId = filters.advertiserId;
    if (filters.slotId) where.slotId = filters.slotId;
    if (filters.status) where.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      where.startDate = {};
      if (filters.fromDate) where.startDate.gte = filters.fromDate;
      if (filters.toDate) where.startDate.lte = filters.toDate;
    }

    const [data, total] = await Promise.all([
      prisma.adCampaign.findMany({
        where,
        include: {
          advertiser: { select: { id: true, name: true } },
          slot: { select: { id: true, name: true, location: true } }
        },
        orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.adCampaign.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findCampaignById(id: string) {
    return prisma.adCampaign.findUnique({
      where: { id },
      include: {
        advertiser: true,
        slot: true
      }
    });
  }

  async createCampaign(data: {
    advertiserId: string;
    slotId: string;
    title: string;
    imageUrl?: string;
    targetUrl?: string;
    budget: number;
    startDate: Date;
    endDate: Date;
  }) {
    return prisma.adCampaign.create({
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

  async updateCampaign(id: string, data: Prisma.AdCampaignUpdateInput) {
    return prisma.adCampaign.update({
      where: { id },
      data,
      include: {
        advertiser: true,
        slot: true
      }
    });
  }

  async deleteCampaign(id: string) {
    return prisma.adCampaign.delete({ where: { id } });
  }

  async recordImpression(id: string) {
    return prisma.adCampaign.update({
      where: { id },
      data: { impressions: { increment: 1 } }
    });
  }

  async recordClick(id: string) {
    return prisma.adCampaign.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    });
  }

  async getActiveCampaignsForSlot(slotId: string) {
    const now = new Date();
    return prisma.adCampaign.findMany({
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

export const adRepository = new AdRepository();
