import prisma from '../../lib/prisma';
import { Prisma, OrgStatus, OrganizationType, OrgUserRole, OrgUserStatus, InviteStatus } from '@prisma/client';
import { PaginationParams, createPaginatedResult } from '../../utils/pagination';

export interface OrganizationFilters {
  type?: OrganizationType;
  status?: OrgStatus;
  search?: string;
}

export class OrganizationRepository {
  async findMany(filters: OrganizationFilters, pagination: PaginationParams) {
    const where: Prisma.OrganizationWhereInput = {};
    
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.name = { contains: filters.search };
    }

    const [data, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          users: { include: { user: true } },
          _count: { select: { users: true, invitations: true } }
        },
        orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
        skip: (pagination.page! - 1) * pagination.limit!,
        take: pagination.limit
      }),
      prisma.organization.count({ where })
    ]);

    return createPaginatedResult(data, total, pagination.page!, pagination.limit!);
  }

  async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          include: { user: true }
        },
        invitations: true,
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
  }

  async findByOwner(ownerUserId: string) {
    return prisma.organization.findFirst({
      where: { ownerUserId },
      include: {
        users: { include: { user: true } }
      }
    });
  }

  async create(data: Prisma.OrganizationCreateInput) {
    return prisma.organization.create({
      data,
      include: { users: true }
    });
  }

  async update(id: string, data: Prisma.OrganizationUpdateInput) {
    return prisma.organization.update({
      where: { id },
      data,
      include: { users: true }
    });
  }

  async delete(id: string) {
    return prisma.organization.delete({ where: { id } });
  }

  async addMember(data: {
    organizationId: string;
    userId: string;
    role: OrgUserRole;
    permissions?: string;
    jobTitle?: string;
    department?: string;
    invitedBy?: string;
  }) {
    return prisma.organizationUser.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        role: data.role,
        permissions: data.permissions,
        jobTitle: data.jobTitle,
        department: data.department,
        invitedBy: data.invitedBy,
        status: 'ACTIVE'
      },
      include: { user: true, organization: true }
    });
  }

  async updateMember(id: string, data: Prisma.OrganizationUserUpdateInput) {
    return prisma.organizationUser.update({
      where: { id },
      data,
      include: { user: true }
    });
  }

  async removeMember(id: string) {
    return prisma.organizationUser.delete({ where: { id } });
  }

  async findMember(organizationId: string, userId: string) {
    return prisma.organizationUser.findFirst({
      where: { organizationId, userId },
      include: { user: true, organization: true }
    });
  }

  async getMembers(organizationId: string) {
    return prisma.organizationUser.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { joinedAt: 'desc' }
    });
  }

  async createInvitation(data: {
    organizationId: string;
    email: string;
    phone?: string;
    role: OrgUserRole;
    inviteCode: string;
    expiresAt: Date;
    createdBy: string;
  }) {
    return prisma.teamInvitation.create({ data });
  }

  async findInvitationByCode(inviteCode: string) {
    return prisma.teamInvitation.findUnique({
      where: { inviteCode },
      include: { organization: true }
    });
  }

  async updateInvitation(id: string, data: Prisma.TeamInvitationUpdateInput) {
    return prisma.teamInvitation.update({ where: { id }, data });
  }

  async getInvitations(organizationId: string, status?: InviteStatus) {
    return prisma.teamInvitation.findMany({
      where: {
        organizationId,
        ...(status && { status })
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async logActivity(data: {
    organizationId: string;
    userId: string;
    userName?: string;
    action: string;
    description: string;
    metadata?: object;
  }) {
    return prisma.orgActivityLog.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        userName: data.userName,
        action: data.action,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
  }
}

export const organizationRepository = new OrganizationRepository();
