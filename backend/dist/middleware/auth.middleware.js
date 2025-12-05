"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminOnly = adminOnly;
exports.ownerOrAdmin = ownerOrAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: 'لم يتم توفير رمز المصادقة'
        });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwt.secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: 'رمز المصادقة غير صالح أو منتهي الصلاحية'
        });
    }
}
function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'هذا الإجراء يتطلب صلاحيات المدير'
        });
    }
    next();
}
function ownerOrAdmin(req, res, next) {
    if (!req.user || !['SUPER_ADMIN', 'CUSTOMER_OWNER'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: 'هذا الإجراء يتطلب صلاحيات المالك أو المدير'
        });
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map