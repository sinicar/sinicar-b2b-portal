import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { CustomerStatus, CustomerType, PriceLevel } from '../../types/enums';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';
// Force reload: 2025-12-29 06:25

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  priceLevel?: PriceLevel;
  isApproved?: boolean;
  region?: string;
  city?: string;
}

export class CustomerRepository {
  async findMany(filters: CustomerFilters, pagination: PaginationParams) {
    const where: Prisma.UserWhereInput = {
      role: { in: ['CUSTOMER_OWNER', 'CUSTOMER_STAFF'] }
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { clientId: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { profile: { companyName: { contains: filters.search } } }
      ];
    }
    if (filters.status) where.status = filters.status;

    const profileWhere: Prisma.BusinessProfileWhereInput = {};
    if (filters.customerType) profileWhere.customerType = filters.customerType;
    if (filters.priceLevel) profileWhere.assignedPriceLevel = filters.priceLevel;
    if (filters.isApproved !== undefined) profileWhere.isApproved = filters.isApproved;
    if (filters.region) profileWhere.region = filters.region;
    if (filters.city) profileWhere.city = filters.city;

    if (Object.keys(profileWhere).length > 0) {
      where.profile = profileWhere;
    }

    // حقول الفرز المسموحة في جدول User
    const validUserSortFields = ['name', 'clientId', 'email', 'phone', 'createdAt', 'lastLoginAt', 'status'];
    
    // تحديد orderBy بناءً على نوع الفرز
    let orderBy: Prisma.UserOrderByWithRelationInput;
    const sortOrder = pagination.sortOrder || 'desc';
    
    if (pagination.sortBy === 'totalOrdersCount') {
      // الفرز حسب عدد الطلبات باستخدام Prisma relation count
      orderBy = { orders: { _count: sortOrder } };
    } else if (pagination.sortBy === 'totalSearchesCount') {
      // الفرز حسب عدد طلبات عروض الأسعار (كبديل لعمليات البحث)
      orderBy = { quoteRequests: { _count: sortOrder } };
    } else {
      // الفرز العادي حسب حقول User
      const sortField = validUserSortFields.includes(pagination.sortBy || '') 
        ? pagination.sortBy! 
        : 'createdAt';
      orderBy = { [sortField]: sortOrder };
    }
    
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: {
            include: { branches: true, documents: true }
          },
          organizationUsers: {
            include: { organization: true }
          },
          // إضافة _count للحصول على عدد الطلبات وطلبات عروض الأسعار
          _count: {
            select: { orders: true, quoteRequests: true }
          }
        },
        orderBy,
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.user.count({ where })
    ]);

    // تحويل البيانات لإضافة totalOrdersCount و totalSearchesCount من _count
    const enrichedData = data.map(user => ({
      ...user,
      totalOrdersCount: (user as any)._count?.orders || 0,
      totalSearchesCount: (user as any)._count?.quoteRequests || 0
    }));

    return createPaginatedResult(enrichedData, total, pagination.page!, pagination.limit!);
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: { branches: true, documents: true }
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true }
        },
        organizationUsers: {
          include: { organization: true }
        },
        children: {
          select: { id: true, name: true, clientId: true, isActive: true, employeeRole: true }
        }
      }
    });
  }

  async findByClientId(clientId: string) {
    return prisma.user.findUnique({
      where: { clientId },
      include: {
        profile: {
          include: { branches: true }
        }
      }
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        profile: {
          include: { branches: true }
        }
      }
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        profile: {
          include: { branches: true }
        }
      }
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        status: 'BLOCKED'
      }
    });
  }

  async updateProfile(userId: string, data: Prisma.BusinessProfileUpdateInput) {
    return prisma.businessProfile.update({
      where: { userId },
      data,
      include: { branches: true, documents: true }
    });
  }

  async createProfile(data: Prisma.BusinessProfileCreateInput) {
    return prisma.businessProfile.create({
      data,
      include: { branches: true }
    });
  }

  async addBranch(profileId: string, data: Omit<Prisma.BranchCreateInput, 'profile'>) {
    return prisma.branch.create({
      data: {
        ...data,
        profile: { connect: { id: profileId } }
      }
    });
  }

  async updateBranch(id: string, data: Prisma.BranchUpdateInput) {
    return prisma.branch.update({ where: { id }, data });
  }

  async deleteBranch(id: string) {
    return prisma.branch.delete({ where: { id } });
  }

  async addDocument(profileId: string, data: Omit<Prisma.DocumentCreateInput, 'profile'>) {
    return prisma.document.create({
      data: {
        ...data,
        profile: { connect: { id: profileId } }
      }
    });
  }

  async deleteDocument(id: string) {
    return prisma.document.delete({ where: { id } });
  }

  async getStaff(parentId: string) {
    return prisma.user.findMany({
      where: { parentId, role: 'CUSTOMER_STAFF' },
      include: { profile: true }
    });
  }

  async addStaff(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data: {
        ...data,
        role: 'CUSTOMER_STAFF'
      }
    });
  }

  async getAccountOpeningRequests(pagination: PaginationParams) {
    const [data, total] = await Promise.all([
      prisma.accountOpeningRequest.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.accountOpeningRequest.count()
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async createAccountOpeningRequest(data: Prisma.AccountOpeningRequestCreateInput) {
    return prisma.accountOpeningRequest.create({ data });
  }

  async updateAccountOpeningRequest(id: string, data: Prisma.AccountOpeningRequestUpdateInput) {
    return prisma.accountOpeningRequest.update({ where: { id }, data });
  }
}

export const customerRepository = new CustomerRepository();
