import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { LanguageSwitcherLight } from '../../../components/LanguageSwitcher';
import { NotificationBell } from '../../../components/NotificationBell';
import type { AdminUser, Role } from '../../../types';

// ============================================================================
// AdminDashboardHeader (COPY ONLY - Step F1)
// Source: AdminDashboard.tsx lines 534-598 (Top Bar / Header)
// Plus: ConnectionWidget from lines 388-404
// NOTE: Not wired yet. This is the exact JSX/CSS copied from AdminDashboard.
// ============================================================================

// --- ViewType (matching AdminDashboard.tsx) ---
type ViewType = 'DASHBOARD' | 'CUSTOMERS' | 'PRODUCTS' | 'PRODUCT_IMAGES' | 'SETTINGS' | 'QUOTES' | 'MISSING' | 'ORDER_SHORTAGES' | 'IMPORT_REQUESTS' | 'UNIFIED_ACCOUNT_REQUESTS' | 'ACCOUNT_REQUESTS' | 'ACTIVITY_LOGS' | 'FEEDBACK_CENTER' | 'MESSAGING_CENTER' | 'ORDERS_MANAGER' | 'ABANDONED_CARTS' | 'ADMIN_USERS' | 'MARKETING' | 'PRICING' | 'TRADER_TOOLS' | 'SUPPLIER_MARKETPLACE' | 'MARKETERS' | 'INSTALLMENTS' | 'ADVERTISING' | 'TEAM_SETTINGS' | 'CUSTOMER_PORTAL' | 'AI_SETTINGS' | 'AI_TRAINING' | 'AI_COMMAND_CENTER' | 'ALTERNATIVES' | 'NOTIFICATIONS' | 'INTERNATIONAL_PRICING' | 'PERMISSION_CENTER' | 'REPORTS_CENTER' | 'SEO_CENTER' | 'UNIFIED_PERMISSIONS' | 'ASSIGNMENTS_CENTER';

type ConnectionStatus = 'CONNECTED' | 'SLOW' | 'DISCONNECTED';

// --- Props Types ---
export interface AdminDashboardHeaderProps {
    /** Current view/page */
    view: ViewType;
    /** View setter for navigation */
    setView: (view: ViewType) => void;
    /** Current admin user */
    adminUser: AdminUser | null;
    /** Current role */
    role: Role | null;
    /** Connection status */
    connectionStatus: ConnectionStatus;
    /** Connection latency in ms */
    latency: number;
    /** Is retrying connection */
    isRetrying: boolean;
    /** Check connection handler */
    checkConnection: () => void;
}

// --- Connection Widget (from AdminDashboard.tsx lines 388-404) ---
function ConnectionWidget({ 
    connectionStatus, 
    latency, 
    isRetrying, 
    checkConnection 
}: Pick<AdminDashboardHeaderProps, 'connectionStatus' | 'latency' | 'isRetrying' | 'checkConnection'>) {
    const { t } = useTranslation();
    
    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border text-sm font-bold shadow-sm backdrop-blur-md transition-all ${connectionStatus === 'CONNECTED' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' :
            connectionStatus === 'SLOW' ? 'bg-amber-50/90 border-amber-200 text-amber-700' :
                'bg-red-50/90 border-red-200 text-red-700'
            }`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500' :
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
}

export function AdminDashboardHeader({ 
    view,
    setView,
    adminUser,
    role,
    connectionStatus,
    latency,
    isRetrying,
    checkConnection
}: AdminDashboardHeaderProps) {
    const { t } = useTranslation();

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {view === 'DASHBOARD' && t('adminDashboard.pageTitles.dashboard')}
                {view === 'ORDERS_MANAGER' && t('adminDashboard.pageTitles.ordersManager')}
                {view === 'ABANDONED_CARTS' && t('adminDashboard.pageTitles.abandonedCarts', 'السلات المتروكة')}
                {view === 'ACTIVITY_LOGS' && t('adminDashboard.pageTitles.activityLogs')}
                {view === 'FEEDBACK_CENTER' && t('adminDashboard.pageTitles.feedbackCenter', 'مركز الملاحظات')}
                {view === 'MESSAGING_CENTER' && t('adminDashboard.pageTitles.messagingCenter', 'مركز الرسائل')}
                {view === 'ACCOUNT_REQUESTS' && t('adminDashboard.pageTitles.accountRequests')}
                {view === 'CUSTOMERS' && t('adminDashboard.pageTitles.customers')}
                {view === 'QUOTES' && t('adminDashboard.pageTitles.quotes')}
                {view === 'IMPORT_REQUESTS' && t('adminDashboard.pageTitles.imports')}
                {view === 'MISSING' && t('adminDashboard.pageTitles.missing')}
                {view === 'ORDER_SHORTAGES' && t('adminDashboard.pageTitles.orderShortages', 'نواقص الطلبيات')}
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
                {view === 'INTERNATIONAL_PRICING' && t('adminDashboard.pageTitles.internationalPricing', 'التسعير الدولي والموردين')}
                {view === 'PERMISSION_CENTER' && t('adminDashboard.pageTitles.permissionCenter', 'مركز الصلاحيات')}
                {view === 'REPORTS_CENTER' && t('adminDashboard.pageTitles.reportsCenter', 'مركز التقارير')}
                {['PRODUCTS'].includes(view) && t('adminDashboard.pageTitles.products')}
            </h2>
            <div className="flex items-center gap-4">
                <LanguageSwitcherLight />
                <ConnectionWidget 
                    connectionStatus={connectionStatus}
                    latency={latency}
                    isRetrying={isRetrying}
                    checkConnection={checkConnection}
                />
                {adminUser && (
                    <NotificationBell
                        user={{
                            id: adminUser.id,
                            clientId: adminUser.id,
                            name: adminUser.username,
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
    );
}

export default AdminDashboardHeader;
