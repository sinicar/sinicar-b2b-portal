
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { QuoteRequest, MissingProductRequest, ImportRequest, ImportRequestStatus, AccountOpeningRequest, AccountRequestStatus, ActivityLogEntry, Order, Product, User, OrderStatus, Notification, AdminUser, Role, PermissionResource } from '../types';
import { 
    LayoutDashboard, Users, ShoppingBag, ShoppingCart, Settings, FileText, LogOut, 
    CheckCircle, SearchX, Download, Globe, XCircle, Info, Truck, Check, 
    UserPlus, Activity, Clock, ChevronRight, ChevronLeft, BarChart3, 
    TrendingUp, RefreshCw, Zap, Bell, AlertTriangle, ShieldCheck, 
    Database, Server, ExternalLink, Plus, Layers, Megaphone, DollarSign,
    Wrench, Store, UserCheck, Palette, Bot
} from 'lucide-react';
import { LanguageSwitcherLight } from './LanguageSwitcher';
import { AdminSettings } from './AdminSettings';
import { AdminOrdersManager } from './AdminOrdersManager';
import { AdminAccountRequests } from './AdminAccountRequests';
import { AdminQuoteManager } from './AdminQuoteManager'; 
import { AdminMissingParts } from './AdminMissingParts'; 
import { AdminCustomersPage } from './AdminCustomersPage'; 
import { AdminImportManager } from './AdminImportManager';
import { AdminProductsPage } from './AdminProductsPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AccessDenied } from './AccessDenied';
import { AdminMarketingCenter } from './AdminMarketingCenter';
import { AdminPricingCenter } from './AdminPricingCenter';
import { AdminTraderToolsSettings } from './AdminTraderToolsSettings';
import { AdminSupplierMarketplaceSettings } from './AdminSupplierMarketplaceSettings';
import { AdminMarketersPage } from './AdminMarketersPage';
import { AdminInstallmentsPage } from './AdminInstallmentsPage';
import { AdminAdvertisingPage } from './AdminAdvertisingPage';
import { AdminOrganizationSettings } from './AdminOrganizationSettings';
import { AdminCustomerPortalSettings } from './AdminCustomerPortalSettings';
import AdminAISettings from './AdminAISettings';
import { AdminAbandonedCartsPage } from './AdminAbandonedCartsPage';
import { AdminAlternativesPage } from './AdminAlternativesPage';
import { AdminActivityLogPage } from './AdminActivityLogPage';
import AdminFeedbackCenter from './AdminFeedbackCenter';
import { NotificationBell } from './NotificationBell';
import { NotificationsPage } from './NotificationsPage';
import { formatDateTime } from '../utils/dateUtils';
import { Modal } from './Modal';
import { useToast } from '../services/ToastContext';
import { AdminBadgesProvider, useAdminBadges } from '../services/AdminBadgesContext';
import { PermissionProvider, usePermission } from '../services/PermissionContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

interface AdminDashboardProps {
    onLogout: () => void;
}

type ViewType = 'DASHBOARD' | 'CUSTOMERS' | 'PRODUCTS' | 'SETTINGS' | 'QUOTES' | 'MISSING' | 'IMPORT_REQUESTS' | 'ACCOUNT_REQUESTS' | 'ACTIVITY_LOGS' | 'FEEDBACK_CENTER' | 'ORDERS_MANAGER' | 'ABANDONED_CARTS' | 'ADMIN_USERS' | 'MARKETING' | 'PRICING' | 'TRADER_TOOLS' | 'SUPPLIER_MARKETPLACE' | 'MARKETERS' | 'INSTALLMENTS' | 'ADVERTISING' | 'TEAM_SETTINGS' | 'CUSTOMER_PORTAL' | 'AI_SETTINGS' | 'ALTERNATIVES' | 'NOTIFICATIONS';

const VIEW_PERMISSION_MAP: Record<ViewType, PermissionResource> = {
    'DASHBOARD': 'dashboard',
    'CUSTOMERS': 'customers',
    'PRODUCTS': 'products',
    'SETTINGS': 'settings_general',
    'QUOTES': 'quotes',
    'MISSING': 'missing',
    'IMPORT_REQUESTS': 'imports',
    'ACCOUNT_REQUESTS': 'account_requests',
    'ACTIVITY_LOGS': 'activity_log',
    'FEEDBACK_CENTER': 'settings_general',
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
    'ALTERNATIVES': 'products',
    'NOTIFICATIONS': 'dashboard'
};

const VIEW_LABELS_KEYS: Record<ViewType, string> = {
    'DASHBOARD': 'adminDashboard.views.dashboard',
    'CUSTOMERS': 'adminDashboard.views.customers',
    'PRODUCTS': 'adminDashboard.views.products',
    'SETTINGS': 'adminDashboard.views.settings',
    'QUOTES': 'adminDashboard.views.quotes',
    'MISSING': 'adminDashboard.views.missing',
    'IMPORT_REQUESTS': 'adminDashboard.views.importRequests',
    'ACCOUNT_REQUESTS': 'adminDashboard.views.accountRequests',
    'ACTIVITY_LOGS': 'adminDashboard.views.activityLogs',
    'FEEDBACK_CENTER': 'adminDashboard.views.feedbackCenter',
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
    'ALTERNATIVES': 'adminDashboard.views.alternatives',
    'NOTIFICATIONS': 'adminDashboard.views.notifications'
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
    const [view, setView] = useState<ViewType>('DASHBOARD');
    const isRtl = i18n.dir() === 'rtl';
    
    // Admin badges from context
    const { badges, markOrdersAsSeen, markAccountsAsSeen, markQuotesAsSeen, markImportsAsSeen, markMissingAsSeen } = useAdminBadges();
    
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
                fetchedUsers, // Note: This actually returns {user, profile}[] from MockApi.getAllUsers() wrapper, but we access raw users from storage in MockApi
                fetchedProducts, 
                fetchedQuotes,
                fetchedImports,
                fetchedAccounts,
                fetchedLogs,
                fetchedMissing,
                fetchedNotifs
            ] = await Promise.all([
                MockApi.getAllOrders(),
                // We need raw users array for counting
                new Promise<User[]>(resolve => resolve(JSON.parse(localStorage.getItem('b2b_users_sini_v2') || '[]'))),
                MockApi.searchProducts(''),
                MockApi.getAllQuoteRequests(),
                MockApi.getImportRequests(),
                MockApi.getAccountOpeningRequests(),
                MockApi.getActivityLogs(),
                MockApi.getMissingProductRequests(),
                MockApi.getAllNotifications()
            ]);

            setOrders(fetchedOrders);
            setUsers(fetchedUsers);
            setProducts(fetchedProducts);
            setQuotes(fetchedQuotes);
            setImportRequests(fetchedImports);
            setAccountRequests(fetchedAccounts);
            setActivityLogs(fetchedLogs);
            setMissingRequests(fetchedMissing);
            setNotifications(fetchedNotifs);
            
            checkConnection(); // Check connection after fetch
        } catch (e) {
            console.error("Failed to load admin data", e);
            setConnectionStatus('DISCONNECTED');
        }
    };

    const checkConnection = async () => {
        setIsRetrying(true);
        try {
            const result = await MockApi.checkHealth();
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
        // Revenue
        const totalRevenue = orders
            .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED)
            .reduce((acc, o) => acc + o.totalAmount, 0);
        
        const todayRevenue = orders
            .filter(o => new Date(o.date).toDateString() === new Date().toDateString())
            .filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REJECTED)
            .reduce((acc, o) => acc + o.totalAmount, 0);

        // Orders
        const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
        const approvedOrders = orders.filter(o => o.status === OrderStatus.APPROVED).length;
        const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED).length;
        const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED).length;

        // Inventory
        const outOfStock = products.filter(p => p.stock <= 0).length;
        const needsPriceUpdate = products.filter(p => p.price === 0).length; // Assumption

        // Users
        const activeBusinesses = users.filter(u => u.role === 'CUSTOMER_OWNER' && u.isActive).length;
        const pendingAccounts = accountRequests.filter(r => r.status === 'NEW').length;
        const pendingQuotes = quotes.filter(q => q.status === 'NEW' || q.status === 'UNDER_REVIEW').length;

        return {
            totalRevenue, todayRevenue,
            pendingOrders, approvedOrders, shippedOrders, cancelledOrders, totalOrders: orders.length,
            totalProducts: products.length, outOfStock, needsPriceUpdate,
            activeBusinesses, pendingAccounts, totalUsers: users.length, pendingQuotes
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
            const dayOrders = orders.filter(o => o.date.startsWith(date));
            return {
                date: date.slice(5), // MM-DD
                orders: dayOrders.length,
                revenue: dayOrders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((acc, o) => acc + o.totalAmount, 0)
            };
        });

        return { dailyStats };
    }, [orders]);

    const insights = useMemo(() => {
        // Most searched missing terms
        const searchCounts: Record<string, number> = {};
        missingRequests.filter(req => req.source === 'SEARCH').forEach(req => {
            const term = req.query.trim().toLowerCase();
            searchCounts[term] = (searchCounts[term] || 0) + 1;
        });
        const topMissing = Object.entries(searchCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Top Customers
        const customerSpend: Record<string, number> = {};
        orders.forEach(o => {
            if(o.status !== OrderStatus.CANCELLED) {
                customerSpend[o.createdByName || o.userId] = (customerSpend[o.createdByName || o.userId] || 0) + o.totalAmount;
            }
        });
        const topCustomers = Object.entries(customerSpend)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return { topMissing, topCustomers };
    }, [missingRequests, orders]);

    const activitySummary = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = activityLogs.filter(l => l.createdAt.startsWith(today));
        return {
            logins: todayLogs.filter(l => l.eventType === 'LOGIN').length,
            orders: todayLogs.filter(l => l.eventType === 'ORDER_CREATED').length,
            quotes: todayLogs.filter(l => l.eventType === 'QUOTE_REQUEST').length,
            searches: todayLogs.filter(l => l.eventType === 'SEARCH_PERFORMED').length,
        };
    }, [activityLogs]);

    // --- Render Components ---

    const ConnectionWidget = () => (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border text-sm font-bold shadow-sm backdrop-blur-md transition-all ${
            connectionStatus === 'CONNECTED' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' :
            connectionStatus === 'SLOW' ? 'bg-amber-50/90 border-amber-200 text-amber-700' :
            'bg-red-50/90 border-red-200 text-red-700'
        }`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                connectionStatus === 'CONNECTED' ? 'bg-emerald-500' :
                connectionStatus === 'SLOW' ? 'bg-amber-500' : 'bg-red-500'
            }`}></div>
            <span className="hidden md:inline">
                {connectionStatus === 'CONNECTED' ? t('adminDashboard.connected') : connectionStatus === 'SLOW' ? t('adminDashboard.slowConnection') : t('adminDashboard.disconnected')}
            </span>
            <span className="font-mono text-xs opacity-70">({latency}ms)</span>
            <button onClick={checkConnection} disabled={isRetrying} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
            </button>
        </div>
    );

    const StatCard = ({ title, value, subValue, icon, colorClass, delay }: any) => (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group animate-slide-up" style={{animationDelay: delay}}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-brand-600 transition-colors">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(icon, { size: 20, className: colorClass.replace('bg-', 'text-') })}
                </div>
            </div>
            {subValue && (
                <div className="pt-3 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400">{subValue}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className={`flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Sidebar */}
            <aside className="w-72 bg-[#0B1B3A] text-white flex flex-col shadow-2xl z-20 flex-shrink-0">
                <div className="p-6 border-b border-slate-700/50 bg-[#08142b]">
                     <h1 className="text-xl font-black uppercase tracking-wider text-[#C8A04F] font-display flex items-center gap-2">
                        <ShieldCheck size={24} /> SINI ADMIN
                     </h1>
                     <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-widest uppercase">Wholesale Control Center</p>
                </div>
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('adminDashboard.mainSection')}</p>
                    {canAccess('dashboard') && (
                        <NavItem icon={<LayoutDashboard size={20} />} label={t('adminDashboard.dashboard')} active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} />
                    )}
                    {canAccess('activity_log') && (
                        <NavItem icon={<Activity size={20} />} label={t('adminDashboard.activityLog')} active={view === 'ACTIVITY_LOGS'} onClick={() => setView('ACTIVITY_LOGS')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Megaphone size={20} />} label={t('adminDashboard.feedbackCenter', 'مركز الملاحظات')} active={view === 'FEEDBACK_CENTER'} onClick={() => setView('FEEDBACK_CENTER')} />
                    )}
                    
                    <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-4">{t('adminDashboard.ordersCustomersSection')}</p>
                    {canAccess('orders') && (
                        <NavItem icon={<ShoppingBag size={20} />} label={t('adminDashboard.customerOrders')} active={view === 'ORDERS_MANAGER'} onClick={() => { setView('ORDERS_MANAGER'); markOrdersAsSeen(); }} badge={badges.orders} />
                    )}
                    {canAccess('orders') && (
                        <NavItem icon={<ShoppingCart size={20} />} label={t('adminDashboard.abandonedCarts', 'السلات المتروكة')} active={view === 'ABANDONED_CARTS'} onClick={() => setView('ABANDONED_CARTS')} />
                    )}
                    {canAccess('account_requests') && (
                        <NavItem icon={<UserPlus size={20} />} label={t('adminDashboard.accountRequests')} active={view === 'ACCOUNT_REQUESTS'} onClick={() => { setView('ACCOUNT_REQUESTS'); markAccountsAsSeen(); }} badge={badges.accounts} />
                    )}
                    {canAccess('customers') && (
                        <NavItem icon={<Users size={20} />} label={t('adminDashboard.customersCRM')} active={view === 'CUSTOMERS'} onClick={() => setView('CUSTOMERS')} />
                    )}
                    {canAccess('quotes') && (
                        <NavItem icon={<FileText size={20} />} label={t('adminDashboard.quoteRequests')} active={view === 'QUOTES'} onClick={() => { setView('QUOTES'); markQuotesAsSeen(); }} badge={badges.quotes} />
                    )}
                    {canAccess('imports') && (
                        <NavItem icon={<Globe size={20} />} label={t('adminDashboard.importRequests')} active={view === 'IMPORT_REQUESTS'} onClick={() => { setView('IMPORT_REQUESTS'); markImportsAsSeen(); }} badge={badges.imports} />
                    )}
                    {canAccess('missing') && (
                        <NavItem icon={<SearchX size={20} />} label={t('adminDashboard.missingParts')} active={view === 'MISSING'} onClick={() => { setView('MISSING'); markMissingAsSeen(); }} badge={badges.missing} />
                    )}
                    
                    <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-4">{t('adminDashboard.settingsSection')}</p>
                    {canAccess('products') && (
                        <NavItem icon={<Database size={20} />} label={t('adminDashboard.products')} active={view === 'PRODUCTS'} onClick={() => setView('PRODUCTS')} />
                    )}
                    {canAccess('products') && (
                        <NavItem icon={<Layers size={20} />} label={t('adminDashboard.alternatives', 'بدائل الأصناف')} active={view === 'ALTERNATIVES'} onClick={() => setView('ALTERNATIVES')} />
                    )}
                    {canAccess('users') && (
                        <NavItem icon={<Users size={20} />} label={t('adminDashboard.users')} active={view === 'ADMIN_USERS'} onClick={() => setView('ADMIN_USERS')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Settings size={20} />} label={t('adminDashboard.systemSettings')} active={view === 'SETTINGS'} onClick={() => setView('SETTINGS')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Megaphone size={20} />} label={t('adminDashboard.marketingCenter')} active={view === 'MARKETING'} onClick={() => setView('MARKETING')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<DollarSign size={20} />} label={t('adminDashboard.pricingCenter')} active={view === 'PRICING'} onClick={() => setView('PRICING')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Wrench size={20} />} label={t('adminDashboard.traderTools')} active={view === 'TRADER_TOOLS'} onClick={() => setView('TRADER_TOOLS')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Store size={20} />} label={t('adminDashboard.supplierMarketplace')} active={view === 'SUPPLIER_MARKETPLACE'} onClick={() => setView('SUPPLIER_MARKETPLACE')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<UserCheck size={20} />} label={t('adminDashboard.marketers')} active={view === 'MARKETERS'} onClick={() => setView('MARKETERS')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<DollarSign size={20} />} label={t('adminDashboard.installments')} active={view === 'INSTALLMENTS'} onClick={() => setView('INSTALLMENTS')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Megaphone size={20} />} label={t('adminDashboard.advertising')} active={view === 'ADVERTISING'} onClick={() => setView('ADVERTISING')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Users size={20} />} label={t('adminDashboard.teamSettings')} active={view === 'TEAM_SETTINGS'} onClick={() => setView('TEAM_SETTINGS')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Palette size={20} />} label={t('adminDashboard.customerPortalSettings')} active={view === 'CUSTOMER_PORTAL'} onClick={() => setView('CUSTOMER_PORTAL')} />
                    )}
                    {canAccess('settings_general') && (
                        <NavItem icon={<Bot size={20} />} label={t('adminDashboard.aiSettings')} active={view === 'AI_SETTINGS'} onClick={() => setView('AI_SETTINGS')} />
                    )}
                </nav>
                <div className="p-4 border-t border-slate-700/50 bg-[#08142b]">
                    <button onClick={onLogout} className="flex items-center gap-3 text-red-400 hover:text-white text-sm font-bold w-full px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors">
                        <LogOut size={18} /> {t('nav.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative scroll-smooth">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        {view === 'DASHBOARD' && t('adminDashboard.pageTitles.dashboard')}
                        {view === 'ORDERS_MANAGER' && t('adminDashboard.pageTitles.ordersManager')}
                        {view === 'ABANDONED_CARTS' && t('adminDashboard.pageTitles.abandonedCarts', 'السلات المتروكة')}
                        {view === 'ACTIVITY_LOGS' && t('adminDashboard.pageTitles.activityLogs')}
                        {view === 'FEEDBACK_CENTER' && t('adminDashboard.pageTitles.feedbackCenter', 'مركز الملاحظات')}
                        {view === 'ACCOUNT_REQUESTS' && t('adminDashboard.pageTitles.accountRequests')}
                        {view === 'CUSTOMERS' && t('adminDashboard.pageTitles.customers')}
                        {view === 'QUOTES' && t('adminDashboard.pageTitles.quotes')}
                        {view === 'IMPORT_REQUESTS' && t('adminDashboard.pageTitles.imports')}
                        {view === 'MISSING' && t('adminDashboard.pageTitles.missing')}
                        {view === 'SETTINGS' && t('adminDashboard.pageTitles.settings')}
                        {view === 'ADMIN_USERS' && t('adminDashboard.pageTitles.users')}
                        {view === 'MARKETING' && t('adminDashboard.pageTitles.marketing')}
                        {view === 'PRICING' && t('adminDashboard.pageTitles.pricing')}
                        {view === 'TRADER_TOOLS' && t('adminDashboard.pageTitles.traderTools')}
                        {view === 'SUPPLIER_MARKETPLACE' && t('adminDashboard.pageTitles.supplierMarketplace')}
                        {view === 'MARKETERS' && t('adminDashboard.pageTitles.marketers')}
                        {view === 'INSTALLMENTS' && t('adminDashboard.pageTitles.installments')}
                        {view === 'ADVERTISING' && t('adminDashboard.pageTitles.advertising')}
                        {view === 'TEAM_SETTINGS' && t('adminDashboard.pageTitles.teamSettings')}
                        {view === 'CUSTOMER_PORTAL' && t('adminDashboard.pageTitles.customerPortal')}
                        {view === 'AI_SETTINGS' && t('adminDashboard.pageTitles.aiSettings')}
                        {view === 'NOTIFICATIONS' && t('adminDashboard.pageTitles.notifications', 'الإشعارات')}
                        {['PRODUCTS'].includes(view) && t('adminDashboard.pageTitles.products')}
                    </h2>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcherLight />
                        <ConnectionWidget />
                        {adminUser && (
                            <NotificationBell 
                                user={{ 
                                    id: adminUser.id, 
                                    username: adminUser.username, 
                                    email: adminUser.email, 
                                    phone: '', 
                                    role: 'ADMIN', 
                                    status: adminUser.isActive ? 'ACTIVE' : 'PENDING', 
                                    createdAt: adminUser.createdAt, 
                                    hasProfile: true 
                                }} 
                                onViewAll={() => setView('NOTIFICATIONS')}
                            />
                        )}
                        <div className="w-px h-8 bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-slate-800">{adminUser?.fullName || t('adminDashboard.generalManager')}</p>
                                <p className="text-left text-[10px] text-slate-500 font-mono">{role?.name || 'Super Admin'}</p>
                            </div>
                            <div className="w-10 h-10 bg-[#0B1B3A] rounded-full flex items-center justify-center text-[#C8A04F] shadow-md border-2 border-[#C8A04F]">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                    
                    {view === 'DASHBOARD' && (
                        <>
                            {/* KPI Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard 
                                    title={t('adminDashboard.stats.todayRevenue')} 
                                    value={`${kpiData.todayRevenue.toLocaleString()} ${t('customerDashboard.sar')}`} 
                                    subValue={`${t('adminDashboard.stats.totalRevenue')}: ${kpiData.totalRevenue.toLocaleString()} ${t('customerDashboard.sar')}`}
                                    icon={<BarChart3 />} 
                                    colorClass="text-emerald-600 bg-emerald-100"
                                    delay="0ms"
                                />
                                <StatCard 
                                    title={t('adminDashboard.stats.pendingOrders')} 
                                    value={kpiData.pendingOrders} 
                                    subValue={`${kpiData.approvedOrders} ${t('adminDashboard.stats.approvedOrders')} | ${kpiData.shippedOrders} ${t('adminDashboard.stats.shippedOrders')}`}
                                    icon={<ShoppingBag />} 
                                    colorClass="text-blue-600 bg-blue-100"
                                    delay="50ms"
                                />
                                <StatCard 
                                    title={t('adminDashboard.stats.activeBusinesses')} 
                                    value={kpiData.activeBusinesses} 
                                    subValue={`${kpiData.pendingAccounts} ${t('adminDashboard.stats.pendingAccounts')}`}
                                    icon={<Users />} 
                                    colorClass="text-[#C8A04F] bg-amber-100"
                                    delay="100ms"
                                />
                                <StatCard 
                                    title={t('adminDashboard.stats.pendingQuotes')} 
                                    value={kpiData.pendingQuotes} 
                                    subValue={t('common.noData')}
                                    icon={<FileText />} 
                                    colorClass="text-slate-600 bg-slate-200"
                                    delay="150ms"
                                />
                            </div>

                            {/* Charts & Quick Tools Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Chart (Revenue) */}
                                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <TrendingUp size={20} className="text-[#C8A04F]" /> {t('adminDashboard.charts.dailyRevenue')} (30)
                                        </h3>
                                    </div>
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={graphData.dailyStats}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={COLORS.navy} stopOpacity={0.2}/>
                                                        <stop offset="95%" stopColor={COLORS.navy} stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                                <Tooltip 
                                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                                                    formatter={(value: number) => [`${value.toLocaleString()} ${t('customerDashboard.sar')}`, t('adminDashboard.charts.revenue')]}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke={COLORS.navy} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Quick Tools & Orders Chart */}
                                <div className="space-y-6">
                                    {/* Tools */}
                                    <div className="bg-[#0B1B3A] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A04F] rounded-full blur-[60px] opacity-20"></div>
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
                                            <Zap size={20} className="text-[#C8A04F]" /> {t('dashboard.quickActions')}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 relative z-10">
                                            <QuickActionBtn label={t('products.addProduct')} icon={<Plus size={16}/>} onClick={() => setView('PRODUCTS')} />
                                            <QuickActionBtn label={t('common.refresh')} icon={<RefreshCw size={16}/>} onClick={() => setView('PRODUCTS')} />
                                            <QuickActionBtn label={t('adminDashboard.stats.pendingOrders')} icon={<Clock size={16}/>} onClick={() => setView('QUOTES')} />
                                            <QuickActionBtn label={t('common.export')} icon={<Download size={16}/>} onClick={() => addToast(t('common.loading'), 'success')} />
                                        </div>
                                    </div>

                                    {/* Orders Mini Chart */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[200px] flex flex-col">
                                        <h3 className="font-bold text-slate-800 text-sm mb-4">{t('adminDashboard.charts.dailyOrders')}</h3>
                                        <div className="flex-1 w-full min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={graphData.dailyStats}>
                                                    <Bar dataKey="orders" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
                                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Grid: Insights & Alerts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* AI Insights */}
                                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <SearchX size={20} className="text-red-500" /> {t('adminDashboard.charts.topMissingParts')}
                                    </h3>
                                    <div className="space-y-4">
                                        {insights.topMissing.length > 0 ? insights.topMissing.map(([term, count], i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</span>
                                                    <span className="font-bold text-slate-700">{term}</span>
                                                </div>
                                                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">{count} {t('common.search')}</span>
                                            </div>
                                        )) : (
                                            <p className="text-center text-slate-400 py-8">{t('common.noData')}</p>
                                        )}
                                    </div>
                                    <button onClick={() => setView('MISSING')} className="w-full mt-4 text-center text-sm font-bold text-brand-600 hover:text-brand-700 py-2">{t('common.view')} {t('adminDashboard.missingParts')}</button>
                                </div>

                                {/* Activity Summary */}
                                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Activity size={20} className="text-blue-500" /> {t('adminDashboard.activityLog')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <ActivityCard label={t('adminDashboard.activity.logins')} value={activitySummary.logins} color="blue" />
                                        <ActivityCard label={t('adminDashboard.activity.ordersCreated')} value={activitySummary.orders} color="emerald" />
                                        <ActivityCard label={t('adminDashboard.activity.quotesRequested')} value={activitySummary.quotes} color="amber" />
                                        <ActivityCard label={t('adminDashboard.activity.searchesPerformed')} value={activitySummary.searches} color="slate" />
                                    </div>
                                    <button onClick={() => setView('ACTIVITY_LOGS')} className="w-full mt-6 bg-slate-50 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                                        <ExternalLink size={16} /> {t('common.view')} {t('adminDashboard.activityLog')}
                                    </button>
                                </div>

                                {/* Latest Alerts */}
                                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Bell size={20} className="text-slate-400" /> {t('nav.notifications')}
                                    </h3>
                                    <div className="space-y-4">
                                        {notifications.slice(0, 5).map(n => (
                                            <div key={n.id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                                                <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{n.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{n.message}</p>
                                                    <span className="text-[10px] text-slate-400 mt-1 block">{formatDateTime(n.createdAt)}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && <p className="text-center text-slate-400 py-8">{t('notifications.noNotifications')}</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- OTHER VIEWS HANDLER WITH PERMISSION CHECKS --- */}
                    {view === 'SETTINGS' && (
                        canAccess('settings_general') 
                            ? <AdminSettings /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'ADMIN_USERS' && (
                        canAccess('users') 
                            ? <AdminUsersPage onRefresh={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'MARKETING' && (
                        canAccess('settings_general') 
                            ? <AdminMarketingCenter /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}

                    {view === 'PRICING' && (
                        canAccess('settings_general') 
                            ? <AdminPricingCenter /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'TRADER_TOOLS' && (
                        canAccess('settings_general') 
                            ? <AdminTraderToolsSettings /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'SUPPLIER_MARKETPLACE' && (
                        canAccess('settings_general') 
                            ? <AdminSupplierMarketplaceSettings /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'MARKETERS' && (
                        canAccess('settings_general') 
                            ? <AdminMarketersPage /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'INSTALLMENTS' && (
                        canAccess('settings_general') 
                            ? <AdminInstallmentsPage /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'ADVERTISING' && (
                        canAccess('settings_general') 
                            ? <AdminAdvertisingPage /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'TEAM_SETTINGS' && (
                        canAccess('settings_general') 
                            ? <AdminOrganizationSettings /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'CUSTOMER_PORTAL' && (
                        canAccess('settings_general') 
                            ? <AdminCustomerPortalSettings /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'AI_SETTINGS' && (
                        canAccess('settings_general') 
                            ? <AdminAISettings /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'ORDERS_MANAGER' && (
                        canAccess('orders') 
                            ? <AdminOrdersManager orders={orders} users={users} onUpdate={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'ABANDONED_CARTS' && (
                        canAccess('orders') 
                            ? <AdminAbandonedCartsPage onRefresh={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'ACCOUNT_REQUESTS' && (
                        canAccess('account_requests') 
                            ? <AdminAccountRequests requests={accountRequests} onUpdate={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'CUSTOMERS' && (
                        canAccess('customers') 
                            ? <AdminCustomersPage /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'QUOTES' && (
                        canAccess('quotes') 
                            ? <AdminQuoteManager quotes={quotes} onUpdate={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'MISSING' && (
                        canAccess('missing') 
                            ? <AdminMissingParts missingRequests={missingRequests} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'IMPORT_REQUESTS' && (
                        canAccess('imports') 
                            ? <AdminImportManager requests={importRequests} onUpdate={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'ACTIVITY_LOGS' && (
                        canAccess('activity_log') 
                            ? <AdminActivityLogPage /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    {view === 'FEEDBACK_CENTER' && (
                        canAccess('settings_general') 
                            ? <AdminFeedbackCenter /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}
                    
                    {view === 'PRODUCTS' && (
                        canAccess('products') 
                            ? <AdminProductsPage onRefresh={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}

                    {view === 'ALTERNATIVES' && (
                        canAccess('products') 
                            ? <AdminAlternativesPage onRefresh={fetchAllData} /> 
                            : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
                    )}

                    {view === 'NOTIFICATIONS' && adminUser && (
                        <NotificationsPage 
                            user={{ 
                                id: adminUser.id, 
                                username: adminUser.username, 
                                email: adminUser.email, 
                                phone: '', 
                                role: 'ADMIN', 
                                status: adminUser.isActive ? 'ACTIVE' : 'PENDING', 
                                createdAt: adminUser.createdAt, 
                                hasProfile: true 
                            }}
                            onBack={() => setView('DASHBOARD')}
                        />
                    )}

                </div>
            </main>
        </div>
    );
};

// --- Sub Components ---

const NavItem = ({ icon, label, active, onClick, badge }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${active ? 'bg-[#C8A04F] text-[#0B1B3A] font-black shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'}`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm">{label}</span>
        </div>
        {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
);

const QuickActionBtn = ({ label, icon, onClick }: any) => (
    <button onClick={onClick} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl font-bold text-xs transition-all border border-white/5 backdrop-blur-sm">
        {icon} {label}
    </button>
);

const ActivityCard = ({ label, value, color }: any) => {
    const colors: any = { blue: 'bg-blue-50 text-blue-700', emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', slate: 'bg-slate-100 text-slate-700' };
    return (
        <div className={`p-4 rounded-xl ${colors[color]} text-center`}>
            <p className="text-2xl font-black mb-1">{value}</p>
            <p className="text-xs font-bold opacity-70">{label}</p>
        </div>
    );
}

// --- Simplified Views for Sub-Pages (Ported from original to keep file size managed) ---

const OnlineUsersCard = () => {
    const { t } = useTranslation();
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOnline = async () => {
            try {
                const online = await MockApi.getOnlineUsers(5); // Active in last 5 mins
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
                        <button disabled={page===1} onClick={() => setPage(page-1)} className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={16}/></button>
                        <span className="text-sm font-bold text-slate-600 pt-1">{page} / {totalPages}</span>
                        <button disabled={page===totalPages} onClick={() => setPage(page+1)} className="p-2 border rounded hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={16}/></button>
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
                const users = await MockApi.getAdminUsers();
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
