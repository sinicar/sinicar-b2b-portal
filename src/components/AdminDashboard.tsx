
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Api from '../services/api';
import { services } from '../services/serviceFactory';
import { QuoteRequest, MissingProductRequest, ImportRequest, ImportRequestStatus, AccountOpeningRequest, AccountRequestStatus, ActivityLogEntry, Order, Product, User, OrderStatus, Notification, AdminUser, Role, PermissionResource } from '../types';
import {
    Users, Activity, Clock, ChevronRight, ChevronLeft,
    RefreshCw, Zap, ShieldCheck
} from 'lucide-react';
import { AdminDashboardHeader } from '../features/admin/components/AdminDashboardHeader';
import { AdminDashboardSidebar } from '../features/admin/components/AdminDashboardSidebar';
import { AdminDashboardViewRenderer } from '../features/admin/views/AdminDashboardViewRenderer';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../services/ToastContext';
import { AdminBadgesProvider, useAdminBadges } from '../services/AdminBadgesContext';
import { PermissionProvider, usePermission } from '../services/PermissionContext';

interface AdminDashboardProps {
    onLogout: () => void;
}

type ViewType = 'DASHBOARD' | 'CUSTOMERS' | 'PRODUCTS' | 'PRODUCT_IMAGES' | 'SETTINGS' | 'QUOTES' | 'MISSING' | 'ORDER_SHORTAGES' | 'IMPORT_REQUESTS' | 'UNIFIED_ACCOUNT_REQUESTS' | 'ACCOUNT_REQUESTS' | 'ACTIVITY_LOGS' | 'FEEDBACK_CENTER' | 'MESSAGING_CENTER' | 'ORDERS_MANAGER' | 'ABANDONED_CARTS' | 'ADMIN_USERS' | 'MARKETING' | 'PRICING' | 'TRADER_TOOLS' | 'SUPPLIER_MARKETPLACE' | 'MARKETERS' | 'INSTALLMENTS' | 'ADVERTISING' | 'TEAM_SETTINGS' | 'CUSTOMER_PORTAL' | 'AI_SETTINGS' | 'AI_TRAINING' | 'AI_COMMAND_CENTER' | 'ALTERNATIVES' | 'NOTIFICATIONS' | 'INTERNATIONAL_PRICING' | 'PERMISSION_CENTER' | 'REPORTS_CENTER' | 'SEO_CENTER' | 'UNIFIED_PERMISSIONS' | 'ASSIGNMENTS_CENTER';

const VIEW_PERMISSION_MAP: Record<ViewType, PermissionResource> = {
    'DASHBOARD': 'dashboard',
    'CUSTOMERS': 'customers',
    'PRODUCTS': 'products',
    'SETTINGS': 'settings_general',
    'QUOTES': 'quotes',
    'MISSING': 'missing',
    'ORDER_SHORTAGES': 'orders',
    'IMPORT_REQUESTS': 'imports',
    'UNIFIED_ACCOUNT_REQUESTS': 'account_requests',
    'ACCOUNT_REQUESTS': 'account_requests',
    'ACTIVITY_LOGS': 'activity_log',
    'FEEDBACK_CENTER': 'settings_general',
    'MESSAGING_CENTER': 'settings_general',
    'ORDERS_MANAGER': 'orders',
    'ABANDONED_CARTS': 'orders',
    'ADMIN_USERS': 'users',
    'MARKETING': 'settings_general',
    'PRICING': 'settings_general',
    'TRADER_TOOLS': 'settings_general',
    'SUPPLIER_MARKETPLACE': 'settings_general',
    'MARKETERS': 'settings_general',
    'INSTALLMENTS': 'settings_general',
    'ADVERTISING': 'settings_general',
    'TEAM_SETTINGS': 'settings_general',
    'CUSTOMER_PORTAL': 'settings_general',
    'AI_SETTINGS': 'settings_general',
    'AI_TRAINING': 'settings_general',
    'AI_COMMAND_CENTER': 'settings_general',
    'ALTERNATIVES': 'products',
    'PRODUCT_IMAGES': 'products',
    'NOTIFICATIONS': 'dashboard',
    'INTERNATIONAL_PRICING': 'settings_general',
    'PERMISSION_CENTER': 'settings_general',
    'REPORTS_CENTER': 'settings_general',
    'SEO_CENTER': 'settings_general',
    'UNIFIED_PERMISSIONS': 'settings_general',
    'ASSIGNMENTS_CENTER': 'settings_general'
};

const VIEW_LABELS_KEYS: Record<ViewType, string> = {
    'DASHBOARD': 'adminDashboard.views.dashboard',
    'CUSTOMERS': 'adminDashboard.views.customers',
    'PRODUCTS': 'adminDashboard.views.products',
    'SETTINGS': 'adminDashboard.views.settings',
    'QUOTES': 'adminDashboard.views.quotes',
    'MISSING': 'adminDashboard.views.missing',
    'ORDER_SHORTAGES': 'adminDashboard.views.orderShortages',
    'IMPORT_REQUESTS': 'adminDashboard.views.importRequests',
    'UNIFIED_ACCOUNT_REQUESTS': 'adminDashboard.views.accountRequests',
    'ACCOUNT_REQUESTS': 'adminDashboard.views.accountRequests',
    'ACTIVITY_LOGS': 'adminDashboard.views.activityLogs',
    'FEEDBACK_CENTER': 'adminDashboard.views.feedbackCenter',
    'MESSAGING_CENTER': 'adminDashboard.views.messagingCenter',
    'ORDERS_MANAGER': 'adminDashboard.views.ordersManager',
    'ABANDONED_CARTS': 'adminDashboard.views.abandonedCarts',
    'ADMIN_USERS': 'adminDashboard.views.adminUsers',
    'MARKETING': 'adminDashboard.views.marketing',
    'PRICING': 'adminDashboard.views.pricing',
    'TRADER_TOOLS': 'adminDashboard.views.traderTools',
    'SUPPLIER_MARKETPLACE': 'adminDashboard.views.supplierMarketplace',
    'MARKETERS': 'adminDashboard.views.marketers',
    'INSTALLMENTS': 'adminDashboard.views.installments',
    'ADVERTISING': 'adminDashboard.views.advertising',
    'TEAM_SETTINGS': 'adminDashboard.views.teamSettings',
    'CUSTOMER_PORTAL': 'adminDashboard.views.customerPortal',
    'AI_SETTINGS': 'adminDashboard.views.aiSettings',
    'AI_TRAINING': 'adminDashboard.views.aiTraining',
    'AI_COMMAND_CENTER': 'adminDashboard.views.aiCommandCenter',
    'ALTERNATIVES': 'adminDashboard.views.alternatives',
    'PRODUCT_IMAGES': 'adminDashboard.views.productImages',
    'NOTIFICATIONS': 'adminDashboard.views.notifications',
    'INTERNATIONAL_PRICING': 'adminDashboard.views.internationalPricing',
    'PERMISSION_CENTER': 'adminDashboard.views.permissionCenter',
    'REPORTS_CENTER': 'adminDashboard.views.reportsCenter',
    'SEO_CENTER': 'adminDashboard.views.seoCenter',
    'UNIFIED_PERMISSIONS': 'adminDashboard.views.unifiedPermissions',
    'ASSIGNMENTS_CENTER': 'adminDashboard.views.assignmentsCenter'
};

// Color Constants for Navy & Gold Theme
const COLORS = {
    navy: '#0B1B3A',
    navyLight: '#1a2e56',
    gold: '#C8A04F',
    goldLight: '#e6c47d',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    slate: '#64748b'
};

const PIE_COLORS = [COLORS.gold, COLORS.navyLight, COLORS.success, COLORS.slate];

// Inner component that uses the hooks
const AdminDashboardInner: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const { t, i18n } = useTranslation();

    // Persist view state in localStorage
    const [view, setView] = useState<ViewType>(() => {
        const savedView = localStorage.getItem('admin_dashboard_view');
        if (savedView && Object.keys(VIEW_LABELS_KEYS).includes(savedView)) {
            return savedView as ViewType;
        }
        return 'DASHBOARD';
    });
    const isRtl = i18n.dir() === 'rtl';

    // Save view to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('admin_dashboard_view', view);
    }, [view]);

    // Admin badges from context
    const { badges, markOrdersAsSeen, markAccountsAsSeen, markQuotesAsSeen, markImportsAsSeen, markMissingAsSeen, markOrderShortagesAsSeen } = useAdminBadges();

    // Permissions from context
    const { hasPermission, canAccess, isSuperAdmin, adminUser, role, loading: permissionLoading } = usePermission();

    // Data States
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [importRequests, setImportRequests] = useState<ImportRequest[]>([]);
    const [accountRequests, setAccountRequests] = useState<AccountOpeningRequest[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
    const [missingRequests, setMissingRequests] = useState<MissingProductRequest[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Connection Status
    const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'SLOW' | 'DISCONNECTED'>('CONNECTED');
    const [latency, setLatency] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    // Activity Log Pagination
    const [logPage, setLogPage] = useState(1);
    const LOGS_PER_PAGE = 20;

    const { addToast } = useToast();

    // Initial Data Load
    useEffect(() => {
        fetchAllData();
        const interval = setInterval(checkConnection, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);


    const fetchAllData = async () => {
        try {
            const [
                fetchedOrders,
                fetchedUsers, // Note: This actually returns {user, profile}[] from Api.getAllUsers() wrapper, but we access raw users from storage in Api
                fetchedProducts,
                fetchedQuotes,
                fetchedImports,
                fetchedAccounts,
                fetchedLogs,
                fetchedMissing,
                fetchedNotifs
            ] = await Promise.all([
                services.orders.getAllOrders(),
                // We need raw users array for counting
                new Promise<User[]>(resolve => resolve(JSON.parse(localStorage.getItem('b2b_users_sini_v2') || '[]'))),
                Api.searchProducts(''),
                Api.getAllQuoteRequests(),
                Api.getImportRequests(),
                Api.getAccountOpeningRequests(),
                Api.getActivityLogs(),
                Api.getMissingProductRequests(),
                Api.getAllNotifications()
            ]);

            // Safe guards: ضمان أن كل القيم arrays حتى لو رجع null/undefined
            setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
            setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
            setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
            setQuotes(Array.isArray(fetchedQuotes) ? fetchedQuotes : []);
            setImportRequests(Array.isArray(fetchedImports) ? fetchedImports : []);
            setAccountRequests(Array.isArray(fetchedAccounts) ? fetchedAccounts : []);
            setActivityLogs(Array.isArray(fetchedLogs) ? fetchedLogs : []);
            setMissingRequests(Array.isArray(fetchedMissing) ? fetchedMissing : []);
            setNotifications(Array.isArray(fetchedNotifs) ? fetchedNotifs : []);

            checkConnection(); // Check connection after fetch
        } catch (e) {
            console.error("Failed to load admin data", e);
            setConnectionStatus('DISCONNECTED');
        }
    };

    const checkConnection = async () => {
        setIsRetrying(true);
        try {
            const result = await Api.checkHealth();
            setLatency(result.latency);
            if (result.latency > 500) setConnectionStatus('SLOW');
            else setConnectionStatus('CONNECTED');
        } catch (e) {
            setConnectionStatus('DISCONNECTED');
        } finally {
            setIsRetrying(false);
        }
    };

    // --- Computed Analytics (Memoized) ---

    const kpiData = useMemo(() => {
        // Defensive: Ensure arrays are defined
        const safeOrders = orders || [];
        const safeProducts = products || [];
        const safeUsers = users || [];
        const safeAccountRequests = accountRequests || [];
        const safeQuotes = quotes || [];

        // Revenue
        const totalRevenue = safeOrders
            .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED)
            .reduce((acc, o) => acc + o.totalAmount, 0);

        const todayRevenue = safeOrders
            .filter(o => new Date(o.date).toDateString() === new Date().toDateString())
            .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED)
            .reduce((acc, o) => acc + o.totalAmount, 0);

        // Orders
        const pendingOrders = safeOrders.filter(o => o.status === OrderStatus.PENDING).length;
        const approvedOrders = safeOrders.filter(o => o.status === OrderStatus.APPROVED).length;
        const shippedOrders = safeOrders.filter(o => o.status === OrderStatus.SHIPPED).length;
        const cancelledOrders = safeOrders.filter(o => o.status === OrderStatus.CANCELLED).length;

        // Inventory
        const outOfStock = safeProducts.filter(p => p.stock <= 0).length;
        const needsPriceUpdate = safeProducts.filter(p => p.price === 0).length; // Assumption

        // Users
        const activeBusinesses = safeUsers.filter(u => u.role === 'CUSTOMER_OWNER' && u.isActive).length;
        const pendingAccounts = safeAccountRequests.filter(r => r.status === 'NEW').length;
        const pendingQuotes = safeQuotes.filter(q => q.status === 'NEW' || q.status === 'UNDER_REVIEW').length;

        return {
            totalRevenue, todayRevenue,
            pendingOrders, approvedOrders, shippedOrders, cancelledOrders, totalOrders: safeOrders.length,
            totalProducts: safeProducts.length, outOfStock, needsPriceUpdate,
            activeBusinesses, pendingAccounts, totalUsers: safeUsers.length, pendingQuotes
        };
    }, [orders, products, users, accountRequests, quotes]);

    const graphData = useMemo(() => {
        // Last 30 Days Order Volume & Revenue
        const last30Days = [...Array(30)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toISOString().split('T')[0];
        });

        const dailyStats = last30Days.map(date => {
            const safeOrders = orders || [];
            const dayOrders = safeOrders.filter(o => o.date.startsWith(date));
            return {
                date: date.slice(5), // MM-DD
                orders: dayOrders.length,
                revenue: dayOrders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((acc, o) => acc + o.totalAmount, 0)
            };
        });

        return { dailyStats };
    }, [orders]);

    const insights = useMemo(() => {
        // Defensive: Ensure arrays are defined
        const safeMissingRequests = missingRequests || [];
        const safeOrders = orders || [];

        // Most searched missing terms
        const searchCounts: Record<string, number> = {};
        safeMissingRequests.filter(req => req.source === 'SEARCH').forEach(req => {
            const term = req.query.trim().toLowerCase();
            searchCounts[term] = (searchCounts[term] || 0) + 1;
        });
        const topMissing = Object.entries(searchCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Top Customers
        const customerSpend: Record<string, number> = {};
        safeOrders.forEach(o => {
            if (o.status !== OrderStatus.CANCELLED) {
                customerSpend[o.createdByName || o.userId] = (customerSpend[o.createdByName || o.userId] || 0) + o.totalAmount;
            }
        });
        const topCustomers = Object.entries(customerSpend)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return { topMissing, topCustomers };
    }, [missingRequests, orders]);

    const activitySummary = useMemo(() => {
        const safeActivityLogs = activityLogs || [];
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = safeActivityLogs.filter(l => l.createdAt.startsWith(today));
        return {
            logins: todayLogs.filter(l => l.eventType === 'LOGIN').length,
            orders: todayLogs.filter(l => l.eventType === 'ORDER_CREATED').length,
            quotes: todayLogs.filter(l => l.eventType === 'QUOTE_REQUEST').length,
            searches: todayLogs.filter(l => l.eventType === 'SEARCH_PERFORMED').length,
        };
    }, [activityLogs]);

    // --- Render Components ---

    return (
        <div className={`flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Sidebar - Using extracted AdminDashboardSidebar */}
            <AdminDashboardSidebar
                view={view}
                setView={setView}
                canAccess={canAccess}
                badges={badges}
                fetchAllData={fetchAllData}
                markOrdersAsSeen={markOrdersAsSeen}
                markAccountsAsSeen={markAccountsAsSeen}
                markQuotesAsSeen={markQuotesAsSeen}
                markImportsAsSeen={markImportsAsSeen}
                markMissingAsSeen={markMissingAsSeen}
                markOrderShortagesAsSeen={markOrderShortagesAsSeen}
                onLogout={onLogout}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative scroll-smooth">
                {/* Top Bar - Using extracted AdminDashboardHeader */}
                <AdminDashboardHeader
                    view={view}
                    setView={setView}
                    adminUser={adminUser}
                    role={role}
                    connectionStatus={connectionStatus}
                    latency={latency}
                    isRetrying={isRetrying}
                    checkConnection={checkConnection}
                />

                <div className="p-8 max-w-[1600px] mx-auto space-y-8">

                    {/* All Views - Using extracted AdminDashboardViewRenderer */}
                    <AdminDashboardViewRenderer
                        view={view}
                        setView={setView}
                        canAccess={canAccess}
                        addToast={addToast}
                        fetchAllData={fetchAllData}
                        data={{
                            kpiData,
                            graphData,
                            insights,
                            activitySummary,
                            notifications,
                            orders,
                            users,
                            quotes,
                            missingRequests,
                            importRequests,
                            adminUser,
                        }}
                    />

                </div>
            </main>
        </div>
    );
};

// --- Simplified Views for Sub-Pages (Ported from original to keep file size managed) ---

const OnlineUsersCard = () => {
    const { t } = useTranslation();
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOnline = async () => {
            try {
                const online = await Api.getOnlineUsers(5); // Active in last 5 mins
                setOnlineUsers(online);
            } catch (e) {
                console.error("Failed to load online users", e);
            } finally {
                setLoading(false);
            }
        };

        loadOnline();
        const interval = setInterval(loadOnline, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const formatLastActive = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return t('adminDashboard.onlineUsers.now');
        return t('adminDashboard.onlineUsers.minutesAgo', { mins });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Zap size={20} className="text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{t('adminDashboard.onlineUsers.title')}</h3>
                        <p className="text-xs text-slate-500">{t('adminDashboard.onlineUsers.subtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xl font-bold text-green-600">{onlineUsers.length}</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <RefreshCw className="animate-spin text-slate-400" size={24} />
                </div>
            ) : onlineUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {onlineUsers.slice(0, 12).map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="relative">
                                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
                                    {user.name?.charAt(0) || '?'}
                                </div>
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-800 truncate">{user.name}</p>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400 font-mono">{user.clientId}</span>
                                    <span className="text-[10px] text-green-600 font-bold">• {user.lastActiveAt ? formatLastActive(user.lastActiveAt) : t('adminDashboard.onlineUsers.online')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-bold">{t('adminDashboard.onlineUsers.noOnlineUsers')}</p>
                </div>
            )}

            {onlineUsers.length > 12 && (
                <p className="text-center mt-4 text-xs text-slate-500">
                    {t('adminDashboard.onlineUsers.moreOnline', { count: onlineUsers.length - 12 })}
                </p>
            )}
        </div>
    );
};

const ActivityLogsView = ({ logs, page, setPage, perPage }: any) => {
    const { t } = useTranslation();
    const start = (page - 1) * perPage;
    const current = logs.slice(start, start + perPage);
    const totalPages = Math.ceil(logs.length / perPage);

    return (
        <div className="space-y-6">
            {/* Online Users Section */}
            <OnlineUsersCard />

            {/* Activity Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity size={18} className="text-slate-600" />
                        {t('adminDashboard.activityLogs.title')}
                    </h3>
                    <span className="text-xs text-slate-500">{logs.length} {t('adminDashboard.activityLogs.activity')}</span>
                </div>
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50/50 text-slate-600 font-bold border-b border-slate-200">
                        <tr><th className="p-4">{t('adminDashboard.activityLogs.time')}</th><th className="p-4">{t('adminDashboard.activityLogs.user')}</th><th className="p-4">{t('adminDashboard.activityLogs.event')}</th><th className="p-4">{t('adminDashboard.activityLogs.details')}</th></tr>
                    </thead>
                    <tbody>
                        {current.length > 0 ? current.map((log: ActivityLogEntry) => (
                            <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="p-4 font-mono text-slate-500 text-xs" dir="ltr">{formatDateTime(log.createdAt)}</td>
                                <td className="p-4 font-bold">{log.userName || log.userId}</td>
                                <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{log.eventType}</span></td>
                                <td className="p-4 text-slate-600">{log.description}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400">
                                    <Clock size={32} className="mx-auto mb-2 opacity-40" />
                                    <p className="font-bold">{t('adminDashboard.activityLogs.noActivities')}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="p-4 flex justify-center gap-4 border-t border-slate-100">
                        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={16} /></button>
                        <span className="text-sm font-bold text-slate-600 pt-1">{page} / {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Wrapper component with providers
export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

    useEffect(() => {
        const loadAdminUser = async () => {
            try {
                // أولاً: محاولة جلب المستخدم الحالي من الـ session
                const currentUser = await Api.getCurrentSession();
                if (currentUser) {
                    // تحويل User إلى AdminUser
                    const adminUserData: AdminUser = {
                        id: currentUser.id,
                        username: currentUser.clientId || currentUser.username || 'admin',
                        email: currentUser.email || '',
                        phone: currentUser.phone || '',
                        fullName: currentUser.name || currentUser.username || 'مدير النظام',
                        roleId: currentUser.role === 'SUPER_ADMIN' ? 'role-super-admin' : 'role-admin',
                        extendedRole: currentUser.role as any,
                        isActive: currentUser.isActive !== false,
                        isSuperAdmin: currentUser.role === 'SUPER_ADMIN',
                        createdAt: currentUser.createdAt || new Date().toISOString(),
                        lastLoginAt: (currentUser as any).lastLoginAt || new Date().toISOString()
                    };
                    setAdminUser(adminUserData);
                    return;
                }
                
                // Fallback: استخدام Api للمستخدمين المحليين
                const users = await Api.getAdminUsers();
                if (users.length > 0) {
                    const superAdmin = users.find(u => u.isActive);
                    setAdminUser(superAdmin || users[0]);
                }
            } catch (e) {
                console.error('Failed to load admin user:', e);
            }
        };
        loadAdminUser();
    }, []);

    return (
        <PermissionProvider initialAdminUser={adminUser}>
            <AdminBadgesProvider>
                <AdminDashboardInner {...props} />
            </AdminBadgesProvider>
        </PermissionProvider>
    );
}
