/**
 * مركز التسويق - Marketing Center
 * إدارة الحملات التسويقية والإعلانات
 */

import React, { useState, useEffect } from 'react';
import { 
    Megaphone, Plus, Trash2, Play, Pause, Eye, Edit2,
    Image, Video, FileText, Code, Users, Calendar,
    Bell, Layout, MessageSquare, AlertCircle, CheckCircle,
    X, Save, ExternalLink, Target, Zap
} from 'lucide-react';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';
import { 
    MarketingCampaign, 
    CampaignDisplayType, 
    CampaignContentType, 
    CampaignStatus,
    CampaignAudienceType 
} from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface AdminMarketingCenterProps {
    onClose?: () => void;
}

const DISPLAY_TYPE_LABELS: Record<CampaignDisplayType, string> = {
    'POPUP': 'نافذة منبثقة',
    'BANNER': 'شريط إعلاني',
    'BELL': 'إشعار الجرس',
    'DASHBOARD_CARD': 'بطاقة لوحة التحكم'
};

const CONTENT_TYPE_LABELS: Record<CampaignContentType, string> = {
    'TEXT': 'نص فقط',
    'IMAGE': 'صورة',
    'VIDEO': 'فيديو',
    'HTML': 'محتوى HTML'
};

const STATUS_LABELS: Record<CampaignStatus, { label: string; color: string; bg: string }> = {
    'DRAFT': { label: 'مسودة', color: 'text-slate-600', bg: 'bg-slate-100' },
    'ACTIVE': { label: 'نشط', color: 'text-green-600', bg: 'bg-green-100' },
    'PAUSED': { label: 'متوقف', color: 'text-amber-600', bg: 'bg-amber-100' },
    'EXPIRED': { label: 'منتهي', color: 'text-red-600', bg: 'bg-red-100' }
};

const AUDIENCE_TYPE_LABELS: Record<CampaignAudienceType, string> = {
    'ALL': 'جميع العملاء',
    'SPARE_PARTS_SHOP': 'محلات قطع الغيار',
    'RENTAL_COMPANY': 'شركات التأجير',
    'MAINTENANCE_CENTER': 'مراكز الصيانة',
    'INSURANCE_COMPANY': 'شركات التأمين',
    'SALES_REP': 'مندوبي المبيعات'
};

const getDisplayTypeIcon = (type: CampaignDisplayType) => {
    switch (type) {
        case 'POPUP': return <MessageSquare size={16} />;
        case 'BANNER': return <Layout size={16} />;
        case 'BELL': return <Bell size={16} />;
        case 'DASHBOARD_CARD': return <FileText size={16} />;
    }
};

const getContentTypeIcon = (type: CampaignContentType) => {
    switch (type) {
        case 'TEXT': return <FileText size={16} />;
        case 'IMAGE': return <Image size={16} />;
        case 'VIDEO': return <Video size={16} />;
        case 'HTML': return <Code size={16} />;
    }
};

export const AdminMarketingCenter: React.FC<AdminMarketingCenterProps> = ({ onClose }) => {
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const { addToast } = useToast();

    // Form state
    const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
        title: '',
        message: '',
        displayType: 'POPUP',
        skippable: true,
        contentType: 'TEXT',
        mediaUrl: '',
        htmlContent: '',
        ctaLabel: '',
        ctaUrl: '',
        audienceType: 'ALL',
        status: 'DRAFT',
        priority: 1,
        startsAt: '',
        expiresAt: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const data = await MockApi.getAllCampaigns();
            setCampaigns(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            addToast('حدث خطأ في تحميل الحملات', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            displayType: 'POPUP',
            skippable: true,
            contentType: 'TEXT',
            mediaUrl: '',
            htmlContent: '',
            ctaLabel: '',
            ctaUrl: '',
            audienceType: 'ALL',
            status: 'DRAFT',
            priority: 1,
            startsAt: '',
            expiresAt: ''
        });
        setFormErrors({});
        setEditingCampaign(null);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        
        if (!formData.title?.trim()) {
            errors.title = 'عنوان الحملة مطلوب';
        }
        
        if (!formData.message?.trim()) {
            errors.message = 'نص الرسالة مطلوب';
        }
        
        if ((formData.contentType === 'IMAGE' || formData.contentType === 'VIDEO') && !formData.mediaUrl?.trim()) {
            errors.mediaUrl = 'رابط الوسائط مطلوب لهذا النوع من المحتوى';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateOrUpdate = async () => {
        if (!validateForm()) return;

        try {
            if (editingCampaign) {
                await MockApi.updateCampaign(editingCampaign.id, formData);
                addToast('تم تحديث الحملة بنجاح', 'success');
            } else {
                await MockApi.createCampaign(formData);
                addToast('تم إنشاء الحملة بنجاح', 'success');
            }
            setShowCreateModal(false);
            resetForm();
            loadCampaigns();
        } catch (error) {
            addToast('حدث خطأ في حفظ الحملة', 'error');
        }
    };

    const handleStatusChange = async (id: string, newStatus: CampaignStatus) => {
        try {
            await MockApi.updateCampaignStatus(id, newStatus);
            addToast(`تم ${newStatus === 'ACTIVE' ? 'تفعيل' : newStatus === 'PAUSED' ? 'إيقاف' : 'تحديث'} الحملة`, 'success');
            loadCampaigns();
        } catch (error) {
            addToast('حدث خطأ في تحديث حالة الحملة', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await MockApi.deleteCampaign(id);
            addToast('تم حذف الحملة بنجاح', 'success');
            setShowDeleteConfirm(null);
            loadCampaigns();
        } catch (error) {
            addToast('حدث خطأ في حذف الحملة', 'error');
        }
    };

    const openEditModal = (campaign: MarketingCampaign) => {
        setEditingCampaign(campaign);
        setFormData({
            title: campaign.title,
            message: campaign.message,
            displayType: campaign.displayType,
            skippable: campaign.skippable,
            contentType: campaign.contentType,
            mediaUrl: campaign.mediaUrl || '',
            htmlContent: campaign.htmlContent || '',
            ctaLabel: campaign.ctaLabel || '',
            ctaUrl: campaign.ctaUrl || '',
            audienceType: campaign.audienceType,
            status: campaign.status,
            priority: campaign.priority,
            startsAt: campaign.startsAt || '',
            expiresAt: campaign.expiresAt || ''
        });
        setShowCreateModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <Megaphone size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">مركز التسويق</h1>
                            <p className="text-purple-200 text-sm">إدارة الحملات التسويقية والإعلانات</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-2 bg-white text-purple-600 px-5 py-2.5 rounded-xl font-bold hover:bg-purple-50 transition-colors"
                        data-testid="button-create-campaign"
                    >
                        <Plus size={20} />
                        حملة جديدة
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-3xl font-bold">{campaigns.length}</div>
                        <div className="text-purple-200 text-sm">إجمالي الحملات</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-3xl font-bold text-green-300">
                            {campaigns.filter(c => c.status === 'ACTIVE').length}
                        </div>
                        <div className="text-purple-200 text-sm">حملات نشطة</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-3xl font-bold text-amber-300">
                            {campaigns.filter(c => c.status === 'DRAFT').length}
                        </div>
                        <div className="text-purple-200 text-sm">مسودات</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-3xl font-bold text-slate-300">
                            {campaigns.filter(c => c.status === 'PAUSED' || c.status === 'EXPIRED').length}
                        </div>
                        <div className="text-purple-200 text-sm">متوقفة/منتهية</div>
                    </div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-bold text-lg text-slate-800">قائمة الحملات</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        جاري التحميل...
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="p-12 text-center">
                        <Megaphone size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">لا توجد حملات تسويقية حالياً</p>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowCreateModal(true);
                            }}
                            className="mt-4 text-purple-600 font-bold hover:underline"
                        >
                            أنشئ حملتك الأولى
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-right">
                                <tr>
                                    <th className="px-4 py-3 text-sm font-bold text-slate-600">الحملة</th>
                                    <th className="px-4 py-3 text-sm font-bold text-slate-600">النوع</th>
                                    <th className="px-4 py-3 text-sm font-bold text-slate-600">الجمهور</th>
                                    <th className="px-4 py-3 text-sm font-bold text-slate-600">الحالة</th>
                                    <th className="px-4 py-3 text-sm font-bold text-slate-600">الأولوية</th>
                                    <th className="px-4 py-3 text-sm font-bold text-slate-600">تاريخ الإنشاء</th>
                                    <th className="px-4 py-3 text-sm font-bold text-slate-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.map(campaign => (
                                    <tr key={campaign.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-campaign-${campaign.id}`}>
                                        <td className="px-4 py-4">
                                            <div>
                                                <div className="font-bold text-slate-800">{campaign.title}</div>
                                                <div className="text-sm text-slate-500 line-clamp-1">{campaign.message}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="p-1.5 bg-slate-100 rounded">
                                                    {getDisplayTypeIcon(campaign.displayType)}
                                                </span>
                                                <span className="text-sm text-slate-600">
                                                    {DISPLAY_TYPE_LABELS[campaign.displayType]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="flex items-center gap-1 text-sm text-slate-600">
                                                <Target size={14} />
                                                {AUDIENCE_TYPE_LABELS[campaign.audienceType]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[campaign.status].bg} ${STATUS_LABELS[campaign.status].color}`}>
                                                {campaign.status === 'ACTIVE' && <Zap size={12} />}
                                                {STATUS_LABELS[campaign.status].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                                                {campaign.priority}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500">
                                            {formatDateTime(campaign.createdAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1">
                                                {campaign.status === 'ACTIVE' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(campaign.id, 'PAUSED')}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="إيقاف"
                                                        data-testid={`button-pause-${campaign.id}`}
                                                    >
                                                        <Pause size={18} />
                                                    </button>
                                                ) : campaign.status !== 'EXPIRED' ? (
                                                    <button
                                                        onClick={() => handleStatusChange(campaign.id, 'ACTIVE')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="تفعيل"
                                                        data-testid={`button-activate-${campaign.id}`}
                                                    >
                                                        <Play size={18} />
                                                    </button>
                                                ) : null}
                                                <button
                                                    onClick={() => openEditModal(campaign)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                    data-testid={`button-edit-${campaign.id}`}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(campaign.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                    data-testid={`button-delete-${campaign.id}`}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }}>
                    <div className="p-6 max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Megaphone className="text-purple-600" />
                                {editingCampaign ? 'تعديل الحملة' : 'إنشاء حملة جديدة'}
                            </h2>
                            <button
                                onClick={() => { setShowCreateModal(false); resetForm(); }}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    عنوان الحملة <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${formErrors.title ? 'border-red-300' : 'border-slate-200'}`}
                                    placeholder="مثال: عروض نهاية العام"
                                    data-testid="input-campaign-title"
                                />
                                {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    نص الرسالة <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={3}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${formErrors.message ? 'border-red-300' : 'border-slate-200'}`}
                                    placeholder="اكتب نص الرسالة التسويقية هنا..."
                                    data-testid="input-campaign-message"
                                />
                                {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
                            </div>

                            {/* Display Type & Content Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        طريقة العرض
                                    </label>
                                    <select
                                        value={formData.displayType}
                                        onChange={(e) => setFormData({ ...formData, displayType: e.target.value as CampaignDisplayType })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        data-testid="select-display-type"
                                    >
                                        {Object.entries(DISPLAY_TYPE_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        نوع المحتوى
                                    </label>
                                    <select
                                        value={formData.contentType}
                                        onChange={(e) => setFormData({ ...formData, contentType: e.target.value as CampaignContentType })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        data-testid="select-content-type"
                                    >
                                        {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Media URL (conditional) */}
                            {(formData.contentType === 'IMAGE' || formData.contentType === 'VIDEO') && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        رابط الوسائط <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.mediaUrl}
                                        onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 ${formErrors.mediaUrl ? 'border-red-300' : 'border-slate-200'}`}
                                        placeholder="https://example.com/image.jpg"
                                        data-testid="input-media-url"
                                    />
                                    {formErrors.mediaUrl && <p className="text-red-500 text-sm mt-1">{formErrors.mediaUrl}</p>}
                                    <p className="text-xs text-slate-500 mt-1">
                                        {formData.contentType === 'IMAGE' ? 'أدخل رابط الصورة (jpg, png, gif)' : 'أدخل رابط الفيديو (mp4, webm)'}
                                    </p>
                                </div>
                            )}

                            {/* HTML Content (conditional) */}
                            {formData.contentType === 'HTML' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        محتوى HTML
                                    </label>
                                    <textarea
                                        value={formData.htmlContent}
                                        onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
                                        placeholder="<div>...</div>"
                                        data-testid="input-html-content"
                                    />
                                </div>
                            )}

                            {/* Skippable */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="skippable"
                                    checked={formData.skippable}
                                    onChange={(e) => setFormData({ ...formData, skippable: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                    data-testid="checkbox-skippable"
                                />
                                <label htmlFor="skippable" className="text-sm">
                                    <span className="font-bold text-slate-700">إشعار قابل للتخطي</span>
                                    <p className="text-slate-500 text-xs">السماح للعميل بإغلاق الإعلان</p>
                                </label>
                            </div>

                            {/* CTA */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        نص زر الإجراء (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ctaLabel}
                                        onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="مثال: اطلب الآن"
                                        data-testid="input-cta-label"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        رابط الإجراء (اختياري)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.ctaUrl}
                                        onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        placeholder="https://..."
                                        data-testid="input-cta-url"
                                    />
                                </div>
                            </div>

                            {/* Audience & Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        الجمهور المستهدف
                                    </label>
                                    <select
                                        value={formData.audienceType}
                                        onChange={(e) => setFormData({ ...formData, audienceType: e.target.value as CampaignAudienceType })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        data-testid="select-audience"
                                    >
                                        {Object.entries(AUDIENCE_TYPE_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        الأولوية
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        data-testid="input-priority"
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        تاريخ البداية (اختياري)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startsAt}
                                        onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        data-testid="input-starts-at"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        تاريخ الانتهاء (اختياري)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                        data-testid="input-expires-at"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    الحالة
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CampaignStatus })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    data-testid="select-status"
                                >
                                    <option value="DRAFT">مسودة</option>
                                    <option value="ACTIVE">نشط</option>
                                    <option value="PAUSED">متوقف</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleCreateOrUpdate}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                                    data-testid="button-save-campaign"
                                >
                                    <Save size={18} />
                                    {editingCampaign ? 'حفظ التعديلات' : 'إنشاء الحملة'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)}>
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={32} className="text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">تأكيد الحذف</h3>
                        <p className="text-slate-600 mb-6">هل أنت متأكد من حذف هذه الحملة؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                                data-testid="button-confirm-delete"
                            >
                                <Trash2 size={18} />
                                حذف الحملة
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
