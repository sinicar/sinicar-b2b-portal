import { useState, useEffect, useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { AbandonedCart, ExtendedUserRole } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { usePermission } from '../services/PermissionContext';
import { 
    ShoppingCart, Search, Eye, Phone, MessageCircle, 
    Clock, Package, RefreshCw, User, Filter, X
} from 'lucide-react';
import { Modal } from './Modal';

interface AdminAbandonedCartsPageProps {
    onRefresh?: () => void;
}

export const AdminAbandonedCartsPage: FC<AdminAbandonedCartsPageProps> = ({ onRefresh }) => {
    const { t } = useTranslation();
    const [carts, setCarts] = useState<AbandonedCart[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    const { hasPermission } = usePermission();
    const canView = hasPermission('orders', 'view') || hasPermission('customers', 'view');

    const loadCarts = async () => {
        setLoading(true);
        try {
            const data = await MockApi.getAbandonedCarts();
            setCarts(data);
        } catch (error) {
            console.error('Failed to load abandoned carts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCarts();
    }, []);

    const formatTimeSince = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) return `${diffDays} ${t('common.days', 'يوم')}`;
        if (diffHours > 0) return `${diffHours} ${t('common.hours', 'ساعة')}`;
        return `${diffMins} ${t('common.minutes', 'دقيقة')}`;
    };

    const getRoleBadge = (role?: ExtendedUserRole) => {
        const roleLabels: Record<ExtendedUserRole, { label: string; color: string }> = {
            ADMIN: { label: 'مدير', color: 'bg-purple-100 text-purple-700' },
            EMPLOYEE: { label: 'موظف', color: 'bg-blue-100 text-blue-700' },
            CUSTOMER: { label: 'عميل', color: 'bg-green-100 text-green-700' },
            SUPPLIER_LOCAL: { label: 'مورد محلي', color: 'bg-orange-100 text-orange-700' },
            SUPPLIER_INTERNATIONAL: { label: 'مورد دولي', color: 'bg-red-100 text-red-700' },
            MARKETER: { label: 'مسوق', color: 'bg-pink-100 text-pink-700' }
        };
        
        if (!role) return <span className="text-slate-400 text-xs">-</span>;
        const info = roleLabels[role] || { label: role, color: 'bg-slate-100 text-slate-700' };
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${info.color}`}>{info.label}</span>;
    };

    const filteredCarts = useMemo(() => {
        return carts.filter(cart => {
            const matchesSearch = !searchQuery || 
                (cart.userName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (cart.phone?.includes(searchQuery)) ||
                (cart.whatsapp?.includes(searchQuery));
            
            const matchesRole = roleFilter === 'ALL' || cart.extendedRole === roleFilter;
            
            return matchesSearch && matchesRole;
        });
    }, [carts, searchQuery, roleFilter]);

    const totalValue = useMemo(() => {
        return filteredCarts.reduce((sum, cart) => sum + cart.totalAmount, 0);
    }, [filteredCarts]);

    const handleViewDetails = (cart: AbandonedCart) => {
        setSelectedCart(cart);
        setShowDetailsModal(true);
    };

    const openWhatsApp = (phone?: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    if (!canView) {
        return (
            <div className="p-6 lg:p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <ShoppingCart className="w-12 h-12 text-red-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-red-700">{t('common.accessDenied', 'غير مصرح')}</h3>
                    <p className="text-red-600 mt-2">{t('adminAbandonedCarts.noPermission', 'ليس لديك صلاحية الوصول لهذه الصفحة')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <ShoppingCart className="text-[#C8A04F]" size={28} />
                        {t('adminAbandonedCarts.title', 'السلات المتروكة')}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {t('adminAbandonedCarts.subtitle', 'متابعة العملاء الذين أضافوا منتجات ولم يكملوا الطلب (أكثر من 15 دقيقة)')}
                    </p>
                </div>
                
                <button
                    onClick={loadCarts}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
                    data-testid="button-refresh-carts"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {t('common.refresh', 'تحديث')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="text-orange-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">{t('adminAbandonedCarts.stats.count', 'السلات المتروكة')}</p>
                            <p className="text-2xl font-black text-slate-800" data-testid="text-abandoned-count">{filteredCarts.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="text-green-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">{t('adminAbandonedCarts.stats.totalValue', 'القيمة الإجمالية')}</p>
                            <p className="text-2xl font-black text-slate-800" data-testid="text-total-value">{totalValue.toLocaleString()} ر.س</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">{t('adminAbandonedCarts.stats.avgItems', 'متوسط المنتجات')}</p>
                            <p className="text-2xl font-black text-slate-800" data-testid="text-avg-items">
                                {filteredCarts.length > 0 
                                    ? Math.round(filteredCarts.reduce((sum, c) => sum + c.items.length, 0) / filteredCarts.length)
                                    : 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('adminAbandonedCarts.searchPlaceholder', 'بحث بالاسم أو رقم الجوال...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A04F]/20 focus:border-[#C8A04F]"
                            data-testid="input-search-carts"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8A04F]/20 focus:border-[#C8A04F]"
                            data-testid="select-role-filter"
                        >
                            <option value="ALL">{t('common.allRoles', 'كل الأنواع')}</option>
                            <option value="CUSTOMER">{t('roles.customer', 'عميل')}</option>
                            <option value="SUPPLIER_LOCAL">{t('roles.supplierLocal', 'مورد محلي')}</option>
                            <option value="SUPPLIER_INTERNATIONAL">{t('roles.supplierIntl', 'مورد دولي')}</option>
                            <option value="MARKETER">{t('roles.marketer', 'مسوق')}</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-slate-400 mx-auto animate-spin mb-3" />
                        <p className="text-slate-500">{t('common.loading', 'جاري التحميل...')}</p>
                    </div>
                ) : filteredCarts.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-600">{t('adminAbandonedCarts.noResults', 'لا توجد سلات متروكة')}</h3>
                        <p className="text-slate-400 mt-1">{t('adminAbandonedCarts.noResultsDesc', 'جميع العملاء أكملوا طلباتهم أو لم يضيفوا منتجات')}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                                        {t('adminAbandonedCarts.table.customer', 'العميل')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                                        {t('adminAbandonedCarts.table.role', 'النوع')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                                        {t('adminAbandonedCarts.table.items', 'المنتجات')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                                        {t('adminAbandonedCarts.table.value', 'القيمة')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">
                                        {t('adminAbandonedCarts.table.abandoned', 'منذ')}
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">
                                        {t('adminAbandonedCarts.table.actions', 'إجراءات')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCarts.map((cart) => (
                                    <tr key={cart.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-cart-${cart.id}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-800" data-testid={`text-username-${cart.id}`}>
                                                    {cart.userName || t('common.unknown', 'غير معروف')}
                                                </span>
                                                {cart.phone && (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <Phone size={12} />
                                                        {cart.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getRoleBadge(cart.extendedRole)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-slate-700" data-testid={`text-items-${cart.id}`}>
                                                {cart.items.length} {t('common.products', 'منتج')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-green-600" data-testid={`text-value-${cart.id}`}>
                                                {cart.totalAmount.toLocaleString()} ر.س
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <Clock size={14} />
                                                <span className="text-sm font-medium" data-testid={`text-time-${cart.id}`}>
                                                    {formatTimeSince(cart.lastUpdatedAt)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(cart)}
                                                    className="p-2 text-slate-600 hover:text-[#C8A04F] hover:bg-[#C8A04F]/10 rounded-lg transition-colors"
                                                    title={t('common.viewDetails', 'عرض التفاصيل')}
                                                    data-testid={`button-view-${cart.id}`}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {cart.whatsapp && (
                                                    <button
                                                        onClick={() => openWhatsApp(cart.whatsapp)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title={t('common.whatsapp', 'واتساب')}
                                                        data-testid={`button-whatsapp-${cart.id}`}
                                                    >
                                                        <MessageCircle size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="max-w-2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <ShoppingCart className="text-[#C8A04F]" size={24} />
                            {t('adminAbandonedCarts.details.title', 'تفاصيل السلة المتروكة')}
                        </h2>
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            data-testid="button-close-details"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {selectedCart && (
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">{t('adminAbandonedCarts.details.customer', 'العميل')}</span>
                                    <span className="font-bold text-slate-800">{selectedCart.userName || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">{t('adminAbandonedCarts.details.role', 'النوع')}</span>
                                    {getRoleBadge(selectedCart.extendedRole)}
                                </div>
                                {selectedCart.phone && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">{t('adminAbandonedCarts.details.phone', 'الجوال')}</span>
                                        <span className="font-medium text-slate-700">{selectedCart.phone}</span>
                                    </div>
                                )}
                                {selectedCart.whatsapp && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">{t('adminAbandonedCarts.details.whatsapp', 'واتساب')}</span>
                                        <button
                                            onClick={() => openWhatsApp(selectedCart.whatsapp)}
                                            className="text-green-600 font-medium hover:underline flex items-center gap-1"
                                        >
                                            <MessageCircle size={14} />
                                            {selectedCart.whatsapp}
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">{t('adminAbandonedCarts.details.abandonedSince', 'متروكة منذ')}</span>
                                    <span className="font-medium text-orange-600">{formatTimeSince(selectedCart.lastUpdatedAt)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">{t('adminAbandonedCarts.details.lastUpdate', 'آخر تحديث')}</span>
                                    <span className="font-medium text-slate-700">{formatDateTime(selectedCart.lastUpdatedAt)}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                    <Package size={18} />
                                    {t('adminAbandonedCarts.details.products', 'المنتجات في السلة')} ({selectedCart.items.length})
                                </h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-2 text-right text-xs font-bold text-slate-600">{t('common.product', 'المنتج')}</th>
                                                <th className="px-4 py-2 text-center text-xs font-bold text-slate-600">{t('common.quantity', 'الكمية')}</th>
                                                <th className="px-4 py-2 text-left text-xs font-bold text-slate-600">{t('common.price', 'السعر')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedCart.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-800">{item.name}</span>
                                                            <span className="text-xs text-slate-500">{item.partNumber}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="font-medium">{item.quantity}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-left">
                                                        <span className="font-bold text-green-600">{(item.price * item.quantity).toLocaleString()} ر.س</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan={2} className="px-4 py-3 text-right font-bold text-slate-700">
                                                    {t('common.total', 'الإجمالي')}
                                                </td>
                                                <td className="px-4 py-3 text-left font-black text-lg text-green-600">
                                                    {selectedCart.totalAmount.toLocaleString()} ر.س
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                {selectedCart.whatsapp && (
                                    <button
                                        onClick={() => openWhatsApp(selectedCart.whatsapp)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors"
                                        data-testid="button-contact-whatsapp"
                                    >
                                        <MessageCircle size={18} />
                                        {t('adminAbandonedCarts.details.contactWhatsapp', 'تواصل عبر واتساب')}
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                    data-testid="button-close"
                                >
                                    {t('common.close', 'إغلاق')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
