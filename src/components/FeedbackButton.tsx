import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquarePlus, X, Send, Bug, Lightbulb, AlertCircle, HelpCircle, MoreHorizontal, Loader2, CheckCircle2 } from 'lucide-react';
import { MockApi } from '../services/mockApi';
import { FeedbackCategory, FeedbackPriority, FeedbackCreateInput } from '../types';

interface FeedbackButtonProps {
  user?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    role: string;
  } | null;
}

const CATEGORY_OPTIONS: { value: FeedbackCategory; labelKey: string; icon: typeof Bug }[] = [
  { value: 'BUG', labelKey: 'feedback.categories.bug', icon: Bug },
  { value: 'SUGGESTION', labelKey: 'feedback.categories.suggestion', icon: Lightbulb },
  { value: 'COMPLAINT', labelKey: 'feedback.categories.complaint', icon: AlertCircle },
  { value: 'QUESTION', labelKey: 'feedback.categories.question', icon: HelpCircle },
  { value: 'OTHER', labelKey: 'feedback.categories.other', icon: MoreHorizontal },
];

const PRIORITY_OPTIONS: { value: FeedbackPriority; labelKey: string; color: string }[] = [
  { value: 'LOW', labelKey: 'feedback.priorities.low', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', labelKey: 'feedback.priorities.medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', labelKey: 'feedback.priorities.high', color: 'bg-red-100 text-red-700' },
  { value: 'CRITICAL', labelKey: 'feedback.priorities.critical', color: 'bg-purple-100 text-purple-700' },
];

export default function FeedbackButton({ user }: FeedbackButtonProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  const [category, setCategory] = useState<FeedbackCategory>('SUGGESTION');
  const [priority, setPriority] = useState<FeedbackPriority>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    MockApi.getFeedbackSettings().then(settings => {
      setIsEnabled(settings.enabled);
      setCategory(settings.defaultCategory);
      setPriority(settings.defaultPriority);
    });
  }, []);

  useEffect(() => {
    if (user) {
      setContact(user.phone || user.email || '');
    }
  }, [user]);

  const resetForm = () => {
    setCategory('SUGGESTION');
    setPriority('MEDIUM');
    setSubject('');
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const input: FeedbackCreateInput = {
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
        pageContext: window.location.pathname,
        senderContact: contact || undefined,
      };

      if (user) {
        await MockApi.createFeedback(
          input,
          user.id,
          user.name,
          user.phone || user.email || '',
          user.role
        );
      } else {
        await MockApi.createPublicFeedback({
          senderName: t('feedback.guest', 'زائر'),
          senderContact: contact,
          ...input,
        });
      }

      setShowSuccess(true);
      resetForm();
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEnabled) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed ${isRtl ? 'left-4' : 'right-4'} bottom-20 z-50 flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110`}
        title={t('feedback.button', 'إرسال ملاحظة')}
        data-testid="button-feedback-open"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-primary" />
                {t('feedback.title', 'إرسال ملاحظة')}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                data-testid="button-feedback-close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {showSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {t('feedback.success', 'تم إرسال ملاحظتك بنجاح!')}
                </p>
                <p className="text-sm text-slate-500">
                  {t('feedback.successDesc', 'شكراً لك، سنقوم بمراجعتها قريباً')}
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {user && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-sm">
                      <span className="text-slate-500">{t('feedback.sendingAs', 'الإرسال باسم')}:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 mx-2">{user.name}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('feedback.category', 'نوع الملاحظة')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setCategory(opt.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                              category === opt.value
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                            }`}
                            data-testid={`button-category-${opt.value}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {t(opt.labelKey, opt.value)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('feedback.priority', 'الأهمية')}
                    </label>
                    <div className="flex gap-2">
                      {PRIORITY_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setPriority(opt.value)}
                          className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                            priority === opt.value
                              ? opt.color + ' ring-2 ring-primary ring-offset-1'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                          data-testid={`button-priority-${opt.value}`}
                        >
                          {t(opt.labelKey, opt.value)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('feedback.subject', 'العنوان')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={t('feedback.subjectPlaceholder', 'عنوان مختصر للملاحظة')}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      data-testid="input-feedback-subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('feedback.message', 'الرسالة')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={t('feedback.messagePlaceholder', 'اكتب تفاصيل ملاحظتك هنا...')}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      data-testid="input-feedback-message"
                    />
                  </div>

                  {!user && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t('feedback.contact', 'بيانات التواصل')}
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={e => setContact(e.target.value)}
                        placeholder={t('feedback.contactPlaceholder', 'رقم الجوال أو البريد الإلكتروني')}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        data-testid="input-feedback-contact"
                      />
                    </div>
                  )}

                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <span>{t('feedback.pageContext', 'الصفحة الحالية')}:</span>
                    <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{location}</code>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    data-testid="button-feedback-cancel"
                  >
                    {t('common.cancel', 'إلغاء')}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !subject.trim() || !message.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-feedback-submit"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {t('feedback.send', 'إرسال')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
