import React, { useState, useMemo, useEffect } from 'react';
import { MockApi } from '../services/mockApi';
import { OrderShortage, OrderShortageStatus } from '../types/order';
import {
    Search, Filter, Download, ChevronRight, ChevronLeft, Eye,
    X, Save, CheckCircle, Clock, Phone, Truck,
    Package, AlertCircle, RefreshCw, User
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';
import { useTranslation } from 'react-i18next';

interface AdminOrderShortagesPageProps {
    onRefresh?: () => void;
}

const STATUS_CONFIG: Record<OrderShortageStatus, { label: string; color: string; bgColor: string }> = {
    'NEW': { label: 'جديد', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
    'CONTACTING': { label: 'جاري التواصل', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
    'CONFIRMED': { label: 'تم التأكيد', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
    'PREPARING': { label: 'قيد التحضير', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
    'RECEIVED': { label: 'تم الاستلام', color: 'text-teal-700', bgColor: 'bg-teal-50 border-teal-200' },
    'DELIVERED': { label: 'تم التسليم', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
    'CANCELLED': { label: 'ملغي', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' }
};

export const AdminOrderShortagesPage: React.FC<AdminOrderShortagesPageProps> = ({ onRefresh }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();

    // Data
    const [shortages, setShortages] = useState<OrderShortage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    // Selected item panel
    const [selectedShortage, setSelectedShortage] = useState<OrderShortage | null>(null);
    const [editForm, setEditForm] = useState<{ status: OrderShortageStatus; internalNotes: string }>({
        status: 'NEW',
        internalNotes: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Load data
    useEffect(() => {
        loadShortages();
    }, []);

    const loadShortages = async () => {
        setIsLoading(true);
        try {
            const data = await MockApi.getOrderShortages();
            setShortages(data);
        } catch (error) {
            console.error('Error loading shortages:', error);
            addToast('فشل تحميل البيانات', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Stats
    const stats = useMemo(() => ({
        total: shortages.length,
        new: shortages.filter(s => s.status === 'NEW').length,
        contacting: shortages.filter(s => s.status === 'CONTACTING').length,
        preparing: shortages.filter(s => s.status === 'PREPARING' || s.status === 'CONFIRMED').length,
        received: shortages.filter(s => s.status === 'RECEIVED').length,
        delivered: shortages.filter(s => s.status === 'DELIVERED').length
    }), [shortages]);

    // Filtering
    const filteredShortages = useMemo(() => {
        let result = [...shortages];

        // Text search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.partNumber.toLowerCase().includes(lower) ||
                s.productName.toLowerCase().includes(lower) ||
                s.customerName.toLowerCase().includes(lower) ||
                s.supplierName.toLowerCase().includes(lower)
            );
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            result = result.filter(s => s.status === statusFilter);
        }

        // Sort by date (newest first)
        return result.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [shortages, searchTerm, statusFilter]);

    // Pagination
    const paginatedShortages = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredShortages.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredShortages, currentPage]);

    const totalPages = Math.ceil(filteredShortages.length / ITEMS_PER_PAGE);

    // Handlers
    const handleViewDetails = (shortage: OrderShortage) => {
        setSelectedShortage(shortage);
        setEditForm({
            status: shortage.status,
            internalNotes: shortage.internalNotes || ''
        });
    };

    const handleSaveStatus = async () => {
        if (!selectedShortage) return;
        setIsSaving(true);

        try {
            await MockApi.updateOrderShortageStatus(
                selectedShortage.id,
                editForm.status,
                editForm.internalNotes,
                'Admin'
            );

            // Update local state
            setShortages(prev => prev.map(s =>
                s.id === selectedShortage.id
                    ? { ...s, status: editForm.status, internalNotes: editForm.internalNotes }
                    : s
            ));

            addToast('تم تحديث الحالة بنجاح', 'success');
            setSelectedShortage(null);
            onRefresh?.();
        } catch (error) {
            addToast('فشل تحديث الحالة', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const { utils, writeFile } = await import('xlsx');
            const data = filteredShortages.map(s => ({
                'رقم القطعة': s.partNumber,
                'اسم المنتج': s.productName,
                'العميل': s.customerName,
                'المورد': s.supplierName,
                'الكمية': s.quantity,
                'السعر': s.unitPrice,
                'الحالة': STATUS_CONFIG[s.status]?.label || s.status,
                'وقت التوصيل': `${s.deliveryHours} ساعة`,
                'تاريخ الطلب': formatDateTime(s.createdAt)
            }));

            const ws = utils.json_to_sheet(data);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Order Shortages");
            writeFile(wb, "نواقص_الطلبيات.xlsx");
            addToast('تم تصدير الملف بنجاح', 'success');
        } catch (error) {
            addToast('فشل تصدير الملف', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-brand-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">الإجمالي</p>
                    <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">جديد</p>
                    <p className="text-2xl font-black text-blue-600">{stats.new}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-xs font-bold text-yellow-500 uppercase mb-1">جاري التواصل</p>
                    <p className="text-2xl font-black text-yellow-600">{stats.contacting}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <p className="text-xs font-bold text-orange-500 uppercase mb-1">قيد التحضير</p>
                    <p className="text-2xl font-black text-orange-600">{stats.preparing}</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
                    <p className="text-xs font-bold text-teal-500 uppercase mb-1">تم الاستلام</p>
                    <p className="text-2xl font-black text-teal-600">{stats.received}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-xs font-bold text-green-500 uppercase mb-1">تم التسليم</p>
                    <p className="text-2xl font-black text-green-600">{stats.delivered}</p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث برقم القطعة، المنتج، العميل..."
                            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">كل الحالات</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Download size={16} /> Excel
                    </button>
                    <button
                        onClick={loadShortages}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} /> تحديث
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4">رقم القطعة</th>
                            <th className="p-4">المنتج</th>
                            <th className="p-4">العميل</th>
                            <th className="p-4">المورد</th>
                            <th className="p-4 text-center">الكمية</th>
                            <th className="p-4 text-center">وقت التوصيل</th>
                            <th className="p-4 text-center">الحالة</th>
                            <th className="p-4 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedShortages.map(shortage => (
                            <tr key={shortage.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <span className="font-mono font-bold text-brand-700">{shortage.partNumber}</span>
                                </td>
                                <td className="p-4">
                                    <span className="font-bold text-slate-800 line-clamp-1">{shortage.productName}</span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        <span className="font-bold text-slate-700">{shortage.customerName}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{shortage.supplierName}</span>
                                        {shortage.supplierContact && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Phone size={10} /> {shortage.supplierContact}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="font-black text-slate-800">{shortage.quantity}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                        {shortage.deliveryHours} ساعة
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${STATUS_CONFIG[shortage.status]?.bgColor} ${STATUS_CONFIG[shortage.status]?.color}`}>
                                        {STATUS_CONFIG[shortage.status]?.label || shortage.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleViewDetails(shortage)}
                                        className="text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto font-bold text-xs"
                                    >
                                        <Eye size={16} /> تفاصيل
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedShortages.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-16 text-center text-slate-400 font-bold">
                                    {shortages.length === 0 ? 'لا توجد طلبيات حتى الآن' : 'لا توجد نتائج مطابقة'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <span className="text-sm font-bold text-slate-600">صفحة {currentPage} من {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 rounded-lg border bg-white disabled:opacity-50 hover:bg-slate-50"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            )}

            {/* Detail Panel */}
            {selectedShortage && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setSelectedShortage(null)}></div>
                    <div className="fixed inset-y-0 left-0 w-full md:w-[500px] bg-slate-50 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-200 flex flex-col">

                        {/* Header */}
                        <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">تفاصيل الطلبية</h3>
                                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedShortage.id}</p>
                            </div>
                            <button onClick={() => setSelectedShortage(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Product Info */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="mb-4">
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">رقم القطعة</span>
                                    <span className="block text-2xl font-black text-brand-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                                        {selectedShortage.partNumber}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">اسم المنتج</span>
                                        <span className="font-bold text-slate-800">{selectedShortage.productName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-slate-400 uppercase mb-1">الكمية</span>
                                        <span className="font-bold text-slate-800">{selectedShortage.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Supplier Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-400 uppercase mb-2">العميل</p>
                                    <p className="font-bold text-blue-700">{selectedShortage.customerName}</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <p className="text-xs font-bold text-purple-400 uppercase mb-2">المورد</p>
                                    <p className="font-bold text-purple-700">{selectedShortage.supplierName}</p>
                                    {selectedShortage.supplierContact && (
                                        <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                                            <Phone size={10} /> {selectedShortage.supplierContact}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <div className="flex items-center gap-3">
                                    <Truck className="text-amber-600" size={24} />
                                    <div>
                                        <p className="text-xs font-bold text-amber-500">وقت التوصيل المتوقع</p>
                                        <p className="text-lg font-black text-amber-700">{selectedShortage.deliveryHours} ساعة</p>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Actions */}
                            <div className="bg-[#0B1B3A] p-6 rounded-2xl border border-slate-700 shadow-lg text-white space-y-4">
                                <h4 className="font-bold text-[#C8A04F] flex items-center gap-2 border-b border-slate-700 pb-2">
                                    <AlertCircle size={18} /> تحديث الحالة
                                </h4>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2">الحالة الجديدة</label>
                                    <select
                                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white font-bold focus:ring-1 focus:ring-[#C8A04F]"
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as OrderShortageStatus })}
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                            <option key={key} value={key}>{config.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2">ملاحظات داخلية</label>
                                    <textarea
                                        rows={3}
                                        className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:border-[#C8A04F] focus:outline-none"
                                        placeholder="ملاحظات حول هذه الطلبية..."
                                        value={editForm.internalNotes}
                                        onChange={(e) => setEditForm({ ...editForm, internalNotes: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Status History */}
                            {selectedShortage.statusHistory && selectedShortage.statusHistory.length > 0 && (
                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Clock size={16} /> سجل الحالات
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedShortage.statusHistory.map((h, i) => (
                                            <div key={i} className="flex items-start gap-3 text-sm border-b border-slate-50 pb-2 last:border-0">
                                                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2"></div>
                                                <div>
                                                    <span className="font-bold text-slate-700">{STATUS_CONFIG[h.status as OrderShortageStatus]?.label || h.status}</span>
                                                    <p className="text-xs text-slate-500">{formatDateTime(h.changedAt)} - {h.changedBy}</p>
                                                    {h.notes && <p className="text-xs text-slate-400 mt-1">{h.notes}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white border-t border-slate-200 shadow-up flex gap-4">
                            <button
                                onClick={handleSaveStatus}
                                disabled={isSaving}
                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                <Save size={18} /> {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                            <button
                                onClick={() => setSelectedShortage(null)}
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
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

export default AdminOrderShortagesPage;
