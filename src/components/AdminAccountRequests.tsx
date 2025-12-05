
import React, { useState, useMemo } from 'react';
import { AccountOpeningRequest, AccountRequestStatus, PriceLevel, BusinessCustomerType, UploadedDocument } from '../types';
import { MockApi } from '../services/mockApi';
import { 
    Search, Filter, CheckCircle, XCircle, Clock, Eye, 
    MoreHorizontal, UserPlus, Briefcase, MapPin, Phone, 
    FileText, Shield, Save, X, Calendar, Users, File, Image, Download, ExternalLink
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { formatDateTime, formatDate } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';

// Document type labels - using translation function
const getDocTypeLabels = (t: (key: string, options?: { defaultValue: string }) => string): Record<string, string> => ({
    CR_CERTIFICATE: t('adminAccountRequests.docTypes.crCertificate', { defaultValue: 'السجل التجاري' }),
    VAT_CERTIFICATE: t('adminAccountRequests.docTypes.vatCertificate', { defaultValue: 'شهادة الرقم الضريبي' }),
    NATIONAL_ID: t('adminAccountRequests.docTypes.nationalId', { defaultValue: 'الهوية الوطنية' }),
    AUTHORIZATION_LETTER: t('adminAccountRequests.docTypes.authLetter', { defaultValue: 'خطاب التفويض' }),
    OTHER: t('adminAccountRequests.docTypes.other', { defaultValue: 'مستند آخر' })
});

interface AdminAccountRequestsProps {
    requests: AccountOpeningRequest[];
    onUpdate: () => void;
}

// Status labels - using translation function
const getStatusLabels = (t: (key: string, options?: { defaultValue: string }) => string): Record<AccountRequestStatus, string> => ({
    'NEW': t('adminAccountRequests.status.new', { defaultValue: 'طلب جديد' }),
    'UNDER_REVIEW': t('adminAccountRequests.status.underReview', { defaultValue: 'قيد المراجعة' }),
    'APPROVED': t('adminAccountRequests.status.approved', { defaultValue: 'تم الموافقة' }),
    'REJECTED': t('adminAccountRequests.status.rejected', { defaultValue: 'مرفوض' }),
    'ON_HOLD': t('adminAccountRequests.status.onHold', { defaultValue: 'مؤجل' })
});

const STATUS_COLORS: Record<AccountRequestStatus, string> = {
    'NEW': 'bg-blue-100 text-blue-700 border-blue-200',
    'UNDER_REVIEW': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'APPROVED': 'bg-green-100 text-green-700 border-green-200',
    'REJECTED': 'bg-red-100 text-red-700 border-red-200',
    'ON_HOLD': 'bg-gray-100 text-gray-600 border-gray-200'
};

export const AdminAccountRequests: React.FC<AdminAccountRequestsProps> = ({ requests, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedRequest, setSelectedRequest] = useState<AccountOpeningRequest | null>(null);
    
    // Decision Form State
    const [decisionForm, setDecisionForm] = useState<{
        status: AccountRequestStatus;
        priceLevel: PriceLevel;
        customerType: BusinessCustomerType;
        searchPointsInitial: number;
        searchPointsMonthly: number;
        portalAccessStart: string;
        portalAccessEnd: string;
        canCreateStaff: boolean;
        maxStaffUsers: number;
        adminNotes: string;
        openEnded: boolean;
    }>({
        status: 'UNDER_REVIEW',
        priceLevel: 'LEVEL_3',
        customerType: 'OTHER',
        searchPointsInitial: 50,
        searchPointsMonthly: 50,
        portalAccessStart: new Date().toISOString().split('T')[0],
        portalAccessEnd: '',
        canCreateStaff: false,
        maxStaffUsers: 3,
        adminNotes: '',
        openEnded: true
    });

    const { addToast } = useToast();
    const { t } = useTranslation();
    
    // Get translated labels
    const STATUS_LABELS = useMemo(() => getStatusLabels(t), [t]);
    const DOC_TYPE_LABELS = useMemo(() => getDocTypeLabels(t), [t]);

    // Stats
    const stats = useMemo(() => ({
        new: requests.filter(r => r.status === 'NEW').length,
        review: requests.filter(r => r.status === 'UNDER_REVIEW').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length
    }), [requests]);

    // Filtered Data
    const filteredRequests = useMemo(() => {
        let res = [...requests];
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            res = res.filter(r => 
                (r.businessName || r.fullName || '').toLowerCase().includes(lower) || 
                r.phone.includes(lower)
            );
        }
        if (statusFilter !== 'ALL') {
            res = res.filter(r => r.status === statusFilter);
        }
        return res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [requests, searchTerm, statusFilter]);

    // Handlers
    const handleViewRequest = (req: AccountOpeningRequest) => {
        setSelectedRequest(req);
        // Initialize form with existing data or defaults
        setDecisionForm({
            status: req.status === 'NEW' ? 'UNDER_REVIEW' : req.status,
            priceLevel: req.assignedPriceLevel || 'LEVEL_2',
            customerType: req.assignedCustomerType || 'PARTS_SHOP',
            searchPointsInitial: req.searchPointsInitial || 50,
            searchPointsMonthly: req.searchPointsMonthly || 0,
            portalAccessStart: req.portalAccessStart || new Date().toISOString().split('T')[0],
            portalAccessEnd: req.portalAccessEnd || '',
            openEnded: !req.portalAccessEnd,
            canCreateStaff: req.canCreateStaff || false,
            maxStaffUsers: req.maxStaffUsers || 3,
            adminNotes: req.adminNotes || ''
        });
    };

    const handleSaveDecision = async () => {
        if (!selectedRequest) return;
        try {
            await MockApi.reviewAccountRequest(selectedRequest.id, {
                status: decisionForm.status,
                adminNotes: decisionForm.adminNotes,
                assignedPriceLevel: decisionForm.priceLevel,
                assignedCustomerType: decisionForm.customerType,
                searchPointsInitial: decisionForm.searchPointsInitial,
                searchPointsMonthly: decisionForm.searchPointsMonthly,
                portalAccessStart: decisionForm.portalAccessStart,
                portalAccessEnd: decisionForm.openEnded ? null : decisionForm.portalAccessEnd,
                canCreateStaff: decisionForm.canCreateStaff,
                maxStaffUsers: decisionForm.maxStaffUsers,
                reviewedBy: 'Admin'
            });
            
            addToast(t('adminAccountRequests.toast.saveSuccess', 'تم حفظ القرار بنجاح'), 'success');
            onUpdate();
            setSelectedRequest(null);
        } catch (e) {
            addToast(t('adminAccountRequests.toast.saveError', 'حدث خطأ أثناء الحفظ'), 'error');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">{t('adminAccountRequests.stats.newRequests', 'طلبات جديدة')}</p>
                        <p className="text-2xl font-black text-blue-600">{stats.new}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><UserPlus size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">{t('adminAccountRequests.stats.underReview', 'قيد المراجعة')}</p>
                        <p className="text-2xl font-black text-yellow-600">{stats.review}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">{t('adminAccountRequests.stats.approved', 'تمت الموافقة')}</p>
                        <p className="text-2xl font-black text-green-600">{stats.approved}</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">{t('adminAccountRequests.stats.rejected', 'مرفوضة')}</p>
                        <p className="text-2xl font-black text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg"><XCircle size={20}/></div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('adminAccountRequests.searchPlaceholder', 'بحث باسم المنشأة، الجوال...')}
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none w-full md:w-auto"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">{t('adminAccountRequests.allStatuses', 'جميع الحالات')}</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4">{t('adminAccountRequests.table.businessName', 'اسم المنشأة / العميل')}</th>
                            <th className="p-4">{t('adminAccountRequests.table.activityType', 'نوع النشاط')}</th>
                            <th className="p-4">{t('adminAccountRequests.table.city', 'المدينة')}</th>
                            <th className="p-4">{t('adminAccountRequests.table.date', 'التاريخ')}</th>
                            <th className="p-4 text-center">{t('adminAccountRequests.table.status', 'الحالة')}</th>
                            <th className="p-4 text-center">{t('adminAccountRequests.table.actions', 'إجراءات')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-slate-800">{req.businessName || req.fullName}</p>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">{req.phone}</p>
                                </td>
                                <td className="p-4 text-slate-600 font-medium">
                                    {req.category === 'SPARE_PARTS_SHOP' ? t('adminAccountRequests.categories.spareParts', 'محل قطع غيار') : 
                                     req.category === 'RENTAL_COMPANY' ? t('adminAccountRequests.categories.rental', 'تأجير سيارات') : 
                                     req.category === 'INSURANCE_COMPANY' ? t('adminAccountRequests.categories.insurance', 'شركة تأمين') : t('adminAccountRequests.categories.agent', 'مندوب')}
                                </td>
                                <td className="p-4 text-slate-600">{req.city || req.representativeRegion}</td>
                                <td className="p-4 text-slate-500 text-xs" dir="ltr">{formatDateTime(req.createdAt)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[req.status]}`}>
                                        {STATUS_LABELS[req.status]}
                                    </span>
                                    {req.status === 'APPROVED' && (
                                        <div className="text-[10px] text-green-600 font-bold mt-1">{t('adminAccountRequests.approvedAccount', 'حساب معتمد')}</div>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleViewRequest(req)}
                                        className="text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto font-bold text-xs"
                                    >
                                        <Eye size={16} /> {t('adminAccountRequests.view', 'عرض')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                            <tr><td colSpan={6} className="p-10 text-center text-slate-400">{t('adminAccountRequests.noMatchingRequests', 'لا توجد طلبات مطابقة')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- SLIDE-OVER PANEL FOR DETAILS & DECISION --- */}
            {selectedRequest && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)}></div>
                    <div className="fixed inset-y-0 left-0 w-full md:w-[600px] bg-slate-50 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-200 flex flex-col">
                        
                        {/* Panel Header */}
                        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">{t('adminAccountRequests.panel.title', 'تفاصيل طلب الاعتماد')}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">REF: {selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Panel Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Section 1: Customer Data */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <FileText size={18} className="text-blue-600" /> {t('adminAccountRequests.panel.customerData', 'بيانات العميل')}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">{t('adminAccountRequests.panel.businessName', 'اسم المنشأة')}</span>
                                        <span className="font-bold text-slate-800 text-base">{selectedRequest.businessName || selectedRequest.fullName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">{t('adminAccountRequests.panel.activity', 'النشاط')}</span>
                                        <span className="font-bold text-slate-800">{selectedRequest.category}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">{t('adminAccountRequests.panel.city', 'المدينة')}</span>
                                        <span className="font-bold text-slate-800">{selectedRequest.city || selectedRequest.representativeRegion}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">{t('adminAccountRequests.panel.contactNumber', 'رقم التواصل')}</span>
                                        <span className="font-mono font-bold text-slate-800">{selectedRequest.phone}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">{t('adminAccountRequests.panel.crNumber', 'السجل التجاري')}</span>
                                        <span className="font-mono text-slate-800">{selectedRequest.commercialRegNumber || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">{t('adminAccountRequests.panel.vatNumber', 'الرقم الضريبي')}</span>
                                        <span className="font-mono text-slate-800">{selectedRequest.vatNumber || '-'}</span>
                                    </div>
                                </div>
                                {selectedRequest.notes && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600">
                                        <span className="block text-xs font-bold text-slate-400 mb-1">{t('adminAccountRequests.panel.customerNotes', 'ملاحظات العميل')}:</span>
                                        {selectedRequest.notes}
                                    </div>
                                )}
                            </div>

                            {/* Section 1.5: Uploaded Documents */}
                            {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <File size={18} className="text-purple-600" /> {t('adminAccountRequests.panel.attachedDocuments', 'المستندات المرفقة')} ({selectedRequest.documents.length})
                                    </h4>
                                    <div className="grid gap-3">
                                        {selectedRequest.documents.map((doc: UploadedDocument) => {
                                            const isImage = doc.fileType.startsWith('image/');
                                            const fileSize = doc.fileSize < 1024 * 1024 
                                                ? (doc.fileSize / 1024).toFixed(1) + ' KB'
                                                : (doc.fileSize / (1024 * 1024)).toFixed(1) + ' MB';
                                            
                                            return (
                                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-colors">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isImage ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                                        {isImage ? <Image size={20} /> : <File size={20} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 truncate">{DOC_TYPE_LABELS[doc.type] || doc.type}</p>
                                                        <p className="text-xs text-slate-500">{doc.name} • {fileSize}</p>
                                                    </div>
                                                    {doc.base64Data && (
                                                        <a 
                                                            href={doc.base64Data} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            download={doc.name}
                                                            className="p-2 bg-purple-100 rounded-lg text-purple-600 hover:bg-purple-200 transition-colors"
                                                            data-testid={`view-doc-${doc.id}`}
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Section 2: Admin Decision Form */}
                            <div className="bg-[#0B1B3A] p-6 rounded-2xl border border-slate-700 shadow-lg text-white space-y-6">
                                <h4 className="font-bold text-[#C8A04F] flex items-center gap-2 border-b border-slate-700 pb-2">
                                    <Shield size={18} /> {t('adminAccountRequests.panel.adminDecision', 'قرار الإدارة والصلاحيات')}
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-2">{t('adminAccountRequests.form.requestStatus', 'حالة الطلب')}</label>
                                        <select 
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-bold focus:ring-1 focus:ring-[#C8A04F]"
                                            value={decisionForm.status}
                                            onChange={(e) => setDecisionForm({...decisionForm, status: e.target.value as AccountRequestStatus})}
                                        >
                                            <option value="NEW">{t('adminAccountRequests.form.statusNew', 'جديد')}</option>
                                            <option value="UNDER_REVIEW">{t('adminAccountRequests.form.statusUnderReview', 'قيد المراجعة')}</option>
                                            <option value="APPROVED">{t('adminAccountRequests.form.statusApproved', 'موافقة (اعتماد)')}</option>
                                            <option value="REJECTED">{t('adminAccountRequests.form.statusRejected', 'رفض')}</option>
                                            <option value="ON_HOLD">{t('adminAccountRequests.form.statusOnHold', 'معلق')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2">{t('adminAccountRequests.form.customerType', 'تصنيف العميل')}</label>
                                        <select 
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                                            value={decisionForm.customerType}
                                            onChange={(e) => setDecisionForm({...decisionForm, customerType: e.target.value as BusinessCustomerType})}
                                        >
                                            <option value="PARTS_SHOP">{t('adminAccountRequests.form.typePartsShop', 'محل قطع غيار')}</option>
                                            <option value="RENTAL_COMPANY">{t('adminAccountRequests.form.typeRentalCompany', 'شركة تأجير')}</option>
                                            <option value="INSURANCE_COMPANY">{t('adminAccountRequests.form.typeInsuranceCompany', 'شركة تأمين')}</option>
                                            <option value="SALES_AGENT">{t('adminAccountRequests.form.typeSalesAgent', 'مندوب')}</option>
                                            <option value="FLEET_CUSTOMER">{t('adminAccountRequests.form.typeFleetCustomer', 'أسطول سيارات')}</option>
                                            <option value="OTHER">{t('adminAccountRequests.form.typeOther', 'أخرى')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2">{t('adminAccountRequests.form.priceLevel', 'مستوى التسعير')}</label>
                                        <select 
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                                            value={decisionForm.priceLevel}
                                            onChange={(e) => setDecisionForm({...decisionForm, priceLevel: e.target.value as PriceLevel})}
                                        >
                                            <option value="LEVEL_1">{t('adminAccountRequests.form.level1', 'Level 1 (VIP - Best Price)')}</option>
                                            <option value="LEVEL_2">{t('adminAccountRequests.form.level2', 'Level 2 (Wholesale)')}</option>
                                            <option value="LEVEL_3">{t('adminAccountRequests.form.level3', 'Level 3 (Retail/Small)')}</option>
                                            <option value="SPECIAL">{t('adminAccountRequests.form.levelSpecial', 'Special')}</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Access & Points */}
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#C8A04F] mb-2 flex items-center gap-2"><Calendar size={14}/> {t('adminAccountRequests.form.accessValidity', 'صلاحية الدخول')}</label>
                                        <div className="flex gap-2 items-center mb-2">
                                            <input type="date" className="bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white w-full" value={decisionForm.portalAccessStart} onChange={e => setDecisionForm({...decisionForm, portalAccessStart: e.target.value})} />
                                            <span className="text-slate-400 text-xs">{t('adminAccountRequests.form.to', 'إلى')}</span>
                                            <input type="date" disabled={decisionForm.openEnded} className="bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white w-full disabled:opacity-50" value={decisionForm.portalAccessEnd} onChange={e => setDecisionForm({...decisionForm, portalAccessEnd: e.target.value})} />
                                        </div>
                                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                            <input type="checkbox" checked={decisionForm.openEnded} onChange={e => setDecisionForm({...decisionForm, openEnded: e.target.checked})} className="rounded bg-slate-700 border-slate-500" />
                                            {t('adminAccountRequests.form.openEnded', 'صلاحية مفتوحة (بدون تاريخ انتهاء)')}
                                        </label>
                                    </div>

                                    <div className="pt-2 border-t border-slate-700">
                                        <label className="block text-xs font-bold text-[#C8A04F] mb-2">{t('adminAccountRequests.form.searchPoints', 'رصيد نقاط البحث')}</label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <span className="text-xs text-slate-400 block mb-1">{t('adminAccountRequests.form.initialBalance', 'الرصيد الأولي')}</span>
                                                <input type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" value={decisionForm.searchPointsInitial} onChange={e => setDecisionForm({...decisionForm, searchPointsInitial: parseInt(e.target.value)})} />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs text-slate-400 block mb-1">{t('adminAccountRequests.form.monthlyRenewal', 'تجديد شهري')}</span>
                                                <input type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white" value={decisionForm.searchPointsMonthly} onChange={e => setDecisionForm({...decisionForm, searchPointsMonthly: parseInt(e.target.value)})} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Staff Permissions */}
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={decisionForm.canCreateStaff} onChange={e => setDecisionForm({...decisionForm, canCreateStaff: e.target.checked})} className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-[#C8A04F] focus:ring-0" />
                                        <span className="text-sm font-bold text-slate-200">{t('adminAccountRequests.form.allowAddStaff', 'السماح بإضافة موظفين')}</span>
                                    </label>
                                    {decisionForm.canCreateStaff && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">{t('adminAccountRequests.form.maxLimit', 'الحد الأقصى')}:</span>
                                            <input type="number" min={1} className="w-16 bg-slate-900 border border-slate-600 rounded p-1 text-center text-sm text-white" value={decisionForm.maxStaffUsers} onChange={e => setDecisionForm({...decisionForm, maxStaffUsers: parseInt(e.target.value)})} />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2">{t('adminAccountRequests.form.adminNotes', 'ملاحظات إدارية (للاستخدام الداخلي)')}</label>
                                    <textarea 
                                        rows={3}
                                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:border-[#C8A04F] focus:outline-none"
                                        placeholder={t('adminAccountRequests.form.notesPlaceholder', 'اكتب أي ملاحظات حول المراجعة...')}
                                        value={decisionForm.adminNotes}
                                        onChange={e => setDecisionForm({...decisionForm, adminNotes: e.target.value})}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer */}
                        <div className="p-6 bg-white border-t border-slate-200 shadow-up z-10 flex gap-4">
                            <button 
                                onClick={handleSaveDecision}
                                className="flex-1 bg-[#0B1B3A] text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Save size={18} /> {t('adminAccountRequests.form.saveDecision', 'حفظ القرار')}
                            </button>
                            <button 
                                onClick={() => setSelectedRequest(null)}
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                {t('adminAccountRequests.form.cancel', 'إلغاء')}
                            </button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};
