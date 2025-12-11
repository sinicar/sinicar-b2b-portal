/**
 * Admin Partner Requests - إدارة طلبات الشركاء
 * يعرض ويدير طلبات الشراكة: موردين محليين، موردين دوليين، مسوقين، معلنين
 */

import React, { useState, useEffect, useMemo } from 'react';
import { MockApi } from '../services/mockApi';
import { useToast } from '../services/ToastContext';
import { useTranslation } from 'react-i18next';
import {
    Search, Filter, CheckCircle, XCircle, Clock, Eye, Building2,
    Globe, Megaphone, Sparkles, Phone, MapPin, Car, MessageCircle,
    Save, X, FileText, Users, AlertTriangle, ArrowLeft, Calendar
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { PARTNER_TYPES, PARTNER_REQUEST_STATUSES, CAR_BRANDS, SAUDI_CITIES, MARKETING_CHANNELS, AD_TYPES, COUNTRIES, BUSINESS_TYPES } from '../utils/partnerConstants';

type PartnerType = 'LOCAL_SUPPLIER' | 'INTERNATIONAL_SUPPLIER' | 'MARKETER' | 'ADVERTISER';
type PartnerRequestStatus = 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_MODIFICATION';

interface PartnerRequest {
    id: string;
    type: PartnerType;
    status: PartnerRequestStatus;
    createdAt: string;
    updatedAt?: string;
    phone: string;
    password?: string;
    // Local Supplier
    companyName?: string;
    commercialRegNumber?: string;
    vatNumber?: string;
    nationalAddressNumber?: string;
    city?: string;
    carBrands?: string[];
    ownBrands?: string[];
    // International Supplier
    country?: string;
    businessType?: string;
    // Marketer
    fullName?: string;
    marketingChannels?: string[];
    otherChannel?: string;
    // Advertiser
    adType?: string;
    duration?: number;
    startDate?: string;
    // Admin
    adminNotes?: string;
    rejectionReason?: string;
    modificationNote?: string;
    reviewedAt?: string;
}

interface AdminPartnerRequestsProps {
    onBack?: () => void;
}

const PARTNER_TYPE_ICONS: Record<PartnerType, any> = {
    LOCAL_SUPPLIER: Building2,
    INTERNATIONAL_SUPPLIER: Globe,
    MARKETER: Megaphone,
    ADVERTISER: Sparkles
};

const STATUS_COLORS: Record<PartnerRequestStatus, string> = {
    NEW: 'bg-blue-100 text-blue-700 border-blue-200',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    NEEDS_MODIFICATION: 'bg-orange-100 text-orange-700 border-orange-200'
};

export const AdminPartnerRequests: React.FC<AdminPartnerRequestsProps> = ({ onBack }) => {
    const [requests, setRequests] = useState<PartnerRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);
    const [stats, setStats] = useState<any>(null);

    // Decision Form State
    const [decisionStatus, setDecisionStatus] = useState<PartnerRequestStatus>('UNDER_REVIEW');
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [modificationNote, setModificationNote] = useState('');
    const [searchPoints, setSearchPoints] = useState(100);

    const { addToast } = useToast();
    const { t } = useTranslation();

    // Fetch data
    useEffect(() => {
        loadData();
    }, [typeFilter, statusFilter, searchTerm]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [requestsData, statsData] = await Promise.all([
                MockApi.getPartnerRequests({
                    type: typeFilter !== 'ALL' ? typeFilter : undefined,
                    status: statusFilter !== 'ALL' ? statusFilter : undefined,
                    search: searchTerm || undefined
                }),
                MockApi.getPartnerRequestsStats()
            ]);
            setRequests(requestsData.items);
            setStats(statsData);
        } catch (error) {
            addToast('حدث خطأ أثناء تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle View Request
    const handleViewRequest = (request: PartnerRequest) => {
        setSelectedRequest(request);
        setDecisionStatus(request.status === 'NEW' ? 'UNDER_REVIEW' : request.status);
        setAdminNotes(request.adminNotes || '');
        setRejectionReason(request.rejectionReason || '');
        setModificationNote(request.modificationNote || '');
    };

    // Handle Save Decision
    const handleSaveDecision = async () => {
        if (!selectedRequest) return;

        try {
            if (decisionStatus === 'APPROVED') {
                // Approve and create user
                await MockApi.approvePartnerRequest(selectedRequest.id, {
                    searchPoints: searchPoints
                });
                addToast('تم الموافقة على الطلب وإنشاء الحساب', 'success');
            } else {
                // Just update status
                await MockApi.updatePartnerRequestStatus(
                    selectedRequest.id,
                    decisionStatus,
                    adminNotes,
                    rejectionReason,
                    modificationNote
                );
                addToast('تم تحديث حالة الطلب', 'success');
            }

            setSelectedRequest(null);
            loadData();
        } catch (error) {
            addToast('حدث خطأ أثناء الحفظ', 'error');
        }
    };

    // Get Partner Type Label
    const getTypeLabel = (type: PartnerType) => PARTNER_TYPES[type]?.label || type;
    const getTypeIcon = (type: PartnerType) => PARTNER_TYPE_ICONS[type] || Building2;

    // Get Status Label
    const getStatusLabel = (status: PartnerRequestStatus) => PARTNER_REQUEST_STATUSES[status]?.label || status;

    // Render Car Brands
    const renderCarBrands = (brands: string[]) => {
        if (!brands || brands.length === 0) return <span className="text-slate-400">-</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {brands.slice(0, 3).map((brandId) => {
                    const brand = CAR_BRANDS.find(b => b.id === brandId);
                    return (
                        <span key={brandId} className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs font-bold">
                            {brand?.label || brandId}
                        </span>
                    );
                })}
                {brands.length > 3 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                        +{brands.length - 3}
                    </span>
                )}
            </div>
        );
    };

    // Render Marketing Channels
    const renderMarketingChannels = (channels: string[]) => {
        if (!channels || channels.length === 0) return <span className="text-slate-400">-</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {channels.map((channelId) => {
                    const channel = MARKETING_CHANNELS.find(c => c.id === channelId);
                    return (
                        <span key={channelId} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            {channel?.label || channelId}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">مركز طلبات الشراكة</h2>
                        <p className="text-slate-500 text-sm">إدارة طلبات الموردين والمسوقين والمعلنين</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                        {stats?.total || 0} طلب
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(PARTNER_TYPES).map(([key, value]) => {
                    const Icon = PARTNER_TYPE_ICONS[key as PartnerType];
                    const count = stats?.byType?.[key] || 0;
                    return (
                        <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${value.color} text-white`}>
                                    <Icon size={20} />
                                </div>
                                <span className="text-2xl font-black text-slate-800">{count}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-600">{value.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Status Stats */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-bold text-blue-700">جديد: {stats?.byStatus?.NEW || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-bold text-yellow-700">قيد المراجعة: {stats?.byStatus?.UNDER_REVIEW || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-bold text-green-700">موافق عليه: {stats?.byStatus?.APPROVED || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-bold text-red-700">مرفوض: {stats?.byStatus?.REJECTED || 0}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="بحث باسم الشركة، الجوال..."
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                    >
                        <option value="ALL">جميع الأنواع</option>
                        <option value="LOCAL_SUPPLIER">مورد محلي</option>
                        <option value="INTERNATIONAL_SUPPLIER">مورد دولي</option>
                        <option value="MARKETER">مسوق</option>
                        <option value="ADVERTISER">معلن</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                    >
                        <option value="ALL">جميع الحالات</option>
                        <option value="NEW">طلب جديد</option>
                        <option value="UNDER_REVIEW">قيد المراجعة</option>
                        <option value="APPROVED">تمت الموافقة</option>
                        <option value="REJECTED">مرفوض</option>
                        <option value="NEEDS_MODIFICATION">يحتاج تعديل</option>
                    </select>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-500 mt-3">جارٍ التحميل...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">لا توجد طلبات شراكة بعد</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">النوع</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">الاسم</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">الجوال</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">التفاصيل</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">الحالة</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">التاريخ</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">إجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((request) => {
                                    const TypeIcon = getTypeIcon(request.type);
                                    return (
                                        <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${PARTNER_TYPES[request.type]?.color || 'bg-slate-500'} text-white`}>
                                                        <TypeIcon size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{getTypeLabel(request.type)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-slate-800">
                                                    {request.companyName || request.fullName || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600 font-mono" dir="ltr">
                                                    {request.phone}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {request.type === 'LOCAL_SUPPLIER' && renderCarBrands(request.carBrands || [])}
                                                {request.type === 'INTERNATIONAL_SUPPLIER' && (
                                                    <span className="text-sm text-slate-600">
                                                        {COUNTRIES.find(c => c.code === request.country)?.label || request.country}
                                                    </span>
                                                )}
                                                {request.type === 'MARKETER' && renderMarketingChannels(request.marketingChannels || [])}
                                                {request.type === 'ADVERTISER' && (
                                                    <span className="text-sm text-slate-600">
                                                        {AD_TYPES.find(a => a.id === request.adType)?.label || request.adType} - {request.duration} يوم
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[request.status]}`}>
                                                    {getStatusLabel(request.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-500">
                                                    {formatDateTime(request.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleViewRequest(request)}
                                                    className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl ${PARTNER_TYPES[selectedRequest.type]?.color || 'bg-slate-500'} text-white`}>
                                        {React.createElement(getTypeIcon(selectedRequest.type), { size: 24 })}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">
                                            {selectedRequest.companyName || selectedRequest.fullName}
                                        </h3>
                                        <p className="text-sm text-slate-500">{getTypeLabel(selectedRequest.type)}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-200 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">

                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                        <Phone size={14} />
                                        <span>رقم الجوال</span>
                                    </div>
                                    <p className="font-bold text-slate-800" dir="ltr">{selectedRequest.phone}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                                        <Calendar size={14} />
                                        <span>تاريخ الطلب</span>
                                    </div>
                                    <p className="font-bold text-slate-800">{formatDateTime(selectedRequest.createdAt)}</p>
                                </div>
                            </div>

                            {/* Type-Specific Info */}
                            {selectedRequest.type === 'LOCAL_SUPPLIER' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-700 border-b pb-2">بيانات المورد المحلي</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500">السجل التجاري</label>
                                            <p className="font-bold text-slate-800">{selectedRequest.commercialRegNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500">الرقم الضريبي</label>
                                            <p className="font-bold text-slate-800">{selectedRequest.vatNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500">العنوان الوطني</label>
                                            <p className="font-bold text-slate-800">{selectedRequest.nationalAddressNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500">المدينة</label>
                                            <p className="font-bold text-slate-800">
                                                {SAUDI_CITIES.find(c => c.id === selectedRequest.city)?.label || selectedRequest.city || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500">ماركات السيارات</label>
                                        {renderCarBrands(selectedRequest.carBrands || [])}
                                    </div>
                                    {selectedRequest.ownBrands && selectedRequest.ownBrands.length > 0 && (
                                        <div>
                                            <label className="text-sm text-slate-500">علامات تجارية خاصة</label>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {selectedRequest.ownBrands.map((brand, i) => (
                                                    <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                                        {brand}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedRequest.type === 'INTERNATIONAL_SUPPLIER' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-700 border-b pb-2">بيانات المورد الدولي</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500">البلد</label>
                                            <p className="font-bold text-slate-800">
                                                {COUNTRIES.find(c => c.code === selectedRequest.country)?.label || selectedRequest.country || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500">المدينة</label>
                                            <p className="font-bold text-slate-800">{selectedRequest.city || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500">نوع العمل</label>
                                            <p className="font-bold text-slate-800">
                                                {BUSINESS_TYPES.find(b => b.id === selectedRequest.businessType)?.label || selectedRequest.businessType || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500">ماركات السيارات</label>
                                        {renderCarBrands(selectedRequest.carBrands || [])}
                                    </div>
                                </div>
                            )}

                            {selectedRequest.type === 'MARKETER' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-700 border-b pb-2">بيانات المسوق</h4>
                                    <div>
                                        <label className="text-sm text-slate-500">قنوات التسويق</label>
                                        {renderMarketingChannels(selectedRequest.marketingChannels || [])}
                                    </div>
                                    {selectedRequest.otherChannel && (
                                        <div>
                                            <label className="text-sm text-slate-500">قناة أخرى</label>
                                            <p className="font-bold text-slate-800">{selectedRequest.otherChannel}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedRequest.type === 'ADVERTISER' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-700 border-b pb-2">بيانات المعلن</h4>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500">نوع الإعلان</label>
                                            <p className="font-bold text-slate-800">
                                                {AD_TYPES.find(a => a.id === selectedRequest.adType)?.label || selectedRequest.adType || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500">المدة</label>
                                            <p className="font-bold text-slate-800">{selectedRequest.duration || 0} يوم</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500">تاريخ البداية</label>
                                            <p className="font-bold text-slate-800">{selectedRequest.startDate || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Decision */}
                            <div className="border-t pt-6 space-y-4">
                                <h4 className="font-bold text-slate-700">قرار الإدارة</h4>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-2 block">تغيير الحالة</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_MODIFICATION'] as PartnerRequestStatus[]).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setDecisionStatus(status)}
                                                className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all ${decisionStatus === status
                                                        ? STATUS_COLORS[status] + ' border-current'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                {getStatusLabel(status)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {decisionStatus === 'APPROVED' && selectedRequest.type === 'LOCAL_SUPPLIER' && (
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block">نقاط البحث المبدئية</label>
                                        <input
                                            type="number"
                                            value={searchPoints}
                                            onChange={(e) => setSearchPoints(parseInt(e.target.value) || 0)}
                                            className="w-40 p-2 border border-slate-200 rounded-lg"
                                        />
                                    </div>
                                )}

                                {decisionStatus === 'REJECTED' && (
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block">سبب الرفض</label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full p-3 border border-slate-200 rounded-lg h-20"
                                            placeholder="أدخل سبب رفض الطلب..."
                                        />
                                    </div>
                                )}

                                {decisionStatus === 'NEEDS_MODIFICATION' && (
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-1 block">التعديلات المطلوبة</label>
                                        <textarea
                                            value={modificationNote}
                                            onChange={(e) => setModificationNote(e.target.value)}
                                            className="w-full p-3 border border-slate-200 rounded-lg h-20"
                                            placeholder="حدد التعديلات المطلوبة..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">ملاحظات داخلية</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="w-full p-3 border border-slate-200 rounded-lg h-20"
                                        placeholder="ملاحظات للإدارة (لا تظهر للشريك)..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSaveDecision}
                                className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
                            >
                                <Save size={18} />
                                حفظ القرار
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartnerRequests;
