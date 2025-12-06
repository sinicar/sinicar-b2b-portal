"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const messagingService = __importStar(require("./messaging.service"));
const router = (0, express_1.Router)();
router.get('/templates', async (req, res) => {
    try {
        const templates = await messagingService.getAllTemplates();
        res.json({
            success: true,
            data: templates,
            message: 'Templates retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/templates/by-event/:event', async (req, res) => {
    try {
        const event = req.params.event;
        const templates = await messagingService.getTemplatesByEvent(event);
        res.json({
            success: true,
            data: templates,
            message: 'Templates retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/templates/:id', async (req, res) => {
    try {
        const template = await messagingService.getTemplateById(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, error: 'Template not found' });
        }
        res.json({
            success: true,
            data: template,
            message: 'Template retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/templates', async (req, res) => {
    try {
        const { event, channel, language, name, nameAr, nameEn, subject, subjectAr, subjectEn, body, bodyAr, bodyEn, variables, description, isDefault, isActive, } = req.body;
        if (!event || !channel || !name || !body) {
            return res.status(400).json({
                success: false,
                error: 'Event, channel, name, and body are required',
            });
        }
        const template = await messagingService.createTemplate({
            event: event,
            channel: channel,
            language: language || 'ar',
            name,
            nameAr,
            nameEn,
            subject,
            subjectAr,
            subjectEn,
            body,
            bodyAr,
            bodyEn,
            variables: variables ? JSON.stringify(variables) : undefined,
            description,
            isDefault: isDefault ?? false,
            isActive: isActive ?? true,
        });
        res.status(201).json({
            success: true,
            data: template,
            message: 'Template created successfully',
        });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                error: 'A template with this event, channel, and language already exists',
            });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/templates/:id', async (req, res) => {
    try {
        const { name, nameAr, nameEn, subject, subjectAr, subjectEn, body, bodyAr, bodyEn, variables, description, isDefault, isActive, } = req.body;
        const template = await messagingService.updateTemplate(req.params.id, {
            name,
            nameAr,
            nameEn,
            subject,
            subjectAr,
            subjectEn,
            body,
            bodyAr,
            bodyEn,
            variables: variables ? JSON.stringify(variables) : undefined,
            description,
            isDefault,
            isActive,
        });
        res.json({
            success: true,
            data: template,
            message: 'Template updated successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/templates/:id', async (req, res) => {
    try {
        await messagingService.deleteTemplate(req.params.id);
        res.json({
            success: true,
            message: 'Template deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.patch('/templates/:id/toggle', async (req, res) => {
    try {
        const { isActive } = req.body;
        const template = await messagingService.toggleTemplateActive(req.params.id, isActive);
        res.json({
            success: true,
            data: template,
            message: `Template ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/events', async (req, res) => {
    try {
        const summary = await messagingService.getEventsSummary();
        res.json({
            success: true,
            data: summary,
            message: 'Events summary retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/events/list', async (req, res) => {
    try {
        const events = Object.values(client_1.MessageEvent);
        const eventDetails = events.map(event => ({
            code: event,
            name: event.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            category: getEventCategory(event),
        }));
        res.json({
            success: true,
            data: eventDetails,
            message: 'Events list retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
function getEventCategory(event) {
    if (event.startsWith('QUOTE_'))
        return 'QUOTES';
    if (event.startsWith('ORDER_'))
        return 'ORDERS';
    if (event.startsWith('PAYMENT_'))
        return 'PAYMENTS';
    if (event.startsWith('SHIPMENT_'))
        return 'SHIPMENTS';
    if (event.startsWith('ACCOUNT_') || event.startsWith('PASSWORD_') || event === 'WELCOME_MESSAGE')
        return 'ACCOUNT';
    if (event.startsWith('INSTALLMENT_'))
        return 'INSTALLMENTS';
    if (event.startsWith('SUPPLIER_') || event.startsWith('CATALOG_'))
        return 'SUPPLIERS';
    if (event.includes('ALERT') || event.includes('NOTIFICATION') || event.includes('ANNOUNCEMENT') || event.includes('NOTICE'))
        return 'ALERTS';
    return 'GENERAL';
}
router.get('/channels', async (req, res) => {
    try {
        const channels = Object.values(client_1.MessageChannel).map(channel => ({
            code: channel,
            name: channel.charAt(0) + channel.slice(1).toLowerCase(),
            nameAr: getChannelNameAr(channel),
        }));
        res.json({
            success: true,
            data: channels,
            message: 'Channels retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
function getChannelNameAr(channel) {
    switch (channel) {
        case client_1.MessageChannel.WHATSAPP: return 'واتساب';
        case client_1.MessageChannel.EMAIL: return 'البريد الإلكتروني';
        case client_1.MessageChannel.NOTIFICATION: return 'الإشعارات';
        default: return channel;
    }
}
router.get('/variables', async (req, res) => {
    try {
        const event = req.query.event;
        const variables = await messagingService.getTemplateVariables(event);
        res.json({
            success: true,
            data: variables,
            message: 'Variables retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/logs', async (req, res) => {
    try {
        const { event, channel, status, recipientId, startDate, endDate, limit, offset, } = req.query;
        const result = await messagingService.getMessageLogs({
            event: event,
            channel: channel,
            status: status,
            recipientId: recipientId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json({
            success: true,
            data: result.logs,
            total: result.total,
            message: 'Logs retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/logs/:id', async (req, res) => {
    try {
        const log = await messagingService.getMessageLogById(req.params.id);
        if (!log) {
            return res.status(404).json({ success: false, error: 'Log not found' });
        }
        res.json({
            success: true,
            data: log,
            message: 'Log retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/logs/stats', async (req, res) => {
    try {
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const stats = await messagingService.getLogStats(days);
        res.json({
            success: true,
            data: stats,
            message: 'Log stats retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/settings', async (req, res) => {
    try {
        const settings = await messagingService.getMessageSettings();
        res.json({
            success: true,
            data: settings,
            message: 'Settings retrieved successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/settings', async (req, res) => {
    try {
        const settings = await messagingService.updateMessageSettings(req.body);
        res.json({
            success: true,
            data: settings,
            message: 'Settings updated successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/send', async (req, res) => {
    try {
        const { event, channel, context } = req.body;
        if (!event || !channel || !context) {
            return res.status(400).json({
                success: false,
                error: 'Event, channel, and context are required',
            });
        }
        const result = await messagingService.sendEventMessage(event, channel, context);
        if (result.success) {
            res.json({
                success: true,
                data: { logId: result.logId },
                message: 'Message sent successfully',
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: result.error,
                data: { logId: result.logId },
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/send-test', async (req, res) => {
    try {
        const { templateId, testRecipient, testVariables } = req.body;
        if (!templateId) {
            return res.status(400).json({
                success: false,
                error: 'Template ID is required',
            });
        }
        const result = await messagingService.sendTestMessage(templateId, testRecipient || {}, testVariables || {});
        if (result.success) {
            res.json({
                success: true,
                data: { logId: result.logId },
                message: 'Test message sent successfully',
            });
        }
        else {
            res.status(400).json({
                success: false,
                error: result.error,
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/preview', async (req, res) => {
    try {
        const { body, subject, variables } = req.body;
        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'Body is required',
            });
        }
        const renderedBody = messagingService.renderTemplate(body, variables || {});
        const renderedSubject = subject ? messagingService.renderTemplate(subject, variables || {}) : null;
        res.json({
            success: true,
            data: {
                body: renderedBody,
                subject: renderedSubject,
            },
            message: 'Preview generated successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/refresh-cache', async (req, res) => {
    try {
        await messagingService.refreshTemplateCache();
        res.json({
            success: true,
            message: 'Template cache refreshed successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=messaging.routes.js.map