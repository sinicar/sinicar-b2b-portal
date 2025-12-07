import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { PermissionService } from '../permissions/permission.service';

const permissionService = new PermissionService();

export interface SubUserListItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roleCode: string;
  roleName?: string;
  roleNameAr?: string;
  isOwner: boolean;
  isActive: boolean;
  jobTitle?: string;
  createdAt: Date;
}

export interface CreateSubUserInput {
  name: string;
  email?: string;
  phone?: string;
  roleCode: string;
  jobTitle?: string;
  password?: string;
}

export interface UpdateSubUserInput {
  roleCode?: string;
  isActive?: boolean;
  jobTitle?: string;
}

const SUPPLIER_ROLES = ['SUPPLIER_OWNER', 'SUPPLIER_MANAGER', 'SUPPLIER_STAFF'];

class SupplierUserService {
  async getSupplierIdForUser(userId: string): Promise<string | null> {
    const supplierUser = await prisma.supplierUser.findFirst({
      where: { userId, isActive: true }
    });
    return supplierUser?.supplierId || null;
  }

  async isUserOwner(userId: string, supplierId: string): Promise<boolean> {
    const supplierUser = await prisma.supplierUser.findFirst({
      where: { userId, supplierId, isOwner: true, isActive: true }
    });
    return !!supplierUser;
  }

  async listSubUsers(
    supplierId: string,
    pagination: { page?: number; limit?: number }
  ): Promise<{ data: SubUserListItem[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const [supplierUsers, total] = await Promise.all([
      prisma.supplierUser.findMany({
        where: { supplierId },
        orderBy: [{ isOwner: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: limit
      }),
      prisma.supplierUser.count({ where: { supplierId } })
    ]);

    const userIds = supplierUsers.map((su: any) => su.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, phone: true }
    });
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const roles = await permissionService.getAllRoles();
    const roleMap = new Map(roles.map(r => [r.code, r]));

    const data: SubUserListItem[] = supplierUsers.map((su: any) => {
      const user = userMap.get(su.userId);
      const role = roleMap.get(su.roleCode);
      return {
        id: su.id,
        name: user?.name || 'Unknown',
        email: user?.email || undefined,
        phone: user?.phone || undefined,
        roleCode: su.roleCode,
        roleName: role?.name,
        roleNameAr: role?.nameAr || undefined,
        isOwner: su.isOwner,
        isActive: su.isActive,
        jobTitle: su.jobTitle || undefined,
        createdAt: su.createdAt
      };
    });

    const totalPages = Math.ceil(total / limit);
    return { 
      data, 
      pagination: { 
        page, 
        limit, 
        total, 
        totalPages, 
        hasNext: page < totalPages, 
        hasPrev: page > 1 
      } 
    };
  }

  async addSubUser(
    supplierId: string,
    inviterId: string,
    input: CreateSubUserInput
  ): Promise<SubUserListItem> {
    if (!SUPPLIER_ROLES.includes(input.roleCode)) {
      throw new Error('Invalid role code. Must be SUPPLIER_OWNER, SUPPLIER_MANAGER, or SUPPLIER_STAFF');
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          input.email ? { email: input.email } : {},
          input.phone ? { phone: input.phone } : {}
        ].filter(o => Object.keys(o).length > 0)
      }
    });

    if (!user) {
      const clientId = `supplier-${supplierId.slice(0, 8)}-${Date.now()}`;
      const password = input.password || Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await prisma.user.create({
        data: {
          clientId,
          name: input.name,
          email: input.email || undefined,
          phone: input.phone || undefined,
          password: hashedPassword,
          role: input.roleCode,
          status: 'ACTIVE',
          isActive: true,
          isSupplier: true,
          completionPercent: 50
        }
      });
    } else {
      const existing = await prisma.supplierUser.findUnique({
        where: { supplierId_userId: { supplierId, userId: user.id } }
      });
      if (existing) {
        throw new Error('User is already a member of this supplier');
      }
    }

    const isOwner = input.roleCode === 'SUPPLIER_OWNER';
    const supplierUser = await prisma.supplierUser.create({
      data: {
        supplierId,
        userId: user.id,
        roleCode: input.roleCode,
        isOwner,
        isActive: true,
        jobTitle: input.jobTitle || undefined,
        invitedBy: inviterId
      }
    });

    const roles = await permissionService.getAllRoles();
    const role = roles.find(r => r.code === input.roleCode);

    return {
      id: supplierUser.id,
      name: user.name,
      email: user.email || undefined,
      phone: user.phone || undefined,
      roleCode: supplierUser.roleCode,
      roleName: role?.name,
      roleNameAr: role?.nameAr || undefined,
      isOwner: supplierUser.isOwner,
      isActive: supplierUser.isActive,
      jobTitle: supplierUser.jobTitle || undefined,
      createdAt: supplierUser.createdAt
    };
  }

  async updateSubUser(
    supplierId: string,
    subUserId: string,
    input: UpdateSubUserInput
  ): Promise<SubUserListItem> {
    const supplierUser = await prisma.supplierUser.findFirst({
      where: { id: subUserId, supplierId }
    });

    if (!supplierUser) {
      throw new Error('Sub-user not found');
    }

    if (input.roleCode && !SUPPLIER_ROLES.includes(input.roleCode)) {
      throw new Error('Invalid role code');
    }

    if (input.isActive === false && supplierUser.isOwner) {
      const ownerCount = await prisma.supplierUser.count({
        where: { supplierId, isOwner: true, isActive: true }
      });
      if (ownerCount <= 1) {
        throw new Error('Cannot deactivate the last active owner');
      }
    }

    const updateData: any = {};
    if (input.roleCode !== undefined) {
      updateData.roleCode = input.roleCode;
      updateData.isOwner = input.roleCode === 'SUPPLIER_OWNER';
    }
    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }
    if (input.jobTitle !== undefined) {
      updateData.jobTitle = input.jobTitle;
    }

    const updated = await prisma.supplierUser.update({
      where: { id: subUserId },
      data: updateData
    });

    const user = await prisma.user.findUnique({
      where: { id: updated.userId },
      select: { name: true, email: true, phone: true }
    });

    const roles = await permissionService.getAllRoles();
    const role = roles.find(r => r.code === updated.roleCode);

    return {
      id: updated.id,
      name: user?.name || 'Unknown',
      email: user?.email || undefined,
      phone: user?.phone || undefined,
      roleCode: updated.roleCode,
      roleName: role?.name,
      roleNameAr: role?.nameAr || undefined,
      isOwner: updated.isOwner,
      isActive: updated.isActive,
      jobTitle: updated.jobTitle || undefined,
      createdAt: updated.createdAt
    };
  }

  async getSupplierRoles(): Promise<{ code: string; name: string; nameAr?: string }[]> {
    const roles = await permissionService.getAllRoles();
    return roles
      .filter(r => SUPPLIER_ROLES.includes(r.code))
      .map(r => ({ code: r.code, name: r.name, nameAr: r.nameAr || undefined }));
  }

  async createOwnerRecord(supplierId: string, userId: string): Promise<void> {
    const existing = await prisma.supplierUser.findUnique({
      where: { supplierId_userId: { supplierId, userId } }
    });

    if (!existing) {
      await prisma.supplierUser.create({
        data: {
          supplierId,
          userId,
          roleCode: 'SUPPLIER_OWNER',
          isOwner: true,
          isActive: true
        }
      });
    }
  }
}

export const supplierUserService = new SupplierUserService();
