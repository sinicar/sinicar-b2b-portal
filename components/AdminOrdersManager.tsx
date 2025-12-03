
import React, { useState, useMemo } from 'react';
import { Order, OrderInternalStatus, OrderStatus, User } from '../types';
import { MockApi } from '../services/mockApi';
import { 
    FileText, Search, Filter, Eye, X, ChevronRight, ChevronLeft, 
    Truck, CheckCircle, Clock, Save, History, Edit, AlertCircle, ShoppingBag, Lock
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';
import { usePermission } from '../services/PermissionContext';

interface AdminOrdersManagerProps {
    orders: Order[];
    users: User[];
    onUpdate: () => void;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
    [OrderStatus.PENDING]: 'بانتظار الموافقة',
    [OrderStatus.APPROVED]: 'تم الاعتماد',
    [OrderStatus.SHIPPED]: 'تم الشحن',
    [OrderStatus.DELIVERED]: 'تم التسليم',
    [OrderStatus.REJECTED]: 'مرفوض',
    [OrderStatus.CANCELLED]: 'ملغي'
};

const INTERNAL_STATUS_LABELS: Record<OrderInternalStatus, string> = {
    'NEW': 'طلب جديد',
    'SENT_TO_WAREHOUSE': 'تم الإرسال للمستودع',
    'WAITING_PAYMENT': 'بانتظار التحويل',
    'PAYMENT_CONFIRMED': 'تم تأكيد التحويل',
    'SALES_INVOICE_CREATED': 'فاتورة المبيعات',
    'READY_FOR_SHIPMENT': 'جاهز للشحن',
    'COMPLETED_INTERNAL': 'مكتمل داخليًا',
    'CANCELLED_INTERNAL': 'ملغي داخليًا'
};

const STATUS_COLORS: Record<string, string> = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [OrderStatus.APPROVED]: 'bg-blue-100 text-blue-800',
    [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
    [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
    [OrderStatus.REJECTED]: 'bg-red-100 text-red-800',
    [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    
    'NEW': 'bg-slate-100 text-slate-600',
    'SENT_TO_WAREHOUSE': 'bg-orange-100 text-orange-700',
    'WAITING_PAYMENT': 'bg-amber-100 text-amber-700',
    'PAYMENT_CONFIRMED': 'bg-emerald-100 text-emerald-700',
    'SALES_INVOICE_CREATED': 'bg-cyan-100 text-cyan-700',
    'READY_FOR_SHIPMENT': 'bg-purple-100 text-purple-700',
    'COMPLETED_INTERNAL': 'bg-teal-100 text-teal-800',
    'CANCELLED_INTERNAL': 'bg-pink-100 text-pink-800'
};

export const AdminOrdersManager: React.FC<AdminOrdersManagerProps> = ({ orders, users, onUpdate }) => {
    // Permission checks
    const { hasPermission } = usePermission();
    const canEditOrder = hasPermission('orders', 'edit');
    const canApproveOrder = hasPermission('orders', 'approve');
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [internalFilter, setInternalFilter] = useState<string>('ALL');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Modal
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [internalNote, setInternalNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const { addToast } = useToast();

    // --- Stats ---
    const stats = useMemo(() => ({
        total: orders.length,
        new: orders.filter(o => !o.internalStatus || o.internalStatus === 'NEW').length,
        processing: orders.filter(o => o.status === OrderStatus.APPROVED && o.internalStatus !== 'COMPLETED_INTERNAL').length,
        ready: orders.filter(o => o.internalStatus === 'READY_FOR_SHIPMENT').length
    }), [orders]);

    // --- Filtering ---
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(o => 
                o.id.toLowerCase().includes(lower) || 
                o.createdByName?.toLowerCase().includes(lower) ||
                o.totalAmount.toString().includes(lower)
            );
        }

        if (statusFilter !== 'ALL') {
            result = result.filter(o => o.status === statusFilter);
        }

        if (internalFilter !== 'ALL') {
            result = result.filter(o => (o.internalStatus || 'NEW') === internalFilter);
        }

        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, searchTerm, statusFilter, internalFilter]);

    // --- Pagination ---
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    // --- Handlers ---

    const handleUpdateExternalStatus = async (newStatus: OrderStatus) => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            await MockApi.adminUpdateOrderStatus(selectedOrder.id, newStatus, 'Admin');
            addToast('تم تحديث الحالة الخارجية وإشعار العميل', 'success');
            onUpdate(); // Refresh parent data
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (e) {
            addToast('فشل التحديث', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateInternalStatus = async (newStatus: OrderInternalStatus) => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            await MockApi.updateOrderInternalStatus(selectedOrder.id, newStatus, 'Admin', internalNote);
            addToast('تم تحديث الحالة الداخلية', 'success');
            onUpdate();
            // Update local state to reflect immediately in modal
            const updatedOrder = (await MockApi.getAllOrders()).find(o => o.id === selectedOrder.id);
            if(updatedOrder) setSelectedOrder(updatedOrder);
        } catch (e) {
            addToast('فشل التحديث', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const openDetails = (order: Order) => {
        setSelectedOrder(order);
        setInternalNote(order.internalNotes || '');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">الطلبات الجديدة</p>
                        <p className="text-2xl font-black text-slate-800">{stats.new}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">قيد المعالجة</p>
                        <p className="text-2xl font-black text-slate-800">{stats.processing}</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">جاهز للشحن</p>
                        <p className="text-2xl font-black text-slate-800">{stats.ready}</p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Truck size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">الإجمالي</p>
                        <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-lg"><ShoppingBag size={20}/></div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="بحث برقم الطلب، العميل..." 
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#C8A04F] focus:border-[#C8A04F] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select 
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">الحالة الخارجية (الكل)</option>
                        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <select 
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none"
                        value={internalFilter}
                        onChange={(e) => setInternalFilter(e.target.value)}
                    >
                        <option value="ALL">الحالة الداخلية (الكل)</option>
                        {Object.entries(INTERNAL_STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4">رقم الطلب</th>
                            <th className="p-4">العميل</th>
                            <th className="p-4">التاريخ</th>
                            <th className="p-4">المبلغ</th>
                            <th className="p-4 text-center">الحالة (للعميل)</th>
                            <th className="p-4 text-center">الحالة (داخلي)</th>
                            <th className="p-4 text-center">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {paginatedOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono font-bold text-[#C8A04F]">{order.id}</td>
                                <td className="p-4 font-bold text-slate-700">{order.createdByName || order.userId}</td>
                                <td className="p-4 text-slate-500 text-xs" dir="ltr">{formatDateTime(order.date)}</td>
                                <td className="p-4 font-black text-slate-800">{order.totalAmount.toLocaleString()} ر.س</td>
                                
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[order.status]}`}>
                                        {ORDER_STATUS_LABELS[order.status]}
                                    </span>
                                </td>
                                
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${STATUS_COLORS[order.internalStatus || 'NEW']}`}>
                                        {INTERNAL_STATUS_LABELS[order.internalStatus || 'NEW']}
                                    </span>
                                </td>

                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => openDetails(order)}
                                        className="text-[#0B1B3A] hover:bg-slate-100 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto font-bold text-xs"
                                    >
                                        <Eye size={16} /> التفاصيل
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedOrders.length === 0 && (
                            <tr><td colSpan={7} className="p-10 text-center text-slate-400">لا توجد طلبات مطابقة</td></tr>
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

            {/* Order Details Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={selectedOrder ? `إدارة الطلب #${selectedOrder.id}` : ''}
                maxWidth="max-w-4xl"
            >
                {selectedOrder && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column: Details & Items */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Customer Info Card */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText size={16}/> بيانات العميل</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400 font-bold text-xs uppercase">الاسم</p>
                                        <p className="font-bold text-slate-800">{selectedOrder.createdByName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-xs uppercase">المعرف</p>
                                        <p className="font-mono text-slate-700">{selectedOrder.userId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-slate-100 text-slate-600 font-bold">
                                        <tr>
                                            <th className="p-3">المنتج</th>
                                            <th className="p-3 text-center">الكمية</th>
                                            <th className="p-3 text-center">السعر</th>
                                            <th className="p-3 text-center">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3">
                                                    <p className="font-bold text-slate-800">{item.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{item.partNumber}</p>
                                                </td>
                                                <td className="p-3 text-center font-bold">{item.quantity}</td>
                                                <td className="p-3 text-center">{item.price}</td>
                                                <td className="p-3 text-center font-bold text-[#C8A04F]">{(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-bold text-slate-600">الإجمالي الكلي</span>
                                    <span className="font-black text-xl text-slate-900">{selectedOrder.totalAmount.toLocaleString()} ر.س</span>
                                </div>
                            </div>

                            {/* Internal Timeline */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><History size={16}/> سجل التحديثات الداخلية</h4>
                                <div className="space-y-4 relative before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    {(selectedOrder.internalStatusHistory || []).slice().reverse().map((hist, idx) => (
                                        <div key={idx} className="relative pr-6">
                                            <div className="absolute right-0 top-1 w-4 h-4 bg-slate-200 rounded-full border-2 border-white"></div>
                                            <p className="text-xs text-slate-400 font-mono mb-0.5">{formatDateTime(hist.changedAt)}</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {hist.changedBy}: قام بتغيير الحالة إلى <span className="text-[#C8A04F]">{INTERNAL_STATUS_LABELS[hist.status]}</span>
                                            </p>
                                        </div>
                                    ))}
                                    {(!selectedOrder.internalStatusHistory || selectedOrder.internalStatusHistory.length === 0) && (
                                        <p className="text-center text-slate-400 text-sm">لا يوجد سجل سابق</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions */}
                        <div className="space-y-6">
                            
                            {/* External Status Control */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Eye size={18} className="text-blue-500"/> الحالة للعميل (External)</h4>
                                <p className="text-xs text-slate-500 mb-3">سيتم إشعار العميل عند تغيير هذه الحالة.</p>
                                {canApproveOrder ? (
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 mb-3"
                                        value={selectedOrder.status}
                                        onChange={(e) => handleUpdateExternalStatus(e.target.value as OrderStatus)}
                                        disabled={isUpdating}
                                    >
                                        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-2">
                                        <Lock size={16} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-500">ليس لديك صلاحية تغيير الحالة</span>
                                    </div>
                                )}
                            </div>

                            {/* Internal Status Control */}
                            <div className="bg-[#0B1B3A] p-5 rounded-xl border border-slate-700 shadow-lg text-white">
                                <h4 className="font-bold text-[#C8A04F] mb-3 flex items-center gap-2"><Save size={18}/> الحالة الداخلية (Internal)</h4>
                                <p className="text-xs text-slate-400 mb-3">للاستخدام الإداري فقط. لا يظهر للعميل.</p>
                                {canEditOrder ? (
                                    <>
                                        <select 
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg font-bold text-white mb-3 focus:ring-1 focus:ring-[#C8A04F]"
                                            value={selectedOrder.internalStatus || 'NEW'}
                                            onChange={(e) => handleUpdateInternalStatus(e.target.value as OrderInternalStatus)}
                                            disabled={isUpdating}
                                        >
                                            {Object.entries(INTERNAL_STATUS_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        
                                        <label className="block text-xs font-bold text-slate-400 mb-2 mt-4">ملاحظات داخلية</label>
                                        <textarea 
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-[#C8A04F]"
                                            rows={3}
                                            placeholder="اكتب ملاحظة حول سبب تغيير الحالة..."
                                            value={internalNote}
                                            onChange={(e) => setInternalNote(e.target.value)}
                                        ></textarea>
                                        <button 
                                            onClick={() => handleUpdateInternalStatus(selectedOrder.internalStatus || 'NEW')}
                                            className="w-full mt-3 bg-[#C8A04F] text-[#0B1B3A] py-2 rounded-lg font-bold text-sm hover:bg-[#b08d45] transition-colors"
                                            disabled={isUpdating}
                                        >
                                            حفظ الملاحظات
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 flex items-center gap-2">
                                        <Lock size={16} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-400">ليس لديك صلاحية تعديل الحالة الداخلية</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2"><AlertCircle size={16}/> منطقة الخطر</h4>
                                <button 
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${canApproveOrder ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                    disabled={!canApproveOrder}
                                >
                                    {canApproveOrder ? 'إلغاء الطلب نهائياً' : 'ليس لديك صلاحية'}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
