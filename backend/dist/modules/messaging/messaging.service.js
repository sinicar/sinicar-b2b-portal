"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateFromCache = getTemplateFromCache;
exports.refreshTemplateCache = refreshTemplateCache;
exports.renderTemplate = renderTemplate;
exports.sendEventMessage = sendEventMessage;
exports.getAllTemplates = getAllTemplates;
exports.getTemplatesByEvent = getTemplatesByEvent;
exports.getTemplateById = getTemplateById;
exports.createTemplate = createTemplate;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
exports.toggleTemplateActive = toggleTemplateActive;
exports.getMessageLogs = getMessageLogs;
exports.getMessageLogById = getMessageLogById;
exports.getTemplateVariables = getTemplateVariables;
exports.getMessageSettings = getMessageSettings;
exports.updateMessageSettings = updateMessageSettings;
exports.getEventsSummary = getEventsSummary;
exports.sendTestMessage = sendTestMessage;
exports.getLogStats = getLogStats;
const client_1 = require("@prisma/client");
const whatsapp_provider_1 = require("./providers/whatsapp.provider");
const email_provider_1 = require("./providers/email.provider");
const notification_provider_1 = require("./providers/notification.provider");
const prisma = new client_1.PrismaClient();
const templateCache = {
    data: new Map(),
    lastUpdated: 0,
};
const CACHE_TTL_MS = 5 * 60 * 1000;
function getCacheKey(event, channel, language) {
    return `${event}:${channel}:${language}`;
}
async function getTemplateFromCache(event, channel, language = 'ar') {
    const now = Date.now();
    if (now - templateCache.lastUpdated > CACHE_TTL_MS) {
        await refreshTemplateCache();
    }
    const key = getCacheKey(event, channel, language);
    let template = templateCache.data.get(key);
    if (!template && language !== 'ar') {
        const fallbackKey = getCacheKey(event, channel, 'ar');
        template = templateCache.data.get(fallbackKey);
    }
    if (!template) {
        const enKey = getCacheKey(event, channel, 'en');
        template = templateCache.data.get(enKey);
    }
    return template || null;
}
async function refreshTemplateCache() {
    const templates = await prisma.messageTemplate.findMany({
        where: { isActive: true },
    });
    templateCache.data.clear();
    for (const template of templates) {
        const key = getCacheKey(template.event, template.channel, template.language);
        templateCache.data.set(key, template);
    }
    templateCache.lastUpdated = Date.now();
}
function renderTemplate(template, variables) {
    if (!template)
        return '';
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        result = result.replace(regex, String(value ?? ''));
    }
    result = result.replace(/\{\{\s*\w+\s*\}\}/g, '');
    return result;
}
async function sendEventMessage(event, channel, context) {
    const language = context.language || 'ar';
    const template = await getTemplateFromCache(event, channel, language);
    if (!template) {
        return {
            success: false,
            error: `No active template found for event ${event}, channel ${channel}, language ${language}`,
        };
    }
    const renderedSubject = template.subject
        ? renderTemplate(template.subject, context.variables)
        : null;
    const renderedBody = renderTemplate(template.body, context.variables);
    const log = await prisma.messageLog.create({
        data: {
            templateId: template.id,
            event,
            channel,
            language,
            recipientId: context.recipientId,
            recipientType: context.recipientType,
            recipientName: context.recipientName,
            recipientPhone: context.recipientPhone,
            recipientEmail: context.recipientEmail,
            subject: renderedSubject,
            body: renderedBody,
            variables: JSON.stringify(context.variables),
            status: client_1.MessageStatus.PENDING,
            metadata: context.metadata ? JSON.stringify(context.metadata) : null,
        },
    });
    try {
        let sendResult;
        switch (channel) {
            case client_1.MessageChannel.WHATSAPP:
                sendResult = await whatsapp_provider_1.whatsappProvider.send({
                    phone: context.recipientPhone || '',
                    body: renderedBody,
                    templateName: template.name,
                });
                break;
            case client_1.MessageChannel.EMAIL:
                sendResult = await email_provider_1.emailProvider.send({
                    email: context.recipientEmail || '',
                    subject: renderedSubject || '',
                    body: renderedBody,
                    fromName: 'SINI CAR',
                });
                break;
            case client_1.MessageChannel.NOTIFICATION:
                sendResult = await notification_provider_1.notificationProvider.send({
                    userId: context.recipientId || '',
                    title: renderedSubject || template.name,
                    body: renderedBody,
                    data: context.metadata,
                });
                break;
            default:
                sendResult = { success: false, error: 'Unknown channel' };
        }
        await prisma.messageLog.update({
            where: { id: log.id },
            data: {
                status: sendResult.success ? client_1.MessageStatus.SENT : client_1.MessageStatus.FAILED,
                sentAt: sendResult.success ? new Date() : null,
                externalId: sendResult.externalId,
                errorMessage: sendResult.error,
            },
        });
        return {
            success: sendResult.success,
            logId: log.id,
            error: sendResult.error,
        };
    }
    catch (error) {
        await prisma.messageLog.update({
            where: { id: log.id },
            data: {
                status: client_1.MessageStatus.FAILED,
                errorMessage: error.message,
                retryCount: { increment: 1 },
            },
        });
        return {
            success: false,
            logId: log.id,
            error: error.message,
        };
    }
}
async function getAllTemplates() {
    return prisma.messageTemplate.findMany({
        orderBy: [{ event: 'asc' }, { channel: 'asc' }, { language: 'asc' }],
    });
}
async function getTemplatesByEvent(event) {
    return prisma.messageTemplate.findMany({
        where: { event },
        orderBy: [{ channel: 'asc' }, { language: 'asc' }],
    });
}
async function getTemplateById(id) {
    return prisma.messageTemplate.findUnique({
        where: { id },
    });
}
async function createTemplate(data) {
    const template = await prisma.messageTemplate.create({ data });
    await refreshTemplateCache();
    return template;
}
async function updateTemplate(id, data) {
    const template = await prisma.messageTemplate.update({
        where: { id },
        data,
    });
    await refreshTemplateCache();
    return template;
}
async function deleteTemplate(id) {
    const template = await prisma.messageTemplate.delete({
        where: { id },
    });
    await refreshTemplateCache();
    return template;
}
async function toggleTemplateActive(id, isActive, updatedBy) {
    const template = await prisma.messageTemplate.update({
        where: { id },
        data: { isActive, updatedBy },
    });
    await refreshTemplateCache();
    return template;
}
async function getMessageLogs(filters) {
    const where = {};
    if (filters?.event)
        where.event = filters.event;
    if (filters?.channel)
        where.channel = filters.channel;
    if (filters?.status)
        where.status = filters.status;
    if (filters?.recipientId)
        where.recipientId = filters.recipientId;
    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters.startDate)
            where.createdAt.gte = filters.startDate;
        if (filters.endDate)
            where.createdAt.lte = filters.endDate;
    }
    const [logs, total] = await Promise.all([
        prisma.messageLog.findMany({
            where,
            include: { template: { select: { name: true, nameAr: true } } },
            orderBy: { createdAt: 'desc' },
            take: filters?.limit || 50,
            skip: filters?.offset || 0,
        }),
        prisma.messageLog.count({ where }),
    ]);
    return { logs, total };
}
async function getMessageLogById(id) {
    return prisma.messageLog.findUnique({
        where: { id },
        include: { template: true },
    });
}
async function getTemplateVariables(event) {
    const where = event ? { event } : {};
    return prisma.messageTemplateVariable.findMany({
        where,
        orderBy: [{ event: 'asc' }, { sortOrder: 'asc' }],
    });
}
async function getMessageSettings() {
    let settings = await prisma.messageSettings.findUnique({
        where: { key: 'global' },
    });
    if (!settings) {
        settings = await prisma.messageSettings.create({
            data: { key: 'global' },
        });
    }
    return settings;
}
async function updateMessageSettings(data) {
    return prisma.messageSettings.upsert({
        where: { key: 'global' },
        update: data,
        create: { key: 'global', ...data },
    });
}
async function getEventsSummary() {
    const events = Object.values(client_1.MessageEvent);
    const templates = await prisma.messageTemplate.findMany({
        select: {
            event: true,
            channel: true,
            language: true,
            isActive: true,
        },
    });
    const summary = events.map(event => {
        const eventTemplates = templates.filter(t => t.event === event);
        const channels = {
            WHATSAPP: eventTemplates.filter(t => t.channel === client_1.MessageChannel.WHATSAPP),
            EMAIL: eventTemplates.filter(t => t.channel === client_1.MessageChannel.EMAIL),
            NOTIFICATION: eventTemplates.filter(t => t.channel === client_1.MessageChannel.NOTIFICATION),
        };
        return {
            event,
            channels: {
                whatsapp: {
                    total: channels.WHATSAPP.length,
                    active: channels.WHATSAPP.filter(t => t.isActive).length,
                    languages: [...new Set(channels.WHATSAPP.map(t => t.language))],
                },
                email: {
                    total: channels.EMAIL.length,
                    active: channels.EMAIL.filter(t => t.isActive).length,
                    languages: [...new Set(channels.EMAIL.map(t => t.language))],
                },
                notification: {
                    total: channels.NOTIFICATION.length,
                    active: channels.NOTIFICATION.filter(t => t.isActive).length,
                    languages: [...new Set(channels.NOTIFICATION.map(t => t.language))],
                },
            },
            totalTemplates: eventTemplates.length,
            activeTemplates: eventTemplates.filter(t => t.isActive).length,
        };
    });
    return summary;
}
async function sendTestMessage(templateId, testRecipient, testVariables) {
    const template = await prisma.messageTemplate.findUnique({
        where: { id: templateId },
    });
    if (!template) {
        return { success: false, error: 'Template not found' };
    }
    return sendEventMessage(template.event, template.channel, {
        recipientPhone: testRecipient.phone,
        recipientEmail: testRecipient.email,
        recipientId: testRecipient.userId,
        recipientType: 'TEST',
        recipientName: 'Test Recipient',
        language: template.language,
        variables: testVariables,
        metadata: { isTest: true },
    });
}
async function getLogStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const logs = await prisma.messageLog.groupBy({
        by: ['channel', 'status'],
        where: {
            createdAt: { gte: startDate },
        },
        _count: true,
    });
    const dailyStats = await prisma.$queryRaw `
    SELECT 
      DATE(created_at) as date,
      channel,
      COUNT(*) as count,
      COUNT(*) FILTER (WHERE status = 'SENT' OR status = 'DELIVERED') as success_count,
      COUNT(*) FILTER (WHERE status = 'FAILED') as failed_count
    FROM "MessageLog"
    WHERE created_at >= ${startDate}
    GROUP BY DATE(created_at), channel
    ORDER BY date DESC
  `;
    return { byChannelStatus: logs, dailyStats };
}
//# sourceMappingURL=messaging.service.js.map