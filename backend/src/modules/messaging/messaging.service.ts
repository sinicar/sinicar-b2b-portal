import { PrismaClient, MessageChannel, MessageEvent, MessageStatus } from '@prisma/client';
import { whatsappProvider } from './providers/whatsapp.provider';
import { emailProvider } from './providers/email.provider';
import { notificationProvider } from './providers/notification.provider';

const prisma = new PrismaClient();

interface TemplateCache {
  data: Map<string, any>;
  lastUpdated: number;
}

const templateCache: TemplateCache = {
  data: new Map(),
  lastUpdated: 0,
};

const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(event: MessageEvent, channel: MessageChannel, language: string): string {
  return `${event}:${channel}:${language}`;
}

export async function getTemplateFromCache(
  event: MessageEvent,
  channel: MessageChannel,
  language: string = 'ar'
): Promise<any | null> {
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

export async function refreshTemplateCache(): Promise<void> {
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

export function renderTemplate(template: string, variables: Record<string, any>): string {
  if (!template) return '';
  
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  
  result = result.replace(/\{\{\s*\w+\s*\}\}/g, '');
  
  return result;
}

export interface SendMessageContext {
  recipientId?: string;
  recipientType?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  language?: string;
  variables: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SendMessageResult {
  success: boolean;
  logId?: string;
  error?: string;
}

export async function sendEventMessage(
  event: MessageEvent,
  channel: MessageChannel,
  context: SendMessageContext
): Promise<SendMessageResult> {
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
      status: MessageStatus.PENDING,
      metadata: context.metadata ? JSON.stringify(context.metadata) : null,
    },
  });
  
  try {
    let sendResult: { success: boolean; externalId?: string; error?: string };
    
    switch (channel) {
      case MessageChannel.WHATSAPP:
        sendResult = await whatsappProvider.send({
          phone: context.recipientPhone || '',
          body: renderedBody,
          templateName: template.name,
        });
        break;
        
      case MessageChannel.EMAIL:
        sendResult = await emailProvider.send({
          email: context.recipientEmail || '',
          subject: renderedSubject || '',
          body: renderedBody,
          fromName: 'SINI CAR',
        });
        break;
        
      case MessageChannel.NOTIFICATION:
        sendResult = await notificationProvider.send({
          userId: context.recipientId || '',
          title: renderedSubject || template.name,
          body: renderedBody,
          event: event,
          data: context.metadata,
          link: context.metadata?.link,
          priority: context.metadata?.priority,
          category: context.metadata?.category,
        });
        break;
        
      default:
        sendResult = { success: false, error: 'Unknown channel' };
    }
    
    await prisma.messageLog.update({
      where: { id: log.id },
      data: {
        status: sendResult.success ? MessageStatus.SENT : MessageStatus.FAILED,
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
  } catch (error: any) {
    await prisma.messageLog.update({
      where: { id: log.id },
      data: {
        status: MessageStatus.FAILED,
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

export async function getAllTemplates() {
  return prisma.messageTemplate.findMany({
    orderBy: [{ event: 'asc' }, { channel: 'asc' }, { language: 'asc' }],
  });
}

export async function getTemplatesByEvent(event: MessageEvent) {
  return prisma.messageTemplate.findMany({
    where: { event },
    orderBy: [{ channel: 'asc' }, { language: 'asc' }],
  });
}

export async function getTemplateById(id: string) {
  return prisma.messageTemplate.findUnique({
    where: { id },
  });
}

export async function createTemplate(data: {
  event: MessageEvent;
  channel: MessageChannel;
  language: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  subject?: string;
  subjectAr?: string;
  subjectEn?: string;
  body: string;
  bodyAr?: string;
  bodyEn?: string;
  variables?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
  createdBy?: string;
}) {
  const template = await prisma.messageTemplate.create({ data });
  await refreshTemplateCache();
  return template;
}

export async function updateTemplate(
  id: string,
  data: {
    name?: string;
    nameAr?: string;
    nameEn?: string;
    subject?: string;
    subjectAr?: string;
    subjectEn?: string;
    body?: string;
    bodyAr?: string;
    bodyEn?: string;
    variables?: string;
    description?: string;
    isDefault?: boolean;
    isActive?: boolean;
    updatedBy?: string;
  }
) {
  const template = await prisma.messageTemplate.update({
    where: { id },
    data,
  });
  await refreshTemplateCache();
  return template;
}

export async function deleteTemplate(id: string) {
  const template = await prisma.messageTemplate.delete({
    where: { id },
  });
  await refreshTemplateCache();
  return template;
}

export async function toggleTemplateActive(id: string, isActive: boolean, updatedBy?: string) {
  const template = await prisma.messageTemplate.update({
    where: { id },
    data: { isActive, updatedBy },
  });
  await refreshTemplateCache();
  return template;
}

export async function getMessageLogs(filters?: {
  event?: MessageEvent;
  channel?: MessageChannel;
  status?: MessageStatus;
  recipientId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (filters?.event) where.event = filters.event;
  if (filters?.channel) where.channel = filters.channel;
  if (filters?.status) where.status = filters.status;
  if (filters?.recipientId) where.recipientId = filters.recipientId;
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
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

export async function getMessageLogById(id: string) {
  return prisma.messageLog.findUnique({
    where: { id },
    include: { template: true },
  });
}

export async function getTemplateVariables(event?: MessageEvent) {
  const where = event ? { event } : {};
  return prisma.messageTemplateVariable.findMany({
    where,
    orderBy: [{ event: 'asc' }, { sortOrder: 'asc' }],
  });
}

export async function getMessageSettings() {
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

export async function updateMessageSettings(data: {
  defaultLanguage?: string;
  enableWhatsApp?: boolean;
  enableEmail?: boolean;
  enableNotifications?: boolean;
  whatsappApiUrl?: string;
  whatsappApiKey?: string;
  whatsappPhoneNumberId?: string;
  emailProvider?: string;
  emailFromAddress?: string;
  emailFromName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  retryAttempts?: number;
  retryDelayMinutes?: number;
  logRetentionDays?: number;
}) {
  return prisma.messageSettings.upsert({
    where: { key: 'global' },
    update: data,
    create: { key: 'global', ...data },
  });
}

export async function getEventsSummary() {
  const events = Object.values(MessageEvent);
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
      WHATSAPP: eventTemplates.filter(t => t.channel === MessageChannel.WHATSAPP),
      EMAIL: eventTemplates.filter(t => t.channel === MessageChannel.EMAIL),
      NOTIFICATION: eventTemplates.filter(t => t.channel === MessageChannel.NOTIFICATION),
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

export async function sendTestMessage(
  templateId: string,
  testRecipient: {
    phone?: string;
    email?: string;
    userId?: string;
  },
  testVariables: Record<string, any>
) {
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

export async function getLogStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await prisma.messageLog.groupBy({
    by: ['channel', 'status'],
    where: {
      createdAt: { gte: startDate },
    },
    _count: true,
  });
  
  const dailyStats = await prisma.$queryRaw`
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
