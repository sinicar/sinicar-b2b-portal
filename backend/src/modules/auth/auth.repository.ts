import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByClientId(clientId: string) {
    return prisma.user.findUnique({
      where: { clientId },
      include: {
        profile: true,
        organizationUsers: {
          include: { organization: true }
        }
      }
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        organizationUsers: {
          include: { organization: true }
        }
      }
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email },
      include: { profile: true }
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: { profile: true }
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { profile: true }
    });
  }

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        failedLoginAttempts: 0
      }
    });
  }

  async incrementFailedLoginAttempts(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        failedLoginAttempts: { increment: 1 }
      }
    });
  }

  async findStaffByParent(parentId: string, activationCode: string) {
    return prisma.user.findFirst({
      where: {
        parentId,
        activationCode,
        role: 'CUSTOMER_STAFF'
      },
      include: { profile: true }
    });
  }

  async findUserByResetToken(resetToken: string) {
    return prisma.user.findFirst({
      where: { 
        passwordResetToken: resetToken,
        role: { not: 'CUSTOMER_STAFF' }
      },
      include: { profile: true }
    });
  }

  async logActivity(data: {
    userId?: string;
    userName?: string;
    role?: string;
    eventType: string;
    description: string;
    page?: string;
    metadata?: object;
  }) {
    return prisma.activityLog.create({
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

export const authRepository = new AuthRepository();
