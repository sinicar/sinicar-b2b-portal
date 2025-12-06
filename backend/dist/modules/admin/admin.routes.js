"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const router = (0, express_1.Router)();
router.put('/users/:id/approve', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        return (0, response_1.errorResponse)(res, 'المستخدم غير موجود', 404);
    }
    await prisma_1.default.user.update({
        where: { id },
        data: { status: 'APPROVED' }
    });
    await prisma_1.default.activityLog.create({
        data: {
            userId: req.user.id,
            userName: req.user.clientId,
            role: req.user.role,
            eventType: 'USER_APPROVED',
            description: `تمت الموافقة على المستخدم: ${user.name}`,
            metadata: JSON.stringify({ targetUserId: id, targetUserName: user.name })
        }
    });
    (0, response_1.successResponse)(res, { success: true, status: 'APPROVED' }, 'تمت الموافقة على الحساب بنجاح');
}));
router.put('/users/:id/reject', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        return (0, response_1.errorResponse)(res, 'المستخدم غير موجود', 404);
    }
    await prisma_1.default.user.update({
        where: { id },
        data: { status: 'REJECTED' }
    });
    await prisma_1.default.activityLog.create({
        data: {
            userId: req.user.id,
            userName: req.user.clientId,
            role: req.user.role,
            eventType: 'USER_REJECTED',
            description: `تم رفض المستخدم: ${user.name}`,
            metadata: JSON.stringify({ targetUserId: id, targetUserName: user.name })
        }
    });
    (0, response_1.successResponse)(res, { success: true, status: 'REJECTED' }, 'تم رفض الحساب');
}));
router.put('/users/:id/block', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        return (0, response_1.errorResponse)(res, 'المستخدم غير موجود', 404);
    }
    await prisma_1.default.user.update({
        where: { id },
        data: { status: 'BLOCKED' }
    });
    await prisma_1.default.activityLog.create({
        data: {
            userId: req.user.id,
            userName: req.user.clientId,
            role: req.user.role,
            eventType: 'USER_BLOCKED',
            description: `تم حظر المستخدم: ${user.name}`,
            metadata: JSON.stringify({ targetUserId: id, targetUserName: user.name })
        }
    });
    (0, response_1.successResponse)(res, { success: true, status: 'BLOCKED' }, 'تم حظر الحساب');
}));
router.get('/users/pending', auth_middleware_1.authMiddleware, auth_middleware_1.adminOnly, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pendingUsers = await prisma_1.default.user.findMany({
        where: { status: 'PENDING' },
        select: {
            id: true,
            clientId: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true,
            isCustomer: true,
            isSupplier: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
    (0, response_1.successResponse)(res, pendingUsers, 'قائمة الحسابات المعلقة');
}));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map