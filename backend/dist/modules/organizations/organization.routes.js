"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organization_service_1 = require("./organization.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const error_middleware_1 = require("../../middleware/error.middleware");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const organization_schema_1 = require("../../schemas/organization.schema");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePaginationParams)(req.query);
    const filters = {
        type: req.query.type,
        status: req.query.status,
        search: req.query.search
    };
    const result = await organization_service_1.organizationService.list(filters, pagination);
    (0, response_1.paginatedResponse)(res, result);
}));
router.get('/my', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const org = await organization_service_1.organizationService.getByOwner(req.user.id);
    (0, response_1.successResponse)(res, org);
}));
router.get('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const org = await organization_service_1.organizationService.getById(req.params.id);
    (0, response_1.successResponse)(res, org);
}));
router.post('/', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(organization_schema_1.createOrganizationSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const org = await organization_service_1.organizationService.create(req.user.id, req.body);
    (0, response_1.createdResponse)(res, org, 'تم إنشاء المنظمة بنجاح');
}));
router.put('/:id', auth_middleware_1.authMiddleware, (0, validate_middleware_1.validate)(organization_schema_1.updateOrganizationSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const org = await organization_service_1.organizationService.update(req.params.id, req.user.id, req.body);
    (0, response_1.successResponse)(res, org, 'تم تحديث المنظمة بنجاح');
}));
router.delete('/:id', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await organization_service_1.organizationService.delete(req.params.id, req.user.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/:id/users', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const members = await organization_service_1.organizationService.getMembers(req.params.id);
    (0, response_1.successResponse)(res, members);
}));
router.post('/:id/users', auth_middleware_1.authMiddleware, auth_middleware_1.ownerOrAdmin, (0, validate_middleware_1.validate)(organization_schema_1.addMemberSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const member = await organization_service_1.organizationService.addMember(req.params.id, req.user.id, req.body);
    (0, response_1.createdResponse)(res, member, 'تم إضافة العضو بنجاح');
}));
router.put('/:id/users/:userId', auth_middleware_1.authMiddleware, auth_middleware_1.ownerOrAdmin, (0, validate_middleware_1.validate)(organization_schema_1.updateMemberSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const member = await organization_service_1.organizationService.updateMember(req.params.id, req.params.userId, req.user.id, req.body);
    (0, response_1.successResponse)(res, member, 'تم تحديث بيانات العضو');
}));
router.delete('/:id/users/:userId', auth_middleware_1.authMiddleware, auth_middleware_1.ownerOrAdmin, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const result = await organization_service_1.organizationService.removeMember(req.params.id, req.params.userId, req.user.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.post('/:id/invitations', auth_middleware_1.authMiddleware, auth_middleware_1.ownerOrAdmin, (0, validate_middleware_1.validate)(organization_schema_1.createInvitationSchema), (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const invitation = await organization_service_1.organizationService.createInvitation(req.params.id, req.user.id, req.body);
    (0, response_1.createdResponse)(res, invitation, 'تم إنشاء الدعوة بنجاح');
}));
router.get('/:id/invitations', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const invitations = await organization_service_1.organizationService.getInvitations(req.params.id, req.user.id);
    (0, response_1.successResponse)(res, invitations);
}));
router.delete('/:id/invitations/:invitationId', auth_middleware_1.authMiddleware, auth_middleware_1.ownerOrAdmin, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    (0, response_1.successResponse)(res, { message: 'تم إلغاء الدعوة' });
}));
router.post('/accept-invitation', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { inviteCode } = req.body;
    const result = await organization_service_1.organizationService.acceptInvitation(inviteCode, req.user.id);
    (0, response_1.successResponse)(res, result, result.message);
}));
router.get('/:id/activity-logs', auth_middleware_1.authMiddleware, (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const logs = await organization_service_1.organizationService.getActivityLog(req.params.id, req.user.id);
    (0, response_1.successResponse)(res, logs);
}));
exports.default = router;
//# sourceMappingURL=organization.routes.js.map