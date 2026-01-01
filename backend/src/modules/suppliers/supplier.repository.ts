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

  // ============ Supplier Portal Endpoints ============

  // A) Dashboard - returns supplier statistics
  async getDashboard(supplierId: string) {
    const [productsCount, catalogItems] = await Promise.all([
      prisma.supplierCatalogItem.count({ where: { supplierId, isActive: true } }),
      prisma.supplierCatalogItem.findMany({ 
        where: { supplierId }, 
        orderBy: { updatedAt: 'desc' }, 
        take: 1 
      })
    ]);

    return {
      supplierId,
      totals: {
        productsCount,
        openRequestsCount: 0,        // placeholder for future
        activePurchaseOrdersCount: 0 // placeholder for future
      },
      lastUpdatedAt: catalogItems[0]?.updatedAt || new Date()
    };
  }

  // B) Products with search and pagination
  async getProducts(supplierId: string, pagination: PaginationParams, search?: string) {
    const where: Prisma.SupplierCatalogItemWhereInput = { supplierId };

    if (search) {
      where.OR = [
        { partNumber: { contains: search, mode: 'insensitive' } },
        { partName: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ];
    }

    const sortField = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder || 'desc';

    const [data, total] = await Promise.all([
      prisma.supplierCatalogItem.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.supplierCatalogItem.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  // C) Requests - UNIFIED data from SupplierRequestAssignment with strict anonymization
  // Combines: QuoteRequest, Order, InstallmentOffer via assignment layer
  async getRequests(supplierId: string, pagination: PaginationParams) {
    const sortField = pagination.sortBy || 'createdAt';
    const sortOrder = pagination.sortOrder || 'desc';

    // Query SupplierRequestAssignment for all assigned requests
    const where = { supplierId };

    const [assignments, total] = await Promise.all([
      prisma.supplierRequestAssignment.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.supplierRequestAssignment.count({ where })
    ]);

    // For each assignment, fetch underlying request details (anonymized)
    const enrichedData = await Promise.all(
      assignments.map(async (assignment) => {
        let linesCount = 0;
        let totalValue = 0;
        let requestCreatedAt = assignment.createdAt;

        // Fetch details based on requestType
        if (assignment.requestType === 'QUOTE') {
          const quote = await prisma.quoteRequest.findUnique({
            where: { id: assignment.requestId },
            select: {
              id: true,
              status: true,
              createdAt: true,
              _count: { select: { items: true } }
              // EXCLUDED: userId, userName, companyName
            }
          });
          if (quote) {
            linesCount = quote._count.items;
            requestCreatedAt = quote.createdAt;
          }
        } else if (assignment.requestType === 'ORDER') {
          const order = await prisma.order.findUnique({
            where: { id: assignment.requestId },
            select: {
              id: true,
              status: true,
              totalAmount: true,
              createdAt: true,
              _count: { select: { items: true } }
              // EXCLUDED: userId, businessId, branchId
            }
          });
          if (order) {
            linesCount = order._count.items;
            totalValue = order.totalAmount;
            requestCreatedAt = order.createdAt;
          }
        } else if (assignment.requestType === 'INSTALLMENT') {
          const offer = await prisma.installmentOffer.findUnique({
            where: { id: assignment.requestId },
            select: {
              id: true,
              status: true,
              totalApprovedValue: true,
              createdAt: true,
              request: {
                select: {
                  _count: { select: { items: true } }
                  // EXCLUDED: customerId, customerName
                }
              }
            }
          });
          if (offer) {
            linesCount = offer.request?._count?.items || 0;
            totalValue = offer.totalApprovedValue;
            requestCreatedAt = offer.createdAt;
          }
        }

        // Return unified, anonymized response
        return {
          assignmentId: assignment.id,
          requestId: assignment.requestId,
          type: assignment.requestType,
          status: assignment.status,
          priority: assignment.priority,
          createdAt: requestCreatedAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          linesCount,
          totalValue: totalValue || null,
          notesForSupplier: assignment.supplierNotes || null
          // STRICT ANONYMIZATION - EXCLUDED FIELDS:
          // - customerName, customerId, companyName
          // - phone, email, address
          // - userId, organizationId, businessId
          // - internalNotes (admin only)
        };
      })
    );

    return createPaginatedResult(enrichedData, total, pagination.page!, pagination.limit!);
  }

  // ============ Assignment Management (for Admin) ============

  // Create a new assignment (Admin only)
  async createAssignment(data: {
    supplierId: string;
    requestType: string;
    requestId: string;
    priority?: string;
    supplierNotes?: string;
    createdByAdminId?: string;
  }) {
    return prisma.supplierRequestAssignment.create({
      data: {
        supplierId: data.supplierId,
        requestType: data.requestType,
        requestId: data.requestId,
        priority: data.priority || 'NORMAL',
        supplierNotes: data.supplierNotes,
        createdByAdminId: data.createdByAdminId
      }
    });
  }

  // Get all assignments (Admin only)
  async getAssignments(filters: { supplierId?: string; requestType?: string; status?: string }, pagination: PaginationParams) {
    const where: any = {};
    if (filters.supplierId) where.supplierId = filters.supplierId;
    if (filters.requestType) where.requestType = filters.requestType;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.supplierRequestAssignment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.supplierRequestAssignment.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  // Update assignment status
  async updateAssignmentStatus(assignmentId: string, status: string, notes?: string) {
    return prisma.supplierRequestAssignment.update({
      where: { id: assignmentId },
      data: {
        status,
        ...(notes && { supplierNotes: notes })
      }
    });
  }

  // D) Supplier-specific settings
  async getSupplierSettings(supplierId: string) {
    const supplier = await this.findById(supplierId);
    return {
      supplierId,
      preferredCurrency: supplier?.preferredCurrency || 'SAR',
      allowedCurrencies: supplier?.allowedCurrencies || ['SAR'],
      defaultLeadTimeDays: 7,
      shippingOriginCity: supplier?.shippingOriginCity || null,
      languageHint: supplier?.languageHint || 'ar',
      companyName: supplier?.companyName || '',
      contactName: supplier?.contactName || '',
      contactPhone: supplier?.contactPhone || '',
      contactEmail: supplier?.contactEmail || ''
    };
  }

  // E) Update supplier settings
  async updateSupplierSettings(supplierId: string, data: any) {
    await this.update(supplierId, {
      preferredCurrency: data.preferredCurrency,
      shippingOriginCity: data.shippingOriginCity,
      languageHint: data.languageHint,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail
    });
    return this.getSupplierSettings(supplierId);
  }

  // ============ Authorization Helpers ============
  
  // Get SupplierUser record for a userId (to verify supplier ownership)
  async getSupplierUserByUserId(userId: string) {
    return prisma.supplierUser.findFirst({
      where: { userId, isActive: true }
    });
  }

  // ============ Supplier Assignment Status Update ============

  // Get assignment by ID
  async getAssignmentById(assignmentId: string) {
    return prisma.supplierRequestAssignment.findUnique({
      where: { id: assignmentId }
    });
  }

  // Update assignment status with audit log (transactional)
  async updateSupplierAssignmentStatus(
    assignmentId: string,
    oldStatus: string,
    newStatus: string,
    changedByUserId: string,
    changedByRole: 'SUPPLIER' | 'ADMIN',
    notes?: string
  ) {
    // Use transaction to ensure both update and audit log succeed
    return prisma.$transaction(async (tx) => {
      // Update assignment
      const updatedAssignment = await tx.supplierRequestAssignment.update({
        where: { id: assignmentId },
        data: {
          status: newStatus,
          ...(notes && { supplierNotes: notes })
        }
      });

      // Create audit log
      await tx.supplierAssignmentAudit.create({
        data: {
          assignmentId,
          oldStatus,
          newStatus,
          changedByUserId,
          changedByRole,
          notes
        }
      });

      return updatedAssignment;
    });
  }

  // Get audit logs for an assignment
  async getAssignmentAuditLogs(assignmentId: string) {
    return prisma.supplierAssignmentAudit.findMany({
      where: { assignmentId },
      orderBy: { changedAt: 'desc' }
    });
  }
}

export const supplierRepository = new SupplierRepository();


