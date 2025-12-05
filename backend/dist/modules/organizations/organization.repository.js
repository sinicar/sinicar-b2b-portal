"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRepository = exports.OrganizationRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const pagination_1 = require("../../utils/pagination");
class OrganizationRepository {
    async findMany(filters, pagination) {
        const where = {};
        if (filters.type)
            where.type = filters.type;
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.name = { contains: filters.search };
        }
        const [data, total] = await Promise.all([
            prisma_1.default.organization.findMany({
                where,
                include: {
                    users: { include: { user: true } },
                    _count: { select: { users: true, invitations: true } }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.organization.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        return prisma_1.default.organization.findUnique({
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
    async findByOwner(ownerUserId) {
        return prisma_1.default.organization.findFirst({
            where: { ownerUserId },
            include: {
                users: { include: { user: true } }
            }
        });
    }
    async create(data) {
        return prisma_1.default.organization.create({
            data,
            include: { users: true }
        });
    }
    async update(id, data) {
        return prisma_1.default.organization.update({
            where: { id },
            data,
            include: { users: true }
        });
    }
    async delete(id) {
        return prisma_1.default.organization.delete({ where: { id } });
    }
    async addMember(data) {
        return prisma_1.default.organizationUser.create({
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
    async updateMember(id, data) {
        return prisma_1.default.organizationUser.update({
            where: { id },
            data,
            include: { user: true }
        });
    }
    async removeMember(id) {
        return prisma_1.default.organizationUser.delete({ where: { id } });
    }
    async findMember(organizationId, userId) {
        return prisma_1.default.organizationUser.findFirst({
            where: { organizationId, userId },
            include: { user: true, organization: true }
        });
    }
    async getMembers(organizationId) {
        return prisma_1.default.organizationUser.findMany({
            where: { organizationId },
            include: { user: true },
            orderBy: { joinedAt: 'desc' }
        });
    }
    async createInvitation(data) {
        return prisma_1.default.teamInvitation.create({ data });
    }
    async findInvitationByCode(inviteCode) {
        return prisma_1.default.teamInvitation.findUnique({
            where: { inviteCode },
            include: { organization: true }
        });
    }
    async updateInvitation(id, data) {
        return prisma_1.default.teamInvitation.update({ where: { id }, data });
    }
    async getInvitations(organizationId, status) {
        return prisma_1.default.teamInvitation.findMany({
            where: {
                organizationId,
                ...(status && { status })
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async logActivity(data) {
        return prisma_1.default.orgActivityLog.create({
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
exports.OrganizationRepository = OrganizationRepository;
exports.organizationRepository = new OrganizationRepository();
//# sourceMappingURL=organization.repository.js.map