"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetCode = generateResetCode;
exports.getResetCodeExpiry = getResetCodeExpiry;
exports.storeResetCode = storeResetCode;
exports.findUserByWhatsappOrEmail = findUserByWhatsappOrEmail;
exports.validateResetCode = validateResetCode;
exports.updatePassword = updatePassword;
exports.clearResetCode = clearResetCode;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function getResetCodeExpiry(minutes = 15) {
    return new Date(Date.now() + minutes * 60 * 1000);
}
async function storeResetCode(userId, resetCode, expiresAt) {
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            passwordResetToken: resetCode,
            passwordResetExpiry: expiresAt
        }
    });
}
async function findUserByWhatsappOrEmail(identifier) {
    const user = await prisma_1.default.user.findFirst({
        where: {
            OR: [
                { whatsapp: identifier },
                { email: identifier },
                { phone: identifier }
            ]
        },
        select: { id: true, name: true }
    });
    return user;
}
async function validateResetCode(identifier, resetCode) {
    const user = await prisma_1.default.user.findFirst({
        where: {
            OR: [
                { whatsapp: identifier },
                { email: identifier },
                { phone: identifier }
            ]
        },
        select: {
            id: true,
            passwordResetToken: true,
            passwordResetExpiry: true
        }
    });
    if (!user) {
        return { valid: false, error: 'المستخدم غير موجود' };
    }
    if (!user.passwordResetToken || user.passwordResetToken !== resetCode) {
        return { valid: false, error: 'رمز إعادة التعيين غير صحيح' };
    }
    if (!user.passwordResetExpiry || new Date() > user.passwordResetExpiry) {
        return { valid: false, error: 'انتهت صلاحية رمز إعادة التعيين' };
    }
    return { valid: true, userId: user.id };
}
async function updatePassword(userId, newPassword) {
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpiry: null,
            failedLoginAttempts: 0
        }
    });
}
async function clearResetCode(userId) {
    await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            passwordResetToken: null,
            passwordResetExpiry: null
        }
    });
}
//# sourceMappingURL=password-reset.service.js.map