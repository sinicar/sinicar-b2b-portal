import { useState, useEffect, ReactNode } from 'react';
import { SupplierMarketplaceSettings, SupplierPriorityConfig, SupplierSelectionMode, SupplierProfile } from '../types';
import { MockApi } from '../services/mockApi';
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
  const [activeSection, setActiveSection] = useState<'GENERAL' | 'PRIORITIES' | 'SUPPLIERS'>('GENERAL');

  const { addToast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, suppliersData] = await Promise.all([
        MockApi.getSupplierMarketplaceSettings(),
        MockApi.getSupplierProfiles()
      ]);
      setSettings(settingsData);
      setSuppliers(suppliersData);
    } catch (e) {
      addToast(language === 'ar' ? 'فشل في تحميل الإعدادات' : 'Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await MockApi.saveSupplierMarketplaceSettings(settings);
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

  const SectionButton = ({ id, icon, label }: { id: 'GENERAL' | 'PRIORITIES' | 'SUPPLIERS', icon: ReactNode, label: string }) => (
    <button 
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all font-bold ${
        activeSection === id 
          ? 'bg-brand-600 text-white shadow-lg' 
          : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
      }`}
      data-testid={`section-${id.toLowerCase()}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Store className="text-brand-600" />
            {language === 'ar' ? 'إعدادات سوق الموردين' : 'Supplier Marketplace Settings'}
          </h1>
          <p className="text-slate-500 mt-1">
            {language === 'ar' 
              ? 'إدارة كتالوج الموردين الخارجيين وتكاملهم مع المنتجات'
              : 'Manage external supplier catalog and product integration'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
              settings.enabled 
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
        <SectionButton id="SUPPLIERS" icon={<Building2 size={18} />} label={language === 'ar' ? 'الموردين' : 'Suppliers'} />
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
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.selectionMode === mode.value
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
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.hideRealSupplierFromCustomer ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                  data-testid="toggle-hide-supplier"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.hideRealSupplierFromCustomer ? 'right-1' : 'left-1'
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
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.showSupplierStockLevel ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                  data-testid="toggle-show-stock"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.showSupplierStockLevel ? 'right-1' : 'left-1'
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
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.enableSupplierRating ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                  data-testid="toggle-rating"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.enableSupplierRating ? 'right-1' : 'left-1'
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
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.notifyAdminOnNewSupplierItem ? 'bg-brand-600' : 'bg-slate-300'
                  }`}
                  data-testid="toggle-notify"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    settings.notifyAdminOnNewSupplierItem ? 'right-1' : 'left-1'
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
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      priority.enabled 
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSupplierPriority(priority.supplierId, { enabled: !priority.enabled })}
                        className={`p-2 rounded-lg transition-colors ${
                          priority.enabled 
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

      {activeSection === 'SUPPLIERS' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            {language === 'ar' ? 'الموردين المسجلين' : 'Registered Suppliers'}
          </h2>
          
          {suppliers.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا يوجد موردين مسجلين' : 'No registered suppliers'}</p>
              <p className="text-sm mt-2">
                {language === 'ar' 
                  ? 'الموردين الذين لديهم صلاحية "التصرف كمورد" سيظهرون هنا'
                  : 'Suppliers with "Can Act as Supplier" permission will appear here'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(supplier => (
                <div
                  key={supplier.supplierId}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                  data-testid={`supplier-${supplier.supplierId}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800">{supplier.companyName}</h3>
                      <p className="text-sm text-slate-500">{supplier.contactName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      supplier.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-700'
                        : supplier.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2 text-slate-600">
                      <Package size={14} />
                      {supplier.totalItemsListed || 0} {language === 'ar' ? 'منتج' : 'items'}
                    </p>
                    {supplier.avgRating && (
                      <p className="flex items-center gap-2 text-slate-600">
                        <Star size={14} className="text-amber-500" />
                        {supplier.avgRating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSupplierMarketplaceSettings;
