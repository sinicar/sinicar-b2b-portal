import prisma from '../../lib/prisma';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';
import { Prisma } from '@prisma/client';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
}

export const userRepository = {
  async findMany(filters: UserFilters, pagination: PaginationParams) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters.search) {
      where.OR = [
        { clientId: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.role = filters.role as any;
    }

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.isCustomer !== undefined) {
      where.isCustomer = filters.isCustomer;
    }

    if (filters.isSupplier !== undefined) {
      where.isSupplier = filters.isSupplier;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          clientId: true,
          name: true,
          email: true,
          phone: true,
          whatsapp: true,
          role: true,
          status: true,
          isCustomer: true,
          isSupplier: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          profile: {
            select: {
              companyName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return createPaginatedResult(users, total, page, limit);
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });
  },

  async findByClientId(clientId: string) {
    return prisma.user.findUnique({
      where: { clientId },
      include: {
        profile: true
      }
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        profile: true
      }
    });
  },

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        profile: true
      }
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.user.update({
      where: { id },
      data: { status: status as any }
    });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },

  async getRoles() {
    return ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER', 'SUPPLIER'];
  },

  async getStatuses() {
    return ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED', 'SUSPENDED'];
  },

  async getStats() {
    const [total, pending, approved, customers, suppliers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { isCustomer: true } }),
      prisma.user.count({ where: { isSupplier: true } })
    ]);

    return { total, pending, approved, customers, suppliers };
  }
};
