"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationService = exports.OrganizationService = void 0;
const uuid_1 = require("uuid");
const organization_repository_1 = require("./organization.repository");
const errors_1 = require("../../utils/errors");
class OrganizationService {
    async list(filters, pagination) {
        return organization_repository_1.organizationRepository.findMany(filters, pagination);
    }
    async getById(id) {
        const org = await organization_repository_1.organizationRepository.findById(id);
        if (!org) {
            throw new errors_1.NotFoundError('المنظمة غير موجودة');
        }
        return org;
    }
    async getByOwner(ownerUserId) {
        return organization_repository_1.organizationRepository.findByOwner(ownerUserId);
    }
    async create(ownerUserId, input) {
        const existingOrg = await organization_repository_1.organizationRepository.findByOwner(ownerUserId);
        if (existingOrg) {
            throw new errors_1.BadRequestError('لديك منظمة بالفعل');
        }
        const org = await organization_repository_1.organizationRepository.create({
            type: input.type,
            name: input.name,
            ownerUserId,
            maxEmployees: input.maxEmployees,
            allowCustomPermissions: input.allowCustomPermissions,
            status: 'ACTIVE'
        });
        await organization_repository_1.organizationRepository.addMember({
            organizationId: org.id,
            userId: ownerUserId,
            role: 'OWNER'
        });
        await organization_repository_1.organizationRepository.logActivity({
            organizationId: org.id,
            userId: ownerUserId,
            action: 'CREATE_ORGANIZATION',
            description: `تم إنشاء المنظمة: ${input.name}`
        });
        return org;
    }
    async update(id, userId, input) {
        const org = await this.getById(id);
        await this.checkPermission(id, userId, ['OWNER']);
        const updated = await organization_repository_1.organizationRepository.update(id, input);
        await organization_repository_1.organizationRepository.logActivity({
            organizationId: id,
            userId,
            action: 'UPDATE_ORGANIZATION',
            description: 'تم تحديث بيانات المنظمة',
            metadata: input
        });
        return updated;
    }
    async delete(id, userId) {
        const org = await this.getById(id);
        if (org.ownerUserId !== userId) {
            throw new errors_1.ForbiddenError('فقط المالك يمكنه حذف المنظمة');
        }
        await organization_repository_1.organizationRepository.delete(id);
        return { message: 'تم حذف المنظمة بنجاح' };
    }
    async getMembers(organizationId) {
        await this.getById(organizationId);
        return organization_repository_1.organizationRepository.getMembers(organizationId);
    }
    async addMember(organizationId, addedBy, input) {
        const org = await this.getById(organizationId);
        await this.checkPermission(organizationId, addedBy, ['OWNER', 'MANAGER']);
        const currentMembers = await organization_repository_1.organizationRepository.getMembers(organizationId);
        if (currentMembers.length >= org.maxEmployees) {
            throw new errors_1.BadRequestError('تم الوصول للحد الأقصى من الموظفين');
        }
        const existingMember = await organization_repository_1.organizationRepository.findMember(organizationId, input.userId);
        if (existingMember) {
            throw new errors_1.BadRequestError('المستخدم عضو بالفعل في المنظمة');
        }
        const member = await organization_repository_1.organizationRepository.addMember({
            organizationId,
            userId: input.userId,
            role: input.role,
            permissions: input.permissions ? JSON.stringify(input.permissions) : undefined,
            jobTitle: input.jobTitle,
            department: input.department,
            invitedBy: addedBy
        });
        await organization_repository_1.organizationRepository.logActivity({
            organizationId,
            userId: addedBy,
            action: 'ADD_MEMBER',
            description: `تمت إضافة عضو جديد`,
            metadata: { memberId: input.userId, role: input.role }
        });
        return member;
    }
    async updateMember(organizationId, memberId, updatedBy, input) {
        await this.checkPermission(organizationId, updatedBy, ['OWNER', 'MANAGER']);
        const member = await organization_repository_1.organizationRepository.updateMember(memberId, {
            role: input.role,
            permissions: input.permissions ? JSON.stringify(input.permissions) : undefined,
            status: input.status,
            jobTitle: input.jobTitle,
            department: input.department,
            lastActiveAt: new Date()
        });
        await organization_repository_1.organizationRepository.logActivity({
            organizationId,
            userId: updatedBy,
            action: 'UPDATE_MEMBER',
            description: 'تم تحديث بيانات العضو',
            metadata: { memberId, ...input }
        });
        return member;
    }
    async removeMember(organizationId, memberId, removedBy) {
        const org = await this.getById(organizationId);
        await this.checkPermission(organizationId, removedBy, ['OWNER', 'MANAGER']);
        await organization_repository_1.organizationRepository.removeMember(memberId);
        await organization_repository_1.organizationRepository.logActivity({
            organizationId,
            userId: removedBy,
            action: 'REMOVE_MEMBER',
            description: 'تم إزالة عضو من المنظمة',
            metadata: { memberId }
        });
        return { message: 'تم إزالة العضو بنجاح' };
    }
    async createInvitation(organizationId, createdBy, input) {
        const org = await this.getById(organizationId);
        await this.checkPermission(organizationId, createdBy, ['OWNER', 'MANAGER']);
        const currentMembers = await organization_repository_1.organizationRepository.getMembers(organizationId);
        const pendingInvitations = await organization_repository_1.organizationRepository.getInvitations(organizationId, 'PENDING');
        if (currentMembers.length + pendingInvitations.length >= org.maxEmployees) {
            throw new errors_1.BadRequestError('تم الوصول للحد الأقصى من الموظفين');
        }
        const inviteCode = (0, uuid_1.v4)().split('-')[0].toUpperCase();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays || 7));
        const invitation = await organization_repository_1.organizationRepository.createInvitation({
            organizationId,
            email: input.email,
            phone: input.phone,
            role: input.role,
            inviteCode,
            expiresAt,
            createdBy
        });
        await organization_repository_1.organizationRepository.logActivity({
            organizationId,
            userId: createdBy,
            action: 'CREATE_INVITATION',
            description: `تم إنشاء دعوة لـ ${input.email}`,
            metadata: { email: input.email, role: input.role }
        });
        return invitation;
    }
    async acceptInvitation(inviteCode, userId) {
        const invitation = await organization_repository_1.organizationRepository.findInvitationByCode(inviteCode);
        if (!invitation) {
            throw new errors_1.NotFoundError('الدعوة غير موجودة');
        }
        if (invitation.status !== 'PENDING') {
            throw new errors_1.BadRequestError('الدعوة غير متاحة');
        }
        if (new Date() > invitation.expiresAt) {
            await organization_repository_1.organizationRepository.updateInvitation(invitation.id, { status: 'EXPIRED' });
            throw new errors_1.BadRequestError('انتهت صلاحية الدعوة');
        }
        await organization_repository_1.organizationRepository.addMember({
            organizationId: invitation.organizationId,
            userId,
            role: invitation.role,
            invitedBy: invitation.createdBy
        });
        await organization_repository_1.organizationRepository.updateInvitation(invitation.id, {
            status: 'ACCEPTED',
            acceptedAt: new Date()
        });
        await organization_repository_1.organizationRepository.logActivity({
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
    async getInvitations(organizationId, userId) {
        await this.checkPermission(organizationId, userId, ['OWNER', 'MANAGER']);
        return organization_repository_1.organizationRepository.getInvitations(organizationId);
    }
    async getActivityLog(organizationId, userId) {
        await this.checkPermission(organizationId, userId, ['OWNER', 'MANAGER', 'STAFF']);
        const org = await this.getById(organizationId);
        return org.activityLogs;
    }
    async checkPermission(organizationId, userId, allowedRoles) {
        const member = await organization_repository_1.organizationRepository.findMember(organizationId, userId);
        if (!member) {
            throw new errors_1.ForbiddenError('أنت لست عضواً في هذه المنظمة');
        }
        if (!allowedRoles.includes(member.role)) {
            throw new errors_1.ForbiddenError('لا تملك الصلاحية لهذا الإجراء');
        }
        return member;
    }
}
exports.OrganizationService = OrganizationService;
exports.organizationService = new OrganizationService();
//# sourceMappingURL=organization.service.js.map