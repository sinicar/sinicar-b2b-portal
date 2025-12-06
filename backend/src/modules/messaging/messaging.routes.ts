import { Router, Request, Response } from 'express';
import { MessageChannel, MessageEvent, MessageStatus } from '@prisma/client';
import * as messagingService from './messaging.service';

const router = Router();

router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await messagingService.getAllTemplates();
    res.json({
      success: true,
      data: templates,
      message: 'Templates retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates/by-event/:event', async (req: Request, res: Response) => {
  try {
    const event = req.params.event as MessageEvent;
    const templates = await messagingService.getTemplatesByEvent(event);
    res.json({
      success: true,
      data: templates,
      message: 'Templates retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/templates/:id', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/templates', async (req: Request, res: Response) => {
  try {
    const {
      event,
      channel,
      language,
      name,
      nameAr,
      nameEn,
      subject,
      subjectAr,
      subjectEn,
      body,
      bodyAr,
      bodyEn,
      variables,
      description,
      isDefault,
      isActive,
    } = req.body;

    if (!event || !channel || !name || !body) {
      return res.status(400).json({
        success: false,
        error: 'Event, channel, name, and body are required',
      });
    }

    const template = await messagingService.createTemplate({
      event: event as MessageEvent,
      channel: channel as MessageChannel,
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
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'A template with this event, channel, and language already exists',
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/templates/:id', async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameAr,
      nameEn,
      subject,
      subjectAr,
      subjectEn,
      body,
      bodyAr,
      bodyEn,
      variables,
      description,
      isDefault,
      isActive,
    } = req.body;

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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    await messagingService.deleteTemplate(req.params.id);
    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/templates/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const template = await messagingService.toggleTemplateActive(req.params.id, isActive);
    res.json({
      success: true,
      data: template,
      message: `Template ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/events', async (req: Request, res: Response) => {
  try {
    const summary = await messagingService.getEventsSummary();
    res.json({
      success: true,
      data: summary,
      message: 'Events summary retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/events/list', async (req: Request, res: Response) => {
  try {
    const events = Object.values(MessageEvent);
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function getEventCategory(event: MessageEvent): string {
  if (event.startsWith('QUOTE_')) return 'QUOTES';
  if (event.startsWith('ORDER_')) return 'ORDERS';
  if (event.startsWith('PAYMENT_')) return 'PAYMENTS';
  if (event.startsWith('SHIPMENT_')) return 'SHIPMENTS';
  if (event.startsWith('ACCOUNT_') || event.startsWith('PASSWORD_') || event === 'WELCOME_MESSAGE') return 'ACCOUNT';
  if (event.startsWith('INSTALLMENT_')) return 'INSTALLMENTS';
  if (event.startsWith('SUPPLIER_') || event.startsWith('CATALOG_')) return 'SUPPLIERS';
  if (event.includes('ALERT') || event.includes('NOTIFICATION') || event.includes('ANNOUNCEMENT') || event.includes('NOTICE')) return 'ALERTS';
  return 'GENERAL';
}

router.get('/channels', async (req: Request, res: Response) => {
  try {
    const channels = Object.values(MessageChannel).map(channel => ({
      code: channel,
      name: channel.charAt(0) + channel.slice(1).toLowerCase(),
      nameAr: getChannelNameAr(channel),
    }));
    
    res.json({
      success: true,
      data: channels,
      message: 'Channels retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function getChannelNameAr(channel: MessageChannel): string {
  switch (channel) {
    case MessageChannel.WHATSAPP: return 'واتساب';
    case MessageChannel.EMAIL: return 'البريد الإلكتروني';
    case MessageChannel.NOTIFICATION: return 'الإشعارات';
    default: return channel;
  }
}

router.get('/variables', async (req: Request, res: Response) => {
  try {
    const event = req.query.event as MessageEvent | undefined;
    const variables = await messagingService.getTemplateVariables(event);
    res.json({
      success: true,
      data: variables,
      message: 'Variables retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/logs', async (req: Request, res: Response) => {
  try {
    const {
      event,
      channel,
      status,
      recipientId,
      startDate,
      endDate,
      limit,
      offset,
    } = req.query;

    const result = await messagingService.getMessageLogs({
      event: event as MessageEvent | undefined,
      channel: channel as MessageChannel | undefined,
      status: status as MessageStatus | undefined,
      recipientId: recipientId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({
      success: true,
      data: result.logs,
      total: result.total,
      message: 'Logs retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/logs/:id', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/logs/stats', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const stats = await messagingService.getLogStats(days);
    res.json({
      success: true,
      data: stats,
      message: 'Log stats retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await messagingService.getMessageSettings();
    res.json({
      success: true,
      data: settings,
      message: 'Settings retrieved successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const settings = await messagingService.updateMessageSettings(req.body);
    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send', async (req: Request, res: Response) => {
  try {
    const { event, channel, context } = req.body;

    if (!event || !channel || !context) {
      return res.status(400).json({
        success: false,
        error: 'Event, channel, and context are required',
      });
    }

    const result = await messagingService.sendEventMessage(
      event as MessageEvent,
      channel as MessageChannel,
      context
    );

    if (result.success) {
      res.json({
        success: true,
        data: { logId: result.logId },
        message: 'Message sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        data: { logId: result.logId },
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-test', async (req: Request, res: Response) => {
  try {
    const { templateId, testRecipient, testVariables } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required',
      });
    }

    const result = await messagingService.sendTestMessage(
      templateId,
      testRecipient || {},
      testVariables || {}
    );

    if (result.success) {
      res.json({
        success: true,
        data: { logId: result.logId },
        message: 'Test message sent successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/preview', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/refresh-cache', async (req: Request, res: Response) => {
  try {
    await messagingService.refreshTemplateCache();
    res.json({
      success: true,
      message: 'Template cache refreshed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
