import { v4 as uuidv4 } from 'uuid';
import { organizationRepository } from './organization.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { PaginationParams } from '../../utils/pagination';
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AddMemberInput,
  UpdateMemberInput,
  CreateInvitationInput
} from '../../schemas/organization.schema';
import { OrganizationType, OrgUserRole } from '@prisma/client';

export class OrganizationService {
  async list(filters: { type?: OrganizationType; status?: any; search?: string }, pagination: PaginationParams) {
    return organizationRepository.findMany(filters, pagination);
  }

  async getById(id: string) {
    const org = await organizationRepository.findById(id);
    if (!org) {
      throw new NotFoundError('المنظمة غير موجودة');
    }
    return org;
  }

  async getByOwner(ownerUserId: string) {
    return organizationRepository.findByOwner(ownerUserId);
  }

  async create(ownerUserId: string, input: CreateOrganizationInput) {
    const existingOrg = await organizationRepository.findByOwner(ownerUserId);
    if (existingOrg) {
      throw new BadRequestError('لديك منظمة بالفعل');
    }

    const org = await organizationRepository.create({
      type: input.type,
      name: input.name,
      ownerUserId,
      maxEmployees: input.maxEmployees,
      allowCustomPermissions: input.allowCustomPermissions,
      status: 'ACTIVE'
    });

    await organizationRepository.addMember({
      organizationId: org.id,
      userId: ownerUserId,
      role: 'OWNER'
    });

    await organizationRepository.logActivity({
      organizationId: org.id,
      userId: ownerUserId,
      action: 'CREATE_ORGANIZATION',
      description: `تم إنشاء المنظمة: ${input.name}`
    });

    return org;
  }

  async update(id: string, userId: string, input: UpdateOrganizationInput) {
    const org = await this.getById(id);
    
    await this.checkPermission(id, userId, ['OWNER']);

    const updated = await organizationRepository.update(id, input);

    await organizationRepository.logActivity({
      organizationId: id,
      userId,
      action: 'UPDATE_ORGANIZATION',
      description: 'تم تحديث بيانات المنظمة',
      metadata: input
    });

    return updated;
  }

  async delete(id: string, userId: string) {
    const org = await this.getById(id);
    
    if (org.ownerUserId !== userId) {
      throw new ForbiddenError('فقط المالك يمكنه حذف المنظمة');
    }

    await organizationRepository.delete(id);

    return { message: 'تم حذف المنظمة بنجاح' };
  }

  async getMembers(organizationId: string) {
    await this.getById(organizationId);
    return organizationRepository.getMembers(organizationId);
  }

  async addMember(organizationId: string, addedBy: string, input: AddMemberInput) {
    const org = await this.getById(organizationId);
    
    await this.checkPermission(organizationId, addedBy, ['OWNER', 'MANAGER']);

    const currentMembers = await organizationRepository.getMembers(organizationId);
    if (currentMembers.length >= org.maxEmployees) {
      throw new BadRequestError('تم الوصول للحد الأقصى من الموظفين');
    }

    const existingMember = await organizationRepository.findMember(organizationId, input.userId);
    if (existingMember) {
      throw new BadRequestError('المستخدم عضو بالفعل في المنظمة');
    }

    const member = await organizationRepository.addMember({
      organizationId,
      userId: input.userId,
      role: input.role,
      permissions: input.permissions ? JSON.stringify(input.permissions) : undefined,
      jobTitle: input.jobTitle,
      department: input.department,
      invitedBy: addedBy
    });

    await organizationRepository.logActivity({
      organizationId,
      userId: addedBy,
      action: 'ADD_MEMBER',
      description: `تمت إضافة عضو جديد`,
      metadata: { memberId: input.userId, role: input.role }
    });

    return member;
  }

  async updateMember(organizationId: string, memberId: string, updatedBy: string, input: UpdateMemberInput) {
    await this.checkPermission(organizationId, updatedBy, ['OWNER', 'MANAGER']);

    const member = await organizationRepository.updateMember(memberId, {
      role: input.role,
      permissions: input.permissions ? JSON.stringify(input.permissions) : undefined,
      status: input.status,
      jobTitle: input.jobTitle,
      department: input.department,
      lastActiveAt: new Date()
    });

    await organizationRepository.logActivity({
      organizationId,
      userId: updatedBy,
      action: 'UPDATE_MEMBER',
      description: 'تم تحديث بيانات العضو',
      metadata: { memberId, ...input }
    });

    return member;
  }

  async removeMember(organizationId: string, memberId: string, removedBy: string) {
    const org = await this.getById(organizationId);
    await this.checkPermission(organizationId, removedBy, ['OWNER', 'MANAGER']);

    await organizationRepository.removeMember(memberId);

    await organizationRepository.logActivity({
      organizationId,
      userId: removedBy,
      action: 'REMOVE_MEMBER',
      description: 'تم إزالة عضو من المنظمة',
      metadata: { memberId }
    });

    return { message: 'تم إزالة العضو بنجاح' };
  }

  async createInvitation(organizationId: string, createdBy: string, input: CreateInvitationInput) {
    const org = await this.getById(organizationId);
    await this.checkPermission(organizationId, createdBy, ['OWNER', 'MANAGER']);

    const currentMembers = await organizationRepository.getMembers(organizationId);
    const pendingInvitations = await organizationRepository.getInvitations(organizationId, 'PENDING');
    
    if (currentMembers.length + pendingInvitations.length >= org.maxEmployees) {
      throw new BadRequestError('تم الوصول للحد الأقصى من الموظفين');
    }

    const inviteCode = uuidv4().split('-')[0].toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 7));

    const invitation = await organizationRepository.createInvitation({
      organizationId,
      email: input.email,
      phone: input.phone,
      role: input.role,
      inviteCode,
      expiresAt,
      createdBy
    });

    await organizationRepository.logActivity({
      organizationId,
      userId: createdBy,
      action: 'CREATE_INVITATION',
      description: `تم إنشاء دعوة لـ ${input.email}`,
      metadata: { email: input.email, role: input.role }
    });

    return invitation;
  }

  async acceptInvitation(inviteCode: string, userId: string) {
    const invitation = await organizationRepository.findInvitationByCode(inviteCode);
    
    if (!invitation) {
      throw new NotFoundError('الدعوة غير موجودة');
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestError('الدعوة غير متاحة');
    }

    if (new Date() > invitation.expiresAt) {
      await organizationRepository.updateInvitation(invitation.id, { status: 'EXPIRED' });
      throw new BadRequestError('انتهت صلاحية الدعوة');
    }

    await organizationRepository.addMember({
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      invitedBy: invitation.createdBy
    });

    await organizationRepository.updateInvitation(invitation.id, {
      status: 'ACCEPTED',
      acceptedAt: new Date()
    });

    await organizationRepository.logActivity({
      organizationId: invitation.organizationId,
      userId,
      action: 'ACCEPT_INVITATION',
      description: 'تم قبول الدعوة والانضمام للمنظمة'
    });

    return {
      message: 'تم الانضمام للمنظمة بنجاح',
      organization: invitation.organization
    };
  }

  async getInvitations(organizationId: string, userId: string) {
    await this.checkPermission(organizationId, userId, ['OWNER', 'MANAGER']);
    return organizationRepository.getInvitations(organizationId);
  }

  async getActivityLog(organizationId: string, userId: string) {
    await this.checkPermission(organizationId, userId, ['OWNER', 'MANAGER', 'STAFF']);
    const org = await this.getById(organizationId);
    return org.activityLogs;
  }

  private async checkPermission(organizationId: string, userId: string, allowedRoles: OrgUserRole[]) {
    const member = await organizationRepository.findMember(organizationId, userId);
    
    if (!member) {
      throw new ForbiddenError('أنت لست عضواً في هذه المنظمة');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ForbiddenError('لا تملك الصلاحية لهذا الإجراء');
    }

    return member;
  }
}

export const organizationService = new OrganizationService();
