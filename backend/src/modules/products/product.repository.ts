import prisma from '../../lib/prisma';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const productRepository = {
  async findMany(filters: ProductFilters, pagination: PaginationParams) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { partNumber: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { nameAr: { contains: filters.search, mode: 'insensitive' } },
        { nameEn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.brand) {
      where.brand = filters.brand;
    }

    if (filters.minPrice) {
      where.priceWholesale = { ...where.priceWholesale, gte: filters.minPrice };
    }

    if (filters.maxPrice) {
      where.priceWholesale = { ...where.priceWholesale, lte: filters.maxPrice };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          qualityCode: true,
          brandCode: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return createPaginatedResult(products, total, page, limit);
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        qualityCode: true,
        brandCode: true,
      }
    });
  },

  async findByPartNumber(partNumber: string) {
    return prisma.product.findUnique({
      where: { partNumber },
      include: {
        qualityCode: true,
        brandCode: true,
      }
    });
  },

  async search(query: string, limit: number) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { partNumber: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { nameAr: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: limit,
      include: {
        qualityCode: true,
        brandCode: true,
      },
      orderBy: { priceWholesale: 'asc' }
    });
  },

  async create(data: any) {
    return prisma.product.create({
      data: {
        partNumber: data.partNumber,
        name: data.name,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        brand: data.brand,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        priceRetail: data.priceRetail || 0,
        priceWholesale: data.priceWholesale || 0,
        priceVip: data.priceVip || 0,
        stock: data.stock || 0,
        isActive: data.isActive ?? true,
        qualityCodeId: data.qualityCodeId,
        brandCodeId: data.brandCodeId,
      },
      include: {
        qualityCode: true,
        brandCode: true,
      }
    });
  },

  async update(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        brand: data.brand,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        priceRetail: data.priceRetail,
        priceWholesale: data.priceWholesale,
        priceVip: data.priceVip,
        stock: data.stock,
        isActive: data.isActive,
        qualityCodeId: data.qualityCodeId,
        brandCodeId: data.brandCodeId,
      },
      include: {
        qualityCode: true,
        brandCode: true,
      }
    });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  async getDistinctCategories() {
    const result = await prisma.product.findMany({
      where: {
        isActive: true,
        category: { not: null }
      },
      distinct: ['category'],
      select: { category: true }
    });
    return result.map(r => r.category).filter(Boolean);
  },

  async getDistinctBrands() {
    const result = await prisma.product.findMany({
      where: {
        isActive: true,
        brand: { not: null }
      },
      distinct: ['brand'],
      select: { brand: true }
    });
    return result.map(r => r.brand).filter(Boolean);
  }
};
