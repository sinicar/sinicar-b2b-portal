

import React, { useState, useEffect, useMemo } from 'react';
import { BusinessProfile, User, Order, ActivityLogEntry, CustomerStatus, PriceLevel, StaffStatus, QuoteRequest, OrderStatus } from '../types';
import { MockApi } from '../services/mockApi';
import { 
    Search, Filter, ChevronRight, ChevronLeft, Eye, ShieldAlert, 
    CheckCircle, XCircle, Clock, MoreHorizontal, UserCheck, 
    Building2, MapPin, Phone, Briefcase, Lock, Key, 
    Trash2, AlertTriangle, Activity, Database, FileText, 
    RefreshCcw, UserMinus, Plus, Minus, X
} from 'lucide-react';
import { formatDateTime, formatDate } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';

// Helper for status badge
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
        'SUSPENDED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'BLOCKED': 'bg-red-100 text-red-700 border-red-200',
        'PENDING': 'bg-blue-100 text-blue-700 border-blue-200',
        'INACTIVE': 'bg-gray-100 text-gray-500 border-gray-200'
    };
    const labels: Record<string, string> = {
        'ACTIVE': 'نشط',
        'SUSPENDED': 'موقوف',
        'BLOCKED': 'محظور',
        'PENDING': 'قيد التفعيل',
        'INACTIVE': 'غير نشط'
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles['INACTIVE']}`}>
            {labels[status] || status}
        </span>
    );
};

export const AdminCustomersPage: React.FC = () => {
    // Main Data State
    const [customers, setCustomers] = useState<BusinessProfile[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'ALL'>('ALL');
    const [sortConfig, setSortConfig] = useState<{key: keyof BusinessProfile, direction: 'asc' | 'desc'}>({ key: 'totalOrdersCount', direction: 'desc' });
    const [selectedCustomer, setSelectedCustomer] = useState<BusinessProfile | null>(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    const { addToast } = useToast();

    // Load Data
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data = await MockApi.getCustomersDatabase();
            setCustomers(data);
        } catch (e) {
            addToast('فشل في تحميل قاعدة البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Derived Stats
    const stats = useMemo(() => ({
        total: customers.length,
        active: customers.filter(c => c.status === 'ACTIVE').length,
        suspended: customers.filter(c => c.status === 'SUSPENDED' || c.status === 'BLOCKED').length,
        topOrders: [...customers].sort((a, b) => (b.totalOrdersCount || 0) - (a.totalOrdersCount || 0)).slice(0, 5),
    }), [customers]);

    // Filtering & Sorting
    const filteredCustomers = useMemo(() => {
        let res = [...customers];
        
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            res = res.filter(c => 
                c.companyName.toLowerCase().includes(lower) || 
                c.phone.includes(lower) ||
                (c.city || '').toLowerCase().includes(lower)
            );
        }

        if (statusFilter !== 'ALL') {
            res = res.filter(c => c.status === statusFilter);
        }

        res.sort((a, b) => {
            const valA = a[sortConfig.key] || 0;
            const valB = b[sortConfig.key] || 0;
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return res;
    }, [customers, searchTerm, statusFilter, sortConfig]);

    // Pagination
    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCustomers, currentPage]);

    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

    // Handlers
    const handleSort = (key: keyof BusinessProfile) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handleCustomerClick = (customer: BusinessProfile) => {
        setSelectedCustomer(customer);
    };

    // --- RENDER ---
    return (
        <div className="space-y-6 animate-fade-in relative min-h-screen">
            
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">إجمالي العملاء</p>
                        <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-600"><Users size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">العملاء النشطين</p>
                        <p className="text-2xl font-black text-green-600">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-green-600"><UserCheck size={20}/></div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">المحظورين / الموقوفين</p>
                        <p className="text-2xl font-black text-red-600">{stats.suspended}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-red-600"><ShieldAlert size={20}/></div>
                </div>
                {/* Top Customer (Quick View) */}
                <div className="bg-gradient-to-br from-[#0B1B3A] to-[#1a2e56] text-white p-4 rounded-xl shadow-md border border-slate-700">
                    <p className="text-[#C8A04F] text-xs font-bold uppercase mb-1 flex items-center gap-1"><Activity size={12}/> العميل الأنشط</p>
                    {stats.topOrders[0] ? (
                        <div>
                            <p className="font-bold truncate">{stats.topOrders[0].companyName}</p>
                            <p className="text-xs text-slate-300">{stats.topOrders[0].totalOrdersCount} طلب</p>
                        </div>
                    ) : <p className="text-xs text-slate-400">لا يوجد بيانات</p>}
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-80">
                        <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="بحث بالاسم، المدينة، الهاتف..." 
                            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="ALL">جميع الحالات</option>
                        <option value="ACTIVE">نشط</option>
                        <option value="SUSPENDED">موقوف</option>
                        <option value="BLOCKED">محظور</option>
                        <option value="PENDING">قيد التفعيل</option>
                    </select>
                </div>

                <div className="flex gap-2 w-full xl:w-auto overflow-x-auto">
                    <button onClick={() => setSortConfig({key: 'totalOrdersCount', direction: 'desc'})} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 whitespace-nowrap">
                        الأكثر طلباً
                    </button>
                    <button onClick={() => setSortConfig({key: 'totalSearchesCount', direction: 'desc'})} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 whitespace-nowrap">
                        الأكثر بحثاً
                    </button>
                    <button onClick={() => setSortConfig({key: 'lastLoginAt', direction: 'desc'})} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 whitespace-nowrap">
                        آخر نشاط
                    </button>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm min-h-[500px]">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#0B1B3A] text-white font-bold">
                        <tr>
                            <th className="p-4 cursor-pointer" onClick={() => handleSort('companyName')}>اسم المنشأة</th>
                            <th className="p-4 cursor-pointer hidden md:table-cell" onClick={() => handleSort('city')}>المدينة</th>
                            <th className="p-4 cursor-pointer hidden lg:table-cell" onClick={() => handleSort('customerType')}>النشاط</th>
                            <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('status')}>الحالة</th>
                            <th className="p-4 text-center cursor-pointer" onClick={() => handleSort('totalOrdersCount')}>الطلبات</th>
                            <th className="p-4 text-center cursor-pointer hidden md:table-cell" onClick={() => handleSort('totalSearchesCount')}>بحث</th>
                            <th className="p-4 text-center cursor-pointer hidden lg:table-cell" onClick={() => handleSort('lastLoginAt')}>آخر دخول</th>
                            <th className="p-4 text-center">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={8} className="p-10 text-center">جاري التحميل...</td></tr>
                        ) : paginatedCustomers.length === 0 ? (
                            <tr><td colSpan={8} className="p-10 text-center text-slate-400">لا يوجد عملاء مطابقين</td></tr>
                        ) : (
                            paginatedCustomers.map((customer) => (
                                <tr key={customer.userId} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-base">{customer.companyName}</span>
                                            {customer.riskyLoginFlag && (
                                                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"><AlertTriangle size={10}/> سلوك مريب</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 hidden md:table-cell">{customer.city}</td>
                                    <td className="p-4 text-slate-600 hidden lg:table-cell text-xs font-bold bg-slate-50 px-2 py-1 rounded w-fit h-fit">
                                        {customer.customerType || 'غير محدد'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <StatusBadge status={customer.status || 'ACTIVE'} />
                                    </td>
                                    <td className="p-4 text-center font-bold text-brand-700">{customer.totalOrdersCount}</td>
                                    <td className="p-4 text-center hidden md:table-cell">{customer.totalSearchesCount}</td>
                                    <td className="p-4 text-center hidden lg:table-cell text-xs text-slate-500 font-mono" dir="ltr">
                                        {formatDateTime(customer.lastLoginAt)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                            onClick={() => handleCustomerClick(customer)}
                                            className="bg-slate-100 hover:bg-[#0B1B3A] hover:text-white text-slate-600 p-2 rounded-lg transition-colors text-xs font-bold flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <Eye size={16} /> <span className="hidden xl:inline">التفاصيل</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
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

            {/* --- CUSTOMER DETAIL PANEL --- */}
            {selectedCustomer && (
                <CustomerDetailPanel 
                    customer={selectedCustomer} 
                    onClose={() => setSelectedCustomer(null)} 
                    onUpdate={() => {
                        loadCustomers(); // Reload list
                        setSelectedCustomer(null); // Close panel
                    }}
                />
            )}
        </div>
    );
};

import { Users, FileSpreadsheet, LockKeyhole, MessageSquare, Package, ClipboardList, ExternalLink, DollarSign, Calendar } from 'lucide-react';

interface DetailPanelProps {
    customer: BusinessProfile;
    onClose: () => void;
    onUpdate: () => void;
}

// Order Status Badge Helper
const OrderStatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'APPROVED': 'bg-blue-100 text-blue-700 border-blue-200',
        'SHIPPED': 'bg-purple-100 text-purple-700 border-purple-200',
        'DELIVERED': 'bg-green-100 text-green-700 border-green-200',
        'CANCELLED': 'bg-red-100 text-red-700 border-red-200'
    };
    const labels: Record<string, string> = {
        'PENDING': 'قيد الانتظار',
        'APPROVED': 'معتمد',
        'SHIPPED': 'تم الشحن',
        'DELIVERED': 'تم التسليم',
        'CANCELLED': 'ملغي'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {labels[status] || status}
        </span>
    );
};

// Quote Status Badge Helper  
const QuoteStatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'NEW': 'bg-blue-100 text-blue-700 border-blue-200',
        'UNDER_REVIEW': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'APPROVED': 'bg-green-100 text-green-700 border-green-200',
        'PARTIALLY_APPROVED': 'bg-orange-100 text-orange-700 border-orange-200',
        'REJECTED': 'bg-red-100 text-red-700 border-red-200'
    };
    const labels: Record<string, string> = {
        'NEW': 'جديد',
        'UNDER_REVIEW': 'قيد المراجعة',
        'APPROVED': 'معتمد',
        'PARTIALLY_APPROVED': 'معتمد جزئياً',
        'REJECTED': 'مرفوض'
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {labels[status] || status}
        </span>
    );
};

const CustomerDetailPanel: React.FC<DetailPanelProps> = ({ customer, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'QUOTES' | 'STAFF' | 'SECURITY' | 'NOTES'>('OVERVIEW');
    const { addToast } = useToast();
    
    // Internal States for Actions
    const [status, setStatus] = useState<CustomerStatus>(customer.status || 'ACTIVE');
    const [suspendedUntil, setSuspendedUntil] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // Sub-data states (loaded on demand)
    const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingQuotes, setLoadingQuotes] = useState(false);
    
    useEffect(() => {
        // Load Logs & Staff immediately
        const loadSubData = async () => {
            const logs = await MockApi.getCustomerActivityLogs(customer.userId);
            setActivityLogs(logs);
            const emps = await MockApi.getEmployees(customer.userId);
            setStaff(emps);
        };
        loadSubData();
    }, [customer.userId]);

    // Load orders on-demand when tab is clicked
    useEffect(() => {
        if (activeTab === 'ORDERS' && orders.length === 0 && !loadingOrders) {
            setLoadingOrders(true);
            MockApi.getAllOrders().then(allOrders => {
                // Filter orders by userId or businessId matching the customer
                const customerOrders = allOrders.filter(o => 
                    o.userId === customer.userId || o.businessId === customer.userId
                );
                setOrders(customerOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setLoadingOrders(false);
            });
        }
    }, [activeTab, customer.userId, orders.length, loadingOrders]);

    // Load quotes on-demand when tab is clicked
    useEffect(() => {
        if (activeTab === 'QUOTES' && quotes.length === 0 && !loadingQuotes) {
            setLoadingQuotes(true);
            MockApi.getAllQuoteRequests().then(allQuotes => {
                // Filter quotes by userId matching the customer
                const customerQuotes = allQuotes.filter(q => q.userId === customer.userId);
                setQuotes(customerQuotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setLoadingQuotes(false);
            });
        }
    }, [activeTab, customer.userId, quotes.length, loadingQuotes]);

    const handleSaveStatus = async () => {
        setIsSaving(true);
        try {
            await MockApi.updateCustomerStatus(customer.userId, status, suspendedUntil);
            addToast('تم تحديث حالة العميل', 'success');
            onUpdate();
        } catch (e) {
            addToast('حدث خطأ', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddPoints = async () => {
        const points = prompt('أدخل عدد النقاط للإضافة:', '50');
        if (points && parseInt(points) > 0) {
            await MockApi.addCustomerSearchPoints(customer.userId, parseInt(points));
            addToast(`تم إضافة ${points} نقطة بنجاح`, 'success');
            onUpdate();
        }
    };

    const handleDeductPoints = async () => {
        const currentBalance = customer.searchPointsRemaining || 0;
        const points = prompt(`الرصيد الحالي: ${currentBalance} نقطة\n\nأدخل عدد النقاط للخصم:`, '10');
        if (points && parseInt(points) > 0) {
            const pointsNum = parseInt(points);
            if (pointsNum > currentBalance) {
                addToast(`لا يمكن خصم أكثر من الرصيد المتبقي (${currentBalance} نقطة)`, 'error');
                return;
            }
            const success = await MockApi.deductCustomerSearchPoints(customer.userId, pointsNum);
            if (success) {
                addToast(`تم خصم ${points} نقطة بنجاح`, 'success');
                onUpdate();
            } else {
                addToast('حدث خطأ أثناء خصم النقاط', 'error');
            }
        }
    };

    const handleToggleStaff = async (staffId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        await MockApi.updateStaffStatus(staffId, newStatus);
        addToast('تم تحديث حالة الموظف', 'success');
        // Refresh local staff list
        const emps = await MockApi.getEmployees(customer.userId);
        setStaff(emps);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="fixed inset-y-0 left-0 w-full md:w-[800px] bg-slate-50 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-200 flex flex-col">
                
                {/* Header */}
                <div className="bg-white border-b border-slate-200 flex flex-col shadow-sm z-10">
                    <div className="p-6 flex justify-between items-start pb-4">
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-[#0B1B3A] rounded-xl flex items-center justify-center text-white text-2xl font-bold uppercase shadow-lg">
                                {customer.companyName.substring(0,2)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">{customer.companyName}</h2>
                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                    <MapPin size={14}/> {customer.city}
                                    <span className="mx-1">•</span>
                                    <Phone size={14}/> {customer.phone}
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <StatusBadge status={customer.status || 'ACTIVE'} />
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">{customer.priceLevel}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex px-6 gap-6 overflow-x-auto">
                        {[
                            {id: 'OVERVIEW', label: 'نظرة عامة', icon: <Activity size={16}/>},
                            {id: 'ORDERS', label: 'الطلبات', icon: <FileText size={16}/>},
                            {id: 'QUOTES', label: 'التسعير', icon: <FileSpreadsheet size={16}/>},
                            {id: 'STAFF', label: `الموظفين (${staff.length})`, icon: <Users size={16}/>},
                            {id: 'SECURITY', label: 'الأمان والدخول', icon: <LockKeyhole size={16}/>},
                            {id: 'NOTES', label: 'ملاحظات', icon: <MessageSquare size={16}/>},
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Management Actions */}
                            <div className="bg-[#0B1B3A] p-6 rounded-2xl text-white shadow-lg">
                                <h3 className="font-bold text-[#C8A04F] mb-4 flex items-center gap-2"><ShieldAlert size={18}/> إدارة الحساب</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">تغيير الحالة</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white focus:border-[#C8A04F]"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                                        >
                                            <option value="ACTIVE">نشط (Active)</option>
                                            <option value="SUSPENDED">إيقاف مؤقت (Suspend)</option>
                                            <option value="BLOCKED">حظر نهائي (Block)</option>
                                        </select>
                                    </div>
                                    {status === 'SUSPENDED' && (
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">إيقاف حتى تاريخ</label>
                                            <input 
                                                type="date" 
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-white"
                                                value={suspendedUntil}
                                                onChange={(e) => setSuspendedUntil(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleSaveStatus} 
                                    disabled={isSaving}
                                    className="mt-4 w-full bg-[#C8A04F] text-[#0B1B3A] font-bold py-2 rounded-lg hover:bg-[#b08d45] transition-colors"
                                >
                                    {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                            </div>

                            {/* Search Points Wallet */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Search size={18} className="text-blue-500"/> محفظة البحث</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleAddPoints} 
                                            className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 transition-colors flex items-center gap-1"
                                            data-testid="button-add-points"
                                        >
                                            <Plus size={14} /> إضافة رصيد
                                        </button>
                                        <button 
                                            onClick={handleDeductPoints} 
                                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                                            data-testid="button-deduct-points"
                                        >
                                            <Minus size={14} /> خصم رصيد
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase">الرصيد الكلي</p>
                                        <p className="text-xl font-black text-slate-800">{customer.searchPointsTotal || 0}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase">المستخدم</p>
                                        <p className="text-xl font-black text-slate-800">{(customer.searchPointsTotal || 0) - (customer.searchPointsRemaining || 0)}</p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm">
                                        <p className="text-xs text-blue-500 font-bold uppercase">المتبقي</p>
                                        <p className="text-2xl font-black text-blue-600">{customer.searchPointsRemaining || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">تاريخ الانضمام</p>
                                    <p className="font-mono font-bold text-slate-700">2023-01-15</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">آخر تسجيل دخول</p>
                                    <p className="font-mono font-bold text-slate-700" dir="ltr">{formatDateTime(customer.lastLoginAt)}</p>
                                </div>
                            </div>

                            {/* Customer Documents Section */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                    <FileText size={18} className="text-amber-500"/> وثائق العميل
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Commercial Registration */}
                                    {customer.crNumber ? (
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800">السجل التجاري</p>
                                                <p className="text-xs text-slate-500 truncate">{customer.crNumber}</p>
                                            </div>
                                            {customer.documents?.find(d => d.type === 'CR_CERTIFICATE') ? (
                                                <button 
                                                    onClick={() => {
                                                        const doc = customer.documents?.find(d => d.type === 'CR_CERTIFICATE');
                                                        if (doc?.base64Data) {
                                                            window.open(doc.base64Data, '_blank');
                                                        }
                                                    }}
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                                    data-testid="view-cr-doc"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400">غير مرفق</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                            <p className="text-sm text-slate-400">السجل التجاري</p>
                                            <p className="text-xs text-slate-300">غير متوفر</p>
                                        </div>
                                    )}

                                    {/* Tax Number */}
                                    {customer.taxNumber ? (
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800">الرقم الضريبي</p>
                                                <p className="text-xs text-slate-500 truncate">{customer.taxNumber}</p>
                                            </div>
                                            {customer.documents?.find(d => d.type === 'VAT_CERTIFICATE') ? (
                                                <button 
                                                    onClick={() => {
                                                        const doc = customer.documents?.find(d => d.type === 'VAT_CERTIFICATE');
                                                        if (doc?.base64Data) {
                                                            window.open(doc.base64Data, '_blank');
                                                        }
                                                    }}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                                    data-testid="view-vat-doc"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400">غير مرفق</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                            <p className="text-sm text-slate-400">الرقم الضريبي</p>
                                            <p className="text-xs text-slate-300">غير متوفر</p>
                                        </div>
                                    )}

                                    {/* National Address */}
                                    {customer.nationalAddress ? (
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800">العنوان الوطني</p>
                                                <p className="text-xs text-slate-500 truncate">{customer.nationalAddress}</p>
                                            </div>
                                            {customer.documents?.find(d => d.type === 'NATIONAL_ADDRESS') ? (
                                                <button 
                                                    onClick={() => {
                                                        const doc = customer.documents?.find(d => d.type === 'NATIONAL_ADDRESS');
                                                        if (doc?.base64Data) {
                                                            window.open(doc.base64Data, '_blank');
                                                        }
                                                    }}
                                                    className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"
                                                    data-testid="view-address-doc"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400">غير مرفق</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                                            <p className="text-sm text-slate-400">العنوان الوطني</p>
                                            <p className="text-xs text-slate-300">غير متوفر</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'STAFF' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-slate-800">المستخدمين التابعين ({staff.length})</h3>
                                <p className="text-xs text-slate-500">الحد الأقصى: {customer.staffLimit}</p>
                            </div>
                            
                            {staff.map(user => (
                                <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{user.name} {user.role === 'CUSTOMER_OWNER' && <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 rounded ml-1">مالك</span>}</p>
                                            <p className="text-xs text-slate-500 font-mono">{user.phone || user.clientId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {user.isActive ? 'نشط' : 'موقوف'}
                                        </span>
                                        <button 
                                            onClick={() => handleToggleStaff(user.id, user.status || 'ACTIVE')}
                                            className="text-xs border px-3 py-1.5 rounded hover:bg-slate-50"
                                        >
                                            {user.isActive ? 'إيقاف' : 'تفعيل'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {staff.length === 0 && <p className="text-center text-slate-400 py-8">لا يوجد موظفين</p>}
                        </div>
                    )}

                    {activeTab === 'SECURITY' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={18}/> مؤشرات الأمان</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                        <span>محاولات دخول فاشلة</span>
                                        <span className={`font-bold ${customer.failedLoginAttempts! > 3 ? 'text-red-600' : 'text-slate-800'}`}>{customer.failedLoginAttempts || 0}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                                        <span>سلوك مريب (Flag)</span>
                                        <span className={`font-bold ${customer.riskyLoginFlag ? 'text-red-600' : 'text-green-600'}`}>
                                            {customer.riskyLoginFlag ? 'نعم' : 'لا'}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => MockApi.resetFailedLogin(customer.userId).then(() => {addToast('تم تصفير العداد', 'success'); onUpdate();})}
                                    className="mt-4 w-full border border-slate-300 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50"
                                >
                                    إعادة تعيين عداد الفشل (Reset)
                                </button>
                            </div>

                            {/* Password Reset Section */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><LockKeyhole size={18}/> إعادة تعيين كلمة المرور</h3>
                                <p className="text-sm text-slate-500 mb-4">يمكنك إعادة تعيين كلمة مرور صاحب الحساب من هنا. سيتم إنشاء كلمة مرور جديدة وإرسال إشعار للعميل.</p>
                                <button 
                                    onClick={async () => {
                                        const newPassword = prompt('أدخل كلمة المرور الجديدة (4 أحرف على الأقل):', '');
                                        if (newPassword && newPassword.length >= 4) {
                                            try {
                                                // Get current admin user from localStorage
                                                const adminUser = JSON.parse(localStorage.getItem('sini_car_current_user') || '{}');
                                                if (!adminUser.id) {
                                                    addToast('خطأ: لم يتم العثور على بيانات المسؤول', 'error');
                                                    return;
                                                }
                                                const result = await MockApi.adminResetPassword(adminUser.id, customer.userId, newPassword);
                                                if (result.success) {
                                                    addToast(result.message, 'success');
                                                } else {
                                                    addToast(result.message, 'error');
                                                }
                                            } catch (e) {
                                                addToast('حدث خطأ أثناء إعادة تعيين كلمة المرور', 'error');
                                            }
                                        } else if (newPassword) {
                                            addToast('كلمة المرور يجب أن تكون 4 أحرف على الأقل', 'error');
                                        }
                                    }}
                                    className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg text-sm hover:bg-amber-600 flex items-center justify-center gap-2"
                                    data-testid="button-admin-reset-password"
                                >
                                    <LockKeyhole size={16} />
                                    إعادة تعيين كلمة المرور
                                </button>
                            </div>

                            <h3 className="font-bold text-slate-800 mb-2 text-sm">سجل الدخول الأخير</h3>
                            <div className="space-y-2">
                                {activityLogs.filter(l => l.eventType === 'LOGIN' || l.eventType === 'FAILED_LOGIN' || l.eventType === 'PASSWORD_CHANGED' || l.eventType === 'PASSWORD_RESET').slice(0, 5).map(log => (
                                    <div key={log.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg text-xs">
                                        <span className={`font-bold ${
                                            log.eventType === 'LOGIN' ? 'text-green-600' : 
                                            log.eventType === 'FAILED_LOGIN' ? 'text-red-600' : 
                                            log.eventType === 'PASSWORD_CHANGED' ? 'text-blue-600' :
                                            log.eventType === 'PASSWORD_RESET' ? 'text-amber-600' : 'text-slate-600'
                                        }`}>
                                            {log.eventType === 'LOGIN' ? 'دخول ناجح' : 
                                             log.eventType === 'FAILED_LOGIN' ? 'فشل دخول' : 
                                             log.eventType === 'PASSWORD_CHANGED' ? 'تغيير كلمة المرور' :
                                             log.eventType === 'PASSWORD_RESET' ? 'إعادة تعيين (Admin)' : log.eventType}
                                        </span>
                                        <span className="text-slate-500 font-mono" dir="ltr">{formatDateTime(log.createdAt)}</span>
                                    </div>
                                ))}
                                {activityLogs.length === 0 && <p className="text-center text-slate-400 text-xs">لا يوجد سجلات محفوظة</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'NOTES' && (
                        <div className="animate-fade-in h-full flex flex-col">
                            <textarea 
                                className="flex-1 w-full p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-slate-700 focus:outline-none resize-none"
                                placeholder="اكتب ملاحظات إدارية هنا..."
                                defaultValue={customer.internalNotes}
                            ></textarea>
                            <button className="mt-4 bg-yellow-500 text-white font-bold py-2 rounded-xl hover:bg-yellow-600">حفظ الملاحظة</button>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'ORDERS' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Package size={18} className="text-blue-500"/> طلبات العميل ({orders.length})
                                </h3>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg font-bold">
                                        المكتملة: {orders.filter(o => o.status === 'DELIVERED').length}
                                    </span>
                                    <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg font-bold">
                                        الجارية: {orders.filter(o => ['PENDING', 'APPROVED', 'SHIPPED'].includes(o.status as string)).length}
                                    </span>
                                </div>
                            </div>

                            {loadingOrders ? (
                                <div className="text-center py-12 text-slate-400">
                                    <RefreshCcw size={24} className="mx-auto mb-3 animate-spin opacity-50"/>
                                    <p className="text-sm">جاري تحميل الطلبات...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Package size={40} className="mx-auto mb-4 opacity-20"/>
                                    <p className="text-sm">لا توجد طلبات لهذا العميل</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.slice(0, 10).map(order => (
                                        <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                        <Package size={20}/>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">#{order.id}</p>
                                                        <p className="text-xs text-slate-500">{order.createdByName || 'غير محدد'}</p>
                                                    </div>
                                                </div>
                                                <OrderStatusBadge status={order.status as string}/>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-xs">
                                                <div className="bg-slate-50 p-2 rounded-lg">
                                                    <p className="text-slate-400 mb-0.5">المنتجات</p>
                                                    <p className="font-bold text-slate-700">{order.items.length} صنف</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-lg">
                                                    <p className="text-slate-400 mb-0.5">الإجمالي</p>
                                                    <p className="font-bold text-green-700">{order.totalAmount.toLocaleString()} ر.س</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-lg">
                                                    <p className="text-slate-400 mb-0.5">التاريخ</p>
                                                    <p className="font-bold text-slate-700 font-mono" dir="ltr">{formatDate(order.date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length > 10 && (
                                        <p className="text-center text-slate-400 text-xs py-2">
                                            عرض 10 من {orders.length} طلب
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quotes Tab */}
                    {activeTab === 'QUOTES' && (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <ClipboardList size={18} className="text-purple-500"/> طلبات التسعير ({quotes.length})
                                </h3>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg font-bold">
                                        المعتمدة: {quotes.filter(q => q.status === 'APPROVED').length}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold">
                                        الجديدة: {quotes.filter(q => q.status === 'NEW').length}
                                    </span>
                                </div>
                            </div>

                            {loadingQuotes ? (
                                <div className="text-center py-12 text-slate-400">
                                    <RefreshCcw size={24} className="mx-auto mb-3 animate-spin opacity-50"/>
                                    <p className="text-sm">جاري تحميل طلبات التسعير...</p>
                                </div>
                            ) : quotes.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <ClipboardList size={40} className="mx-auto mb-4 opacity-20"/>
                                    <p className="text-sm">لا توجد طلبات تسعير لهذا العميل</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {quotes.slice(0, 10).map(quote => (
                                        <div key={quote.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                                        <ClipboardList size={20}/>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">#{quote.id}</p>
                                                        <p className="text-xs text-slate-500">{quote.priceType || 'غير محدد'}</p>
                                                    </div>
                                                </div>
                                                <QuoteStatusBadge status={quote.status}/>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-xs">
                                                <div className="bg-slate-50 p-2 rounded-lg">
                                                    <p className="text-slate-400 mb-0.5">الأصناف</p>
                                                    <p className="font-bold text-slate-700">{quote.items.length} صنف</p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-lg">
                                                    <p className="text-slate-400 mb-0.5">الإجمالي</p>
                                                    <p className="font-bold text-green-700">
                                                        {quote.totalQuotedAmount ? `${quote.totalQuotedAmount.toLocaleString()} ر.س` : 'قيد التسعير'}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-lg">
                                                    <p className="text-slate-400 mb-0.5">التاريخ</p>
                                                    <p className="font-bold text-slate-700 font-mono" dir="ltr">{formatDate(quote.date)}</p>
                                                </div>
                                            </div>
                                            {quote.resultReady && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                    <div className="flex gap-2 text-[10px]">
                                                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded">معتمد: {quote.approvedItemsCount || 0}</span>
                                                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded">ناقص: {quote.missingItemsCount || 0}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">
                                                        بواسطة: {quote.adminReviewedBy || 'غير محدد'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {quotes.length > 10 && (
                                        <p className="text-center text-slate-400 text-xs py-2">
                                            عرض 10 من {quotes.length} طلب تسعير
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};