import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    clientId: string;
    role: string;
    organizationId?: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'لم يتم توفير رمز المصادقة'
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as {
      id: string;
      clientId: string;
      role: string;
      organizationId?: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'رمز المصادقة غير صالح أو منتهي الصلاحية'
    });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'هذا الإجراء يتطلب صلاحيات المدير'
    });
  }
  next();
}

export function ownerOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || !['SUPER_ADMIN', 'CUSTOMER_OWNER'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'هذا الإجراء يتطلب صلاحيات المالك أو المدير'
    });
  }
  next();
}
