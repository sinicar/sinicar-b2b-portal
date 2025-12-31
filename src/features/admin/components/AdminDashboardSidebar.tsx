import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    LayoutDashboard, Activity, ShoppingBag, ShoppingCart, UserPlus, Users, FileText, 
    Globe, SearchX, Package, Database, Layers, FileImage, Settings, Megaphone, 
    DollarSign, Wrench, Store, UserCheck, Palette, Bot, Brain, Terminal, Shield,
    BarChart3, Bell, LogOut, ShieldCheck
} from 'lucide-react';
import type { PermissionResource } from '../../../types';

// ============================================================================
// AdminDashboardSidebar (COPY ONLY - Step H1)
// Source: AdminDashboard.tsx lines 391-513 (Sidebar JSX)
// Plus: NavItem helper from lines 764-772
// NOTE: Not wired yet. This is the exact JSX/CSS copied from AdminDashboard.
// ============================================================================

// --- ViewType (matching AdminDashboard.tsx) ---
type ViewType = 'DASHBOARD' | 'CUSTOMERS' | 'PRODUCTS' | 'PRODUCT_IMAGES' | 'SETTINGS' | 'QUOTES' | 'MISSING' | 'ORDER_SHORTAGES' | 'IMPORT_REQUESTS' | 'UNIFIED_ACCOUNT_REQUESTS' | 'ACCOUNT_REQUESTS' | 'ACTIVITY_LOGS' | 'FEEDBACK_CENTER' | 'MESSAGING_CENTER' | 'ORDERS_MANAGER' | 'ABANDONED_CARTS' | 'ADMIN_USERS' | 'MARKETING' | 'PRICING' | 'TRADER_TOOLS' | 'SUPPLIER_MARKETPLACE' | 'MARKETERS' | 'INSTALLMENTS' | 'ADVERTISING' | 'TEAM_SETTINGS' | 'CUSTOMER_PORTAL' | 'AI_SETTINGS' | 'AI_TRAINING' | 'AI_COMMAND_CENTER' | 'ALTERNATIVES' | 'NOTIFICATIONS' | 'INTERNATIONAL_PRICING' | 'PERMISSION_CENTER' | 'REPORTS_CENTER' | 'SEO_CENTER' | 'UNIFIED_PERMISSIONS' | 'ASSIGNMENTS_CENTER';

// --- Badges Type ---
interface BadgeCounts {
    orders: number;
    quotes: number;
    imports: number;
    missing: number;
    accounts: number;
    orderShortages: number;
}

// --- Props Types ---
export interface AdminDashboardSidebarProps {
    /** Current view/page */
    view: ViewType;
    /** View setter for navigation */
    setView: (view: ViewType) => void;
    /** Permission check function */
    canAccess: (resource: PermissionResource) => boolean;
    /** Badge counts for nav items */
    badges: BadgeCounts;
    /** Handler functions */
    fetchAllData: () => void;
    markOrdersAsSeen: () => void;
    markAccountsAsSeen: () => void;
    markQuotesAsSeen: () => void;
    markImportsAsSeen: () => void;
    markMissingAsSeen: () => void;
    markOrderShortagesAsSeen: () => void;
    /** Logout handler */
    onLogout: () => void;
}

// --- NavItem Helper (from AdminDashboard.tsx lines 764-772) ---
const NavItem = ({ icon, label, active, onClick, badge }: { 
    icon: React.ReactNode; 
    label: string; 
    active: boolean; 
    onClick: () => void; 
    badge?: number;
}) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-1 ${active ? 'bg-[#C8A04F] text-[#0B1B3A] font-black shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'}`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
);

export function AdminDashboardSidebar({ 
    view,
    setView,
    canAccess,
    badges,
    fetchAllData,
    markOrdersAsSeen,
    markAccountsAsSeen,
    markQuotesAsSeen,
    markImportsAsSeen,
    markMissingAsSeen,
    markOrderShortagesAsSeen,
    onLogout
}: AdminDashboardSidebarProps) {
    const { t } = useTranslation();

    return (
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
                {canAccess('settings_general') && (
                    <NavItem icon={<Bell size={20} />} label={t('adminDashboard.messagingCenter', 'مركز الرسائل')} active={view === 'MESSAGING_CENTER'} onClick={() => setView('MESSAGING_CENTER')} />
                )}

                <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-4">{t('adminDashboard.ordersCustomersSection')}</p>
                {canAccess('orders') && (
                    <NavItem icon={<ShoppingBag size={20} />} label={t('adminDashboard.customerOrders')} active={view === 'ORDERS_MANAGER'} onClick={() => { setView('ORDERS_MANAGER'); fetchAllData(); markOrdersAsSeen(); }} badge={badges.orders} />
                )}
                {canAccess('orders') && (
                    <NavItem icon={<ShoppingCart size={20} />} label={t('adminDashboard.abandonedCarts', 'السلات المتروكة')} active={view === 'ABANDONED_CARTS'} onClick={() => setView('ABANDONED_CARTS')} />
                )}
                {canAccess('account_requests') && (
                    <NavItem icon={<UserPlus size={20} />} label={t('adminDashboard.accountRequests')} active={view === 'UNIFIED_ACCOUNT_REQUESTS'} onClick={() => { setView('UNIFIED_ACCOUNT_REQUESTS'); markAccountsAsSeen(); }} badge={badges.accounts} />
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
                {canAccess('orders') && (
                    <NavItem icon={<Package size={20} />} label={t('adminDashboard.orderShortages', 'نواقص الطلبيات')} active={view === 'ORDER_SHORTAGES'} onClick={() => { setView('ORDER_SHORTAGES'); markOrderShortagesAsSeen(); }} badge={badges.orderShortages} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Users size={20} />} label={t('adminDashboard.assignmentsCenter', 'مركز التخصيصات')} active={view === 'ASSIGNMENTS_CENTER'} onClick={() => setView('ASSIGNMENTS_CENTER')} />
                )}

                <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-4">{t('adminDashboard.settingsSection')}</p>
                {canAccess('products') && (
                    <NavItem icon={<Database size={20} />} label={t('adminDashboard.products')} active={view === 'PRODUCTS'} onClick={() => setView('PRODUCTS')} />
                )}
                {canAccess('products') && (
                    <NavItem icon={<Layers size={20} />} label={t('adminDashboard.alternatives', 'بدائل الأصناف')} active={view === 'ALTERNATIVES'} onClick={() => setView('ALTERNATIVES')} />
                )}
                {canAccess('products') && (
                    <NavItem icon={<FileImage size={20} />} label={t('adminDashboard.productImages', 'صور المنتجات')} active={view === 'PRODUCT_IMAGES'} onClick={() => setView('PRODUCT_IMAGES')} />
                )}
                {canAccess('users') && (
                    <NavItem icon={<Users size={20} />} label={t('adminDashboard.users')} active={view === 'UNIFIED_PERMISSIONS'} onClick={() => setView('UNIFIED_PERMISSIONS')} />
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
                    <NavItem icon={<Users size={20} />} label={t('adminDashboard.teamSettings')} active={view === 'UNIFIED_PERMISSIONS'} onClick={() => setView('UNIFIED_PERMISSIONS')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Palette size={20} />} label={t('adminDashboard.customerPortalSettings')} active={view === 'CUSTOMER_PORTAL'} onClick={() => setView('CUSTOMER_PORTAL')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Bot size={20} />} label={t('adminDashboard.aiSettings')} active={view === 'AI_SETTINGS'} onClick={() => setView('AI_SETTINGS')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Brain size={20} />} label={t('adminDashboard.aiTraining', 'تدريب الذكاء الاصطناعي')} active={view === 'AI_TRAINING'} onClick={() => setView('AI_TRAINING')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Terminal size={20} />} label={t('adminDashboard.aiCommandCenter', 'مركز أوامر AI')} active={view === 'AI_COMMAND_CENTER'} onClick={() => setView('AI_COMMAND_CENTER')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Globe size={20} />} label={t('adminDashboard.internationalPricing', 'التسعير الدولي')} active={view === 'INTERNATIONAL_PRICING'} onClick={() => setView('INTERNATIONAL_PRICING')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Shield size={20} />} label={t('adminDashboard.unifiedPermissions', 'مركز الصلاحيات الموحد')} active={view === 'UNIFIED_PERMISSIONS'} onClick={() => setView('UNIFIED_PERMISSIONS')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<BarChart3 size={20} />} label={t('adminDashboard.reportsCenter', 'مركز التقارير')} active={view === 'REPORTS_CENTER'} onClick={() => setView('REPORTS_CENTER')} />
                )}
                {canAccess('settings_general') && (
                    <NavItem icon={<Globe size={20} />} label={t('adminDashboard.seoCenter', 'مركز SEO')} active={view === 'SEO_CENTER'} onClick={() => setView('SEO_CENTER')} />
                )}
            </nav>
            <div className="p-4 border-t border-slate-700/50 bg-[#08142b]">
                <button onClick={onLogout} className="flex items-center gap-3 text-red-400 hover:text-white text-sm font-bold w-full px-4 py-3 hover:bg-slate-800 rounded-xl transition-colors">
                    <LogOut size={18} /> {t('nav.logout')}
                </button>
            </div>
        </aside>
    );
}

export default AdminDashboardSidebar;
