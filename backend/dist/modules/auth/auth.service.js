"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const auth_repository_1 = require("./auth.repository");
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
class AuthService {
    generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.jwt.secret, {
            expiresIn: env_1.env.jwt.expiresIn
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: payload.id, type: 'refresh' }, env_1.env.jwt.secret, { expiresIn: '30d' });
        return { accessToken, refreshToken };
    }
    async login(input) {
        const { identifier, password, loginType } = input;
        if (loginType === 'owner') {
            const user = await auth_repository_1.authRepository.findUserByClientId(identifier);
            if (!user) {
                throw new errors_1.UnauthorizedError('معرف العميل أو كلمة المرور غير صحيحة');
            }
            if (!user.isActive || user.status !== 'ACTIVE') {
                throw new errors_1.UnauthorizedError('الحساب غير نشط أو موقوف');
            }
            if (user.failedLoginAttempts >= 5) {
                throw new errors_1.UnauthorizedError('تم تجاوز عدد محاولات الدخول. يرجى الانتظار أو التواصل مع الدعم');
            }
            if (!user.password) {
                throw new errors_1.UnauthorizedError('لم يتم تعيين كلمة مرور لهذا الحساب');
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                await auth_repository_1.authRepository.incrementFailedLoginAttempts(user.id);
                throw new errors_1.UnauthorizedError('معرف العميل أو كلمة المرور غير صحيحة');
            }
            await auth_repository_1.authRepository.updateLastLogin(user.id);
            const orgUser = user.organizationUsers[0];
            const tokens = this.generateTokens({
                id: user.id,
                clientId: user.clientId,
                role: user.role,
                organizationId: orgUser?.organizationId
            });
            await auth_repository_1.authRepository.logActivity({
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
        }
        else {
            const [ownerClientId, activationCode] = identifier.split('-');
            if (!ownerClientId || !activationCode) {
                throw new errors_1.BadRequestError('صيغة معرف الموظف غير صحيحة. استخدم: معرف_المالك-رمز_التفعيل');
            }
            const owner = await auth_repository_1.authRepository.findUserByClientId(ownerClientId);
            if (!owner) {
                throw new errors_1.NotFoundError('لم يتم العثور على حساب المالك');
            }
            const staff = await auth_repository_1.authRepository.findStaffByParent(owner.id, activationCode);
            if (!staff) {
                throw new errors_1.UnauthorizedError('رمز التفعيل غير صحيح');
            }
            if (!staff.isActive) {
                throw new errors_1.UnauthorizedError('حساب الموظف غير نشط');
            }
            if (!staff.password) {
                throw new errors_1.UnauthorizedError('لم يتم تعيين كلمة مرور لحساب الموظف. يرجى التواصل مع المالك');
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, staff.password);
            if (!isValidPassword) {
                throw new errors_1.UnauthorizedError('كلمة المرور غير صحيحة');
            }
            await auth_repository_1.authRepository.updateLastLogin(staff.id);
            const tokens = this.generateTokens({
                id: staff.id,
                clientId: `${ownerClientId}-${activationCode}`,
                role: staff.role
            });
            await auth_repository_1.authRepository.logActivity({
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
    async register(input) {
        const existingUser = await auth_repository_1.authRepository.findUserByClientId(input.clientId);
        if (existingUser) {
            throw new errors_1.BadRequestError('معرف العميل مستخدم بالفعل');
        }
        const hashedPassword = await bcryptjs_1.default.hash(input.password, 10);
        const user = await auth_repository_1.authRepository.createUser({
            clientId: input.clientId,
            name: input.name,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
            role: input.role,
            status: 'PENDING'
        });
        await auth_repository_1.authRepository.logActivity({
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
    async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwt.secret);
            if (decoded.type !== 'refresh') {
                throw new errors_1.UnauthorizedError('رمز التجديد غير صالح');
            }
            const user = await auth_repository_1.authRepository.findUserById(decoded.id);
            if (!user || !user.isActive) {
                throw new errors_1.UnauthorizedError('المستخدم غير موجود أو غير نشط');
            }
            const orgUser = user.organizationUsers[0];
            const tokens = this.generateTokens({
                id: user.id,
                clientId: user.clientId,
                role: user.role,
                organizationId: orgUser?.organizationId
            });
            return tokens;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.UnauthorizedError('انتهت صلاحية رمز التجديد');
            }
            throw new errors_1.UnauthorizedError('رمز التجديد غير صالح');
        }
    }
    async getMe(userId) {
        const user = await auth_repository_1.authRepository.findUserById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('المستخدم غير موجود');
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
    async logout(userId) {
        await auth_repository_1.authRepository.logActivity({
            userId,
            eventType: 'LOGOUT',
            description: 'تسجيل الخروج',
            page: '/logout'
        });
        return { message: 'تم تسجيل الخروج بنجاح' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await auth_repository_1.authRepository.findUserById(userId);
        if (!user || !user.password) {
            throw new errors_1.NotFoundError('المستخدم غير موجود');
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new errors_1.BadRequestError('كلمة المرور الحالية غير صحيحة');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await auth_repository_1.authRepository.updateUser(userId, { password: hashedPassword });
        await auth_repository_1.authRepository.logActivity({
            userId,
            eventType: 'PASSWORD_CHANGE',
            description: 'تغيير كلمة المرور',
            page: '/settings'
        });
        return { message: 'تم تغيير كلمة المرور بنجاح' };
    }
    async forgotPassword(identifier) {
        const user = await auth_repository_1.authRepository.findUserByClientId(identifier)
            || await auth_repository_1.authRepository.findUserByEmail(identifier);
        if (!user) {
            return {
                message: 'إذا كان الحساب موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور',
                success: true
            };
        }
        const genericResponse = {
            message: 'إذا كان الحساب موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور',
            success: true
        };
        if (user.role === 'CUSTOMER_STAFF') {
            await auth_repository_1.authRepository.logActivity({
                userId: user.id,
                userName: user.name,
                role: user.role,
                eventType: 'PASSWORD_RESET_DENIED_STAFF',
                description: 'محاولة إعادة تعيين كلمة مرور لحساب موظف'
            });
            return genericResponse;
        }
        const resetToken = (0, uuid_1.v4)();
        const resetExpiry = new Date(Date.now() + 3600000);
        await auth_repository_1.authRepository.updateUser(user.id, {
            passwordResetToken: resetToken,
            passwordResetExpiry: resetExpiry
        });
        await auth_repository_1.authRepository.logActivity({
            userId: user.id,
            userName: user.name,
            role: user.role,
            eventType: 'PASSWORD_RESET_REQUEST',
            description: 'طلب إعادة تعيين كلمة المرور',
            metadata: { expiresAt: resetExpiry.toISOString() }
        });
        return genericResponse;
    }
    async resetPassword(resetToken, newPassword) {
        const user = await auth_repository_1.authRepository.findUserByResetToken(resetToken);
        if (!user) {
            throw new errors_1.BadRequestError('رمز إعادة التعيين غير صالح أو منتهي الصلاحية');
        }
        if (user.passwordResetExpiry && new Date() > user.passwordResetExpiry) {
            await auth_repository_1.authRepository.updateUser(user.id, {
                passwordResetToken: null,
                passwordResetExpiry: null
            });
            throw new errors_1.BadRequestError('انتهت صلاحية رمز إعادة التعيين. يرجى طلب رمز جديد');
        }
        if (newPassword.length < 8) {
            throw new errors_1.BadRequestError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await auth_repository_1.authRepository.updateUser(user.id, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpiry: null,
            failedLoginAttempts: 0
        });
        await auth_repository_1.authRepository.logActivity({
            userId: user.id,
            userName: user.name,
            role: user.role,
            eventType: 'PASSWORD_RESET_COMPLETE',
            description: 'تم إعادة تعيين كلمة المرور بنجاح'
        });
        return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map