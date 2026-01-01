import { useState, useEffect, ReactNode } from 'react';
import { SupplierMarketplaceSettings, SupplierPriorityConfig, SupplierSelectionMode, SupplierProfile } from '../types';
import Api from '../services/api';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';
import {
  Store,
  Save,
  Settings,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Power,
  PowerOff,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Star,
  Package,
  Truck,
  DollarSign,
  Clock,
  Bell,
  RefreshCw,
  Building2,
  ArrowUpDown,
  Percent,
  AlertCircle
} from 'lucide-react';

const SELECTION_MODES: { value: SupplierSelectionMode; labelAr: string; labelEn: string; descAr: string; descEn: string }[] = [
  {
    value: 'SINI_FIRST_THEN_SUPPLIERS',
    labelAr: 'سني أولاً ثم الموردين',
    labelEn: 'Sini First, Then Suppliers',
    descAr: 'البحث في مخزون سني أولاً، وإذا لم يتوفر يتم البحث في كتالوج الموردين',
    descEn: 'Search Sini inventory first, then supplier catalogs if not available'
  },
  {
    value: 'SUPPLIERS_ONLY_WHEN_OUT_OF_STOCK',
    labelAr: 'الموردين فقط عند نفاد المخزون',
    labelEn: 'Suppliers Only When Out of Stock',
    descAr: 'عرض منتجات الموردين فقط عندما يكون المنتج غير متوفر في مخزون سني',
    descEn: 'Show supplier products only when item is out of stock at Sini'
  },
  {
    value: 'RANDOM_SUPPLIER_WHEN_OUT_OF_STOCK',
    labelAr: 'مورد عشوائي عند نفاد المخزون',
    labelEn: 'Random Supplier When Out of Stock',
    descAr: 'اختيار مورد عشوائي من الموردين المتاحين عند عدم توفر المنتج',
    descEn: 'Pick a random supplier from available ones when product is not available'
  },
  {
    value: 'LOWEST_PRICE_FIRST',
    labelAr: 'أقل سعر أولاً',
    labelEn: 'Lowest Price First',
    descAr: 'عرض المنتج من المورد صاحب أقل سعر بغض النظر عن المخزون',
    descEn: 'Show product from supplier with lowest price regardless of stock'
  },
  {
    value: 'HIGHEST_PRIORITY_FIRST',
    labelAr: 'الأولوية الأعلى أولاً',
    labelEn: 'Highest Priority First',
    descAr: 'عرض المنتج من المورد ذو الأولوية الأعلى في الترتيب',
    descEn: 'Show product from supplier with highest priority in ranking'
  }
];

export const AdminSupplierMarketplaceSettings = () => {
  const [settings, setSettings] = useState<SupplierMarketplaceSettings | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'GENERAL' | 'PRIORITIES' | 'LOCAL_SUPPLIERS' | 'INTL_SUPPLIERS' | 'UNREGISTERED_SUPPLIERS' | 'ADD_SUPPLIER'>('GENERAL');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProfile | null>(null);
  const [showSupplierDetails, setShowSupplierDetails] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    supplierType: 'LOCAL' as 'LOCAL' | 'INTERNATIONAL' | 'UNREGISTERED',
    deliveryHours: 48, // Default delivery time in hours for UNREGISTERED suppliers
    // Permissions
    canPlaceOrders: false,
    canRequestQuotes: false,
    hasPointsAccount: false,
    canViewPricing: false,
    canUploadProducts: true,
    maxProductsLimit: 1000,
  });

  const { addToast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, suppliersData] = await Promise.all([
        Api.getSupplierMarketplaceSettings(),
        Api.getSupplierProfiles()
      ]);
      setSettings(settingsData);
      // Ensure suppliersData is an array
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (e) {
      addToast(language === 'ar' ? 'فشل في تحميل الإعدادات' : 'Failed to load settings', 'error');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await Api.saveSupplierMarketplaceSettings(settings);
      addToast(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully', 'success');
    } catch (e) {
      addToast(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = () => {
    if (!settings) return;
    setSettings({ ...settings, enabled: !settings.enabled });
  };

  const updateSetting = <K extends keyof SupplierMarketplaceSettings>(
    key: K,
    value: SupplierMarketplaceSettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const addSupplierPriority = () => {
    if (!settings) return;
    const newPriority: SupplierPriorityConfig = {
      supplierId: `SUP${Date.now()}`,
      supplierName: language === 'ar' ? 'مورد جديد' : 'New Supplier',
      priority: settings.supplierPriorities.length + 1,
      enabled: true
    };
    setSettings({
      ...settings,
      supplierPriorities: [...settings.supplierPriorities, newPriority]
    });
  };

  const removeSupplierPriority = (supplierId: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      supplierPriorities: settings.supplierPriorities.filter(p => p.supplierId !== supplierId)
    });
  };

  const updateSupplierPriority = (supplierId: string, updates: Partial<SupplierPriorityConfig>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      supplierPriorities: settings.supplierPriorities.map(p =>
        p.supplierId === supplierId ? { ...p, ...updates } : p
      )
    });
  };

  const moveSupplierPriority = (supplierId: string, direction: 'up' | 'down') => {
    if (!settings) return;
    const priorities = [...settings.supplierPriorities];
    const index = priorities.findIndex(p => p.supplierId === supplierId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= priorities.length) return;

    [priorities[index], priorities[newIndex]] = [priorities[newIndex], priorities[index]];
    priorities.forEach((p, i) => p.priority = i + 1);

    setSettings({ ...settings, supplierPriorities: priorities });
  };

  if (loading || !settings) {
    return (
      <div className="p-10 text-center">
        <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
        <span className="text-slate-500">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  const SectionButton = ({ id, icon, label }: { id: 'GENERAL' | 'PRIORITIES' | 'LOCAL_SUPPLIERS' | 'INTL_SUPPLIERS' | 'UNREGISTERED_SUPPLIERS' | 'ADD_SUPPLIER', icon: ReactNode, label: string }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-bold ${activeSection === id
        ? 'bg-brand-600 text-white shadow-lg'
        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
        }`}
      data-testid={`section-${id.toLowerCase()}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // Filter suppliers by type
  const localSuppliers = suppliers.filter(s => s.supplierType === 'LOCAL' || (!s.supplierType && s.supplierType !== 'UNREGISTERED'));
  const internationalSuppliers = suppliers.filter(s => s.supplierType === 'INTERNATIONAL');
  const unregisteredSuppliers = suppliers.filter(s => s.supplierType === 'UNREGISTERED');

  // Handle add supplier
  const handleAddSupplier = async () => {
    try {
      // In real implementation, this would call Api.addSupplier()
      const newSupplier: SupplierProfile = {
        supplierId: `SUP-${Date.now()}`,
        companyName: newSupplierForm.companyName,
        contactName: newSupplierForm.contactName,
        email: newSupplierForm.email,
        phone: newSupplierForm.phone,
        supplierType: newSupplierForm.supplierType,
        status: 'ACTIVE',
        totalItemsListed: 0,
        permissions: {
          canPlaceOrders: newSupplierForm.canPlaceOrders,
          canRequestQuotes: newSupplierForm.canRequestQuotes,
          hasPointsAccount: newSupplierForm.hasPointsAccount,
          canViewPricing: newSupplierForm.canViewPricing,
          canUploadProducts: newSupplierForm.canUploadProducts,
          maxProductsLimit: newSupplierForm.maxProductsLimit,
        },
        createdAt: new Date().toISOString(),
      };
      setSuppliers([...suppliers, newSupplier]);
      setNewSupplierForm({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        supplierType: 'LOCAL',
        deliveryHours: 48,
        canPlaceOrders: false,
        canRequestQuotes: false,
        hasPointsAccount: false,
        canViewPricing: false,
        canUploadProducts: true,
        maxProductsLimit: 1000,
      });
      addToast(language === 'ar' ? 'تم إضافة المورد بنجاح' : 'Supplier added successfully', 'success');
      setActiveSection('LOCAL_SUPPLIERS');
    } catch (e) {
      addToast(language === 'ar' ? 'فشل في إضافة المورد' : 'Failed to add supplier', 'error');
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Store className="text-brand-600" />
            {language === 'ar' ? 'الموردين وإعداداتهم' : 'Suppliers & Settings'}
          </h1>
          <p className="text-slate-500 mt-1">
            {language === 'ar'
              ? 'إدارة الموردين المحليين والدوليين وصلاحياتهم ومنتجاتهم'
              : 'Manage local and international suppliers, permissions & products'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${settings.enabled
              ? 'bg-green-100 text-green-700 border-2 border-green-300'
              : 'bg-red-100 text-red-700 border-2 border-red-300'
              }`}
            data-testid="toggle-marketplace"
          >
            {settings.enabled ? <Power size={18} /> : <PowerOff size={18} />}
            {settings.enabled
              ? (language === 'ar' ? 'مفعّل' : 'Enabled')
              : (language === 'ar' ? 'معطّل' : 'Disabled')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2 transition-all"
            data-testid="btn-save-settings"
          >
            <Save size={18} />
            {saving
              ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
              : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
          </button>
        </div>
      </div>

      {!settings.enabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-amber-800">
              {language === 'ar' ? 'سوق الموردين معطّل حالياً' : 'Supplier Marketplace is Currently Disabled'}
            </p>
            <p className="text-sm text-amber-700">
              {language === 'ar'
                ? 'قم بتفعيل السوق لعرض منتجات الموردين للعملاء'
                : 'Enable the marketplace to show supplier products to customers'}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <SectionButton id="GENERAL" icon={<Settings size={18} />} label={language === 'ar' ? 'الإعدادات العامة' : 'General Settings'} />
        <SectionButton id="PRIORITIES" icon={<ArrowUpDown size={18} />} label={language === 'ar' ? 'أولويات الموردين' : 'Supplier Priorities'} />
        <SectionButton id="LOCAL_SUPPLIERS" icon={<Building2 size={18} />} label={language === 'ar' ? 'موردين محليين' : 'Local Suppliers'} />
        <SectionButton id="INTL_SUPPLIERS" icon={<Truck size={18} />} label={language === 'ar' ? 'موردين دوليين' : 'International Suppliers'} />
        <SectionButton id="UNREGISTERED_SUPPLIERS" icon={<AlertCircle size={18} />} label={language === 'ar' ? 'غير مسجلين' : 'Unregistered'} />
        <SectionButton id="ADD_SUPPLIER" icon={<Plus size={18} />} label={language === 'ar' ? 'إضافة مورد' : 'Add Supplier'} />
      </div>

      {activeSection === 'GENERAL' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              {language === 'ar' ? 'طريقة اختيار المورد' : 'Supplier Selection Mode'}
            </label>
            <div className="space-y-3">
              {SELECTION_MODES.map(mode => (
                <label
                  key={mode.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.selectionMode === mode.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="selectionMode"
                    value={mode.value}
                    checked={settings.selectionMode === mode.value}
                    onChange={() => updateSetting('selectionMode', mode.value)}
                    className="mt-1"
                    data-testid={`radio-mode-${mode.value}`}
                  />
                  <div>
                    <p className="font-bold text-slate-800">
                      {language === 'ar' ? mode.labelAr : mode.labelEn}
                    </p>
                    <p className="text-sm text-slate-500">
                      {language === 'ar' ? mode.descAr : mode.descEn}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <EyeOff size={18} className="text-slate-600" />
                  <span className="font-bold text-slate-700">
                    {language === 'ar' ? 'إخفاء هوية المورد' : 'Hide Supplier Identity'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('hideRealSupplierFromCustomer', !settings.hideRealSupplierFromCustomer)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.hideRealSupplierFromCustomer ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                  data-testid="toggle-hide-supplier"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.hideRealSupplierFromCustomer ? 'right-1' : 'left-1'
                    }`} />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'عدم إظهار اسم المورد الحقيقي للعميل'
                  : 'Do not show real supplier name to customers'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-slate-600" />
                  <span className="font-bold text-slate-700">
                    {language === 'ar' ? 'عرض مستوى المخزون' : 'Show Stock Level'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('showSupplierStockLevel', !settings.showSupplierStockLevel)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.showSupplierStockLevel ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                  data-testid="toggle-show-stock"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.showSupplierStockLevel ? 'right-1' : 'left-1'
                    }`} />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'إظهار كمية المخزون المتاحة من المورد'
                  : 'Display available stock quantity from supplier'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-slate-600" />
                  <span className="font-bold text-slate-700">
                    {language === 'ar' ? 'تقييم الموردين' : 'Supplier Rating'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('enableSupplierRating', !settings.enableSupplierRating)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.enableSupplierRating ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                  data-testid="toggle-rating"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableSupplierRating ? 'right-1' : 'left-1'
                    }`} />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'السماح بتقييم الموردين بناءً على الأداء'
                  : 'Allow rating suppliers based on performance'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-slate-600" />
                  <span className="font-bold text-slate-700">
                    {language === 'ar' ? 'إشعار المنتجات الجديدة' : 'New Product Notification'}
                  </span>
                </div>
                <button
                  onClick={() => updateSetting('notifyAdminOnNewSupplierItem', !settings.notifyAdminOnNewSupplierItem)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifyAdminOnNewSupplierItem ? 'bg-brand-600' : 'bg-slate-300'
                    }`}
                  data-testid="toggle-notify"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifyAdminOnNewSupplierItem ? 'right-1' : 'left-1'
                    }`} />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'إشعار المسؤول عند إضافة منتج جديد من مورد'
                  : 'Notify admin when new product is added by supplier'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Percent size={14} />
                {language === 'ar' ? 'نسبة الهامش الافتراضية' : 'Default Markup %'}
              </label>
              <input
                type="number"
                value={settings.defaultMarkupPercent || ''}
                onChange={(e) => updateSetting('defaultMarkupPercent', parseFloat(e.target.value) || undefined)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                placeholder="15"
                data-testid="input-markup"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <DollarSign size={14} />
                {language === 'ar' ? 'الحد الأدنى للربح %' : 'Min Profit Margin %'}
              </label>
              <input
                type="number"
                value={settings.minProfitMargin || ''}
                onChange={(e) => updateSetting('minProfitMargin', parseFloat(e.target.value) || undefined)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                placeholder="5"
                data-testid="input-min-margin"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Clock size={14} />
                {language === 'ar' ? 'الحد الأقصى للتوصيل (أيام)' : 'Max Lead Time (days)'}
              </label>
              <input
                type="number"
                value={settings.maxLeadTimeDays || ''}
                onChange={(e) => updateSetting('maxLeadTimeDays', parseInt(e.target.value) || undefined)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                placeholder="14"
                data-testid="input-lead-time"
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'PRIORITIES' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              {language === 'ar' ? 'ترتيب أولويات الموردين' : 'Supplier Priority Order'}
            </h2>
            <button
              onClick={addSupplierPriority}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors"
              data-testid="btn-add-priority"
            >
              <Plus size={16} />
              {language === 'ar' ? 'إضافة مورد' : 'Add Supplier'}
            </button>
          </div>

          {settings.supplierPriorities.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا يوجد موردين مضافين' : 'No suppliers added yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.supplierPriorities
                .sort((a, b) => a.priority - b.priority)
                .map((priority, index) => (
                  <div
                    key={priority.supplierId}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${priority.enabled
                      ? 'border-slate-200 bg-white'
                      : 'border-slate-100 bg-slate-50 opacity-60'
                      }`}
                    data-testid={`priority-${priority.supplierId}`}
                  >
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveSupplierPriority(priority.supplierId, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveSupplierPriority(priority.supplierId, 'down')}
                        disabled={index === settings.supplierPriorities.length - 1}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold">
                      {priority.priority}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={priority.supplierName || ''}
                        onChange={(e) => updateSupplierPriority(priority.supplierId, { supplierName: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        placeholder={language === 'ar' ? 'اسم المورد' : 'Supplier Name'}
                      />
                    </div>

                    <div className="w-24">
                      <div className="relative">
                        <input
                          type="number"
                          value={priority.minProfitMargin || ''}
                          onChange={(e) => updateSupplierPriority(priority.supplierId, { minProfitMargin: parseFloat(e.target.value) || 0 })}
                          className="w-full p-2 bg-amber-50 border border-amber-200 rounded-lg text-center font-bold text-amber-700"
                          placeholder="20"
                          min="0"
                          max="100"
                          data-testid={`margin-${priority.supplierId}`}
                        />
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500 text-xs font-bold">%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center mt-0.5">{language === 'ar' ? 'هامش الربح' : 'Margin'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSupplierPriority(priority.supplierId, { enabled: !priority.enabled })}
                        className={`p-2 rounded-lg transition-colors ${priority.enabled
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                      >
                        {priority.enabled ? <Power size={18} /> : <PowerOff size={18} />}
                      </button>
                      <button
                        onClick={() => removeSupplierPriority(priority.supplierId)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {(activeSection === 'LOCAL_SUPPLIERS' || activeSection === 'INTL_SUPPLIERS') && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              {activeSection === 'LOCAL_SUPPLIERS'
                ? (language === 'ar' ? 'الموردين المحليين' : 'Local Suppliers')
                : (language === 'ar' ? 'الموردين الدوليين' : 'International Suppliers')}
            </h2>
            <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full font-bold">
              {activeSection === 'LOCAL_SUPPLIERS' ? localSuppliers.length : internationalSuppliers.length}
            </span>
          </div>

          {(activeSection === 'LOCAL_SUPPLIERS' ? localSuppliers : internationalSuppliers).length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا يوجد موردين مسجلين' : 'No registered suppliers'}</p>
              <button
                onClick={() => setActiveSection('ADD_SUPPLIER')}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
              >
                {language === 'ar' ? 'إضافة مورد جديد' : 'Add New Supplier'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeSection === 'LOCAL_SUPPLIERS' ? localSuppliers : internationalSuppliers).map(supplier => (
                <div
                  key={supplier.supplierId}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors"
                  data-testid={`supplier-${supplier.supplierId}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 text-lg">{supplier.companyName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${supplier.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : supplier.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {supplier.status === 'ACTIVE' ? (language === 'ar' ? 'نشط' : 'Active') :
                            supplier.status === 'PENDING' ? (language === 'ar' ? 'معلق' : 'Pending') :
                              (language === 'ar' ? 'موقف' : 'Suspended')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{supplier.contactName} • {supplier.email || supplier.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedSupplier(supplier); setShowSupplierDetails(true); }}
                        className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100"
                        title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                        <Settings size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <p className="text-slate-500">{language === 'ar' ? 'المنتجات' : 'Products'}</p>
                      <p className="font-bold text-slate-800">{supplier.totalItemsListed || 0}</p>
                    </div>
                    {supplier.avgRating && (
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <p className="text-slate-500">{language === 'ar' ? 'التقييم' : 'Rating'}</p>
                        <p className="font-bold text-amber-600 flex items-center gap-1">
                          <Star size={14} /> {supplier.avgRating.toFixed(1)}
                        </p>
                      </div>
                    )}
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <p className="text-slate-500">{language === 'ar' ? 'تاريخ التسجيل' : 'Registered'}</p>
                      <p className="font-bold text-slate-800">{supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('en-GB') : '-'}</p>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-500 mb-2">{language === 'ar' ? 'الصلاحيات:' : 'Permissions:'}</p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.permissions?.canPlaceOrders && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{language === 'ar' ? 'طلب شراء' : 'Can Order'}</span>
                      )}
                      {supplier.permissions?.canRequestQuotes && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">{language === 'ar' ? 'طلب تسعير' : 'Quote Request'}</span>
                      )}
                      {supplier.permissions?.hasPointsAccount && (
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">{language === 'ar' ? 'حساب نقاط' : 'Points Account'}</span>
                      )}
                      {supplier.permissions?.canViewPricing && (
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">{language === 'ar' ? 'عرض الأسعار' : 'View Pricing'}</span>
                      )}
                      {supplier.permissions?.canUploadProducts && (
                        <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">{language === 'ar' ? 'رفع منتجات' : 'Upload Products'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'UNREGISTERED_SUPPLIERS' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={20} />
                {language === 'ar' ? 'الموردين غير المسجلين' : 'Unregistered Suppliers'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {language === 'ar'
                  ? 'موردين بدون حساب في المنصة - يتم التواصل معهم يدوياً'
                  : 'Suppliers without platform account - manual contact'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">
                {unregisteredSuppliers.length}
              </span>
              <button
                onClick={() => setActiveSection('ADD_SUPPLIER')}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 flex items-center gap-2"
              >
                <Plus size={16} />
                {language === 'ar' ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>

          {unregisteredSuppliers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-amber-50 rounded-xl border-2 border-dashed border-amber-200">
              <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
              <p className="font-bold text-amber-700">{language === 'ar' ? 'لا يوجد موردين غير مسجلين' : 'No unregistered suppliers'}</p>
              <p className="text-sm text-amber-600 mt-1">
                {language === 'ar'
                  ? 'أضف مورد غير مسجل لرفع منتجاته يدوياً'
                  : 'Add an unregistered supplier to upload their products manually'}
              </p>
              <button
                onClick={() => {
                  setNewSupplierForm({ ...newSupplierForm, supplierType: 'UNREGISTERED' });
                  setActiveSection('ADD_SUPPLIER');
                }}
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600"
              >
                {language === 'ar' ? 'إضافة مورد غير مسجل' : 'Add Unregistered Supplier'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {unregisteredSuppliers.map(supplier => (
                <div
                  key={supplier.supplierId}
                  className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-colors"
                  data-testid={`supplier-${supplier.supplierId}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-800 text-lg">{supplier.companyName}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-800">
                          ⚠️ {language === 'ar' ? 'غير مسجل' : 'Unregistered'}
                        </span>
                        {supplier.deliveryHours && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            ⏱ {supplier.deliveryHours} {language === 'ar' ? 'ساعة' : 'hours'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{supplier.contactName} • {supplier.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 flex items-center gap-1"
                        title={language === 'ar' ? 'رفع منتجات Excel' : 'Upload Excel Products'}
                      >
                        <Package size={18} />
                        <span className="text-xs font-bold hidden md:inline">
                          {language === 'ar' ? 'رفع منتجات' : 'Upload'}
                        </span>
                      </button>
                      <button
                        onClick={() => { setSelectedSupplier(supplier); setShowSupplierDetails(true); }}
                        className="p-2 bg-white text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200"
                        title={language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <p className="text-slate-500">{language === 'ar' ? 'المنتجات' : 'Products'}</p>
                      <p className="font-bold text-slate-800">{supplier.totalItemsListed || 0}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <p className="text-slate-500">{language === 'ar' ? 'وقت التوريد' : 'Delivery'}</p>
                      <p className="font-bold text-blue-600">{supplier.deliveryHours || 48} {language === 'ar' ? 'ساعة' : 'h'}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <p className="text-slate-500">{language === 'ar' ? 'تاريخ الإضافة' : 'Added'}</p>
                      <p className="font-bold text-slate-800">{supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('en-GB') : '-'}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-100">
                      <p className="text-slate-500">{language === 'ar' ? 'الجوال' : 'Phone'}</p>
                      <p className="font-bold text-slate-800 text-xs">{supplier.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'ADD_SUPPLIER' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Plus size={20} className="text-brand-600" />
            {language === 'ar' ? 'إضافة مورد جديد' : 'Add New Supplier'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700">{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}</h3>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</label>
                <input
                  type="text"
                  value={newSupplierForm.companyName}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, companyName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder={language === 'ar' ? 'مثال: شركة الوفاء' : 'e.g. Al-Wafa Company'}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">{language === 'ar' ? 'اسم المسؤول' : 'Contact Name'}</label>
                <input
                  type="text"
                  value={newSupplierForm.contactName}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, contactName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  type="email"
                  value={newSupplierForm.email}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, email: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">{language === 'ar' ? 'رقم الجوال' : 'Phone'}</label>
                <input
                  type="tel"
                  value={newSupplierForm.phone}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">{language === 'ar' ? 'نوع المورد' : 'Supplier Type'}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewSupplierForm({ ...newSupplierForm, supplierType: 'LOCAL' })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${newSupplierForm.supplierType === 'LOCAL'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {language === 'ar' ? 'محلي' : 'Local'}
                  </button>
                  <button
                    onClick={() => setNewSupplierForm({ ...newSupplierForm, supplierType: 'INTERNATIONAL' })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${newSupplierForm.supplierType === 'INTERNATIONAL'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {language === 'ar' ? 'دولي' : 'International'}
                  </button>
                  <button
                    onClick={() => setNewSupplierForm({ ...newSupplierForm, supplierType: 'UNREGISTERED' })}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${newSupplierForm.supplierType === 'UNREGISTERED'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {language === 'ar' ? 'غير مسجل' : 'Unregistered'}
                  </button>
                </div>
                {newSupplierForm.supplierType === 'UNREGISTERED' && (
                  <p className="text-xs text-amber-600 mt-2">
                    {language === 'ar'
                      ? '⚠️ مورد بدون حساب - يتم التواصل معه يدوياً وترفع منتجاته من صيني كار'
                      : '⚠️ Supplier without account - manual contact, products uploaded by Sini Car'}
                  </p>
                )}
              </div>

              {/* Delivery Hours - Only for UNREGISTERED suppliers */}
              {newSupplierForm.supplierType === 'UNREGISTERED' && (
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    {language === 'ar' ? 'وقت التوريد (ساعات)' : 'Delivery Time (hours)'}
                  </label>
                  <div className="flex gap-2">
                    {[24, 48, 72, 96].map(hours => (
                      <button
                        key={hours}
                        onClick={() => setNewSupplierForm({ ...newSupplierForm, deliveryHours: hours })}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${newSupplierForm.deliveryHours === hours
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                      >
                        {hours} {language === 'ar' ? 'س' : 'h'}
                      </button>
                    ))}
                    <input
                      type="number"
                      value={newSupplierForm.deliveryHours}
                      onChange={(e) => setNewSupplierForm({ ...newSupplierForm, deliveryHours: parseInt(e.target.value) || 48 })}
                      className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                      min="1"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'ar'
                      ? 'سيظهر للعميل كـ "طلبية X ساعة"'
                      : 'Will show to customer as "Order X hours"'}
                  </p>
                </div>
              )}
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700">{language === 'ar' ? 'الصلاحيات الخاصة' : 'Special Permissions'}</h3>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={newSupplierForm.canUploadProducts}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, canUploadProducts: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-brand-600"
                  />
                  <div>
                    <p className="font-bold text-slate-700">{language === 'ar' ? 'رفع المنتجات' : 'Upload Products'}</p>
                    <p className="text-xs text-slate-500">{language === 'ar' ? 'السماح برفع وإدارة المنتجات' : 'Allow uploading and managing products'}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={newSupplierForm.canPlaceOrders}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, canPlaceOrders: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-brand-600"
                  />
                  <div>
                    <p className="font-bold text-slate-700">{language === 'ar' ? 'طلب شراء (كعميل)' : 'Place Orders (as Customer)'}</p>
                    <p className="text-xs text-slate-500">{language === 'ar' ? 'يستطيع الطلب مثل العميل' : 'Can place orders like a customer'}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={newSupplierForm.canRequestQuotes}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, canRequestQuotes: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-brand-600"
                  />
                  <div>
                    <p className="font-bold text-slate-700">{language === 'ar' ? 'طلب عرض سعر' : 'Request Quotes'}</p>
                    <p className="text-xs text-slate-500">{language === 'ar' ? 'طلب تسعيرات للمنتجات' : 'Request price quotes'}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={newSupplierForm.hasPointsAccount}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, hasPointsAccount: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-brand-600"
                  />
                  <div>
                    <p className="font-bold text-slate-700">{language === 'ar' ? 'حساب نقاط' : 'Points Account'}</p>
                    <p className="text-xs text-slate-500">{language === 'ar' ? 'ربط بنظام النقاط والمكافآت' : 'Link to points and rewards system'}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={newSupplierForm.canViewPricing}
                    onChange={(e) => setNewSupplierForm({ ...newSupplierForm, canViewPricing: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-brand-600"
                  />
                  <div>
                    <p className="font-bold text-slate-700">{language === 'ar' ? 'عرض الأسعار' : 'View Pricing'}</p>
                    <p className="text-xs text-slate-500">{language === 'ar' ? 'مشاهدة أسعار المنتجات' : 'View product pricing'}</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">{language === 'ar' ? 'الحد الأقصى للمنتجات' : 'Max Products Limit'}</label>
                <input
                  type="number"
                  value={newSupplierForm.maxProductsLimit}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, maxProductsLimit: parseInt(e.target.value) || 1000 })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={() => setActiveSection('LOCAL_SUPPLIERS')}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleAddSupplier}
              disabled={!newSupplierForm.companyName || !newSupplierForm.contactName}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={18} />
              {language === 'ar' ? 'إضافة المورد' : 'Add Supplier'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupplierMarketplaceSettings;
