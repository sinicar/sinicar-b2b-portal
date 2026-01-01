import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Api } from '../services/api';
import { ApiClient } from '../services/apiClient';
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
  DollarSign, BarChart3, Star, Calendar, Loader2, Image as ImageIcon,
  FileArchive, RefreshCw, ZoomIn, Link2, Unlink, Archive
} from 'lucide-react';
import JSZip from 'jszip';
import {
  compressImage,
  createThumbnail,
  extractPartNumberFromFileName,
  isValidImageFormat,
  generateImageId
} from '../services/imageService';
import { ProductImage, IMAGE_STATUS_LABELS } from '../utils/imageConstants';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { NotificationsPage } from './NotificationsPage';
import { getDirection } from '../services/i18n';
import { Modal } from './Modal';
import { useToast } from '../services/ToastContext';
import { formatDateTime } from '../utils/dateUtils';
import * as XLSX from 'xlsx';
import { SupplierPurchaseOrdersView, SupplierProductsView, SupplierDashboardView } from '../features/supplier/views';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTIwIDEyMCI+PHJlY3QgZmlsbD0iI2YzZjRmNiIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiLz48cGF0aCBmaWxsPSIjOWNhM2FmIiBkPSJNNjAgMzBjLTIwIDAtMzUgMTUtMzUgMzVzMTUgMzUgMzUgMzUgMzUtMTUgMzUtMzUtMTUtMzUtMzUtMzV6bTAgNjBjLTE0IDAtMjUtMTEtMjUtMjVzMTEtMjUgMjUtMjUgMjUgMTEgMjUgMjUtMTEgMjUtMjUgMjV6Ii8+PHBhdGggZmlsbD0iIzljYTNhZiIgZD0iTTYwIDQ1Yy0xMCAwLTIwIDgtMjAgMjBzMTAgMjAgMjAgMjAgMjAtOCAyMC0yMC0xMC0yMC0yMC0yMHptMCAzMGMtNSAwLTEwLTQtMTAtMTBzNS0xMCAxMC0xMCAxMCA0IDEwIDEwLTUgMTAtMTAgMTB6Ii8+PC9zdmc+';

interface SupplierPortalProps {
  user: User;
  onLogout: () => void;
}

type SupplierView = 'DASHBOARD' | 'PRODUCTS' | 'PURCHASE_ORDERS' | 'REQUESTS' | 'SETTINGS' | 'NOTIFICATIONS' | 'TEAM' | 'IMAGES' | 'QUICK_ORDER' | 'EXCEL_PURCHASE';

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
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3.5 rounded-2xl mb-2 transition-all duration-300 group relative overflow-hidden ${active
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

  // Persist view state in localStorage
  const [view, setView] = useState<SupplierView>(() => {
    const savedView = localStorage.getItem('supplier_portal_view');
    const validViews: SupplierView[] = ['DASHBOARD', 'PRODUCTS', 'PURCHASE_ORDERS', 'REQUESTS', 'NOTIFICATIONS', 'SETTINGS', 'TEAM', 'IMAGES', 'QUICK_ORDER', 'EXCEL_PURCHASE'];
    if (savedView && validViews.includes(savedView as SupplierView)) {
      return savedView as SupplierView;
    }
    return 'DASHBOARD';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Save view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('supplier_portal_view', view);
  }, [view]);

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
    try {
      const response = await ApiClient.suppliers.getMyDashboard();
      setStats(response?.data || response || {});
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setStats({} as SupplierDashboardStats);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const response = await ApiClient.suppliers.getMyProducts({
        page: productFilters.page,
        limit: productFilters.pageSize,
        q: productFilters.search
      });
      const data = response?.data || [];
      setProducts(data);
      setProductTotal(response?.pagination?.total || data.length);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
      setProductTotal(0);
    }
  }, [productFilters]);

  const loadRequests = useCallback(async () => {
    try {
      const response = await ApiClient.suppliers.getMyRequests({
        page: requestFilters.page,
        limit: requestFilters.pageSize
      });
      const data = response?.data || [];
      setRequests(data);
      setRequestTotal(response?.pagination?.total || data.length);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setRequests([]);
      setRequestTotal(0);
    }
  }, [requestFilters]);

  const loadSettings = useCallback(async () => {
    try {
      const response = await ApiClient.suppliers.getMySettings();
      setSettings(response?.data || response || {});
    } catch (err) {
      console.error('Failed to load settings:', err);
      setSettings({} as SupplierSettings);
    }
  }, []);

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
      await Api.addSupplierProduct(user.id, product);
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
      await Api.updateSupplierProduct(user.id, productId, updates);
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
      await Api.deleteSupplierProduct(user.id, productId);
      addToast(t('supplier.productDeleted'), 'success');
      loadProducts();
      loadDashboard();
    } catch (err) {
      addToast(t('supplier.productDeleteError'), 'error');
    }
  };

  // NOTE: handleSubmitQuote and handleRejectRequest removed - violates business policy
  // Suppliers only manage their products, Sini Car handles pricing and requests

  const handleImportExcel = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const result = await Api.importSupplierProductsFromExcel(user.id, buffer);
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
      const updated = await Api.updateSupplierSettings(user.id, updates);
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
            label="ط£ظˆط§ظ…ط± ط§ظ„ط´ط±ط§ط،"
            active={view === 'PURCHASE_ORDERS'}
            onClick={() => setView('PURCHASE_ORDERS')}
            collapsed={collapsed}
            testId="nav-purchase-orders"
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
            icon={<Users size={20} />}
            label={t('supplier.team')}
            active={view === 'TEAM'}
            onClick={() => setView('TEAM')}
            collapsed={collapsed}
            testId="nav-team"
          />
          <SidebarItem
            icon={<Settings size={20} />}
            label={t('supplier.settings')}
            active={view === 'SETTINGS'}
            onClick={() => setView('SETTINGS')}
            collapsed={collapsed}
            testId="nav-settings"
          />

          {/* Conditional Customer Features for Dual-Role Suppliers */}
          {user.canAccessCustomerFeatures && (
            <>
              <div className={`${collapsed ? 'mx-auto w-6' : 'mx-3'} my-3 border-t border-amber-500/30`}></div>
              <div className={`${collapsed ? 'hidden' : 'px-3 mb-2'}`}>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">ط®ط¯ظ…ط§طھ ط§ظ„ط¹ظ…ظ„ط§ط،</span>
              </div>
              <SidebarItem
                icon={<Search size={20} />}
                label="ط§ظ„ط·ظ„ط¨ط§طھ ط§ظ„ط³ط±ظٹط¹ط©"
                active={view === 'QUICK_ORDER'}
                onClick={() => setView('QUICK_ORDER')}
                badge={user.supplierSearchPoints || 0}
                collapsed={collapsed}
                testId="nav-quick-order"
              />
              <SidebarItem
                icon={<FileSpreadsheet size={20} />}
                label="ط·ظ„ط¨ ط´ط±ط§ط، Excel"
                active={view === 'EXCEL_PURCHASE'}
                onClick={() => setView('EXCEL_PURCHASE')}
                collapsed={collapsed}
                testId="nav-excel-purchase"
              />
            </>
          )}

          <SidebarItem
            icon={<ImageIcon size={20} />}
            label={t('supplier.images', 'طµظˆط± ط§ظ„ظ…ظ†طھط¬ط§طھ')}
            active={view === 'IMAGES'}
            onClick={() => setView('IMAGES')}
            collapsed={collapsed}
            testId="nav-images"
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
              {view === 'TEAM' && t('supplier.team')}
              {view === 'IMAGES' && t('supplier.images', 'طµظˆط± ط§ظ„ظ…ظ†طھط¬ط§طھ')}
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
            <SupplierDashboardView
              stats={stats}
              t={t}
              onNavigate={setView}
              recentRequests={requests.slice(0, 5)}
            />
          )}

          {view === 'PRODUCTS' && (
            <SupplierProductsView
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

          {view === 'PURCHASE_ORDERS' && (
            <SupplierPurchaseOrdersView
              orders={[]}
              onUpdateStatus={(orderId, status) => {
                addToast(`طھظ… طھط­ط¯ظٹط« ط­ط§ظ„ط© ط§ظ„ط·ظ„ط¨ ${orderId} ط¥ظ„ظ‰ ${status}`, 'success');
              }}
              t={t}
            />
          )}

          {view === 'TEAM' && (
            <SupplierTeamView
              supplierId={user.id}
              t={t}
              currentUser={user}
            />
          )}

          {view === 'IMAGES' && (
            <SupplierImagesView
              supplierId={user.id}
              t={t}
            />
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
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); onFiltersChange({ ...filters, status: e.target.value as 'ALL' | 'NEW' | 'VIEWED' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED', page: 1 }); }}
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
                      <span className={`w-2 h-2 rounded-full ${req.status === 'NEW' ? 'bg-orange-500' :
                        req.status === 'QUOTED' ? 'bg-blue-500' :
                          req.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-slate-400'
                        }`} />
                      <h4 className="font-bold text-slate-800">{req.partName || req.partNumber}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.urgency === 'URGENT' ? 'bg-red-100 text-red-700' :
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

        {/* NOTE: Price markup removed - Sini Car sets all margins, not suppliers */}
        <div className="space-y-4">
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
            {/* Only product-related notifications - NO quote/request notifications */}
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

interface SupplierEmployee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roleCode: string;
  roleName?: string;
  roleNameAr?: string;
  isOwner: boolean;
  isActive: boolean;
  jobTitle?: string;
  createdAt: string;
}

const SupplierTeamView = memo(({ supplierId, t, currentUser }: {
  supplierId: string;
  t: (key: string) => string;
  currentUser?: { id: string; role?: string; isSupplier?: boolean; clientId?: string } | null;
}) => {
  const [employees, setEmployees] = useState<SupplierEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<SupplierEmployee> | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState<Array<{ code: string; name: string; nameAr?: string }>>([]);
  const [newPassword, setNewPassword] = useState('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [ownerCheckDone, setOwnerCheckDone] = useState(false);
  const { addToast } = useToast();
  const { i18n } = useTranslation();
  const isRTL = getDirection(i18n.language) === 'rtl';

  const getBackendToken = async (): Promise<string | null> => {
    // Verify current mock user has supplier role before proceeding
    if (!currentUser?.isSupplier && currentUser?.role !== 'SUPPLIER') {
      console.error('Current user is not a supplier');
      return null;
    }

    // Use user-specific backend token key to avoid cross-user token reuse
    const tokenKey = `backend_token_${currentUser?.id || 'default'}`;
    let backendToken = localStorage.getItem(tokenKey);
    if (backendToken) return backendToken;

    // Get the current user's clientId for backend login
    const clientId = currentUser?.clientId;
    if (!clientId) {
      console.error('No clientId found for current user');
      return null;
    }

    try {
      // Attempt to login to backend with the current user's credentials
      // Note: For demo, we use the mock password pattern (clientId = user-N, password = N)
      const userNum = clientId.replace('user-', '');
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: clientId, password: userNum, loginType: 'owner' })
      });
      const data = await res.json();
      if (data.success && data.data?.accessToken) {
        localStorage.setItem(tokenKey, data.data.accessToken);
        return data.data.accessToken;
      }
    } catch (e) {
      console.error('Failed to get backend token:', e);
    }
    return null;
  };

  useEffect(() => {
    loadEmployees();
    loadRoles();
  }, [supplierId, currentUser?.id]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const token = await getBackendToken();
      if (!token) {
        setEmployees([]);
        setIsOwner(false);
        setOwnerCheckDone(true);
        setLoading(false);
        return;
      }

      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/suppliers/me/sub-users?page=1&limit=50', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        setEmployees(data.data);
        // If API returns success, current user is an owner (backend enforces owner-only access)
        setIsOwner(true);
      } else {
        setEmployees([]);
        // API returned error - user is not an owner or doesn't have access
        setIsOwner(false);
      }
      setOwnerCheckDone(true);
    } catch (err) {
      console.error('Error loading employees:', err);
      setEmployees([]);
      setOwnerCheckDone(true);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const token = await getBackendToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/suppliers/me/sub-users/roles', { headers });
      const data = await res.json();
      if (data.success && data.data) {
        setRoles(data.data);
      } else {
        setRoles([
          { code: 'SUPPLIER_OWNER', name: 'Supplier Owner', nameAr: 'ظ…ط§ظ„ظƒ ظ…ظˆط±ط¯' },
          { code: 'SUPPLIER_MANAGER', name: 'Supplier Manager', nameAr: 'ظ…ط¯ظٹط± ظ…ظˆط±ط¯' },
          { code: 'SUPPLIER_STAFF', name: 'Supplier Staff', nameAr: 'ظ…ظˆط¸ظپ ظ…ظˆط±ط¯' }
        ]);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
      setRoles([
        { code: 'SUPPLIER_OWNER', name: 'Supplier Owner', nameAr: 'ظ…ط§ظ„ظƒ ظ…ظˆط±ط¯' },
        { code: 'SUPPLIER_MANAGER', name: 'Supplier Manager', nameAr: 'ظ…ط¯ظٹط± ظ…ظˆط±ط¯' },
        { code: 'SUPPLIER_STAFF', name: 'Supplier Staff', nameAr: 'ظ…ظˆط¸ظپ ظ…ظˆط±ط¯' }
      ]);
    }
  };

  const handleSave = async () => {
    if (!editingEmployee) return;
    setSaving(true);
    try {
      const token = await getBackendToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (editingEmployee.id) {
        const res = await fetch(`/api/v1/suppliers/me/sub-users/${editingEmployee.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            roleCode: editingEmployee.roleCode,
            isActive: editingEmployee.isActive,
            jobTitle: editingEmployee.jobTitle
          })
        });
        const data = await res.json();
        if (data.success) {
          addToast(isRTL ? 'طھظ… طھط­ط¯ظٹط« ط§ظ„ط¹ط¶ظˆ ط¨ظ†ط¬ط§ط­' : 'Member updated successfully', 'success');
          setShowModal(false);
          setEditingEmployee(null);
          loadEmployees();
        } else {
          addToast(data.error || t('error'), 'error');
        }
      } else {
        const res = await fetch('/api/v1/suppliers/me/sub-users', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: editingEmployee.name,
            email: editingEmployee.email,
            phone: editingEmployee.phone,
            roleCode: editingEmployee.roleCode,
            jobTitle: editingEmployee.jobTitle,
            password: newPassword || undefined
          })
        });
        const data = await res.json();
        if (data.success) {
          addToast(isRTL ? 'طھظ… ط¥ط¶ط§ظپط© ط§ظ„ط¹ط¶ظˆ ط¨ظ†ط¬ط§ط­' : 'Member added successfully', 'success');
          setShowModal(false);
          setEditingEmployee(null);
          setNewPassword('');
          loadEmployees();
        } else {
          addToast(data.error || t('error'), 'error');
        }
      }
    } catch (err) {
      console.error('Error saving employee:', err);
      addToast(t('error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (emp: SupplierEmployee) => {
    try {
      const token = await getBackendToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/suppliers/me/sub-users/${emp.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isActive: !emp.isActive })
      });
      const data = await res.json();
      if (data.success) {
        addToast(emp.isActive ? (isRTL ? 'طھظ… طھط¹ط·ظٹظ„ ط§ظ„ط¹ط¶ظˆ' : 'Member deactivated') : (isRTL ? 'طھظ… طھظپط¹ظٹظ„ ط§ظ„ط¹ط¶ظˆ' : 'Member activated'), 'success');
        loadEmployees();
      } else {
        addToast(data.error || t('error'), 'error');
      }
    } catch (err) {
      addToast(t('error'), 'error');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            data-testid="input-search-employees"
          />
        </div>
        {isOwner && (
          <button
            onClick={() => {
              setEditingEmployee({ name: '', email: '', phone: '', roleCode: 'SUPPLIER_STAFF', isActive: true, isOwner: false });
              setNewPassword('');
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            data-testid="button-add-employee"
          >
            <Plus size={18} />
            {t('supplier.addEmployee')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">{t('supplier.noEmployees')}</h3>
          <p className="text-slate-500">{t('supplier.addFirstEmployee')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">{t('name')}</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">{t('email')}</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">{t('phone')}</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">{t('role')}</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">{t('status')}</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-employee-${emp.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{emp.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{emp.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium inline-block w-fit">
                          {isRTL ? (emp.roleNameAr || emp.roleName || emp.roleCode) : (emp.roleName || emp.roleCode)}
                        </span>
                        {emp.isOwner && (
                          <span className="px-2 py-0.5 mt-1 text-[10px] rounded-full bg-yellow-100 text-yellow-700 font-bold inline-block w-fit">
                            {isRTL ? 'ظ…ط§ظ„ظƒ' : 'Owner'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${emp.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                        }`}>
                        {emp.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isOwner && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingEmployee(emp); setShowModal(true); }}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            data-testid={`button-edit-employee-${emp.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {!emp.isOwner && (
                            <button
                              onClick={() => handleToggleActive(emp)}
                              className={`p-2 rounded-lg transition-colors ${emp.isActive ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-green-600 hover:bg-green-50'}`}
                              data-testid={`button-toggle-employee-${emp.id}`}
                              title={emp.isActive ? (isRTL ? 'طھط¹ط·ظٹظ„' : 'Deactivate') : (isRTL ? 'طھظپط¹ظٹظ„' : 'Activate')}
                            >
                              {emp.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && editingEmployee && (
        <Modal isOpen onClose={() => { setShowModal(false); setEditingEmployee(null); }} title={editingEmployee.id ? t('supplier.editEmployee') : t('supplier.addEmployee')}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')} *</label>
              <input
                type="text"
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                data-testid="input-employee-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')} *</label>
              <input
                type="email"
                value={editingEmployee.email}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                data-testid="input-employee-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
              <input
                type="tel"
                value={editingEmployee.phone || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                data-testid="input-employee-phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('role')} *</label>
              <select
                value={editingEmployee.roleCode || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, roleCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                data-testid="select-employee-role"
              >
                <option value="">{isRTL ? 'ط§ط®طھط± ط§ظ„ط¯ظˆط±' : 'Select Role'}</option>
                {roles.map(r => (
                  <option key={r.code} value={r.code}>{isRTL ? (r.nameAr || r.name) : r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{isRTL ? 'ط§ظ„ظ…ط³ظ…ظ‰ ط§ظ„ظˆط¸ظٹظپظٹ' : 'Job Title'}</label>
              <input
                type="text"
                value={editingEmployee.jobTitle || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                data-testid="input-employee-job-title"
              />
            </div>
            {!editingEmployee.id && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{isRTL ? 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±' : 'Password'}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isRTL ? 'ط§ط®طھظٹط§ط±ظٹ - ط³ظٹطھظ… طھظˆظ„ظٹط¯ظ‡ طھظ„ظ‚ط§ط¦ظٹط§ظ‹' : 'Optional - auto-generated if empty'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  data-testid="input-employee-password"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="employee-active"
                checked={editingEmployee.isActive ?? true}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                data-testid="checkbox-employee-active"
              />
              <label htmlFor="employee-active" className="text-sm text-slate-700">{t('active')}</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={() => { setShowModal(false); setEditingEmployee(null); setNewPassword(''); }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-colors"
              data-testid="button-cancel-employee"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editingEmployee.name || !editingEmployee.roleCode}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              data-testid="button-save-employee"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
});

// Supplier Images View - for uploading product images
const SupplierImagesView = memo(({ supplierId, t }: {
  supplierId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) => {
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; phase: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { addToast } = useToast();

  // Refs
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const IMAGES_STORAGE_KEY = 'sini_product_images';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const prods = await Api.getSupplierProducts(supplierId, {});
        setProducts(prods.items || []);

        const storedImages = localStorage.getItem(IMAGES_STORAGE_KEY);
        // Filter images to show only those uploaded by this supplier OR linked to their products
        // For now, we show all images linked to their part numbers to avoid confusion
        const allImages: ProductImage[] = storedImages ? JSON.parse(storedImages) : [];
        setImages(allImages);
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [supplierId]);

  const saveImages = (newImages: ProductImage[]) => {
    localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(newImages));
    setImages(newImages);
  };

  const processImageFile = async (file: File, partNumber?: string): Promise<ProductImage | null> => {
    try {
      const { dataUrl, width, height, blob } = await compressImage(file);
      const thumbnail = await createThumbnail(dataUrl);

      const pn = (partNumber?.trim().toUpperCase()) || extractPartNumberFromFileName(file.name) || '';
      const matchedProduct = products.find(p => (p.oemNumber || p.sku)?.toUpperCase() === pn);
      // const hasPreviousImage = images.some(img => img.partNumber === pn);

      return {
        id: generateImageId(),
        partNumber: pn,
        fileName: file.name,
        fileUrl: dataUrl,
        thumbnailUrl: thumbnail,
        originalSize: file.size,
        compressedSize: blob.size,
        width,
        height,
        status: 'PENDING', // Always PENDING for suppliers
        uploadedBy: supplierId,
        uploaderType: 'SUPPLIER_LOCAL', // Assuming local used for this demo
        uploaderName: 'Supplier',
        isAutoMatched: !partNumber,
        isLinkedToProduct: !!matchedProduct,
        createdAt: new Date().toISOString(),
        adminNotes: undefined // No admin notes yet
      };
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      return null;
    }
  };

  const handleImageUpload = async (partNumber: string, file: File) => {
    setUploading(true);
    try {
      const newImage = await processImageFile(file, partNumber);
      if (newImage) {
        saveImages([newImage, ...images]);
        addToast(t('supplier.imageUploaded', 'طھظ… ط±ظپط¹ ط§ظ„طµظˆط±ط© ط¨ظ†ط¬ط§ط­ ظˆطھظ†طھط¸ط± ط§ظ„ظ…ظˆط§ظپظ‚ط©'), 'success');
      }
    } catch (e) {
      addToast(t('supplier.imageUploadError', 'ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط§ظ„ط±ظپط¹'), 'error');
    } finally {
      setUploading(false);
    }
  };

  // Handle ZIP upload
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.zip')) {
      addToast('ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ظ…ظ„ظپ ZIP', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: 100, phase: 'ط¬ط§ط±ظٹ ظپظƒ ط§ظ„ط¶ط؛ط·...' });

    try {
      const zip = await JSZip.loadAsync(file);
      const imageFiles: { name: string; data: Blob }[] = [];

      // Extract images from ZIP
      const entries = Object.entries(zip.files);
      let processed = 0;

      for (const [path, zipEntry] of entries) {
        if (zipEntry.dir) continue;

        const ext = path.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext || '')) {
          const blob = await zipEntry.async('blob');
          const fileName = path.split('/').pop() || path;
          imageFiles.push({ name: fileName, data: blob });
        }

        processed++;
        if (processed % 10 === 0) {
          setUploadProgress({ current: Math.round((processed / entries.length) * 20), total: 100, phase: 'ط¬ط§ط±ظٹ ظپظƒ ط§ظ„ط¶ط؛ط·...' });
        }
      }

      if (imageFiles.length === 0) {
        addToast('ظ„ظ… ظٹطھظ… ط§ظ„ط¹ط«ظˆط± ط¹ظ„ظ‰ طµظˆط± ظپظٹ ط§ظ„ظ…ظ„ظپ ط§ظ„ظ…ط¶ط؛ظˆط·', 'error');
        setUploading(false);
        setUploadProgress(null);
        return;
      }

      const newImages: ProductImage[] = [];
      let completed = 0;

      for (const imgFile of imageFiles) {
        setUploadProgress({
          current: 20 + Math.round((completed / imageFiles.length) * 80),
          total: 100,
          phase: `ظ…ط¹ط§ظ„ط¬ط©: ${imgFile.name}`
        });

        const fileObj = new File([imgFile.data], imgFile.name, { type: imgFile.data.type });
        const newImage = await processImageFile(fileObj);
        if (newImage) {
          newImages.push(newImage);
        }
        completed++;
      }

      saveImages([...newImages, ...images]);
      addToast(`طھظ… ط±ظپط¹ ${newImages.length} طµظˆط±ط© ظ…ظ† ظ…ظ„ظپ ZIPطŒ ظˆظ‡ظٹ ط¨ط§ظ†طھط¸ط§ط± ط§ظ„ظ…ظˆط§ظپظ‚ط©`, 'success');

    } catch (error) {
      console.error('ZIP Error:', error);
      addToast('ظپط´ظ„ ظپظٹ ظ…ط¹ط§ظ„ط¬ط© ظ…ظ„ظپ ZIP', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  const filteredProducts = products.filter(p =>
    !searchTerm ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.oemNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductImages = (partNumber: string) => {
    if (!partNumber) return [];
    return images.filter(img => img.partNumber?.toUpperCase() === partNumber.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Upload size={20} className="text-emerald-600" />
          {t('supplier.uploadActions', 'ط¹ظ…ظ„ظٹط§طھ ط§ظ„ط±ظپط¹')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ZIP Upload */}
          <div
            onClick={() => !uploading && zipInputRef.current?.click()}
            className={`border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500 hover:bg-emerald-50'}`}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <FileArchive size={24} className="text-purple-600" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{t('supplier.uploadZip', 'ط±ظپط¹ ظ…ظ„ظپ ظ…ط¶ط؛ظˆط· (ZIP)')}</h4>
            <p className="text-sm text-slate-500 mb-4">{t('supplier.zipHint', 'طµظˆط± ظ…طھط¹ط¯ط¯ط©طŒ ط³ظٹطھظ… ط§ط³طھط®ط±ط§ط¬ ط±ظ‚ظ… ط§ظ„ظ‚ط·ط¹ط© ظ…ظ† ط§ط³ظ… ط§ظ„ظ…ظ„ظپ')}</p>
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleZipUpload}
              disabled={uploading}
            />
            <button disabled={uploading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold">
              {t('supplier.selectFile', 'ط§ط®طھط± ظ…ظ„ظپ')}
            </button>
          </div>

          {/* Bulk Button Placeholder (can be extended) */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-slate-50">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
              <ImageIcon size={24} className="text-slate-500" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{t('supplier.bulkManage', 'ط¥ط¯ط§ط±ط© ط§ظ„طµظˆط±')}</h4>
            <p className="text-sm text-slate-500 mb-4">{t('supplier.bulkHint', 'ط§ط³طھط®ط¯ظ… ط§ظ„ط¬ط¯ظˆظ„ ط£ط¯ظ†ط§ظ‡ ظ„ط±ظپط¹ طµظˆط± ظ„ظƒظ„ ظ…ظ†طھط¬ ط¹ظ„ظ‰ ط­ط¯ط©')}</p>
          </div>
        </div>

        {/* Progress Bar */}
        {uploading && uploadProgress && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-700">{uploadProgress.phase}</span>
              <span className="text-sm font-mono text-slate-500">{Math.round(uploadProgress.current)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${uploadProgress.current}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{t('supplier.totalProducts', 'ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ظ†طھط¬ط§طھ')}</p>
          <p className="text-2xl font-black text-slate-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{t('supplier.imagesPending', 'ط¨ط§ظ†طھط¸ط§ط± ط§ظ„ظ…ظˆط§ظپظ‚ط©')}</p>
          <p className="text-2xl font-black text-amber-500">{images.filter(i => i.status === 'PENDING' && i.uploadedBy === supplierId).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{t('supplier.imagesApproved', 'طµظˆط± ظ…ظ‚ط¨ظˆظ„ط©')}</p>
          <p className="text-2xl font-black text-emerald-500">{images.filter(i => i.status === 'APPROVED' && i.uploadedBy === supplierId).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">{t('supplier.imagesRejected', 'طµظˆط± ظ…ط±ظپظˆط¶ط©')}</p>
          <p className="text-2xl font-black text-red-500">{images.filter(i => i.status === 'REJECTED' && i.uploadedBy === supplierId).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('supplier.searchProducts', 'ط§ط¨ط­ط« ط¹ظ† ظ…ظ†طھط¬...')}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon size={18} />
            {t('supplier.productImages', 'طµظˆط± ظ…ظ†طھط¬ط§طھظƒ')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600">{t('supplier.productInfo', 'طھظپط§طµظٹظ„ ط§ظ„ظ…ظ†طھط¬')}</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-600">{t('supplier.currentImages', 'ط§ظ„طµظˆط± ط§ظ„ط­ط§ظ„ظٹط©')}</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600">{t('actions', 'ط§ظ„ط¥ط¬ط±ط§ط،ط§طھ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-400">
                    <Package size={40} className="mx-auto mb-3 opacity-50" />
                    <p>{t('supplier.noProducts', 'ظ„ط§ طھظˆط¬ط¯ ظ…ظ†طھط¬ط§طھ')}</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.slice(0, 20).map(product => {
                  const partNum = product.oemNumber || product.sku;
                  const productImages = getProductImages(partNum);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-slate-800">{product.oemNumber}</span>
                          <span className="text-xs text-slate-500">{product.sku}</span>
                          <span className="text-sm text-slate-600">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {productImages.length > 0 ? (
                            productImages.map(img => (
                              <div key={img.id} className="relative group">
                                <img
                                  src={img.thumbnailUrl || img.fileUrl}
                                  alt="product"
                                  className={`w-12 h-12 object-contain bg-white rounded-lg border-2 ${img.status === 'APPROVED' ? 'border-emerald-500' :
                                    img.status === 'REJECTED' ? 'border-red-500' :
                                      'border-amber-500'
                                    }`}
                                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                                />
                                <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${img.status === 'APPROVED' ? 'bg-emerald-500' :
                                  img.status === 'REJECTED' ? 'bg-red-500' :
                                    'bg-amber-500'
                                  }`}>
                                  {img.status === 'APPROVED' ? <CheckCircle size={10} /> :
                                    img.status === 'REJECTED' ? <XCircle size={10} /> :
                                      <Clock size={10} />}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">{t('supplier.noImages', 'ظ„ط§ طھظˆط¬ط¯ طµظˆط±')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors">
                          <Plus size={14} />
                          {t('supplier.addImage', 'ط¥ط¶ط§ظپط© طµظˆط±ط©')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && partNum) {
                                handleImageUpload(partNum, file);
                              }
                            }}
                          />
                        </label>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredProducts.length > 20 && (
          <div className="p-3 border-t border-slate-100 text-center text-sm text-slate-500">
            {t('supplier.showingFirst20', 'ظٹطھظ… ط¹ط±ط¶ ط£ظˆظ„ 20 ظ…ظ†طھط¬ ظپظ‚ط·')}
          </div>
        )}
      </div>
    </div>
  );
});

export default SupplierPortal;
