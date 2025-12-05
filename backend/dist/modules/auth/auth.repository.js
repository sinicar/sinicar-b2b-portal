"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = exports.AuthRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class AuthRepository {
    async findUserByClientId(clientId) {
        return prisma_1.default.user.findUnique({
            where: { clientId },
            include: {
                profile: true,
                organizationUsers: {
                    include: { organization: true }
                }
            }
        });
    }
    async findUserById(id) {
        return prisma_1.default.user.findUnique({
            where: { id },
            include: {
                profile: true,
                organizationUsers: {
                    include: { organization: true }
                }
            }
        });
    }
    async findUserByEmail(email) {
        return prisma_1.default.user.findFirst({
            where: { email },
            include: { profile: true }
        });
    }
    async createUser(data) {
        return prisma_1.default.user.create({
            data,
            include: { profile: true }
        });
    }
    async updateUser(id, data) {
        return prisma_1.default.user.update({
            where: { id },
            data,
            include: { profile: true }
        });
    }
    async updateLastLogin(id) {
        return prisma_1.default.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
                lastActiveAt: new Date(),
                failedLoginAttempts: 0
            }
        });
    }
    async incrementFailedLoginAttempts(id) {
        return prisma_1.default.user.update({
            where: { id },
            data: {
                failedLoginAttempts: { increment: 1 }
            }
        });
    }
    async findStaffByParent(parentId, activationCode) {
        return prisma_1.default.user.findFirst({
            where: {
                parentId,
                activationCode,
                role: 'CUSTOMER_STAFF'
            },
            include: { profile: true }
        });
    }
    async findUserByResetToken(resetToken) {
        return prisma_1.default.user.findFirst({
            where: {
                passwordResetToken: resetToken,
                role: { not: 'CUSTOMER_STAFF' }
            },
            include: { profile: true }
        });
    }
    async logActivity(data) {
        return prisma_1.default.activityLog.create({
            data: {
                userId: data.userId,
                userName: data.userName,
                role: data.role,
                eventType: data.eventType,
                description: data.description,
                page: data.page,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null
            }
        });
    }
}
exports.AuthRepository = AuthRepository;
exports.authRepository = new AuthRepository();
//# sourceMappingURL=auth.repository.js.map