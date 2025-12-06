import React, { useState, useEffect, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MockApi } from '../services/mockApi';
import { 
  User, 
  SupplierProduct, 
  SupplierRequest, 
  SupplierDashboardStats, 
  SupplierSettings,
  SupplierProductFilters,
  SupplierRequestFilters,
  SupplierProductInsert,
  SupplierQuoteSubmission,
  SupplierExcelImportResult
} from '../types';
import { 
  LayoutDashboard, Package, FileText, Settings, LogOut, Menu, X, 
  Plus, Upload, Download, Search, Filter, Eye, Send, XCircle,
  ChevronLeft, ChevronRight, Edit2, Trash2, CheckCircle, Clock,
  TrendingUp, Box, FileSpreadsheet, AlertTriangle, Bell, Users,
  DollarSign, BarChart3, Star, Calendar, Loader2
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { NotificationsPage } from './NotificationsPage';
import { getDirection } from '../services/i18n';
import { Modal } from './Modal';
import { useToast } from '../services/ToastContext';
import { formatDateTime } from '../utils/dateUtils';
import * as XLSX from 'xlsx';

interface SupplierPortalProps {
  user: User;
  onLogout: () => void;
}

type SupplierView = 'DASHBOARD' | 'PRODUCTS' | 'REQUESTS' | 'SETTINGS' | 'NOTIFICATIONS';

const SidebarItem = memo(({ icon, label, active, onClick, badge, collapsed, testId }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number | string;
  collapsed: boolean;
  testId?: string;
}) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3.5 rounded-2xl mb-2 transition-all duration-300 group relative overflow-hidden ${
      active 
      ? 'bg-gradient-to-l from-emerald-600 to-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/40 scale-[1.02]' 
      : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium hover:scale-[1.01]'
    }`}
    title={collapsed ? label : undefined}
    data-testid={testId}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50"></div>
    )}
    <div className={`flex items-center relative z-10 ${collapsed ? '' : 'gap-3.5'}`}>
      <span className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</span>
      {!collapsed && <span className="text-sm md:text-[15px] truncate tracking-wide">{label}</span>}
    </div>
    {badge && !collapsed && (
      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center justify-center min-w-[22px] shadow-md animate-bounce relative z-10">
        {badge}
      </span>
    )}
    {badge && collapsed && (
      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse shadow-lg"></span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-3 px-4 py-2.5 bg-slate-800/95 backdrop-blur-sm text-white text-sm font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl border border-slate-700/50">
        {label}
        {badge && <span className="mr-2 text-orange-400 font-black">({badge})</span>}
      </div>
    )}
  </button>
));

const StatCard = memo(({ icon, label, value, color, subValue }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  subValue?: string;
}) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-lg`}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-3xl font-black text-white">{value}</span>
    </div>
    <p className="text-white/80 text-sm font-medium">{label}</p>
    {subValue && <p className="text-white/60 text-xs mt-1">{subValue}</p>}
  </div>
));

export const SupplierPortal = ({ user, onLogout }: SupplierPortalProps) => {
  const { t, i18n } = useTranslation();
  const dir = getDirection(i18n.language);
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';

  const [view, setView] = useState<SupplierView>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<SupplierDashboardStats | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [requests, setRequests] = useState<SupplierRequest[]>([]);
  const [requestTotal, setRequestTotal] = useState(0);
  const [settings, setSettings] = useState<SupplierSettings | null>(null);

  const [productFilters, setProductFilters] = useState<SupplierProductFilters>({ page: 1, pageSize: 20 });
  const [requestFilters, setRequestFilters] = useState<SupplierRequestFilters>({ page: 1, pageSize: 20 });

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupplierRequest | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<SupplierExcelImportResult | null>(null);

  const loadDashboard = useCallback(async () => {
    const data = await MockApi.getSupplierDashboard(user.id);
    setStats(data);
  }, [user.id]);

  const loadProducts = useCallback(async () => {
    const data = await MockApi.getSupplierProducts(user.id, productFilters);
    setProducts(data.items);
    setProductTotal(data.total);
  }, [user.id, productFilters]);

  const loadRequests = useCallback(async () => {
    const data = await MockApi.getSupplierRequests(user.id, requestFilters);
    setRequests(data.items);
    setRequestTotal(data.total);
  }, [user.id, requestFilters]);

  const loadSettings = useCallback(async () => {
    const data = await MockApi.getSupplierSettings(user.id);
    setSettings(data);
  }, [user.id]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboard(), loadProducts(), loadRequests(), loadSettings()]);
      setLoading(false);
    };
    init();
  }, [loadDashboard, loadProducts, loadRequests, loadSettings]);

  useEffect(() => {
    loadProducts();
  }, [productFilters, loadProducts]);

  useEffect(() => {
    loadRequests();
  }, [requestFilters, loadRequests]);

  const handleAddProduct = async (product: SupplierProductInsert) => {
    try {
      await MockApi.addSupplierProduct(user.id, product);
      addToast(t('supplier.productAdded'), 'success');
      setShowProductModal(false);
      loadProducts();
      loadDashboard();
    } catch (err) {
      addToast(t('supplier.productAddError'), 'error');
    }
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<SupplierProductInsert>) => {
    try {
      await MockApi.updateSupplierProduct(user.id, productId, updates);
      addToast(t('supplier.productUpdated'), 'success');
      setShowProductModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      addToast(t('supplier.productUpdateError'), 'error');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t('supplier.confirmDeleteProduct'))) return;
    try {
      await MockApi.deleteSupplierProduct(user.id, productId);
      addToast(t('supplier.productDeleted'), 'success');
      loadProducts();
      loadDashboard();
    } catch (err) {
      addToast(t('supplier.productDeleteError'), 'error');
    }
  };

  const handleSubmitQuote = async (data: SupplierQuoteSubmission) => {
    try {
      await MockApi.submitSupplierQuote(user.id, data);
      addToast(t('supplier.quoteSent'), 'success');
      setShowQuoteModal(false);
      setSelectedRequest(null);
      loadRequests();
      loadDashboard();
    } catch (err) {
      addToast(t('supplier.quoteError'), 'error');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt(t('supplier.rejectReason'));
    if (reason === null) return;
    try {
      await MockApi.rejectSupplierRequest(user.id, requestId, reason);
      addToast(t('supplier.requestRejected'), 'success');
      loadRequests();
      loadDashboard();
    } catch (err) {
      addToast(t('supplier.rejectError'), 'error');
    }
  };

  const handleImportExcel = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const result = await MockApi.importSupplierProductsFromExcel(user.id, buffer);
      setImportResult(result);
      if (result.success) {
        addToast(`${t('supplier.importSuccess')}: ${result.insertedCount} ${t('supplier.added')}, ${result.updatedCount} ${t('supplier.updated')}`, 'success');
        loadProducts();
        loadDashboard();
      } else {
        addToast(t('supplier.importFailed'), 'error');
      }
    } catch (err) {
      addToast(t('supplier.importError'), 'error');
    }
  };

  const handleExportProducts = () => {
    const exportData = products.map(p => ({
      sku: p.sku,
      oemNumber: p.oemNumber,
      name: p.name,
      category: p.category,
      brand: p.brand,
      model: p.model || '',
      yearFrom: p.yearFrom || '',
      yearTo: p.yearTo || '',
      purchasePrice: p.purchasePrice,
      stock: p.stock,
      minOrderQty: p.minOrderQty,
      deliveryTime: p.deliveryTime
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, `supplier_products_${Date.now()}.xlsx`);
    addToast(t('supplier.exportSuccess'), 'success');
  };

  const handleUpdateSettings = async (updates: Partial<SupplierSettings>) => {
    try {
      const updated = await MockApi.updateSupplierSettings(user.id, updates);
      setSettings(updated);
      addToast(t('supplier.settingsSaved'), 'success');
    } catch (err) {
      addToast(t('supplier.settingsError'), 'error');
    }
  };

  const sidebarPosition = isRTL ? 'right-0' : 'left-0';
  const sidebarTransform = isRTL 
    ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
    : (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0');
  const sidebarWidth = collapsed ? 'w-20' : 'w-72';

  const pendingRequestCount = requests.filter(r => r.status === 'NEW' || r.status === 'VIEWED').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-bold">{t('loading.pleaseWait')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-slate-100 ${dir === 'rtl' ? 'rtl' : 'ltr'}`} dir={dir}>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 ${sidebarPosition} ${sidebarWidth} bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white transform transition-all duration-300 z-50 flex flex-col shadow-2xl lg:shadow-xl ${sidebarTransform}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className={`relative p-4 ${collapsed ? 'px-3' : 'p-5'} border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white/20">
                  <Package size={22} />
                </div>
                <div>
                  <h1 className="font-black text-lg tracking-tight">{t('supplier.portalTitle')}</h1>
                  <p className="text-xs text-slate-400">{user.name}</p>
                </div>
              </div>
              <button onClick={() => setCollapsed(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:block hidden">
                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </>
          ) : (
            <button onClick={() => setCollapsed(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label={t('supplier.dashboard')} 
            active={view === 'DASHBOARD'} 
            onClick={() => setView('DASHBOARD')}
            collapsed={collapsed}
            testId="nav-dashboard"
          />
          <SidebarItem 
            icon={<Package size={20} />} 
            label={t('supplier.products')} 
            active={view === 'PRODUCTS'} 
            onClick={() => setView('PRODUCTS')}
            testId="nav-products"
            collapsed={collapsed}
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label={t('supplier.requests')} 
            active={view === 'REQUESTS'} 
            onClick={() => setView('REQUESTS')}
            badge={pendingRequestCount > 0 ? pendingRequestCount : undefined}
            collapsed={collapsed}
            testId="nav-requests"
          />
          <SidebarItem 
            icon={<Bell size={20} />} 
            label={t('supplier.notifications')} 
            active={view === 'NOTIFICATIONS'} 
            onClick={() => setView('NOTIFICATIONS')}
            collapsed={collapsed}
            testId="nav-notifications"
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label={t('supplier.settings')} 
            active={view === 'SETTINGS'} 
            onClick={() => setView('SETTINGS')}
            collapsed={collapsed}
            testId="nav-settings"
          />
        </nav>

        <div className={`p-3 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
          <button 
            onClick={onLogout}
            className={`${collapsed ? 'p-3' : 'w-full px-4 py-3'} flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all`}
            title={t('logout')}
            data-testid="button-logout"
          >
            <LogOut size={18} />
            {!collapsed && <span className="font-bold text-sm">{t('logout')}</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8 flex-shrink-0 z-30 shadow-sm gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg shrink-0"
              data-testid="button-open-sidebar"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-base md:text-xl lg:text-2xl font-bold md:font-black text-slate-800 tracking-tight truncate">
              {view === 'DASHBOARD' && t('supplier.dashboard')}
              {view === 'PRODUCTS' && t('supplier.products')}
              {view === 'REQUESTS' && t('supplier.requests')}
              {view === 'SETTINGS' && t('supplier.settings')}
              {view === 'NOTIFICATIONS' && t('supplier.notifications')}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-slate-700">
              <Clock size={16} />
              <span>{formatDateTime(new Date().toISOString())}</span>
            </div>
            <NotificationBell user={user} onViewAll={() => setView('NOTIFICATIONS')} />
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {view === 'DASHBOARD' && stats && (
            <DashboardView 
              stats={stats} 
              t={t} 
              onNavigate={setView}
              recentRequests={requests.slice(0, 5)}
            />
          )}
          
          {view === 'PRODUCTS' && (
            <ProductsView 
              products={products}
              total={productTotal}
              filters={productFilters}
              onFiltersChange={setProductFilters}
              onAdd={() => { setEditingProduct(null); setShowProductModal(true); }}
              onEdit={(p) => { setEditingProduct(p); setShowProductModal(true); }}
              onDelete={handleDeleteProduct}
              onImport={() => setShowImportModal(true)}
              onExport={handleExportProducts}
              t={t}
            />
          )}

          {view === 'REQUESTS' && (
            <RequestsView 
              requests={requests}
              total={requestTotal}
              filters={requestFilters}
              onFiltersChange={setRequestFilters}
              onQuote={(r) => { setSelectedRequest(r); setShowQuoteModal(true); }}
              onReject={handleRejectRequest}
              t={t}
            />
          )}

          {view === 'SETTINGS' && settings && (
            <SettingsView 
              settings={settings}
              onSave={handleUpdateSettings}
              t={t}
            />
          )}

          {view === 'NOTIFICATIONS' && (
            <NotificationsPage user={user} />
          )}
        </main>
      </div>

      {showProductModal && (
        <ProductFormModal
          product={editingProduct}
          onSave={editingProduct 
            ? (data) => handleUpdateProduct(editingProduct.id, data)
            : handleAddProduct
          }
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
          t={t}
        />
      )}

      {showQuoteModal && selectedRequest && (
        <QuoteFormModal
          request={selectedRequest}
          onSubmit={handleSubmitQuote}
          onClose={() => { setShowQuoteModal(false); setSelectedRequest(null); }}
          t={t}
        />
      )}

      {showImportModal && (
        <ImportModal
          onImport={handleImportExcel}
          onClose={() => { setShowImportModal(false); setImportResult(null); }}
          result={importResult}
          t={t}
        />
      )}
    </div>
  );
};

const DashboardView = memo(({ stats, t, onNavigate, recentRequests }: {
  stats: SupplierDashboardStats;
  t: (key: string) => string;
  onNavigate: (view: SupplierView) => void;
  recentRequests: SupplierRequest[];
}) => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<Package size={24} className="text-white" />}
        label={t('supplier.totalProducts')}
        value={stats.totalProducts}
        color="from-emerald-500 to-emerald-600"
        subValue={`${stats.activeProducts} ${t('supplier.active')}`}
      />
      <StatCard 
        icon={<FileText size={24} className="text-white" />}
        label={t('supplier.pendingRequests')}
        value={stats.pendingRequests}
        color="from-orange-500 to-orange-600"
      />
      <StatCard 
        icon={<CheckCircle size={24} className="text-white" />}
        label={t('supplier.quotesSubmitted')}
        value={stats.quotesSubmitted}
        color="from-blue-500 to-blue-600"
        subValue={`${stats.quotesAccepted} ${t('supplier.accepted')}`}
      />
      <StatCard 
        icon={<DollarSign size={24} className="text-white" />}
        label={t('supplier.totalRevenue')}
        value={`${stats.totalRevenue.toLocaleString()} ${t('currency')}`}
        color="from-purple-500 to-purple-600"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800">{t('supplier.recentRequests')}</h3>
          <button 
            onClick={() => onNavigate('REQUESTS')}
            className="text-emerald-600 text-sm font-bold hover:underline"
            data-testid="link-view-all-requests"
          >
            {t('supplier.viewAll')}
          </button>
        </div>
        {recentRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('supplier.noRequests')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div 
                key={req.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => onNavigate('REQUESTS')}
                data-testid={`request-item-${req.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    req.status === 'NEW' ? 'bg-orange-500' :
                    req.status === 'QUOTED' ? 'bg-blue-500' :
                    req.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-slate-400'
                  }`} />
                  <div>
                    <p className="font-bold text-slate-800">{req.partName || req.partNumber}</p>
                    <p className="text-xs text-slate-500">{req.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{formatDateTime(req.createdAt)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                    req.status === 'NEW' ? 'bg-orange-100 text-orange-700' :
                    req.status === 'QUOTED' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t(`supplier.status.${req.status.toLowerCase()}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-lg text-slate-800 mb-4">{t('supplier.quickActions')}</h3>
        <div className="space-y-3">
          <button 
            onClick={() => onNavigate('PRODUCTS')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
            data-testid="button-add-product-quick"
          >
            <Plus size={20} />
            {t('supplier.addProduct')}
          </button>
          <button 
            onClick={() => onNavigate('PRODUCTS')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
            data-testid="button-import-products-quick"
          >
            <Upload size={20} />
            {t('supplier.importProducts')}
          </button>
          <button 
            onClick={() => onNavigate('REQUESTS')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold hover:bg-orange-100 transition-colors"
            data-testid="button-view-requests-quick"
          >
            <FileText size={20} />
            {t('supplier.viewRequests')}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="font-bold text-slate-700 mb-3">{t('supplier.performance')}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t('supplier.avgResponseTime')}</span>
              <span className="font-bold text-slate-800">{stats.averageResponseTime}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t('supplier.rating')}</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-slate-800">{stats.supplierRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const ProductsView = memo(({ products, total, filters, onFiltersChange, onAdd, onEdit, onDelete, onImport, onExport, t }: {
  products: SupplierProduct[];
  total: number;
  filters: SupplierProductFilters;
  onFiltersChange: (f: SupplierProductFilters) => void;
  onAdd: () => void;
  onEdit: (p: SupplierProduct) => void;
  onDelete: (id: string) => void;
  onImport: () => void;
  onExport: () => void;
  t: (key: string) => string;
}) => {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = () => {
    onFiltersChange({ ...filters, search, page: 1 });
  };

  const totalPages = Math.ceil(total / (filters.pageSize || 20));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('supplier.searchProducts')}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              data-testid="input-search-products"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-search-products"
          >
            {t('search')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
            data-testid="button-import-products"
          >
            <Upload size={18} />
            {t('supplier.import')}
          </button>
          <button 
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            data-testid="button-export-products"
          >
            <Download size={18} />
            {t('supplier.export')}
          </button>
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-add-product"
          >
            <Plus size={18} />
            {t('supplier.addProduct')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">{t('supplier.noProducts')}</p>
            <p className="text-sm">{t('supplier.addFirstProduct')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.sku')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.productName')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.brand')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.price')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.stock')}</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">{t('supplier.status')}</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors" data-testid={`product-row-${product.id}`}>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{product.sku}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.oemNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{product.brand}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">{product.purchasePrice.toLocaleString()} {t('currency')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        product.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {product.isActive ? t('supplier.active') : t('supplier.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => onEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('edit')}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('delete')}
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              {t('showing')} {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} - {Math.min((filters.page || 1) * (filters.pageSize || 20), total)} {t('of')} {total}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={(filters.page || 1) <= 1}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-prev-page"
              >
                <ChevronRight size={18} />
              </button>
              <span className="px-3 py-1 bg-white rounded-lg border text-sm font-bold">
                {filters.page || 1} / {totalPages}
              </span>
              <button 
                onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={(filters.page || 1) >= totalPages}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-next-page"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const RequestsView = memo(({ requests, total, filters, onFiltersChange, onQuote, onReject, t }: {
  requests: SupplierRequest[];
  total: number;
  filters: SupplierRequestFilters;
  onFiltersChange: (f: SupplierRequestFilters) => void;
  onQuote: (r: SupplierRequest) => void;
  onReject: (id: string) => void;
  t: (key: string) => string;
}) => {
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'ALL');

  const handleSearch = () => {
    onFiltersChange({ ...filters, search, status: statusFilter, page: 1 });
  };

  const totalPages = Math.ceil(total / (filters.pageSize || 20));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('supplier.searchRequests')}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              data-testid="input-search-requests"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); onFiltersChange({ ...filters, status: e.target.value, page: 1 }); }}
            className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
            data-testid="select-status-filter"
          >
            <option value="ALL">{t('supplier.allStatuses')}</option>
            <option value="NEW">{t('supplier.status.new')}</option>
            <option value="VIEWED">{t('supplier.status.viewed')}</option>
            <option value="QUOTED">{t('supplier.status.quoted')}</option>
            <option value="ACCEPTED">{t('supplier.status.accepted')}</option>
            <option value="REJECTED">{t('supplier.status.rejected')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {requests.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">{t('supplier.noRequests')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors" data-testid={`request-row-${req.id}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${
                        req.status === 'NEW' ? 'bg-orange-500' :
                        req.status === 'QUOTED' ? 'bg-blue-500' :
                        req.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-slate-400'
                      }`} />
                      <h4 className="font-bold text-slate-800">{req.partName || req.partNumber}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        req.urgency === 'URGENT' ? 'bg-red-100 text-red-700' :
                        req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t(`supplier.urgency.${req.urgency?.toLowerCase() || 'normal'}`)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                      <div>
                        <span className="text-slate-400">{t('supplier.customer')}: </span>
                        <span className="font-medium">{req.customerName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">{t('supplier.quantity')}: </span>
                        <span className="font-medium">{req.quantity}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">{t('supplier.deadline')}: </span>
                        <span className="font-medium">{req.deadline ? formatDateTime(req.deadline) : '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">{t('supplier.received')}: </span>
                        <span className="font-medium">{formatDateTime(req.createdAt)}</span>
                      </div>
                    </div>
                    {req.notes && (
                      <p className="mt-2 text-sm text-slate-500 bg-slate-50 p-2 rounded">{req.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(req.status === 'NEW' || req.status === 'VIEWED') && (
                      <>
                        <button 
                          onClick={() => onQuote(req)}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                          data-testid={`button-quote-${req.id}`}
                        >
                          <Send size={16} />
                          {t('supplier.submitQuote')}
                        </button>
                        <button 
                          onClick={() => onReject(req.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                          data-testid={`button-reject-${req.id}`}
                        >
                          <XCircle size={16} />
                          {t('supplier.reject')}
                        </button>
                      </>
                    )}
                    {req.status === 'QUOTED' && (
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold">
                        {t('supplier.quotedAt')}: {req.quotedPrice?.toLocaleString()} {t('currency')}
                      </span>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <span className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold">
                        <CheckCircle size={16} />
                        {t('supplier.status.accepted')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600">
              {t('showing')} {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} - {Math.min((filters.page || 1) * (filters.pageSize || 20), total)} {t('of')} {total}
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) - 1 })}
                disabled={(filters.page || 1) <= 1}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
              <span className="px-3 py-1 bg-white rounded-lg border text-sm font-bold">
                {filters.page || 1} / {totalPages}
              </span>
              <button 
                onClick={() => onFiltersChange({ ...filters, page: (filters.page || 1) + 1 })}
                disabled={(filters.page || 1) >= totalPages}
                className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const SettingsView = memo(({ settings, onSave, t }: {
  settings: SupplierSettings;
  onSave: (s: Partial<SupplierSettings>) => void;
  t: (key: string) => string;
}) => {
  const [form, setForm] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h3 className="font-bold text-lg text-slate-800 border-b pb-4">{t('supplier.settingsTitle')}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t('supplier.defaultPriceMarkup')}</label>
            <div className="relative">
              <input
                type="number"
                value={form.defaultPriceMarkup || 0}
                onChange={(e) => setForm({ ...form, defaultPriceMarkup: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                data-testid="input-default-markup"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t('supplier.defaultDeliveryTime')}</label>
            <input
              type="number"
              value={form.defaultDeliveryTime || 3}
              onChange={(e) => setForm({ ...form, defaultDeliveryTime: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              data-testid="input-default-delivery"
            />
            <p className="text-xs text-slate-500 mt-1">{t('supplier.deliveryDaysHint')}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-bold text-slate-700 mb-4">{t('supplier.notifications')}</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notifyOnNewRequest}
                onChange={(e) => setForm({ ...form, notifyOnNewRequest: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                data-testid="checkbox-notify-new-request"
              />
              <span className="text-slate-700">{t('supplier.notifyNewRequest')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notifyOnQuoteAccepted}
                onChange={(e) => setForm({ ...form, notifyOnQuoteAccepted: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                data-testid="checkbox-notify-quote-accepted"
              />
              <span className="text-slate-700">{t('supplier.notifyQuoteAccepted')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notifyOnDeadlineApproaching}
                onChange={(e) => setForm({ ...form, notifyOnDeadlineApproaching: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                data-testid="checkbox-notify-deadline"
              />
              <span className="text-slate-700">{t('supplier.notifyDeadline')}</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-save-settings"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
});

const ProductFormModal = memo(({ product, onSave, onClose, t }: {
  product: SupplierProduct | null;
  onSave: (data: SupplierProductInsert) => void;
  onClose: () => void;
  t: (key: string) => string;
}) => {
  const [form, setForm] = useState<SupplierProductInsert>({
    sku: product?.sku || '',
    oemNumber: product?.oemNumber || '',
    name: product?.name || '',
    category: product?.category || '',
    brand: product?.brand || '',
    model: product?.model || '',
    yearFrom: product?.yearFrom,
    yearTo: product?.yearTo,
    purchasePrice: product?.purchasePrice || 0,
    minOrderQty: product?.minOrderQty || 1,
    stock: product?.stock || 0,
    deliveryTime: product?.deliveryTime || 3
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal isOpen onClose={onClose} title={product ? t('supplier.editProduct') : t('supplier.addProduct')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.sku')} *</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              required
              data-testid="input-product-sku"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.oemNumber')}</label>
            <input
              type="text"
              value={form.oemNumber}
              onChange={(e) => setForm({ ...form, oemNumber: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              data-testid="input-product-oem"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.productName')} *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            required
            data-testid="input-product-name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.category')}</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              data-testid="input-product-category"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.brand')}</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              data-testid="input-product-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.price')} *</label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              required
              min="0"
              step="0.01"
              data-testid="input-product-price"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.stock')}</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              min="0"
              data-testid="input-product-stock"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.minOrder')}</label>
            <input
              type="number"
              value={form.minOrderQty}
              onChange={(e) => setForm({ ...form, minOrderQty: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              min="1"
              data-testid="input-product-min-order"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
            data-testid="button-cancel-product"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-save-product"
          >
            {product ? t('save') : t('supplier.add')}
          </button>
        </div>
      </form>
    </Modal>
  );
});

const QuoteFormModal = memo(({ request, onSubmit, onClose, t }: {
  request: SupplierRequest;
  onSubmit: (data: SupplierQuoteSubmission) => void;
  onClose: () => void;
  t: (key: string) => string;
}) => {
  const [quotedPrice, setQuotedPrice] = useState(0);
  const [stockAvailable, setStockAvailable] = useState(request.quantity);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      requestId: request.id,
      quotedPrice,
      stockAvailable,
      notes
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={t('supplier.submitQuoteTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-bold text-slate-800 mb-2">{t('supplier.requestDetails')}</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">{t('supplier.part')}: </span>
              <span className="font-medium">{request.partName || request.partNumber}</span>
            </div>
            <div>
              <span className="text-slate-500">{t('supplier.quantity')}: </span>
              <span className="font-medium">{request.quantity}</span>
            </div>
            <div>
              <span className="text-slate-500">{t('supplier.customer')}: </span>
              <span className="font-medium">{request.customerName}</span>
            </div>
            <div>
              <span className="text-slate-500">{t('supplier.deadline')}: </span>
              <span className="font-medium">{request.deadline ? formatDateTime(request.deadline) : '-'}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.yourPrice')} *</label>
          <input
            type="number"
            value={quotedPrice}
            onChange={(e) => setQuotedPrice(parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            required
            min="0"
            step="0.01"
            data-testid="input-quote-price"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.availableStock')}</label>
          <input
            type="number"
            value={stockAvailable}
            onChange={(e) => setStockAvailable(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            min="0"
            data-testid="input-quote-stock"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">{t('supplier.quoteNotes')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            rows={3}
            data-testid="input-quote-notes"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
            data-testid="button-cancel-quote"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-submit-quote"
          >
            <Send size={16} />
            {t('supplier.sendQuote')}
          </button>
        </div>
      </form>
    </Modal>
  );
});

const ImportModal = memo(({ onImport, onClose, result, t }: {
  onImport: (file: File) => void;
  onClose: () => void;
  result: SupplierExcelImportResult | null;
  t: (key: string) => string;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    await onImport(file);
    setImporting(false);
  };

  return (
    <Modal isOpen onClose={onClose} title={t('supplier.importProducts')}>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
          <Upload size={40} className="mx-auto mb-3 text-slate-400" />
          <p className="text-slate-600 mb-2">{t('supplier.dropExcelFile')}</p>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            data-testid="input-import-file"
          />
        </div>

        {file && (
          <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-lg">
            <FileSpreadsheet size={20} className="text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">{file.name}</span>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h4 className={`font-bold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? t('supplier.importComplete') : t('supplier.importFailed')}
            </h4>
            {result.success && (
              <div className="text-sm text-green-700 space-y-1">
                <p>{t('supplier.totalRows')}: {result.totalRows}</p>
                <p>{t('supplier.inserted')}: {result.insertedCount}</p>
                <p>{t('supplier.updated')}: {result.updatedCount}</p>
                {result.skippedCount > 0 && <p>{t('supplier.skipped')}: {result.skippedCount}</p>}
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="mt-2 text-sm text-red-700">
                <p className="font-bold">{t('supplier.errors')}:</p>
                <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                  {result.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{t('supplier.row')} {err.row}: {err.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
            data-testid="button-close-import"
          >
            {result ? t('close') : t('cancel')}
          </button>
          {!result && (
            <button 
              onClick={handleImport}
              disabled={!file || importing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-start-import"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {importing ? t('supplier.importing') : t('supplier.startImport')}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
});

export default SupplierPortal;
