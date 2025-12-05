import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { SupplierStatus } from '../../types/enums';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';

export interface SupplierFilters {
  search?: string;
  status?: SupplierStatus;
  category?: string;
  region?: string;
  minRating?: number;
}

export interface MarketplaceFilters {
  partNumber?: string;
  partName?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export class SupplierRepository {
  async findMany(filters: SupplierFilters, pagination: PaginationParams) {
    const where: Prisma.SupplierProfileWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.minRating) where.rating = { gte: filters.minRating };
    if (filters.search) {
      where.OR = [
        { companyName: { contains: filters.search } },
        { contactName: { contains: filters.search } }
      ];
    }
    if (filters.category) {
      where.categories = { contains: filters.category };
    }
    if (filters.region) {
      where.regions = { contains: filters.region };
    }

    const [data, total] = await Promise.all([
      prisma.supplierProfile.findMany({
        where,
        include: {
          _count: { select: { catalogItems: true } }
        },
        orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.supplierProfile.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findById(id: string) {
    return prisma.supplierProfile.findUnique({
      where: { id },
      include: {
        catalogItems: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async findByCustomerId(customerId: string) {
    return prisma.supplierProfile.findFirst({
      where: { customerId },
      include: {
        catalogItems: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  async create(data: {
    customerId: string;
    companyName: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    categories?: string[];
    regions?: string[];
  }) {
    return prisma.supplierProfile.create({
      data: {
        customerId: data.customerId,
        companyName: data.companyName,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        categories: data.categories ? JSON.stringify(data.categories) : null,
        regions: data.regions ? JSON.stringify(data.regions) : null,
        status: 'PENDING'
      }
    });
  }

  async update(id: string, data: Prisma.SupplierProfileUpdateInput) {
    return prisma.supplierProfile.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return prisma.supplierProfile.delete({ where: { id } });
  }

  async addCatalogItem(supplierId: string, data: {
    partNumber: string;
    partName?: string;
    brand?: string;
    price: number;
    stock?: number;
    leadTimeDays?: number;
  }) {
    return prisma.supplierCatalogItem.create({
      data: {
        supplierId,
        partNumber: data.partNumber,
        partName: data.partName,
        brand: data.brand,
        price: data.price,
        stock: data.stock ?? 0,
        leadTimeDays: data.leadTimeDays ?? 7,
        isActive: true
      }
    });
  }

  async updateCatalogItem(id: string, data: Prisma.SupplierCatalogItemUpdateInput) {
    return prisma.supplierCatalogItem.update({
      where: { id },
      data
    });
  }

  async deleteCatalogItem(id: string) {
    return prisma.supplierCatalogItem.delete({ where: { id } });
  }

  async getCatalogItems(supplierId: string, pagination: PaginationParams) {
    const where: Prisma.SupplierCatalogItemWhereInput = { supplierId };

    const [data, total] = await Promise.all([
      prisma.supplierCatalogItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.supplierCatalogItem.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async bulkUpsertCatalog(supplierId: string, items: Array<{
    partNumber: string;
    partName?: string;
    brand?: string;
    price: number;
    stock?: number;
    leadTimeDays?: number;
  }>, replaceExisting: boolean = false) {
    if (replaceExisting) {
      await prisma.supplierCatalogItem.deleteMany({ where: { supplierId } });
    }

    const operations = items.map(item => 
      prisma.supplierCatalogItem.upsert({
        where: {
          id: `${supplierId}-${item.partNumber}`
        },
        update: {
          partName: item.partName,
          brand: item.brand,
          price: item.price,
          stock: item.stock ?? 0,
          leadTimeDays: item.leadTimeDays ?? 7
        },
        create: {
          supplierId,
          partNumber: item.partNumber,
          partName: item.partName,
          brand: item.brand,
          price: item.price,
          stock: item.stock ?? 0,
          leadTimeDays: item.leadTimeDays ?? 7,
          isActive: true
        }
      })
    );

    return prisma.$transaction(operations);
  }

  async searchMarketplace(filters: MarketplaceFilters, pagination: PaginationParams) {
    const where: Prisma.SupplierCatalogItemWhereInput = {
      isActive: true,
      supplier: { status: 'ACTIVE' }
    };

    if (filters.partNumber) where.partNumber = { contains: filters.partNumber };
    if (filters.partName) where.partName = { contains: filters.partName };
    if (filters.brand) where.brand = { contains: filters.brand };
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }
    if (filters.inStock) where.stock = { gt: 0 };

    const [data, total] = await Promise.all([
      prisma.supplierCatalogItem.findMany({
        where,
        include: {
          supplier: {
            select: { id: true, companyName: true, rating: true }
          }
        },
        orderBy: { price: 'asc' },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.supplierCatalogItem.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async getSettings() {
    return prisma.supplierMarketplaceSettings.findFirst({
      where: { key: 'global' }
    });
  }

  async updateSettings(data: Prisma.SupplierMarketplaceSettingsUpdateInput) {
    return prisma.supplierMarketplaceSettings.upsert({
      where: { key: 'global' },
      update: data,
      create: {
        key: 'global',
        ...data as any
      }
    });
  }
}

export const supplierRepository = new SupplierRepository();
