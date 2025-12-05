"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRepository = exports.CustomerRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const pagination_1 = require("../../utils/pagination");
class CustomerRepository {
    async findMany(filters, pagination) {
        const where = {
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
        if (filters.status)
            where.status = filters.status;
        const profileWhere = {};
        if (filters.customerType)
            profileWhere.customerType = filters.customerType;
        if (filters.priceLevel)
            profileWhere.assignedPriceLevel = filters.priceLevel;
        if (filters.isApproved !== undefined)
            profileWhere.isApproved = filters.isApproved;
        if (filters.region)
            profileWhere.region = filters.region;
        if (filters.city)
            profileWhere.city = filters.city;
        if (Object.keys(profileWhere).length > 0) {
            where.profile = profileWhere;
        }
        const [data, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                include: {
                    profile: {
                        include: { branches: true, documents: true }
                    },
                    organizationUsers: {
                        include: { organization: true }
                    }
                },
                orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.user.count({ where })
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        return prisma_1.default.user.findUnique({
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
    async findByClientId(clientId) {
        return prisma_1.default.user.findUnique({
            where: { clientId },
            include: {
                profile: {
                    include: { branches: true }
                }
            }
        });
    }
    async create(data) {
        return prisma_1.default.user.create({
            data,
            include: {
                profile: {
                    include: { branches: true }
                }
            }
        });
    }
    async update(id, data) {
        return prisma_1.default.user.update({
            where: { id },
            data,
            include: {
                profile: {
                    include: { branches: true }
                }
            }
        });
    }
    async delete(id) {
        return prisma_1.default.user.delete({ where: { id } });
    }
    async softDelete(id) {
        return prisma_1.default.user.update({
            where: { id },
            data: {
                isActive: false,
                status: 'BLOCKED'
            }
        });
    }
    async updateProfile(userId, data) {
        return prisma_1.default.businessProfile.update({
            where: { userId },
            data,
            include: { branches: true, documents: true }
        });
    }
    async createProfile(data) {
        return prisma_1.default.businessProfile.create({
            data,
            include: { branches: true }
        });
    }
    async addBranch(profileId, data) {
        return prisma_1.default.branch.create({
            data: {
                ...data,
                profile: { connect: { id: profileId } }
            }
        });
    }
    async updateBranch(id, data) {
        return prisma_1.default.branch.update({ where: { id }, data });
    }
    async deleteBranch(id) {
        return prisma_1.default.branch.delete({ where: { id } });
    }
    async addDocument(profileId, data) {
        return prisma_1.default.document.create({
            data: {
                ...data,
                profile: { connect: { id: profileId } }
            }
        });
    }
    async deleteDocument(id) {
        return prisma_1.default.document.delete({ where: { id } });
    }
    async getStaff(parentId) {
        return prisma_1.default.user.findMany({
            where: { parentId, role: 'CUSTOMER_STAFF' },
            include: { profile: true }
        });
    }
    async addStaff(data) {
        return prisma_1.default.user.create({
            data: {
                ...data,
                role: 'CUSTOMER_STAFF'
            }
        });
    }
    async getAccountOpeningRequests(pagination) {
        const [data, total] = await Promise.all([
            prisma_1.default.accountOpeningRequest.findMany({
                orderBy: { createdAt: 'desc' },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            }),
            prisma_1.default.accountOpeningRequest.count()
        ]);
        return (0, pagination_1.createPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async createAccountOpeningRequest(data) {
        return prisma_1.default.accountOpeningRequest.create({ data });
    }
    async updateAccountOpeningRequest(id, data) {
        return prisma_1.default.accountOpeningRequest.update({ where: { id }, data });
    }
}
exports.CustomerRepository = CustomerRepository;
exports.customerRepository = new CustomerRepository();
//# sourceMappingURL=customer.repository.js.map