import { Router } from 'express';
import { organizationService } from './organization.service';
import { authMiddleware, AuthRequest, ownerOrAdmin } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { successResponse, createdResponse, paginatedResponse } from '../../utils/response';
import { parsePaginationParams } from '../../utils/pagination';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberSchema,
  createInvitationSchema
} from '../../schemas/organization.schema';

const router = Router();

router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const pagination = parsePaginationParams(req.query);
  const filters = {
    type: req.query.type as any,
    status: req.query.status as any,
    search: req.query.search as string
  };
  const result = await organizationService.list(filters, pagination);
  paginatedResponse(res, result);
}));

router.get('/my', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const org = await organizationService.getByOwner(req.user!.id);
  successResponse(res, org);
}));

router.get('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const org = await organizationService.getById(req.params.id);
  successResponse(res, org);
}));

router.post('/', authMiddleware, validate(createOrganizationSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const org = await organizationService.create(req.user!.id, req.body);
  createdResponse(res, org, 'تم إنشاء المنظمة بنجاح');
}));

router.put('/:id', authMiddleware, validate(updateOrganizationSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const org = await organizationService.update(req.params.id, req.user!.id, req.body);
  successResponse(res, org, 'تم تحديث المنظمة بنجاح');
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await organizationService.delete(req.params.id, req.user!.id);
  successResponse(res, result, result.message);
}));

router.get('/:id/users', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const members = await organizationService.getMembers(req.params.id);
  successResponse(res, members);
}));

router.post('/:id/users', authMiddleware, ownerOrAdmin, validate(addMemberSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const member = await organizationService.addMember(req.params.id, req.user!.id, req.body);
  createdResponse(res, member, 'تم إضافة العضو بنجاح');
}));

router.put('/:id/users/:userId', authMiddleware, ownerOrAdmin, validate(updateMemberSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const member = await organizationService.updateMember(req.params.id, req.params.userId, req.user!.id, req.body);
  successResponse(res, member, 'تم تحديث بيانات العضو');
}));

router.delete('/:id/users/:userId', authMiddleware, ownerOrAdmin, asyncHandler(async (req: AuthRequest, res: any) => {
  const result = await organizationService.removeMember(req.params.id, req.params.userId, req.user!.id);
  successResponse(res, result, result.message);
}));

router.post('/:id/invitations', authMiddleware, ownerOrAdmin, validate(createInvitationSchema), asyncHandler(async (req: AuthRequest, res: any) => {
  const invitation = await organizationService.createInvitation(req.params.id, req.user!.id, req.body);
  createdResponse(res, invitation, 'تم إنشاء الدعوة بنجاح');
}));

router.get('/:id/invitations', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const invitations = await organizationService.getInvitations(req.params.id, req.user!.id);
  successResponse(res, invitations);
}));

router.delete('/:id/invitations/:invitationId', authMiddleware, ownerOrAdmin, asyncHandler(async (req: AuthRequest, res: any) => {
  successResponse(res, { message: 'تم إلغاء الدعوة' });
}));

router.post('/accept-invitation', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const { inviteCode } = req.body;
  const result = await organizationService.acceptInvitation(inviteCode, req.user!.id);
  successResponse(res, result, result.message);
}));

router.get('/:id/activity-logs', authMiddleware, asyncHandler(async (req: AuthRequest, res: any) => {
  const logs = await organizationService.getActivityLog(req.params.id, req.user!.id);
  successResponse(res, logs);
}));

export default router;
