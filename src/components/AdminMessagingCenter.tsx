import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, Send, Mail, Bell, Phone, Search, Filter, RefreshCw, Download,
  Plus, Edit3, Trash2, Eye, Save, X, Copy, Check, AlertTriangle, Clock,
  ChevronLeft, ChevronRight, Settings, Code, Zap, History, TestTube
} from 'lucide-react';
import { httpClient } from '../services/httpClient';

type MessageChannel = 'WHATSAPP' | 'EMAIL' | 'NOTIFICATION';
type MessageEvent = 
  | 'QUOTE_CREATED' 
  | 'QUOTE_APPROVED' 
  | 'ORDER_CREATED' 
  | 'ORDER_SHIPPED' 
  | 'PASSWORD_RESET' 
  | 'ACCOUNT_ACTIVATED' 
  | 'WELCOME_MESSAGE' 
  | 'PAYMENT_REMINDER'
  | 'SUPPLIER_APPLICATION_APPROVED';

interface MessageTemplate {
  id: string;
  event: MessageEvent;
  channel: MessageChannel;
  language: string;
  name: string;
  subject: string | null;
  body: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateVariable {
  id: string;
  event: MessageEvent;
  code: string;
  name: string;
  nameAr: string;
  sampleValue: string;
  isRequired: boolean;
  sortOrder: number;
}

interface MessageLog {
  id: string;
  templateId: string | null;
  event: MessageEvent;
  channel: MessageChannel;
  recipientId: string | null;
  recipientName: string | null;
  recipientContact: string;
  subject: string | null;
  body: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  errorMessage: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

interface MessageSettings {
  id: string;
  key: string;
  defaultLanguage: string;
  enableWhatsApp: boolean;
  enableEmail: boolean;
  enableNotifications: boolean;
}

const CHANNEL_ICONS: Record<MessageChannel, typeof Phone> = {
  WHATSAPP: Phone,
  EMAIL: Mail,
  NOTIFICATION: Bell,
};

const CHANNEL_COLORS: Record<MessageChannel, { bg: string; text: string; border: string }> = {
  WHATSAPP: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
  EMAIL: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  NOTIFICATION: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  SENT: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  DELIVERED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  FAILED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

const EVENTS: MessageEvent[] = [
  'QUOTE_CREATED', 
  'QUOTE_APPROVED', 
  'ORDER_CREATED', 
  'ORDER_SHIPPED', 
  'PASSWORD_RESET', 
  'ACCOUNT_ACTIVATED', 
  'WELCOME_MESSAGE', 
  'PAYMENT_REMINDER',
  'SUPPLIER_APPLICATION_APPROVED'
];

const CHANNELS: MessageChannel[] = ['WHATSAPP', 'EMAIL', 'NOTIFICATION'];

export default function AdminMessagingCenter() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const currentLang = i18n.language === 'ar' ? 'ar' : 'en';

  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'settings'>('templates');
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>('WHATSAPP');
  const [selectedEvent, setSelectedEvent] = useState<MessageEvent | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [settings, setSettings] = useState<MessageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const logsPageSize = 20;

  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    body: '',
    isActive: true,
  });

  const getEventLabel = (event: MessageEvent) => t(`messaging.events.${event}`, event);
  const getChannelLabel = (channel: MessageChannel) => t(`messaging.channels.${channel}`, channel);
  const getStatusLabel = (status: string) => t(`messaging.status.${status}`, status);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await httpClient.get<MessageTemplate[]>('/api/messaging/templates');
      if (result.success && result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVariables = useCallback(async (event: MessageEvent) => {
    try {
      const result = await httpClient.get<TemplateVariable[]>(`/api/messaging/variables/${event}`);
      if (result.success && result.data) {
        setVariables(result.data);
      }
    } catch (error) {
      console.error('Failed to load variables:', error);
      setVariables([]);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    try {
      const result = await httpClient.get<{ items: MessageLog[]; total: number }>('/api/messaging/logs', {
        params: {
          page: logsPage,
          pageSize: logsPageSize,
          search: searchQuery || undefined,
        },
      });
      if (result.success && result.data) {
        setLogs(result.data.items);
        setLogsTotal(result.data.total);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }, [logsPage, searchQuery]);

  const loadSettings = useCallback(async () => {
    try {
      const result = await httpClient.get<MessageSettings>('/api/messaging/settings');
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
    loadSettings();
  }, [loadTemplates, loadSettings]);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, loadLogs]);

  useEffect(() => {
    if (selectedEvent) {
      loadVariables(selectedEvent);
    }
  }, [selectedEvent, loadVariables]);

  const filteredTemplates = templates.filter(t => 
    t.channel === selectedChannel && t.language === currentLang
  );

  const getTemplateForEvent = (event: MessageEvent) => 
    templates.find(t => t.event === event && t.channel === selectedChannel && t.language === currentLang);

  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setSelectedEvent(template.event);
    setEditForm({
      name: template.name,
      subject: template.subject || '',
      body: template.body,
      isActive: template.isActive,
    });
    setShowEditor(true);
  };

  const handleCreateTemplate = (event: MessageEvent) => {
    setSelectedEvent(event);
    setSelectedTemplate(null);
    setEditForm({
      name: '',
      subject: '',
      body: '',
      isActive: true,
    });
    setShowEditor(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      const payload = {
        event: selectedEvent,
        channel: selectedChannel,
        language: currentLang,
        name: editForm.name,
        subject: editForm.subject || null,
        body: editForm.body,
        isActive: editForm.isActive,
      };

      let result;
      if (selectedTemplate) {
        result = await httpClient.patch<MessageTemplate>(`/api/messaging/templates/${selectedTemplate.id}`, payload);
      } else {
        result = await httpClient.post<MessageTemplate>('/api/messaging/templates', payload);
      }

      if (result.success) {
        await loadTemplates();
        setShowEditor(false);
        setSelectedTemplate(null);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (template: MessageTemplate) => {
    if (!confirm(t('messaging.confirmDelete', 'هل أنت متأكد من حذف هذا القالب؟'))) return;
    try {
      await httpClient.delete(`/api/messaging/templates/${template.id}`);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleToggleActive = async (template: MessageTemplate) => {
    try {
      await httpClient.patch(`/api/messaging/templates/${template.id}`, {
        isActive: !template.isActive,
      });
      await loadTemplates();
    } catch (error) {
      console.error('Failed to toggle template:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await httpClient.patch('/api/messaging/settings', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!selectedTemplate || !testRecipient) return;
    setSaving(true);
    setTestResult(null);
    try {
      const testData: Record<string, string> = {};
      variables.forEach(v => {
        testData[v.code] = v.sampleValue;
      });

      const result = await httpClient.post<{ success: boolean; messageId?: string }>('/api/messaging/send', {
        event: selectedTemplate.event,
        channel: selectedTemplate.channel,
        recipientId: 'test',
        recipientContact: testRecipient,
        data: testData,
        language: currentLang,
      });

      if (result.success) {
        setTestResult({ success: true, message: t('messaging.testSuccess', 'تم إرسال الرسالة التجريبية بنجاح') });
      } else {
        setTestResult({ success: false, message: result.error || t('messaging.testFailed', 'فشل إرسال الرسالة') });
      }
    } catch (error) {
      setTestResult({ success: false, message: t('messaging.testFailed', 'فشل إرسال الرسالة') });
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (code: string) => {
    const variable = `{{${code}}}`;
    setEditForm(prev => ({
      ...prev,
      body: prev.body + variable,
    }));
  };

  const renderPreview = () => {
    let preview = editForm.body;
    variables.forEach(v => {
      const regex = new RegExp(`\\{\\{${v.code}\\}\\}`, 'g');
      preview = preview.replace(regex, v.sampleValue);
    });
    return preview;
  };

  const totalLogsPages = Math.ceil(logsTotal / logsPageSize);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              {t('messaging.title', 'مركز الرسائل')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('messaging.subtitle', 'إدارة قوالب الرسائل والإشعارات')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadTemplates}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              data-testid="button-refresh-templates"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh', 'تحديث')}
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            data-testid="tab-templates"
          >
            <Code className="w-4 h-4" />
            {t('messaging.tabs.templates', 'القوالب')}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            data-testid="tab-logs"
          >
            <History className="w-4 h-4" />
            {t('messaging.tabs.logs', 'سجل الرسائل')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            data-testid="tab-settings"
          >
            <Settings className="w-4 h-4" />
            {t('messaging.tabs.settings', 'الإعدادات')}
          </button>
        </div>

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {CHANNELS.map(channel => {
                const Icon = CHANNEL_ICONS[channel];
                const colors = CHANNEL_COLORS[channel];
                return (
                  <button
                    key={channel}
                    onClick={() => setSelectedChannel(channel)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
                      selectedChannel === channel
                        ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-offset-2 ring-${channel === 'WHATSAPP' ? 'green' : channel === 'EMAIL' ? 'blue' : 'purple'}-500/30`
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    data-testid={`button-channel-${channel.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4" />
                    {getChannelLabel(channel)}
                  </button>
                );
              })}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.table.event', 'الحدث')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.table.template', 'القالب')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.table.status', 'الحالة')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.table.actions', 'الإجراءات')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {EVENTS.map(event => {
                      const template = getTemplateForEvent(event);
                      return (
                        <tr key={event} className="hover:bg-slate-50 dark:hover:bg-slate-700/50" data-testid={`row-event-${event.toLowerCase()}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <span className="font-medium text-slate-800 dark:text-white">
                                {getEventLabel(event)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {template ? (
                              <div>
                                <span className="text-slate-700 dark:text-slate-300">{template.name}</span>
                                {template.isDefault && (
                                  <span className="ms-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                    {t('messaging.default', 'افتراضي')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 italic">
                                {t('messaging.noTemplate', 'لا يوجد قالب')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {template ? (
                              <button
                                onClick={() => handleToggleActive(template)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  template.isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                }`}
                                data-testid={`button-toggle-${event.toLowerCase()}`}
                              >
                                {template.isActive ? (
                                  <><Check className="w-3 h-3" /> {t('messaging.active', 'مفعّل')}</>
                                ) : (
                                  <><X className="w-3 h-3" /> {t('messaging.inactive', 'معطّل')}</>
                                )}
                              </button>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {template ? (
                                <>
                                  <button
                                    onClick={() => handleEditTemplate(template)}
                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                    title={t('common.edit', 'تعديل')}
                                    data-testid={`button-edit-${event.toLowerCase()}`}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedTemplate(template);
                                      setSelectedEvent(template.event);
                                      setShowPreview(true);
                                    }}
                                    className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                                    title={t('common.preview', 'معاينة')}
                                    data-testid={`button-preview-${event.toLowerCase()}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedTemplate(template);
                                      setSelectedEvent(template.event);
                                      setShowTestModal(true);
                                    }}
                                    className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                                    title={t('messaging.sendTest', 'إرسال تجريبي')}
                                    data-testid={`button-test-${event.toLowerCase()}`}
                                  >
                                    <TestTube className="w-4 h-4" />
                                  </button>
                                  {!template.isDefault && (
                                    <button
                                      onClick={() => handleDeleteTemplate(template)}
                                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                      title={t('common.delete', 'حذف')}
                                      data-testid={`button-delete-${event.toLowerCase()}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleCreateTemplate(event)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
                                  data-testid={`button-create-${event.toLowerCase()}`}
                                >
                                  <Plus className="w-4 h-4" />
                                  {t('messaging.createTemplate', 'إنشاء قالب')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('messaging.searchLogs', 'بحث في سجل الرسائل...')}
                  className="w-full ps-10 pe-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400"
                  data-testid="input-search-logs"
                />
              </div>
              <button
                onClick={loadLogs}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                data-testid="button-refresh-logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.logs.recipient', 'المستلم')}
                      </th>
                      <th className="px-4 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.logs.event', 'الحدث')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.logs.channel', 'القناة')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.logs.status', 'الحالة')}
                      </th>
                      <th className="px-4 py-3 text-end text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                        {t('messaging.logs.sentAt', 'وقت الإرسال')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {logs.map(log => {
                      const ChannelIcon = CHANNEL_ICONS[log.channel];
                      const channelColors = CHANNEL_COLORS[log.channel];
                      const statusColors = STATUS_COLORS[log.status];
                      return (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50" data-testid={`row-log-${log.id}`}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-slate-800 dark:text-white">
                                {log.recipientName || t('messaging.logs.unknown', 'غير معروف')}
                              </div>
                              <div className="text-sm text-slate-500">{log.recipientContact}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-slate-700 dark:text-slate-300">
                              {getEventLabel(log.event)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${channelColors.bg} ${channelColors.text}`}>
                              <ChannelIcon className="w-3 h-3" />
                              {getChannelLabel(log.channel)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusColors.bg} ${statusColors.text}`}>
                              {log.status === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                              {log.status === 'DELIVERED' && <Check className="w-3 h-3" />}
                              {log.status === 'PENDING' && <Clock className="w-3 h-3" />}
                              {log.status === 'SENT' && <Send className="w-3 h-3" />}
                              {getStatusLabel(log.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-end text-sm text-slate-500">
                            {log.sentAt ? new Date(log.sentAt).toLocaleString(isRtl ? 'ar-SA' : 'en-US') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          {t('messaging.logs.empty', 'لا توجد رسائل في السجل')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalLogsPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-500">
                    {t('common.showing', 'عرض')} {(logsPage - 1) * logsPageSize + 1} - {Math.min(logsPage * logsPageSize, logsTotal)} {t('common.of', 'من')} {logsTotal}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                      disabled={logsPage === 1}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                      data-testid="button-prev-page"
                    >
                      {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {logsPage} / {totalLogsPages}
                    </span>
                    <button
                      onClick={() => setLogsPage(p => Math.min(totalLogsPages, p + 1))}
                      disabled={logsPage === totalLogsPages}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                      data-testid="button-next-page"
                    >
                      {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  {t('messaging.settings.channels', 'القنوات المفعّلة')}
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableWhatsApp}
                      onChange={(e) => setSettings({ ...settings, enableWhatsApp: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      data-testid="checkbox-whatsapp"
                    />
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="text-slate-700 dark:text-slate-300">{t('messaging.channels.WHATSAPP', 'واتساب')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableEmail}
                      onChange={(e) => setSettings({ ...settings, enableEmail: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      data-testid="checkbox-email"
                    />
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300">{t('messaging.channels.EMAIL', 'البريد الإلكتروني')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      data-testid="checkbox-notifications"
                    />
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span className="text-slate-700 dark:text-slate-300">{t('messaging.channels.NOTIFICATION', 'الإشعارات')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('messaging.settings.defaultLanguage', 'اللغة الافتراضية للرسائل')}
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  data-testid="select-default-language"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  data-testid="button-save-settings"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('common.saving', 'جاري الحفظ...') : t('common.save', 'حفظ')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {selectedTemplate ? t('messaging.editTemplate', 'تعديل القالب') : t('messaging.createTemplate', 'إنشاء قالب جديد')}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                data-testid="button-close-editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('messaging.form.name', 'اسم القالب')}
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    data-testid="input-template-name"
                  />
                </div>
                {selectedChannel === 'EMAIL' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('messaging.form.subject', 'عنوان البريد')}
                    </label>
                    <input
                      type="text"
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      data-testid="input-template-subject"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t('messaging.form.body', 'نص الرسالة')}
                </label>
                <textarea
                  value={editForm.body}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-mono text-sm"
                  dir="auto"
                  data-testid="textarea-template-body"
                />
              </div>

              {variables.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('messaging.form.variables', 'المتغيرات المتاحة')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variables.map(v => (
                      <button
                        key={v.code}
                        onClick={() => insertVariable(v.code)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-sm"
                        title={`${isRtl ? v.nameAr : v.name}: ${v.sampleValue}`}
                        data-testid={`button-variable-${v.code}`}
                      >
                        <Code className="w-3 h-3" />
                        {`{{${v.code}}}`}
                        {v.isRequired && <span className="text-red-500">*</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  data-testid="checkbox-template-active"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                  {t('messaging.form.isActive', 'تفعيل القالب')}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                data-testid="button-cancel-edit"
              >
                {t('common.cancel', 'إلغاء')}
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving || !editForm.name || !editForm.body}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                data-testid="button-save-template"
              >
                <Save className="w-4 h-4" />
                {saving ? t('common.saving', 'جاري الحفظ...') : t('common.save', 'حفظ')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('messaging.preview', 'معاينة الرسالة')}
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                data-testid="button-close-preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedChannel === 'EMAIL' && selectedTemplate.subject && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t('messaging.preview.subject', 'العنوان')}
                  </label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">
                    {selectedTemplate.subject}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t('messaging.preview.body', 'نص الرسالة')}
                </label>
                <div className={`p-4 rounded-lg whitespace-pre-wrap ${
                  selectedChannel === 'WHATSAPP'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : selectedChannel === 'EMAIL'
                    ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                    : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                }`}>
                  {selectedChannel === 'EMAIL' ? (
                    <div 
                      className="text-slate-800 dark:text-white"
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                    />
                  ) : (
                    <p className="text-slate-800 dark:text-white" dir="auto">
                      {selectedTemplate.body}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                data-testid="button-close-preview-action"
              >
                {t('common.close', 'إغلاق')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                {t('messaging.sendTest', 'إرسال رسالة تجريبية')}
              </h2>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setTestRecipient('');
                }}
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                data-testid="button-close-test"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {selectedChannel === 'WHATSAPP' 
                    ? t('messaging.test.phone', 'رقم الهاتف')
                    : selectedChannel === 'EMAIL'
                    ? t('messaging.test.email', 'البريد الإلكتروني')
                    : t('messaging.test.userId', 'معرف المستخدم')
                  }
                </label>
                <input
                  type={selectedChannel === 'EMAIL' ? 'email' : 'text'}
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder={selectedChannel === 'WHATSAPP' ? '+966501234567' : selectedChannel === 'EMAIL' ? 'test@example.com' : 'user-123'}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  dir="ltr"
                  data-testid="input-test-recipient"
                />
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {testResult.success ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  {testResult.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestResult(null);
                  setTestRecipient('');
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                data-testid="button-cancel-test"
              >
                {t('common.cancel', 'إلغاء')}
              </button>
              <button
                onClick={handleSendTestMessage}
                disabled={saving || !testRecipient}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                data-testid="button-send-test"
              >
                <Send className="w-4 h-4" />
                {saving ? t('common.sending', 'جاري الإرسال...') : t('messaging.send', 'إرسال')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
