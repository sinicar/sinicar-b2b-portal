import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, Search, Filter, X, RefreshCw, Download, ChevronLeft, ChevronRight, 
  Bug, Lightbulb, AlertCircle, HelpCircle, MoreHorizontal, User, Clock, Send,
  CheckCircle, XCircle, Eye, AlertTriangle, Mail, Phone
} from 'lucide-react';
import Api from '../services/api';
import { normalizeListResponse } from '../services/normalize';
import { 
  Feedback, FeedbackReply, FeedbackStatus, FeedbackCategory, FeedbackSenderType, 
  FeedbackPriority, FeedbackListFilters, FeedbackUpdateInput 
} from '../types';

const STATUS_STYLES: Record<FeedbackStatus, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  NEW: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: AlertCircle },
  IN_REVIEW: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Eye },
  RESOLVED: { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  DISMISSED: { color: 'text-slate-500', bgColor: 'bg-slate-100', icon: XCircle },
};

const CATEGORY_ICONS: Record<FeedbackCategory, typeof Bug> = {
  BUG: Bug,
  SUGGESTION: Lightbulb,
  COMPLAINT: AlertCircle,
  QUESTION: HelpCircle,
  OTHER: MoreHorizontal,
};

const SENDER_TYPE_STYLES: Record<FeedbackSenderType, { color: string }> = {
  CUSTOMER: { color: 'bg-blue-100 text-blue-700' },
  SUPPLIER: { color: 'bg-orange-100 text-orange-700' },
  MARKETER: { color: 'bg-pink-100 text-pink-700' },
  EMPLOYEE: { color: 'bg-indigo-100 text-indigo-700' },
  ADMIN: { color: 'bg-red-100 text-red-700' },
  GUEST: { color: 'bg-slate-100 text-slate-700' },
};

const PRIORITY_STYLES: Record<FeedbackPriority, { color: string }> = {
  LOW: { color: 'bg-slate-100 text-slate-600' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-700' },
  HIGH: { color: 'bg-red-100 text-red-700' },
  CRITICAL: { color: 'bg-purple-100 text-purple-700' },
};

export default function AdminFeedbackCenter() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const getStatusLabel = (status: FeedbackStatus) => t(`feedbackAdmin.status.${status}`, status);
  const getCategoryLabel = (category: FeedbackCategory) => t(`feedback.categories.${category.toLowerCase()}`, category);
  const getPriorityLabel = (priority: FeedbackPriority) => t(`feedbackAdmin.priority.${priority}`, priority);
  const getSenderTypeLabel = (type: FeedbackSenderType) => t(`feedbackAdmin.senderType.${type}`, type);

  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [filters, setFilters] = useState<FeedbackListFilters>({
    page: 1,
    pageSize: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replies, setReplies] = useState<FeedbackReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<FeedbackStatus, number>;
    thisWeek: number;
  } | null>(null);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const result = await Api.getAdminFeedbackList({
        ...filters,
        search: searchQuery || undefined,
        page,
        pageSize,
      });
      // استخدام normalizeListResponse لضمان items دائماً array
      const { items, total } = normalizeListResponse<Feedback>(result);
      setFeedbackList(items);
      setTotal(total);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, page, pageSize]);

  const loadStats = useCallback(async () => {
    try {
      const result = await Api.getFeedbackStats();
      setStats({
        total: result.total,
        byStatus: result.byStatus,
        thisWeek: result.thisWeek,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
    loadStats();
  }, [loadFeedback, loadStats]);

  const handleSelectFeedback = async (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.adminNotes || '');
    try {
      const feedbackReplies = await Api.getFeedbackReplies(feedback.id);
      setReplies(feedbackReplies);
    } catch (error) {
      console.error('Failed to load replies:', error);
    }
  };

  const handleUpdateStatus = async (status: FeedbackStatus) => {
    if (!selectedFeedback) return;
    setSaving(true);
    try {
      const updates: FeedbackUpdateInput = { status };
      const updated = await Api.updateFeedback(selectedFeedback.id, updates, 'admin', 'مدير النظام');
      if (updated) {
        setSelectedFeedback(updated);
        loadFeedback();
        loadStats();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedFeedback) return;
    setSaving(true);
    try {
      const updates: FeedbackUpdateInput = { adminNotes };
      const updated = await Api.updateFeedback(selectedFeedback.id, updates, 'admin', 'مدير النظام');
      if (updated) {
        setSelectedFeedback(updated);
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddReply = async () => {
    if (!selectedFeedback || !newReply.trim()) return;
    setSaving(true);
    try {
      const reply = await Api.addFeedbackReply(selectedFeedback.id, newReply.trim(), 'admin', 'مدير النظام');
      setReplies([...replies, reply]);
      setNewReply('');
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const csv = await Api.exportFeedbackToCsv(filters);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
    setSearchQuery('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              {t('feedbackCenter.title', 'مركز الملاحظات')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('feedbackCenter.subtitle', 'إدارة ملاحظات ومقترحات المستخدمين')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              {t('common.filter', 'تصفية')}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              data-testid="button-export-feedback"
            >
              <Download className="w-4 h-4" />
              {t('common.export', 'تصدير')}
            </button>
            <button
              onClick={() => { loadFeedback(); loadStats(); }}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              data-testid="button-refresh-feedback"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh', 'تحديث')}
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
              <div className="text-sm text-slate-500">{t('feedbackCenter.totalFeedback', 'إجمالي الملاحظات')}</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="text-2xl font-bold text-purple-700">{stats.byStatus.NEW}</div>
              <div className="text-sm text-purple-600">{t('feedbackCenter.new', 'جديد')}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
              <div className="text-2xl font-bold text-yellow-700">{stats.byStatus.IN_REVIEW}</div>
              <div className="text-sm text-yellow-600">{t('feedbackCenter.inReview', 'قيد المراجعة')}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <div className="text-2xl font-bold text-green-700">{stats.byStatus.RESOLVED}</div>
              <div className="text-sm text-green-600">{t('feedbackCenter.resolved', 'تم الحل')}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="text-2xl font-bold text-blue-700">{stats.thisWeek}</div>
              <div className="text-sm text-blue-600">{t('feedbackCenter.thisWeek', 'هذا الأسبوع')}</div>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {t('common.search', 'بحث')}
                </label>
                <div className="relative">
                  <Search className="absolute top-1/2 transform -translate-y-1/2 start-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('feedbackCenter.searchPlaceholder', 'بحث في العنوان أو الرسالة...')}
                    className="w-full ps-10 pe-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                    data-testid="input-search-feedback"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {t('common.status', 'الحالة')}
                </label>
                <select
                  value={filters.status || ''}
                  onChange={e => setFilters({ ...filters, status: e.target.value as FeedbackStatus || undefined })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  data-testid="select-filter-status"
                >
                  <option value="">{t('common.all', 'الكل')}</option>
                  <option value="NEW">{t('feedbackCenter.new', 'جديد')}</option>
                  <option value="IN_REVIEW">{t('feedbackCenter.inReview', 'قيد المراجعة')}</option>
                  <option value="RESOLVED">{t('feedbackCenter.resolved', 'تم الحل')}</option>
                  <option value="DISMISSED">{t('feedbackCenter.dismissed', 'مرفوض')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {t('feedbackCenter.category', 'التصنيف')}
                </label>
                <select
                  value={filters.category || ''}
                  onChange={e => setFilters({ ...filters, category: e.target.value as FeedbackCategory || undefined })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  data-testid="select-filter-category"
                >
                  <option value="">{t('common.all', 'الكل')}</option>
                  <option value="BUG">{getCategoryLabel('BUG')}</option>
                  <option value="SUGGESTION">{getCategoryLabel('SUGGESTION')}</option>
                  <option value="COMPLAINT">{getCategoryLabel('COMPLAINT')}</option>
                  <option value="QUESTION">{getCategoryLabel('QUESTION')}</option>
                  <option value="OTHER">{getCategoryLabel('OTHER')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {t('feedbackCenter.senderType', 'نوع المرسل')}
                </label>
                <select
                  value={filters.senderType || ''}
                  onChange={e => setFilters({ ...filters, senderType: e.target.value as FeedbackSenderType || undefined })}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
                  data-testid="select-filter-sendertype"
                >
                  <option value="">{t('common.all', 'الكل')}</option>
                  <option value="CUSTOMER">{getSenderTypeLabel('CUSTOMER')}</option>
                  <option value="SUPPLIER">{getSenderTypeLabel('SUPPLIER')}</option>
                  <option value="MARKETER">{getSenderTypeLabel('MARKETER')}</option>
                  <option value="EMPLOYEE">{getSenderTypeLabel('EMPLOYEE')}</option>
                  <option value="GUEST">{getSenderTypeLabel('GUEST')}</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  data-testid="button-clear-filters"
                >
                  <X className="w-4 h-4" />
                  {t('common.reset', 'مسح')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <div className={`flex-1 ${selectedFeedback ? 'hidden md:block md:w-1/2' : 'w-full'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-slate-500">{t('common.loading', 'جاري التحميل...')}</p>
                </div>
              ) : feedbackList.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">{t('feedbackCenter.noFeedback', 'لا توجد ملاحظات')}</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {feedbackList.map(feedback => {
                      const statusStyle = STATUS_STYLES[feedback.status];
                      const CategoryIcon = CATEGORY_ICONS[feedback.category];
                      const senderStyle = SENDER_TYPE_STYLES[feedback.senderType];
                      const priorityStyle = PRIORITY_STYLES[feedback.priority];

                      return (
                        <div
                          key={feedback.id}
                          onClick={() => handleSelectFeedback(feedback)}
                          className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                            selectedFeedback?.id === feedback.id ? 'bg-primary/5 border-s-4 border-primary' : ''
                          }`}
                          data-testid={`feedback-item-${feedback.id}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <CategoryIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span className="font-medium text-slate-800 dark:text-white truncate">
                                  {feedback.subject}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-1 mb-2">
                                {feedback.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className={`px-2 py-0.5 rounded-full ${senderStyle.color}`}>
                                  {feedback.senderName}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full ${priorityStyle.color}`}>
                                  {getPriorityLabel(feedback.priority)}
                                </span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(feedback.createdAt).toLocaleDateString(i18n.language)}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${statusStyle.bgColor} ${statusStyle.color}`}>
                              {getStatusLabel(feedback.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-500">
                        {t('common.page', 'صفحة')} {page} {t('common.of', 'من')} {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                          data-testid="button-prev-page"
                        >
                          {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                          data-testid="button-next-page"
                        >
                          {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {selectedFeedback && (
            <div className="fixed inset-0 md:static md:w-1/2 bg-white dark:bg-slate-800 md:rounded-lg md:border md:border-slate-200 dark:md:border-slate-700 z-50 md:z-auto overflow-auto">
              <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-slate-800 dark:text-white">
                  {t('feedbackCenter.details', 'تفاصيل الملاحظة')}
                </h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  data-testid="button-close-details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-white">{selectedFeedback.senderName}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${SENDER_TYPE_STYLES[selectedFeedback.senderType].color}`}>
                        {getSenderTypeLabel(selectedFeedback.senderType)}
                      </span>
                      {selectedFeedback.senderContact && (
                        <>
                          {selectedFeedback.senderContact.includes('@') ? (
                            <a href={`mailto:${selectedFeedback.senderContact}`} className="flex items-center gap-1 text-primary hover:underline">
                              <Mail className="w-3 h-3" />
                              {selectedFeedback.senderContact}
                            </a>
                          ) : (
                            <a href={`tel:${selectedFeedback.senderContact}`} className="flex items-center gap-1 text-primary hover:underline">
                              <Phone className="w-3 h-3" />
                              {selectedFeedback.senderContact}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const Icon = CATEGORY_ICONS[selectedFeedback.category];
                      return <Icon className="w-4 h-4 text-slate-500" />;
                    })()}
                    <span className="font-semibold text-slate-800 dark:text-white">{selectedFeedback.subject}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedFeedback.message}</p>
                  {selectedFeedback.pageContext && (
                    <div className="mt-3 text-xs text-slate-400">
                      {t('feedbackCenter.pageContext', 'الصفحة')}: <code className="bg-slate-200 dark:bg-slate-600 px-1 rounded">{selectedFeedback.pageContext}</code>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${PRIORITY_STYLES[selectedFeedback.priority].color}`}>
                    {t('feedbackCenter.priority', 'الأهمية')}: {getPriorityLabel(selectedFeedback.priority)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {getCategoryLabel(selectedFeedback.category)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('feedbackCenter.changeStatus', 'تغيير الحالة')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['NEW', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'] as FeedbackStatus[]).map(status => {
                      const style = STATUS_STYLES[status];
                      const Icon = style.icon;
                      return (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={saving || selectedFeedback.status === status}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                            selectedFeedback.status === status
                              ? `${style.bgColor} ${style.color} ring-2 ring-offset-1`
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          } disabled:opacity-50`}
                          data-testid={`button-status-${status}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {getStatusLabel(status)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('feedbackCenter.adminNotes', 'ملاحظات داخلية')}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                    placeholder={t('feedbackCenter.adminNotesPlaceholder', 'ملاحظات للفريق الداخلي...')}
                    data-testid="input-admin-notes"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving || adminNotes === (selectedFeedback.adminNotes || '')}
                    className="mt-2 px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    data-testid="button-save-notes"
                  >
                    {t('common.save', 'حفظ')}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('feedbackCenter.replies', 'الردود')} ({replies.length})
                  </label>
                  <div className="space-y-2 mb-3">
                    {replies.map(reply => (
                      <div key={reply.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-blue-800 dark:text-blue-300">{reply.senderName}</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {new Date(reply.createdAt).toLocaleString('ar-SA')}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-200">{reply.message}</p>
                      </div>
                    ))}
                    {replies.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-2">
                        {t('feedbackCenter.noReplies', 'لا توجد ردود بعد')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newReply}
                      onChange={e => setNewReply(e.target.value)}
                      placeholder={t('feedbackCenter.replyPlaceholder', 'اكتب رداً...')}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm"
                      data-testid="input-reply"
                    />
                    <button
                      onClick={handleAddReply}
                      disabled={saving || !newReply.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                      data-testid="button-send-reply"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>{t('feedbackCenter.createdAt', 'تاريخ الإنشاء')}: {new Date(selectedFeedback.createdAt).toLocaleString('ar-SA')}</div>
                  <div>{t('feedbackCenter.updatedAt', 'آخر تحديث')}: {new Date(selectedFeedback.updatedAt).toLocaleString('ar-SA')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
