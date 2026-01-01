/**
 * UnifiedAccountRequestsCenter - مركز طلبات الحسابات الموحد
 * يدمج: AdminAccountRequests + AdminPartnerRequests
 * 
 * أنواع الطلبات:
 * - CUSTOMER: طلبات العملاء (B2B)
 * - LOCAL_SUPPLIER: موردين محليين
 * - INTERNATIONAL_SUPPLIER: موردين دوليين
 * - MARKETER: مسوقين
 * - ADVERTISER: معلنين
 */

import React, { useState, useEffect, useMemo } from 'react';
import Api from '../services/api';
import { useToast } from '../services/ToastContext';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../utils/dateUtils';
import {
    Search, Filter, CheckCircle, XCircle, Clock, Eye, Building2,
    Globe, Megaphone, Sparkles, Phone, MapPin, Car, MessageCircle,
    Save, X, FileText, Users, AlertTriangle, Calendar, Download,
    UserPlus, Briefcase, Shield, RefreshCw, ChevronDown, ExternalLink,
    Image, File, Store, TrendingUp, AlertCircle
} from 'lucide-react';
import {
    AccountOpeningRequest, AccountRequestStatus, PriceLevel,
    BusinessCustomerType, UploadedDocument
} from '../types';
import {
    PARTNER_TYPES, PARTNER_REQUEST_STATUSES, CAR_BRANDS,
    SAUDI_CITIES, MARKETING_CHANNELS, AD_TYPES, COUNTRIES, BUSINESS_TYPES
} from '../utils/partnerConstants';

// ==================== TYPES ====================

type RequestType = 'ALL' | 'CUSTOMER' | 'LOCAL_SUPPLIER' | 'INTERNATIONAL_SUPPLIER' | 'MARKETER' | 'ADVERTISER';
type UnifiedStatus = 'NEW' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ON_HOLD' | 'NEEDS_MODIFICATION';

interface UnifiedRequest {
    id: string;
    type: RequestType;
    status: UnifiedStatus;
    createdAt: string;
    updatedAt?: string;
    phone: string;
    // Common
    name: string;
    city?: string;
    // Customer specific
    businessName?: string;
    category?: string;
    commercialRegNumber?: string;
    vatNumber?: string;
    documents?: UploadedDocument[];
    notes?: string;
    assignedPriceLevel?: PriceLevel;
    assignedCustomerType?: BusinessCustomerType;
    // Supplier specific
    carBrands?: string[];
    ownBrands?: string[];
    country?: string;
    businessType?: string;
    nationalAddressNumber?: string;
    // Marketer specific
    marketingChannels?: string[];
    otherChannel?: string;
    // Advertiser specific
    adType?: string;
    duration?: number;
    startDate?: string;
    // Admin
    adminNotes?: string;
    rejectionReason?: string;
    modificationNote?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    // Customer extras
    searchPointsInitial?: number;
    searchPointsMonthly?: number;
    portalAccessStart?: string;
    portalAccessEnd?: string;
    canCreateStaff?: boolean;
    maxStaffUsers?: number;
}

// ==================== CONSTANTS ====================

const REQUEST_TYPE_CONFIG: Record<RequestType, { label: string; icon: any; color: string; bgColor: string }> = {
    ALL: { label: 'الكل', icon: Users, color: 'text-slate-600', bgColor: 'bg-slate-100' },
    CUSTOMER: { label: 'عملاء', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-500' },
    LOCAL_SUPPLIER: { label: 'موردين محليين', icon: Building2, color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
    INTERNATIONAL_SUPPLIER: { label: 'موردين دوليين', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-500' },
    MARKETER: { label: 'مسوقين', icon: Megaphone, color: 'text-pink-600', bgColor: 'bg-pink-500' },
    ADVERTISER: { label: 'معلنين', icon: Sparkles, color: 'text-amber-600', bgColor: 'bg-amber-500' }
};

const STATUS_CONFIG: Record<UnifiedStatus, { label: string; color: string; icon: any }> = {
    NEW: { label: 'جديد', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
    UNDER_REVIEW: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    APPROVED: { label: 'موافق عليه', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    ON_HOLD: { label: 'معلق', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock },
    NEEDS_MODIFICATION: { label: 'يحتاج تعديل', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle }
};

const PRIORITY_CONFIG = {
    urgent: { label: 'عاجل', color: 'bg-red-500', days: 3 },
    pending: { label: 'يحتاج متابعة', color: 'bg-yellow-500', days: 7 },
    normal: { label: 'عادي', color: 'bg-green-500', days: Infinity }
};

// ==================== MAIN COMPONENT ====================

export const UnifiedAccountRequestsCenter: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();

    // State
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<UnifiedRequest[]>([]);
    const [activeTab, setActiveTab] = useState<RequestType>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
    const [saving, setSaving] = useState(false);

    // Decision form state
    const [decisionForm, setDecisionForm] = useState({
        status: 'UNDER_REVIEW' as UnifiedStatus,
        adminNotes: '',
        rejectionReason: '',
        modificationNote: '',
        // Customer specific
        priceLevel: 'LEVEL_2' as PriceLevel,
        customerType: 'OTHER' as BusinessCustomerType,
        searchPointsInitial: 50,
        searchPointsMonthly: 0,
        portalAccessStart: new Date().toISOString().split('T')[0],
        portalAccessEnd: '',
        openEnded: true,
        canCreateStaff: false,
        maxStaffUsers: 3,
        // Supplier specific
        searchPoints: 100
    });

    // Load data
    useEffect(() => {
        loadAllRequests();
    }, []);

    const loadAllRequests = async () => {
        setLoading(true);
        try {
            // Load both customer and partner requests with individual error handling
            let customerRequests: AccountOpeningRequest[] = [];
            let partnerData: any = { items: [] };

            // Try to load customer requests
            try {
                const result = await Api.getAccountOpeningRequests();
                customerRequests = Array.isArray(result) ? result : [];
            } catch (err) {
                console.warn('Failed to load customer requests:', err);
            }

            // Try to load partner requests
            try {
                const result = await Api.getPartnerRequests({});
                partnerData = result || { items: [] };
            } catch (err) {
                console.warn('Failed to load partner requests:', err);
            }

            // Transform customer requests
            const transformedCustomer: UnifiedRequest[] = customerRequests.map((req: AccountOpeningRequest) => ({
                id: req.id,
                type: 'CUSTOMER' as RequestType,
                status: req.status as UnifiedStatus,
                createdAt: req.createdAt,
                phone: req.phone,
                name: req.businessName || req.fullName || '',
                businessName: req.businessName,
                city: req.city || req.representativeRegion,
                category: req.category,
                commercialRegNumber: req.commercialRegNumber,
                vatNumber: req.vatNumber,
                documents: req.documents,
                notes: req.notes,
                assignedPriceLevel: req.assignedPriceLevel,
                assignedCustomerType: req.assignedCustomerType,
                adminNotes: req.adminNotes,
                searchPointsInitial: req.searchPointsInitial,
                searchPointsMonthly: req.searchPointsMonthly,
                portalAccessStart: req.portalAccessStart,
                portalAccessEnd: req.portalAccessEnd,
                canCreateStaff: req.canCreateStaff,
                maxStaffUsers: req.maxStaffUsers
            }));

            // Transform partner requests
            const partnerItems = Array.isArray(partnerData?.items) ? partnerData.items : 
                                 Array.isArray(partnerData) ? partnerData : [];
            const transformedPartner: UnifiedRequest[] = partnerItems.map((req: any) => ({
                id: req.id,
                type: req.type as RequestType,
                status: req.status as UnifiedStatus,
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
                phone: req.phone,
                name: req.companyName || req.fullName || '',
                city: req.city,
                commercialRegNumber: req.commercialRegNumber,
                vatNumber: req.vatNumber,
                nationalAddressNumber: req.nationalAddressNumber,
                carBrands: req.carBrands,
                ownBrands: req.ownBrands,
                country: req.country,
                businessType: req.businessType,
                marketingChannels: req.marketingChannels,
                otherChannel: req.otherChannel,
                adType: req.adType,
                duration: req.duration,
                startDate: req.startDate,
                adminNotes: req.adminNotes,
                rejectionReason: req.rejectionReason,
                modificationNote: req.modificationNote,
                reviewedAt: req.reviewedAt
            }));

            // Combine and sort by date
            const allRequests = [...transformedCustomer, ...transformedPartner]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setRequests(allRequests);
        } catch (error) {
            console.error('Failed to load requests:', error);
            // Don't show error toast, just set empty requests
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const stats = useMemo(() => {
        const byType: Record<string, number> = { CUSTOMER: 0, LOCAL_SUPPLIER: 0, INTERNATIONAL_SUPPLIER: 0, MARKETER: 0, ADVERTISER: 0 };
        const byStatus: Record<string, number> = { NEW: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, ON_HOLD: 0, NEEDS_MODIFICATION: 0 };

        requests.forEach(req => {
            if (req.type !== 'ALL') byType[req.type] = (byType[req.type] || 0) + 1;
            byStatus[req.status] = (byStatus[req.status] || 0) + 1;
        });

        return { total: requests.length, byType, byStatus };
    }, [requests]);

    // Priority calculation
    const getPriority = (request: UnifiedRequest) => {
        if (request.status !== 'NEW' && request.status !== 'UNDER_REVIEW') return 'normal';
        const daysSinceCreated = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreated >= PRIORITY_CONFIG.urgent.days) return 'urgent';
        if (daysSinceCreated >= 1) return 'pending';
        return 'normal';
    };

    // Filtered requests
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesTab = activeTab === 'ALL' || req.type === activeTab;
            const matchesSearch = !searchTerm ||
                req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.phone.includes(searchTerm);
            const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
            return matchesTab && matchesSearch && matchesStatus;
        });
    }, [requests, activeTab, searchTerm, statusFilter]);

    // Handle view request
    const handleViewRequest = (request: UnifiedRequest) => {
        setSelectedRequest(request);
        setDecisionForm({
            status: request.status === 'NEW' ? 'UNDER_REVIEW' : request.status,
            adminNotes: request.adminNotes || '',
            rejectionReason: request.rejectionReason || '',
            modificationNote: request.modificationNote || '',
            priceLevel: request.assignedPriceLevel || 'LEVEL_2',
            customerType: request.assignedCustomerType || 'OTHER',
            searchPointsInitial: request.searchPointsInitial || 50,
            searchPointsMonthly: request.searchPointsMonthly || 0,
            portalAccessStart: request.portalAccessStart || new Date().toISOString().split('T')[0],
            portalAccessEnd: request.portalAccessEnd || '',
            openEnded: !request.portalAccessEnd,
            canCreateStaff: request.canCreateStaff || false,
            maxStaffUsers: request.maxStaffUsers || 3,
            searchPoints: 100
        });
    };

    // Handle save decision
    const handleSaveDecision = async () => {
        if (!selectedRequest) return;
        setSaving(true);

        try {
            if (selectedRequest.type === 'CUSTOMER') {
                // Customer request
                await Api.reviewAccountRequest(selectedRequest.id, {
                    status: decisionForm.status as AccountRequestStatus,
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
            } else {
                // Partner request
                if (decisionForm.status === 'APPROVED') {
                    await Api.approvePartnerRequest(selectedRequest.id, {
                        searchPoints: decisionForm.searchPoints
                    });
                } else {
                    await Api.updatePartnerRequestStatus(
                        selectedRequest.id,
                        decisionForm.status,
                        decisionForm.adminNotes,
                        decisionForm.rejectionReason,
                        decisionForm.modificationNote
                    );
                }
            }

            addToast('تم حفظ القرار بنجاح', 'success');
            setSelectedRequest(null);
            loadAllRequests();
        } catch (error) {
            console.error('Failed to save decision:', error);
            addToast('فشل في حفظ القرار', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Export to Excel
    const handleExport = () => {
        const headers = ['النوع', 'الاسم', 'الجوال', 'المدينة', 'الحالة', 'التاريخ'];
        const rows = filteredRequests.map(req => [
            REQUEST_TYPE_CONFIG[req.type]?.label || req.type,
            req.name,
            req.phone,
            req.city || '-',
            STATUS_CONFIG[req.status]?.label || req.status,
            formatDateTime(req.createdAt)
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `account_requests_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        addToast('تم تصدير البيانات', 'success');
    };

    // Render car brands
    const renderCarBrands = (brands?: string[]) => {
        if (!brands || brands.length === 0) return <span className="text-slate-400">-</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {brands.slice(0, 2).map(brandId => {
                    const brand = CAR_BRANDS.find(b => b.id === brandId);
                    return (
                        <span key={brandId} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            {brand?.label || brandId}
                        </span>
                    );
                })}
                {brands.length > 2 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                        +{brands.length - 2}
                    </span>
                )}
            </div>
        );
    };

    // Render marketing channels
    const renderMarketingChannels = (channels?: string[]) => {
        if (!channels || channels.length === 0) return <span className="text-slate-400">-</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {channels.slice(0, 2).map(channelId => {
                    const channel = MARKETING_CHANNELS.find(c => c.id === channelId);
                    return (
                        <span key={channelId} className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                            {channel?.label || channelId}
                        </span>
                    );
                })}
                {channels.length > 2 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                        +{channels.length - 2}
                    </span>
                )}
            </div>
        );
    };

    // Get request details based on type
    const getRequestDetails = (request: UnifiedRequest) => {
        switch (request.type) {
            case 'CUSTOMER':
                return request.category || '-';
            case 'LOCAL_SUPPLIER':
                return renderCarBrands(request.carBrands);
            case 'INTERNATIONAL_SUPPLIER':
                const country = COUNTRIES.find(c => c.code === request.country);
                return country?.label || request.country || '-';
            case 'MARKETER':
                return renderMarketingChannels(request.marketingChannels);
            case 'ADVERTISER':
                const adType = AD_TYPES.find(a => a.id === request.adType);
                return `${adType?.label || request.adType} - ${request.duration || 0} يوم`;
            default:
                return '-';
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw className="animate-spin text-[#C8A04F] mx-auto mb-4" size={40} />
                    <p className="text-slate-500 font-bold">جاري تحميل الطلبات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#0B1B3A] to-[#1a2e56] rounded-xl">
                            <UserPlus className="text-[#C8A04F]" size={24} />
                        </div>
                        مركز طلبات فتح الحسابات
                    </h1>
                    <p className="text-slate-500 mt-1">إدارة طلبات العملاء والموردين والمسوقين والمعلنين</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadAllRequests}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                        title="تحديث"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                    >
                        <Download size={18} />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {['NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(status => {
                    const config = STATUS_CONFIG[status as UnifiedStatus];
                    const Icon = config.icon;
                    return (
                        <div key={status} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${config.color.replace('text-', 'bg-').replace('-700', '-100')}`}>
                                    <Icon size={18} className={config.color.split(' ')[1]} />
                                </div>
                                <span className="text-2xl font-black text-slate-800">{stats.byStatus[status] || 0}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-500">{config.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Type Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto border-b border-slate-200">
                    {(Object.keys(REQUEST_TYPE_CONFIG) as RequestType[]).map(type => {
                        const config = REQUEST_TYPE_CONFIG[type];
                        const Icon = config.icon;
                        const count = type === 'ALL' ? stats.total : (stats.byType[type] || 0);
                        const isActive = activeTab === type;

                        return (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`flex items-center gap-2 px-5 py-4 font-bold whitespace-nowrap transition-all border-b-2 ${isActive
                                        ? 'border-[#C8A04F] text-[#0B1B3A] bg-slate-50'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? config.color : ''} />
                                {config.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-[#C8A04F] text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث بالاسم أو رقم الجوال..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#C8A04F]"
                        >
                            <option value="ALL">جميع الحالات</option>
                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">الأولوية</th>
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
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <Users size={48} className="mx-auto mb-3 opacity-50" />
                                        <p className="font-bold">لا توجد طلبات مطابقة</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map(request => {
                                    const typeConfig = REQUEST_TYPE_CONFIG[request.type];
                                    const TypeIcon = typeConfig?.icon || Users;
                                    const statusConfig = STATUS_CONFIG[request.status];
                                    const priority = getPriority(request);
                                    const priorityConfig = PRIORITY_CONFIG[priority];

                                    return (
                                        <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className={`w-2 h-2 rounded-full ${priorityConfig.color}`} title={priorityConfig.label} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${typeConfig?.bgColor || 'bg-slate-500'} text-white`}>
                                                        <TypeIcon size={14} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{typeConfig?.label || request.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-800">{request.name || '-'}</p>
                                                {request.city && (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin size={10} /> {request.city}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-slate-600 font-mono" dir="ltr">{request.phone}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getRequestDetails(request)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusConfig?.color || ''}`}>
                                                    {statusConfig?.label || request.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-slate-500">{formatDateTime(request.createdAt)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleViewRequest(request)}
                                                    className="p-2 text-[#C8A04F] hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="عرض التفاصيل"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        إجمالي الطلبات: <span className="font-bold text-slate-700">{stats.total}</span>
                        {filteredRequests.length !== stats.total && (
                            <span className="mr-2">• نتائج البحث: <span className="font-bold text-slate-700">{filteredRequests.length}</span></span>
                        )}
                    </p>
                    <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">
                            جديد: {stats.byStatus.NEW || 0}
                        </span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-bold">
                            قيد المراجعة: {stats.byStatus.UNDER_REVIEW || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Request Details Slide-over */}
            {selectedRequest && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setSelectedRequest(null)}
                    />
                    <div className="fixed inset-y-0 left-0 w-full md:w-[650px] bg-slate-50 z-50 shadow-2xl flex flex-col">
                        {/* Panel Header */}
                        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${REQUEST_TYPE_CONFIG[selectedRequest.type]?.bgColor || 'bg-slate-500'} text-white`}>
                                    {React.createElement(REQUEST_TYPE_CONFIG[selectedRequest.type]?.icon || Users, { size: 24 })}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{selectedRequest.name}</h3>
                                    <p className="text-sm text-slate-500">{REQUEST_TYPE_CONFIG[selectedRequest.type]?.label}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                    <FileText size={18} className="text-blue-600" />
                                    البيانات الأساسية
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">رقم الجوال</span>
                                        <span className="font-bold text-slate-800 font-mono" dir="ltr">{selectedRequest.phone}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase">تاريخ الطلب</span>
                                        <span className="font-bold text-slate-800">{formatDateTime(selectedRequest.createdAt)}</span>
                                    </div>
                                    {selectedRequest.city && (
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase">المدينة</span>
                                            <span className="font-bold text-slate-800">{selectedRequest.city}</span>
                                        </div>
                                    )}
                                    {selectedRequest.commercialRegNumber && (
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase">السجل التجاري</span>
                                            <span className="font-mono text-slate-800">{selectedRequest.commercialRegNumber}</span>
                                        </div>
                                    )}
                                    {selectedRequest.vatNumber && (
                                        <div>
                                            <span className="block text-xs font-bold text-slate-400 uppercase">الرقم الضريبي</span>
                                            <span className="font-mono text-slate-800">{selectedRequest.vatNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Type-specific Details */}
                            {selectedRequest.type === 'CUSTOMER' && selectedRequest.documents && selectedRequest.documents.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                        <File size={18} className="text-purple-600" />
                                        المستندات المرفقة ({selectedRequest.documents.length})
                                    </h4>
                                    <div className="grid gap-2">
                                        {selectedRequest.documents.map(doc => (
                                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.fileType.startsWith('image/') ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                                    {doc.fileType.startsWith('image/') ? <Image size={16} /> : <File size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 truncate">{doc.type}</p>
                                                    <p className="text-xs text-slate-500">{doc.name}</p>
                                                </div>
                                                {doc.base64Data && (
                                                    <a
                                                        href={doc.base64Data}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-purple-100 rounded-lg text-purple-600 hover:bg-purple-200"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(selectedRequest.type === 'LOCAL_SUPPLIER' || selectedRequest.type === 'INTERNATIONAL_SUPPLIER') && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                        <Car size={18} className="text-emerald-600" />
                                        بيانات المورد
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedRequest.type === 'INTERNATIONAL_SUPPLIER' && selectedRequest.country && (
                                            <div>
                                                <span className="text-xs text-slate-500">البلد</span>
                                                <p className="font-bold text-slate-800">
                                                    {COUNTRIES.find(c => c.code === selectedRequest.country)?.label || selectedRequest.country}
                                                </p>
                                            </div>
                                        )}
                                        {selectedRequest.carBrands && selectedRequest.carBrands.length > 0 && (
                                            <div>
                                                <span className="text-xs text-slate-500">ماركات السيارات</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {selectedRequest.carBrands.map(brandId => {
                                                        const brand = CAR_BRANDS.find(b => b.id === brandId);
                                                        return (
                                                            <span key={brandId} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                                {brand?.label || brandId}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedRequest.type === 'MARKETER' && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                        <Megaphone size={18} className="text-pink-600" />
                                        بيانات المسوق
                                    </h4>
                                    {selectedRequest.marketingChannels && selectedRequest.marketingChannels.length > 0 && (
                                        <div>
                                            <span className="text-xs text-slate-500">قنوات التسويق</span>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {selectedRequest.marketingChannels.map(channelId => {
                                                    const channel = MARKETING_CHANNELS.find(c => c.id === channelId);
                                                    return (
                                                        <span key={channelId} className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                                                            {channel?.label || channelId}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedRequest.type === 'ADVERTISER' && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
                                        <Sparkles size={18} className="text-amber-600" />
                                        بيانات المعلن
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-xs text-slate-500">نوع الإعلان</span>
                                            <p className="font-bold text-slate-800">
                                                {AD_TYPES.find(a => a.id === selectedRequest.adType)?.label || selectedRequest.adType}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">المدة</span>
                                            <p className="font-bold text-slate-800">{selectedRequest.duration || 0} يوم</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-slate-500">تاريخ البداية</span>
                                            <p className="font-bold text-slate-800">{selectedRequest.startDate || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Decision */}
                            <div className="bg-[#0B1B3A] p-6 rounded-2xl text-white space-y-5">
                                <h4 className="font-bold text-[#C8A04F] flex items-center gap-2 border-b border-slate-700 pb-2">
                                    <Shield size={18} />
                                    قرار الإدارة
                                </h4>

                                {/* Status Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2">تغيير الحالة</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_MODIFICATION'] as UnifiedStatus[]).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setDecisionForm({ ...decisionForm, status })}
                                                className={`px-4 py-2 rounded-lg border-2 font-bold text-sm transition-all ${decisionForm.status === status
                                                        ? STATUS_CONFIG[status].color + ' border-current'
                                                        : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                                    }`}
                                            >
                                                {STATUS_CONFIG[status].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Customer-specific options */}
                                {selectedRequest.type === 'CUSTOMER' && decisionForm.status === 'APPROVED' && (
                                    <div className="p-4 bg-slate-800/50 rounded-xl space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1">تصنيف العميل</label>
                                                <select
                                                    value={decisionForm.customerType}
                                                    onChange={e => setDecisionForm({ ...decisionForm, customerType: e.target.value as BusinessCustomerType })}
                                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-sm"
                                                >
                                                    <option value="PARTS_SHOP">محل قطع غيار</option>
                                                    <option value="RENTAL_COMPANY">شركة تأجير</option>
                                                    <option value="INSURANCE_COMPANY">شركة تأمين</option>
                                                    <option value="SALES_AGENT">مندوب</option>
                                                    <option value="FLEET_CUSTOMER">أسطول</option>
                                                    <option value="OTHER">أخرى</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-400 mb-1">مستوى التسعير</label>
                                                <select
                                                    value={decisionForm.priceLevel}
                                                    onChange={e => setDecisionForm({ ...decisionForm, priceLevel: e.target.value as PriceLevel })}
                                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-sm"
                                                >
                                                    <option value="LEVEL_1">Level 1 (VIP)</option>
                                                    <option value="LEVEL_2">Level 2 (Wholesale)</option>
                                                    <option value="LEVEL_3">Level 3 (Retail)</option>
                                                    <option value="SPECIAL">Special</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs text-slate-400 mb-1">نقاط البحث الأولية</label>
                                                <input
                                                    type="number"
                                                    value={decisionForm.searchPointsInitial}
                                                    onChange={e => setDecisionForm({ ...decisionForm, searchPointsInitial: parseInt(e.target.value) })}
                                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-sm"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs text-slate-400 mb-1">التجديد الشهري</label>
                                                <input
                                                    type="number"
                                                    value={decisionForm.searchPointsMonthly}
                                                    onChange={e => setDecisionForm({ ...decisionForm, searchPointsMonthly: parseInt(e.target.value) })}
                                                    className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Supplier-specific options */}
                                {(selectedRequest.type === 'LOCAL_SUPPLIER' || selectedRequest.type === 'INTERNATIONAL_SUPPLIER') && decisionForm.status === 'APPROVED' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">نقاط البحث المبدئية</label>
                                        <input
                                            type="number"
                                            value={decisionForm.searchPoints}
                                            onChange={e => setDecisionForm({ ...decisionForm, searchPoints: parseInt(e.target.value) })}
                                            className="w-40 p-2 bg-slate-800 border border-slate-600 rounded-lg"
                                        />
                                    </div>
                                )}

                                {/* Rejection reason */}
                                {decisionForm.status === 'REJECTED' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">سبب الرفض</label>
                                        <textarea
                                            value={decisionForm.rejectionReason}
                                            onChange={e => setDecisionForm({ ...decisionForm, rejectionReason: e.target.value })}
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg h-20 text-sm"
                                            placeholder="أدخل سبب رفض الطلب..."
                                        />
                                    </div>
                                )}

                                {/* Modification note */}
                                {decisionForm.status === 'NEEDS_MODIFICATION' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">التعديلات المطلوبة</label>
                                        <textarea
                                            value={decisionForm.modificationNote}
                                            onChange={e => setDecisionForm({ ...decisionForm, modificationNote: e.target.value })}
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg h-20 text-sm"
                                            placeholder="حدد التعديلات المطلوبة..."
                                        />
                                    </div>
                                )}

                                {/* Admin notes */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1">ملاحظات داخلية</label>
                                    <textarea
                                        value={decisionForm.adminNotes}
                                        onChange={e => setDecisionForm({ ...decisionForm, adminNotes: e.target.value })}
                                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg h-16 text-sm"
                                        placeholder="ملاحظات للإدارة (لا تظهر للعميل)..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Panel Footer */}
                        <div className="p-6 bg-white border-t border-slate-200 flex gap-4">
                            <button
                                onClick={handleSaveDecision}
                                disabled={saving}
                                className="flex-1 bg-[#0B1B3A] text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                حفظ القرار
                            </button>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UnifiedAccountRequestsCenter;
