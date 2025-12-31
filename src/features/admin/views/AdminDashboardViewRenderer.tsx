import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

// ============================================================================
// Page Imports - All views used by AdminDashboard view renderer
// ============================================================================
const AdminSettings = React.lazy(() => import('../../../components/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AdminMarketingCenter = React.lazy(() => import('../../../components/AdminMarketingCenter').then(m => ({ default: m.AdminMarketingCenter })));
const AdminPricingCenter = React.lazy(() => import('../../../components/AdminPricingCenter').then(m => ({ default: m.AdminPricingCenter })));
const AdminTraderToolsSettings = React.lazy(() => import('../../../components/AdminTraderToolsSettings').then(m => ({ default: m.AdminTraderToolsSettings })));
import { AdminSupplierMarketplaceSettings } from '../../../components/AdminSupplierMarketplaceSettings';
import { AdminMarketersPage } from '../../../components/AdminMarketersPage';
import AdminInstallmentsPage from '../../../components/AdminInstallmentsPage';
import { AdminAdvertisingPage } from '../../../components/AdminAdvertisingPage';
import { AdminCustomerPortalSettings } from '../../../components/AdminCustomerPortalSettings';
import AdminAISettings from '../../../components/AdminAISettings';
const AdminAITrainingPage = React.lazy(() => import('../../../components/AdminAITrainingPage'));
import AdminAICommandCenter from '../../../components/AdminAICommandCenter';
import { AdminInternationalPricingPage } from '../../../components/AdminInternationalPricingPage';
const UnifiedPermissionCenter = React.lazy(() => import('../../../components/UnifiedPermissionCenter').then(m => ({ default: m.UnifiedPermissionCenter })));
const AdminReportsCenterPage = React.lazy(() => import('../../../components/AdminReportsCenterPage').then(m => ({ default: m.AdminReportsCenterPage })));
import { AdminSEOCenter } from '../../../components/AdminSEOCenter';
const AdminOrdersManager = React.lazy(() => import('../../../components/AdminOrdersManager').then(m => ({ default: m.AdminOrdersManager })));
import { AdminAbandonedCartsPage } from '../../../components/AdminAbandonedCartsPage';
import { UnifiedAccountRequestsCenter } from '../../../components/UnifiedAccountRequestsCenter';
import { AdminCustomersPage } from '../../../components/AdminCustomersPage';
import { AdminQuoteManager } from '../../../components/AdminQuoteManager';
const AdminMissingParts = React.lazy(() => import('../../../components/AdminMissingParts').then(m => ({ default: m.AdminMissingParts })));
import { AdminOrderShortagesPage } from '../../../components/AdminOrderShortagesPage';
const AdminImportManager = React.lazy(() => import('../../../components/AdminImportManager').then(m => ({ default: m.AdminImportManager })));
import { AdminActivityLogPage } from '../../../components/AdminActivityLogPage';
import AdminFeedbackCenter from '../../../components/AdminFeedbackCenter';
import AdminMessagingCenter from '../../../components/AdminMessagingCenter';
const AdminProductsPage = React.lazy(() => import('../../../components/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
import { AdminAlternativesPage } from '../../../components/AdminAlternativesPage';
import { AdminProductImagesPage } from '../../../components/AdminProductImagesPage';
import { NotificationsPage } from '../../../components/NotificationsPage';
import { AdminAssignmentsCenter } from '../../../components/AdminAssignmentsCenter';
import { AccessDenied } from '../../../components/AccessDenied';

// Extracted dashboard components
import { AdminStatsCards } from '../components/AdminStatsCards';
import { AdminChartsSection } from '../components/AdminChartsSection';
import { AdminQuickActions } from '../components/AdminQuickActions';
import { AdminActivitySection } from '../components/AdminActivitySection';
import { AdminSuspenseFallback } from '../components/AdminSuspenseFallback';

// Types
import type { PermissionResource, Order, User, ImportRequest, Notification, AdminUser, QuoteRequest, MissingProductRequest } from '../../../types';

// ============================================================================
// AdminDashboardViewRenderer (COPY ONLY - Step I1)
// Source: AdminDashboard.tsx lines 424-647
// Contains all view conditional rendering blocks
// NOTE: Not wired yet. This is the exact JSX/CSS copied from AdminDashboard.
// ============================================================================

// --- ViewType (matching AdminDashboard.tsx) ---
type ViewType = 'DASHBOARD' | 'CUSTOMERS' | 'PRODUCTS' | 'PRODUCT_IMAGES' | 'SETTINGS' | 'QUOTES' | 'MISSING' | 'ORDER_SHORTAGES' | 'IMPORT_REQUESTS' | 'UNIFIED_ACCOUNT_REQUESTS' | 'ACCOUNT_REQUESTS' | 'ACTIVITY_LOGS' | 'FEEDBACK_CENTER' | 'MESSAGING_CENTER' | 'ORDERS_MANAGER' | 'ABANDONED_CARTS' | 'ADMIN_USERS' | 'MARKETING' | 'PRICING' | 'TRADER_TOOLS' | 'SUPPLIER_MARKETPLACE' | 'MARKETERS' | 'INSTALLMENTS' | 'ADVERTISING' | 'TEAM_SETTINGS' | 'CUSTOMER_PORTAL' | 'AI_SETTINGS' | 'AI_TRAINING' | 'AI_COMMAND_CENTER' | 'ALTERNATIVES' | 'NOTIFICATIONS' | 'INTERNATIONAL_PRICING' | 'PERMISSION_CENTER' | 'REPORTS_CENTER' | 'SEO_CENTER' | 'UNIFIED_PERMISSIONS' | 'ASSIGNMENTS_CENTER';

// VIEW_LABELS_KEYS for translation (copied from AdminDashboard.tsx)
const VIEW_LABELS_KEYS: Record<ViewType, string> = {
    'DASHBOARD': 'adminDashboard.views.dashboard',
    'CUSTOMERS': 'adminDashboard.views.customers',
    'PRODUCTS': 'adminDashboard.views.products',
    'SETTINGS': 'adminDashboard.views.settings',
    'QUOTES': 'adminDashboard.views.quotes',
    'MISSING': 'adminDashboard.views.missing',
    'ORDER_SHORTAGES': 'adminDashboard.views.orderShortages',
    'IMPORT_REQUESTS': 'adminDashboard.views.imports',
    'UNIFIED_ACCOUNT_REQUESTS': 'adminDashboard.views.accountRequests',
    'ACCOUNT_REQUESTS': 'adminDashboard.views.accountRequests',
    'ACTIVITY_LOGS': 'adminDashboard.views.activityLogs',
    'FEEDBACK_CENTER': 'adminDashboard.views.feedbackCenter',
    'MESSAGING_CENTER': 'adminDashboard.views.messagingCenter',
    'ORDERS_MANAGER': 'adminDashboard.views.ordersManager',
    'ABANDONED_CARTS': 'adminDashboard.views.abandonedCarts',
    'ADMIN_USERS': 'adminDashboard.views.users',
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

// --- Props Types ---
export interface AdminDashboardViewRendererProps {
    /** Current view/page */
    view: ViewType;
    /** View setter for navigation */
    setView: (view: ViewType) => void;
    /** Permission check function */
    canAccess: (resource: PermissionResource) => boolean;
    /** Toast notification function */
    addToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
    /** Fetch all data handler */
    fetchAllData: () => void;

    // Data objects
    data: {
        kpiData: {
            todayRevenue: number;
            totalRevenue: number;
            pendingOrders: number;
            approvedOrders: number;
            shippedOrders: number;
            activeBusinesses: number;
            pendingAccounts: number;
            pendingQuotes: number;
        };
        graphData: {
            dailyStats: { date: string; orders: number; revenue: number }[];
        };
        insights: { topMissing: [string, number][] };
        activitySummary: { logins: number; orders: number; quotes: number; searches: number };
        notifications: Notification[];
        orders: Order[];
        users: User[];
        quotes: QuoteRequest[];
        missingRequests: MissingProductRequest[];
        importRequests: ImportRequest[];
        adminUser: AdminUser | null;
    };
}

export function AdminDashboardViewRenderer({ 
    view,
    setView,
    canAccess,
    addToast,
    fetchAllData,
    data
}: AdminDashboardViewRendererProps) {
    const { t } = useTranslation();
    const { kpiData, graphData, insights, activitySummary, notifications, orders, users, quotes, missingRequests, importRequests, adminUser } = data;

    return (
        <>
            {view === 'DASHBOARD' && (
                <>
                    {/* KPI Grid - Using extracted AdminStatsCards */}
                    <AdminStatsCards kpiData={kpiData} />

                    {/* Charts & Quick Tools Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart (Revenue) - Using extracted AdminChartsSection */}
                        <AdminChartsSection graphData={graphData} />

                        {/* Quick Tools - Using extracted AdminQuickActions */}
                        <div className="space-y-6">
                            <AdminQuickActions setView={setView} addToast={addToast} />
                        </div>
                    </div>

                    {/* Bottom Grid: Insights & Alerts - Using extracted AdminActivitySection */}
                    <AdminActivitySection
                        insights={insights}
                        activitySummary={activitySummary}
                        notifications={notifications}
                        setView={setView}
                    />
                </>
            )}

            {/* --- OTHER VIEWS HANDLER WITH PERMISSION CHECKS --- */}
            {view === 'SETTINGS' && (
                canAccess('settings_general')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminSettings />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'MARKETING' && (
                canAccess('settings_general')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminMarketingCenter />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'PRICING' && (
                canAccess('settings_general')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminPricingCenter />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'TRADER_TOOLS' && (
                canAccess('settings_general')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminTraderToolsSettings />
                        </Suspense>
                    )
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
            {view === 'AI_TRAINING' && (
                canAccess('settings_general')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminAITrainingPage />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'AI_COMMAND_CENTER' && (
                canAccess('settings_general')
                    ? <AdminAICommandCenter />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'INTERNATIONAL_PRICING' && (
                canAccess('settings_general')
                    ? <AdminInternationalPricingPage />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'UNIFIED_PERMISSIONS' && (
                canAccess('settings_general')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <UnifiedPermissionCenter />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'REPORTS_CENTER' && (
                canAccess('settings_general')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminReportsCenterPage />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'SEO_CENTER' && (
                canAccess('settings_general')
                    ? <AdminSEOCenter />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'ORDERS_MANAGER' && (
                canAccess('orders')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminOrdersManager orders={orders} users={users} onUpdate={fetchAllData} />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'ABANDONED_CARTS' && (
                canAccess('orders')
                    ? <AdminAbandonedCartsPage onRefresh={fetchAllData} />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'UNIFIED_ACCOUNT_REQUESTS' && (
                canAccess('account_requests')
                    ? <UnifiedAccountRequestsCenter />
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
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminMissingParts missingRequests={missingRequests} />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'ORDER_SHORTAGES' && (
                canAccess('orders')
                    ? <AdminOrderShortagesPage onRefresh={fetchAllData} />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'IMPORT_REQUESTS' && (
                canAccess('imports')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminImportManager requests={importRequests} onUpdate={fetchAllData} />
                        </Suspense>
                    )
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
            {view === 'MESSAGING_CENTER' && (
                canAccess('settings_general')
                    ? <AdminMessagingCenter />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'PRODUCTS' && (
                canAccess('products')
                    ? (
                        <Suspense fallback={<AdminSuspenseFallback />}>
                            <AdminProductsPage onRefresh={fetchAllData} />
                        </Suspense>
                    )
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'ALTERNATIVES' && (
                canAccess('products')
                    ? <AdminAlternativesPage onRefresh={fetchAllData} />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'PRODUCT_IMAGES' && (
                canAccess('products')
                    ? <AdminProductImagesPage />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
            {view === 'NOTIFICATIONS' && adminUser && (
                <NotificationsPage
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
                    onBack={() => setView('DASHBOARD')}
                />
            )}
            {view === 'ASSIGNMENTS_CENTER' && (
                canAccess('settings_general')
                    ? <AdminAssignmentsCenter />
                    : <AccessDenied resourceName={t(VIEW_LABELS_KEYS[view])} onGoHome={() => setView('DASHBOARD')} />
            )}
        </>
    );
}

export default AdminDashboardViewRenderer;
