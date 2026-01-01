import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Order, OrderInternalStatus, OrderStatus, User } from '../types';
import Api from '../services/api';
import { normalizeListResponse } from '../services/normalize';
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
    const { t } = useTranslation();
    
    const ORDER_STATUS_LABELS: Record<string, string> = {
        [OrderStatus.PENDING]: t('adminOrders.statusLabels.pending'),
        [OrderStatus.APPROVED]: t('adminOrders.statusLabels.approved'),
        [OrderStatus.SHIPPED]: t('adminOrders.statusLabels.shipped'),
        [OrderStatus.DELIVERED]: t('adminOrders.statusLabels.delivered'),
        [OrderStatus.REJECTED]: t('adminOrders.statusLabels.rejected'),
        [OrderStatus.CANCELLED]: t('adminOrders.statusLabels.cancelled')
    };

    const INTERNAL_STATUS_LABELS: Record<OrderInternalStatus, string> = {
        'NEW': t('adminOrders.internalStatusLabels.new'),
        'SENT_TO_WAREHOUSE': t('adminOrders.internalStatusLabels.sentToWarehouse'),
        'WAITING_PAYMENT': t('adminOrders.internalStatusLabels.waitingPayment'),
        'PAYMENT_CONFIRMED': t('adminOrders.internalStatusLabels.paymentConfirmed'),
        'SALES_INVOICE_CREATED': t('adminOrders.internalStatusLabels.salesInvoiceCreated'),
        'READY_FOR_SHIPMENT': t('adminOrders.internalStatusLabels.readyForShipment'),
        'COMPLETED_INTERNAL': t('adminOrders.internalStatusLabels.completedInternal'),
        'CANCELLED_INTERNAL': t('adminOrders.internalStatusLabels.cancelledInternal')
    };
    
    const { hasPermission } = usePermission();
    const canEditOrder = hasPermission('orders', 'edit');
    const canApproveOrder = hasPermission('orders', 'approve');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [internalFilter, setInternalFilter] = useState<string>('ALL');
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [internalNote, setInternalNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const { addToast } = useToast();

    const stats = useMemo(() => ({
        total: orders.length,
        new: orders.filter(o => !o.internalStatus || o.internalStatus === 'NEW').length,
        processing: orders.filter(o => o.status === OrderStatus.APPROVED && o.internalStatus !== 'COMPLETED_INTERNAL').length,
        ready: orders.filter(o => o.internalStatus === 'READY_FOR_SHIPMENT').length
    }), [orders]);

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

    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    const handleUpdateExternalStatus = async (newStatus: OrderStatus) => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            await Api.adminUpdateOrderStatus(selectedOrder.id, newStatus, 'Admin');
            addToast(t('adminOrders.externalStatusUpdated'), 'success');
            onUpdate();
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (e) {
            addToast(t('adminOrders.updateFailed'), 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateInternalStatus = async (newStatus: OrderInternalStatus) => {
        if (!selectedOrder) return;
        setIsUpdating(true);
        try {
            await Api.updateOrderInternalStatus(selectedOrder.id, newStatus, 'Admin', internalNote);
            addToast(t('adminOrders.internalStatusUpdated'), 'success');
            onUpdate();
            // استخدام normalizeListResponse للحصول على array آمن
            const { items: allOrders } = normalizeListResponse<Order>(await Api.getAllOrders());
            const updatedOrder = allOrders.find(o => o.id === selectedOrder.id);
            if(updatedOrder) setSelectedOrder(updatedOrder);
        } catch (e) {
            addToast(t('adminOrders.updateFailed'), 'error');
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">{t('adminOrders.newOrders')}</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.new}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FileText size={20}/></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">{t('adminOrders.inProgress')}</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.processing}</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Clock size={20}/></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">{t('adminOrders.readyToShip')}</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.ready}</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Truck size={20}/></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">{t('adminOrders.totalOrders')}</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><ShoppingBag size={20}/></div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-10">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('adminOrders.searchOrder')}
                        className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#C8A04F] focus:border-[#C8A04F] transition-all text-slate-800 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        data-testid="input-order-search"
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <select 
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-white focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        data-testid="select-status-filter"
                    >
                        <option value="ALL">{t('adminOrders.allStatuses')}</option>
                        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <select 
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-white focus:outline-none"
                        value={internalFilter}
                        onChange={(e) => setInternalFilter(e.target.value)}
                        data-testid="select-internal-status-filter"
                    >
                        <option value="ALL">{t('adminOrders.allInternalStatuses')}</option>
                        {Object.entries(INTERNAL_STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm min-h-[400px]">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4">{t('adminOrders.orderNumber')}</th>
                            <th className="p-4">{t('adminOrders.customer')}</th>
                            <th className="p-4">{t('adminOrders.date')}</th>
                            <th className="p-4">{t('adminOrders.total')}</th>
                            <th className="p-4 text-center">{t('adminOrders.status')}</th>
                            <th className="p-4 text-center">{t('adminOrders.internalStatus')}</th>
                            <th className="p-4 text-center">{t('adminOrders.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {paginatedOrders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="p-4 font-mono font-bold text-[#C8A04F]">{order.id}</td>
                                <td className="p-4 font-bold text-slate-700 dark:text-slate-200">{order.createdByName || order.userId}</td>
                                <td className="p-4 text-slate-500 dark:text-slate-400 text-xs" dir="ltr">{formatDateTime(order.date)}</td>
                                <td className="p-4 font-black text-slate-800 dark:text-white">{order.totalAmount.toLocaleString()} {t('common.currency')}</td>
                                
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
                                        className="text-[#0B1B3A] dark:text-[#C8A04F] hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto font-bold text-xs"
                                        data-testid={`button-view-order-${order.id}`}
                                    >
                                        <Eye size={16} /> {t('adminOrders.details')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedOrders.length === 0 && (
                            <tr><td colSpan={7} className="p-10 text-center text-slate-400">{t('adminOrders.noOrders')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-2 rounded-lg border bg-white dark:bg-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600"
                        data-testid="button-prev-page"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                    </span>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-2 rounded-lg border bg-white dark:bg-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600"
                        data-testid="button-next-page"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>
            )}

            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={selectedOrder ? `${t('adminOrders.orderDetails')} #${selectedOrder.id}` : ''}
                maxWidth="max-w-4xl"
            >
                {selectedOrder && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <div className="lg:col-span-2 space-y-6">
                            
                            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><FileText size={16}/> {t('adminOrders.customerInfo')}</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400 font-bold text-xs uppercase">{t('adminOrders.name')}</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{selectedOrder.createdByName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold text-xs uppercase">{t('adminOrders.userId')}</p>
                                        <p className="font-mono text-slate-700 dark:text-slate-300">{selectedOrder.userId}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                                        <tr>
                                            <th className="p-3">{t('adminOrders.product')}</th>
                                            <th className="p-3 text-center">{t('adminOrders.quantity')}</th>
                                            <th className="p-3 text-center">{t('adminOrders.price')}</th>
                                            <th className="p-3 text-center">{t('adminOrders.itemTotal')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-600">
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3">
                                                    <p className="font-bold text-slate-800 dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.partNumber}</p>
                                                </td>
                                                <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-200">{item.quantity}</td>
                                                <td className="p-3 text-center text-slate-700 dark:text-slate-200">{item.price}</td>
                                                <td className="p-3 text-center font-bold text-[#C8A04F]">{(item.price * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600 flex justify-between items-center">
                                    <span className="font-bold text-slate-600 dark:text-slate-300">{t('adminOrders.grandTotal')}</span>
                                    <span className="font-black text-xl text-slate-900 dark:text-white">{selectedOrder.totalAmount.toLocaleString()} {t('common.currency')}</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><History size={16}/> {t('adminOrders.statusHistory')}</h4>
                                <div className="space-y-4 relative before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
                                    {(selectedOrder.internalStatusHistory || []).slice().reverse().map((hist, idx) => (
                                        <div key={idx} className="relative pr-6">
                                            <div className="absolute right-0 top-1 w-4 h-4 bg-slate-200 dark:bg-slate-600 rounded-full border-2 border-white dark:border-slate-800"></div>
                                            <p className="text-xs text-slate-400 font-mono mb-0.5">{formatDateTime(hist.changedAt)}</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                {hist.changedBy}: {t('adminOrders.changedStatusTo')} <span className="text-[#C8A04F]">{INTERNAL_STATUS_LABELS[hist.status]}</span>
                                            </p>
                                        </div>
                                    ))}
                                    {(!selectedOrder.internalStatusHistory || selectedOrder.internalStatusHistory.length === 0) && (
                                        <p className="text-center text-slate-400 text-sm">{t('adminOrders.noHistory')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Eye size={18} className="text-blue-500"/> {t('adminOrders.externalStatus')}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('adminOrders.externalStatusDesc')}</p>
                                {canApproveOrder ? (
                                    <select 
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-bold text-slate-700 dark:text-white mb-3"
                                        value={selectedOrder.status}
                                        onChange={(e) => handleUpdateExternalStatus(e.target.value as OrderStatus)}
                                        disabled={isUpdating}
                                        data-testid="select-external-status"
                                    >
                                        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                                        <Lock size={16} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{t('adminOrders.noStatusPermission')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#0B1B3A] p-5 rounded-xl border border-slate-700 shadow-lg text-white">
                                <h4 className="font-bold text-[#C8A04F] mb-3 flex items-center gap-2"><Save size={18}/> {t('adminOrders.internalStatusTitle')}</h4>
                                <p className="text-xs text-slate-400 mb-3">{t('adminOrders.internalStatusDesc')}</p>
                                {canEditOrder ? (
                                    <>
                                        <select 
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg font-bold text-white mb-3 focus:ring-1 focus:ring-[#C8A04F]"
                                            value={selectedOrder.internalStatus || 'NEW'}
                                            onChange={(e) => handleUpdateInternalStatus(e.target.value as OrderInternalStatus)}
                                            disabled={isUpdating}
                                            data-testid="select-internal-status"
                                        >
                                            {Object.entries(INTERNAL_STATUS_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                        
                                        <label className="block text-xs font-bold text-slate-400 mb-2 mt-4">{t('adminOrders.internalNotes')}</label>
                                        <textarea 
                                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-[#C8A04F]"
                                            rows={3}
                                            placeholder={t('adminOrders.notesPlaceholder')}
                                            value={internalNote}
                                            onChange={(e) => setInternalNote(e.target.value)}
                                            data-testid="textarea-internal-notes"
                                        ></textarea>
                                        <button 
                                            onClick={() => handleUpdateInternalStatus(selectedOrder.internalStatus || 'NEW')}
                                            className="w-full mt-3 bg-[#C8A04F] text-[#0B1B3A] py-2 rounded-lg font-bold text-sm hover:bg-[#b08d45] transition-colors"
                                            disabled={isUpdating}
                                            data-testid="button-save-notes"
                                        >
                                            {t('adminOrders.saveNotes')}
                                        </button>
                                    </>
                                ) : (
                                    <div className="p-3 bg-slate-700 rounded-lg border border-slate-600 flex items-center gap-2">
                                        <Lock size={16} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-400">{t('adminOrders.noInternalPermission')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                                <h4 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2"><AlertCircle size={16}/> {t('adminOrders.dangerZone')}</h4>
                                <button 
                                    className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${canApproveOrder ? 'bg-white dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                    disabled={!canApproveOrder}
                                    data-testid="button-cancel-order"
                                >
                                    {canApproveOrder ? t('adminOrders.cancelOrder') : t('adminOrders.noPermission')}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
