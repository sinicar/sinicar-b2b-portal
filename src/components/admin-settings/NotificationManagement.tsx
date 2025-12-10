import { FC, useState, ReactNode } from 'react';
import { NotificationTemplate } from '../../types';
import { 
    Bell, Plus, Eye, Check, Trash2, Pencil, EyeOff,
    CheckCircle2, XCircle, AlertCircle, Info, MessageSquare,
    Layout, Megaphone, Mail, Smartphone, Volume2, Sparkles,
    Truck, DollarSign, UserCheck
} from 'lucide-react';

export interface NotificationManagementProps {
    t: (key: string, fallback?: string) => string;
}

export const NotificationManagement: FC<NotificationManagementProps> = ({ t }) => {
    const [notifications, setNotifications] = useState<NotificationTemplate[]>([
        { id: 'ORDER_CONFIRMED', name: 'تأكيد الطلب', nameEn: 'Order Confirmed', type: 'success', icon: 'CheckCircle2', 
          channels: ['toast', 'email'], enabled: true,
          message: { ar: 'تم تأكيد طلبك بنجاح', en: 'Your order has been confirmed', hi: 'आपका ऑर्डर कन्फर्म हो गया है', zh: '您的订单已确认' },
          style: { bgColor: '#10b981', textColor: '#ffffff', borderColor: '#059669' } },
        { id: 'ORDER_SHIPPED', name: 'شحن الطلب', nameEn: 'Order Shipped', type: 'info', icon: 'Truck',
          channels: ['toast', 'email', 'sms'], enabled: true,
          message: { ar: 'تم شحن طلبك', en: 'Your order has been shipped', hi: 'आपका ऑर्डर शिप हो गया है', zh: '您的订单已发货' },
          style: { bgColor: '#3b82f6', textColor: '#ffffff', borderColor: '#2563eb' } },
        { id: 'PAYMENT_SUCCESS', name: 'نجاح الدفع', nameEn: 'Payment Success', type: 'success', icon: 'DollarSign',
          channels: ['toast', 'email'], enabled: true,
          message: { ar: 'تم استلام الدفعة بنجاح', en: 'Payment received successfully', hi: 'भुगतान सफलतापूर्वक प्राप्त हुआ', zh: '付款成功收到' },
          style: { bgColor: '#059669', textColor: '#ffffff', borderColor: '#047857' } },
        { id: 'LOW_STOCK', name: 'المخزون منخفض', nameEn: 'Low Stock Alert', type: 'warning', icon: 'AlertCircle',
          channels: ['toast', 'modal'], enabled: true,
          message: { ar: 'تنبيه: مخزون منخفض للمنتج', en: 'Alert: Low stock for product', hi: 'चेतावनी: कम स्टॉक', zh: '警告：库存不足' },
          style: { bgColor: '#f59e0b', textColor: '#ffffff', borderColor: '#d97706' } },
        { id: 'ACCOUNT_APPROVED', name: 'الموافقة على الحساب', nameEn: 'Account Approved', type: 'success', icon: 'UserCheck',
          channels: ['toast', 'email', 'sms'], enabled: true,
          message: { ar: 'تمت الموافقة على حسابك', en: 'Your account has been approved', hi: 'आपका खाता स्वीकृत हो गया', zh: '您的账户已批准' },
          style: { bgColor: '#22c55e', textColor: '#ffffff', borderColor: '#16a34a' } },
        { id: 'NEW_MESSAGE', name: 'رسالة جديدة', nameEn: 'New Message', type: 'info', icon: 'MessageSquare',
          channels: ['toast', 'banner'], enabled: true,
          message: { ar: 'لديك رسالة جديدة', en: 'You have a new message', hi: 'आपके पास एक नया संदेश है', zh: '您有新消息' },
          style: { bgColor: '#6366f1', textColor: '#ffffff', borderColor: '#4f46e5' } },
        { id: 'ERROR_GENERAL', name: 'خطأ عام', nameEn: 'General Error', type: 'error', icon: 'XCircle',
          channels: ['toast', 'modal'], enabled: true,
          message: { ar: 'حدث خطأ، يرجى المحاولة مرة أخرى', en: 'An error occurred, please try again', hi: 'एक त्रुटि हुई, कृपया पुनः प्रयास करें', zh: '发生错误，请重试' },
          style: { bgColor: '#ef4444', textColor: '#ffffff', borderColor: '#dc2626' } },
    ]);
    const [editingNotification, setEditingNotification] = useState<string | null>(null);
    const [previewNotification, setPreviewNotification] = useState<NotificationTemplate | null>(null);

    const notificationTypes: { value: string; label: string; icon: ReactNode }[] = [
        { value: 'success', label: t('adminSettings.notifSuccess', 'نجاح'), icon: <CheckCircle2 size={16} className="text-green-500" /> },
        { value: 'error', label: t('adminSettings.notifError', 'خطأ'), icon: <XCircle size={16} className="text-red-500" /> },
        { value: 'warning', label: t('adminSettings.notifWarning', 'تحذير'), icon: <AlertCircle size={16} className="text-amber-500" /> },
        { value: 'info', label: t('adminSettings.notifInfo', 'معلومات'), icon: <Info size={16} className="text-blue-500" /> },
    ];

    const channelOptions: { value: string; label: string; icon: ReactNode }[] = [
        { value: 'toast', label: t('adminSettings.channelToast', 'إشعار منبثق'), icon: <MessageSquare size={14} /> },
        { value: 'modal', label: t('adminSettings.channelModal', 'نافذة منبثقة'), icon: <Layout size={14} /> },
        { value: 'banner', label: t('adminSettings.channelBanner', 'شريط علوي'), icon: <Megaphone size={14} /> },
        { value: 'email', label: t('adminSettings.channelEmail', 'بريد إلكتروني'), icon: <Mail size={14} /> },
        { value: 'sms', label: t('adminSettings.channelSMS', 'رسالة نصية'), icon: <Smartphone size={14} /> },
    ];

    const updateNotification = (id: string, updates: Partial<NotificationTemplate>) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    const toggleChannel = (id: string, channel: string) => {
        const notif = notifications.find(n => n.id === id);
        if (!notif) return;
        const channels = notif.channels.includes(channel as any)
            ? notif.channels.filter(c => c !== channel)
            : [...notif.channels, channel as any];
        updateNotification(id, { channels });
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="text-brand-600" /> {t('adminSettings.notificationManagement', 'إدارة الإشعارات')}
                </h2>
                <button className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 flex items-center gap-2">
                    <Plus size={18} /> {t('adminSettings.addNotification', 'إضافة إشعار')}
                </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                    <Sparkles className="text-blue-500 mt-0.5" size={20} />
                    <div>
                        <p className="font-bold text-blue-800">{t('adminSettings.notifSystemDesc', 'نظام إشعارات متكامل')}</p>
                        <p className="text-sm text-blue-600">{t('adminSettings.notifSystemDescDetail', 'تحكم كامل في جميع إشعارات النظام: النص، الألوان، القنوات، والتصميم')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {notifications.map(notif => (
                    <div 
                        key={notif.id}
                        className={`p-4 rounded-xl border-2 transition-all ${editingNotification === notif.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                        {editingNotification === notif.id ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-slate-800">{t('adminSettings.editNotification', 'تعديل الإشعار')}</h4>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPreviewNotification(notif)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                            <Eye size={16} />
                                        </button>
                                        <button onClick={() => setEditingNotification(null)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                            <Check size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifNameAr', 'الاسم بالعربية')}</label>
                                        <input 
                                            type="text" value={notif.name}
                                            onChange={e => updateNotification(notif.id, { name: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifNameEn', 'الاسم بالإنجليزية')}</label>
                                        <input 
                                            type="text" value={notif.nameEn}
                                            onChange={e => updateNotification(notif.id, { nameEn: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifType', 'نوع الإشعار')}</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {notificationTypes.map(type => (
                                                <button 
                                                    key={type.value}
                                                    onClick={() => updateNotification(notif.id, { type: type.value as any })}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${notif.type === type.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
                                                >
                                                    {type.icon} {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifChannels', 'قنوات الإرسال')}</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {channelOptions.map(ch => (
                                                <button 
                                                    key={ch.value}
                                                    onClick={() => toggleChannel(notif.id, ch.value)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${notif.channels.includes(ch.value as any) ? 'border-green-500 bg-green-50' : 'border-slate-200'}`}
                                                >
                                                    {ch.icon} {ch.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifMsgAr', 'النص العربي')}</label>
                                        <input type="text" value={notif.message.ar}
                                            onChange={e => updateNotification(notif.id, { message: { ...notif.message, ar: e.target.value } })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifMsgEn', 'النص الإنجليزي')}</label>
                                        <input type="text" value={notif.message.en} dir="ltr"
                                            onChange={e => updateNotification(notif.id, { message: { ...notif.message, en: e.target.value } })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifMsgHi', 'النص الهندي')}</label>
                                        <input type="text" value={notif.message.hi} dir="ltr"
                                            onChange={e => updateNotification(notif.id, { message: { ...notif.message, hi: e.target.value } })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifMsgZh', 'النص الصيني')}</label>
                                        <input type="text" value={notif.message.zh} dir="ltr"
                                            onChange={e => updateNotification(notif.id, { message: { ...notif.message, zh: e.target.value } })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifBgColor', 'لون الخلفية')}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={notif.style.bgColor}
                                                onChange={e => updateNotification(notif.id, { style: { ...notif.style, bgColor: e.target.value } })}
                                                className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200"
                                            />
                                            <input type="text" value={notif.style.bgColor}
                                                onChange={e => updateNotification(notif.id, { style: { ...notif.style, bgColor: e.target.value } })}
                                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifTextColor', 'لون النص')}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={notif.style.textColor}
                                                onChange={e => updateNotification(notif.id, { style: { ...notif.style, textColor: e.target.value } })}
                                                className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200"
                                            />
                                            <input type="text" value={notif.style.textColor}
                                                onChange={e => updateNotification(notif.id, { style: { ...notif.style, textColor: e.target.value } })}
                                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" dir="ltr"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.notifBorderColor', 'لون الحدود')}</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" value={notif.style.borderColor}
                                                onChange={e => updateNotification(notif.id, { style: { ...notif.style, borderColor: e.target.value } })}
                                                className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200"
                                            />
                                            <input type="text" value={notif.style.borderColor}
                                                onChange={e => updateNotification(notif.id, { style: { ...notif.style, borderColor: e.target.value } })}
                                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono" dir="ltr"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <label className="block text-sm font-bold text-slate-700 mb-3">{t('adminSettings.notifPreview', 'معاينة الإشعار')}</label>
                                    <div 
                                        className="p-4 rounded-xl flex items-center gap-3 shadow-lg"
                                        style={{ backgroundColor: notif.style.bgColor, color: notif.style.textColor, borderLeft: `4px solid ${notif.style.borderColor}` }}
                                    >
                                        {notif.type === 'success' && <CheckCircle2 size={24} />}
                                        {notif.type === 'error' && <XCircle size={24} />}
                                        {notif.type === 'warning' && <AlertCircle size={24} />}
                                        {notif.type === 'info' && <Info size={24} />}
                                        <span className="font-bold">{notif.message.ar}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: notif.style.bgColor, color: notif.style.textColor }}
                                    >
                                        {notif.type === 'success' && <CheckCircle2 size={20} />}
                                        {notif.type === 'error' && <XCircle size={20} />}
                                        {notif.type === 'warning' && <AlertCircle size={20} />}
                                        {notif.type === 'info' && <Info size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{notif.name}</h4>
                                        <p className="text-sm text-slate-500">{notif.nameEn}</p>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        {notif.channels.map(ch => (
                                            <span key={ch} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">
                                                {ch}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => updateNotification(notif.id, { enabled: !notif.enabled })}
                                        className={`p-2 rounded-lg transition-colors ${notif.enabled ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {notif.enabled ? <Volume2 size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button 
                                        onClick={() => setEditingNotification(notif.id)}
                                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
