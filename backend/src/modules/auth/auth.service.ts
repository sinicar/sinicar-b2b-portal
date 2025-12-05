import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authRepository } from './auth.repository';
import { env } from '../../config/env';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../../utils/errors';
import { LoginInput, RegisterInput } from '../../schemas/auth.schema';

interface TokenPayload {
  id: string;
  clientId: string;
  role: string;
  organizationId?: string;
}

export class AuthService {
  private generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn
    });
    
    const refreshToken = jwt.sign(
      { id: payload.id, type: 'refresh' },
      env.jwt.secret,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
  }

  async login(input: LoginInput) {
    const { identifier, password, loginType } = input;

    if (loginType === 'owner') {
      const user = await authRepository.findUserByClientId(identifier);
      
      if (!user) {
        throw new UnauthorizedError('معرف العميل أو كلمة المرور غير صحيحة');
      }

      if (!user.isActive || user.status !== 'ACTIVE') {
        throw new UnauthorizedError('الحساب غير نشط أو موقوف');
      }

      if (user.failedLoginAttempts >= 5) {
        throw new UnauthorizedError('تم تجاوز عدد محاولات الدخول. يرجى الانتظار أو التواصل مع الدعم');
      }

      if (!user.password) {
        throw new UnauthorizedError('لم يتم تعيين كلمة مرور لهذا الحساب');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        await authRepository.incrementFailedLoginAttempts(user.id);
        throw new UnauthorizedError('معرف العميل أو كلمة المرور غير صحيحة');
      }

      await authRepository.updateLastLogin(user.id);

      const orgUser = user.organizationUsers[0];
      const tokens = this.generateTokens({
        id: user.id,
        clientId: user.clientId,
        role: user.role,
        organizationId: orgUser?.organizationId
      });

      await authRepository.logActivity({
        userId: user.id,
        userName: user.name,
        role: user.role,
        eventType: 'LOGIN',
        description: 'تسجيل دخول المالك',
        page: '/login'
      });

      return {
        user: {
          id: user.id,
          clientId: user.clientId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile: user.profile
        },
        ...tokens
      };

    } else {
      const [ownerClientId, activationCode] = identifier.split('-');
      
      if (!ownerClientId || !activationCode) {
        throw new BadRequestError('صيغة معرف الموظف غير صحيحة. استخدم: معرف_المالك-رمز_التفعيل');
      }

      const owner = await authRepository.findUserByClientId(ownerClientId);
      if (!owner) {
        throw new NotFoundError('لم يتم العثور على حساب المالك');
      }

      const staff = await authRepository.findStaffByParent(owner.id, activationCode);
      if (!staff) {
        throw new UnauthorizedError('رمز التفعيل غير صحيح');
      }

      if (!staff.isActive) {
        throw new UnauthorizedError('حساب الموظف غير نشط');
      }

      if (staff.password) {
        const isValidPassword = await bcrypt.compare(password, staff.password);
        if (!isValidPassword) {
          throw new UnauthorizedError('كلمة المرور غير صحيحة');
        }
      }

      await authRepository.updateLastLogin(staff.id);

      const tokens = this.generateTokens({
        id: staff.id,
        clientId: `${ownerClientId}-${activationCode}`,
        role: staff.role
      });

      await authRepository.logActivity({
        userId: staff.id,
        userName: staff.name,
        role: staff.role,
        eventType: 'LOGIN',
        description: 'تسجيل دخول الموظف',
        page: '/login'
      });

      return {
        user: {
          id: staff.id,
          clientId: `${ownerClientId}-${activationCode}`,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          role: staff.role,
          employeeRole: staff.employeeRole
        },
        ...tokens
      };
    }
  }

  async register(input: RegisterInput) {
    const existingUser = await authRepository.findUserByClientId(input.clientId);
    if (existingUser) {
      throw new BadRequestError('معرف العميل مستخدم بالفعل');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await authRepository.createUser({
      clientId: input.clientId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      role: input.role,
      status: 'PENDING'
    });

    await authRepository.logActivity({
      userId: user.id,
      userName: user.name,
      role: user.role,
      eventType: 'REGISTER',
      description: 'تسجيل حساب جديد',
      page: '/register'
    });

    return {
      user: {
        id: user.id,
        clientId: user.clientId,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      message: 'تم إنشاء الحساب بنجاح. يرجى انتظار الموافقة'
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwt.secret) as { id: string; type: string };
      
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('رمز التجديد غير صالح');
      }

      const user = await authRepository.findUserById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('المستخدم غير موجود أو غير نشط');
      }

      const orgUser = user.organizationUsers[0];
      const tokens = this.generateTokens({
        id: user.id,
        clientId: user.clientId,
        role: user.role,
        organizationId: orgUser?.organizationId
      });

      return tokens;

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('انتهت صلاحية رمز التجديد');
      }
      throw new UnauthorizedError('رمز التجديد غير صالح');
    }
  }

  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('المستخدم غير موجود');
    }

    return {
      id: user.id,
      clientId: user.clientId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      employeeRole: user.employeeRole,
      isActive: user.isActive,
      status: user.status,
      profile: user.profile,
      searchLimit: user.searchLimit,
      searchUsed: user.searchUsed,
      lastLoginAt: user.lastLoginAt,
      organizations: user.organizationUsers.map(ou => ({
        id: ou.organization.id,
        name: ou.organization.name,
        type: ou.organization.type,
        role: ou.role
      }))
    };
  }

  async logout(userId: string) {
    await authRepository.logActivity({
      userId,
      eventType: 'LOGOUT',
      description: 'تسجيل الخروج',
      page: '/logout'
    });

    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findUserById(userId);
    if (!user || !user.password) {
      throw new NotFoundError('المستخدم غير موجود');
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('كلمة المرور الحالية غير صحيحة');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updateUser(userId, { password: hashedPassword });

    await authRepository.logActivity({
      userId,
      eventType: 'PASSWORD_CHANGE',
      description: 'تغيير كلمة المرور',
      page: '/settings'
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }
}

export const authService = new AuthService();
