import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, Globe, Truck, Shield, Tag, Award, Plus, Save, 
  Trash2, Edit2, X, Check, RefreshCw, Percent, Package, MapPin,
  ChevronDown, ChevronUp, AlertCircle, Building2
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import type { 
  Currency, ExchangeRate, SupplierGroup, QualityCode, BrandCode,
  ShippingMethod, ShippingZone
} from '../types';

// Local simplified Role interface for this component
interface LocalRole {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

type TabType = 'CURRENCIES' | 'EXCHANGE_RATES' | 'SUPPLIER_GROUPS' | 'QUALITY_CODES' | 'BRAND_CODES' | 'SHIPPING_METHODS' | 'SHIPPING_ZONES' | 'ROLES';

// Helper to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default data matching our backend seed
const DEFAULT_CURRENCIES: Currency[] = [
  { id: '1', code: 'SAR', name: 'ريال سعودي', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س', isBase: true, isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: '2', code: 'USD', name: 'دولار أمريكي', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', isBase: false, isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: '3', code: 'CNY', name: 'يوان صيني', nameAr: 'يوان صيني', nameEn: 'Chinese Yuan', symbol: '¥', isBase: false, isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
  { id: '4', code: 'AED', name: 'درهم إماراتي', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'د.إ', isBase: false, isActive: true, sortOrder: 4, createdAt: new Date().toISOString() },
];

const DEFAULT_EXCHANGE_RATES: ExchangeRate[] = [
  { id: '1', currencyId: '2', rateToBase: 3.75, syncPercent: 2.5, effectiveFrom: new Date().toISOString(), isActive: true, createdAt: new Date().toISOString() },
  { id: '2', currencyId: '3', rateToBase: 0.52, syncPercent: 3.0, effectiveFrom: new Date().toISOString(), isActive: true, createdAt: new Date().toISOString() },
  { id: '3', currencyId: '4', rateToBase: 1.02, syncPercent: 1.5, effectiveFrom: new Date().toISOString(), isActive: true, createdAt: new Date().toISOString() },
];

const DEFAULT_SUPPLIER_GROUPS: SupplierGroup[] = [
  { id: '1', name: 'موردين الصين مباشر', nameAr: 'موردين الصين مباشر', nameEn: 'China Direct', description: 'موردين مباشرين من المصانع الصينية', defaultMarginPercent: 25, isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: '2', name: 'شركاء دبي', nameAr: 'شركاء دبي', nameEn: 'Dubai Partners', description: 'موردين من منطقة دبي الحرة', defaultMarginPercent: 18, isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: '3', name: 'موردين محليين', nameAr: 'موردين محليين', nameEn: 'Saudi Local', description: 'موردين داخل المملكة', defaultMarginPercent: 12, isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
];

const DEFAULT_QUALITY_CODES: QualityCode[] = [
  { id: '1', code: 'OEM', label: 'أصلي وكالة', labelAr: 'أصلي وكالة', labelEn: 'Original Equipment', description: 'قطع أصلية من المصنع الأصلي', defaultMarginAdjust: 5, isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: '2', code: 'OES', label: 'أصلي مصنع', labelAr: 'أصلي مصنع', labelEn: 'OES Quality', description: 'نفس جودة الأصلي من مصنع معتمد', defaultMarginAdjust: 3, isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: '3', code: 'AFT', label: 'بديل ممتاز', labelAr: 'بديل ممتاز', labelEn: 'Aftermarket Premium', description: 'بديل عالي الجودة', defaultMarginAdjust: 0, isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
  { id: '4', code: 'CPY', label: 'تجاري', labelAr: 'تجاري', labelEn: 'Commercial Copy', description: 'نسخة تجارية اقتصادية', defaultMarginAdjust: -3, isActive: true, sortOrder: 4, createdAt: new Date().toISOString() },
  { id: '5', code: 'REB', label: 'مجدد', labelAr: 'مجدد', labelEn: 'Rebuilt/Refurbished', description: 'قطع مجددة مع ضمان', defaultMarginAdjust: -5, isActive: true, sortOrder: 5, createdAt: new Date().toISOString() },
];

const DEFAULT_BRAND_CODES: BrandCode[] = [
  { id: '1', code: 'TOY', name: 'تويوتا أصلي', nameAr: 'تويوتا أصلي', nameEn: 'Toyota Genuine', country: 'Japan', isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: '2', code: 'HYU', name: 'هيونداي/كيا أصلي', nameAr: 'هيونداي/كيا أصلي', nameEn: 'Hyundai/Kia Genuine', country: 'Korea', isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: '3', code: 'GMB', name: 'GMB', nameAr: 'جي إم بي', nameEn: 'GMB Japan', country: 'Japan', isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
  { id: '4', code: 'KOY', name: 'KOYO', nameAr: 'كويو', nameEn: 'KOYO Bearings', country: 'Japan', isActive: true, sortOrder: 4, createdAt: new Date().toISOString() },
  { id: '5', code: 'AIS', name: 'AISIN', nameAr: 'أيسن', nameEn: 'AISIN Japan', country: 'Japan', isActive: true, sortOrder: 5, createdAt: new Date().toISOString() },
];

const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  { id: '1', code: 'SEA', name: 'شحن بحري', nameAr: 'شحن بحري', nameEn: 'Sea Freight', baseRate: 500, perKgRate: 2.5, minCharge: 500, deliveryDays: 35, isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: '2', code: 'AIR', name: 'شحن جوي', nameAr: 'شحن جوي', nameEn: 'Air Freight', baseRate: 150, perKgRate: 18, minCharge: 200, deliveryDays: 7, isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: '3', code: 'EXP', name: 'شحن سريع', nameAr: 'شحن سريع', nameEn: 'Express Courier', baseRate: 100, perKgRate: 45, minCharge: 150, deliveryDays: 3, isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
  { id: '4', code: 'LND', name: 'شحن بري', nameAr: 'شحن بري', nameEn: 'Land Freight', baseRate: 300, perKgRate: 1.5, minCharge: 400, deliveryDays: 14, isActive: true, sortOrder: 4, createdAt: new Date().toISOString() },
];

const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  { id: '1', code: 'GCC', name: 'دول الخليج', nameAr: 'دول الخليج', countries: ['SA', 'AE', 'KW', 'BH', 'OM', 'QA'], extraRatePerKg: 0, isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: '2', code: 'MENA', name: 'الشرق الأوسط وشمال أفريقيا', nameAr: 'الشرق الأوسط وشمال أفريقيا', countries: ['EG', 'JO', 'LB', 'IQ', 'MA', 'TN'], extraRatePerKg: 3, isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: '3', code: 'ASIA', name: 'آسيا', nameAr: 'آسيا', countries: ['CN', 'JP', 'KR', 'TH', 'MY', 'ID'], extraRatePerKg: 5, isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
  { id: '4', code: 'EUR', name: 'أوروبا', nameAr: 'أوروبا', countries: ['DE', 'FR', 'IT', 'ES', 'GB', 'NL'], extraRatePerKg: 8, isActive: true, sortOrder: 4, createdAt: new Date().toISOString() },
];

const DEFAULT_ROLES: LocalRole[] = [
  { id: '1', code: 'SUPER_ADMIN', name: 'مدير النظام', nameAr: 'مدير النظام', nameEn: 'Super Admin', isSystem: true, isActive: true, sortOrder: 1, createdAt: new Date().toISOString() },
  { id: '2', code: 'ADMIN', name: 'مدير', nameAr: 'مدير', nameEn: 'Admin', isSystem: true, isActive: true, sortOrder: 2, createdAt: new Date().toISOString() },
  { id: '3', code: 'MANAGER', name: 'مشرف', nameAr: 'مشرف', nameEn: 'Manager', isSystem: false, isActive: true, sortOrder: 3, createdAt: new Date().toISOString() },
  { id: '4', code: 'SUPPLIER', name: 'مورد', nameAr: 'مورد', nameEn: 'Supplier', isSystem: true, isActive: true, sortOrder: 4, createdAt: new Date().toISOString() },
  { id: '5', code: 'TRADER', name: 'تاجر', nameAr: 'تاجر', nameEn: 'Trader', isSystem: true, isActive: true, sortOrder: 5, createdAt: new Date().toISOString() },
  { id: '6', code: 'CUSTOMER', name: 'عميل', nameAr: 'عميل', nameEn: 'Customer', isSystem: true, isActive: true, sortOrder: 6, createdAt: new Date().toISOString() },
  { id: '7', code: 'GUEST', name: 'زائر', nameAr: 'زائر', nameEn: 'Guest', isSystem: true, isActive: true, sortOrder: 7, createdAt: new Date().toISOString() },
];

// Storage keys
const STORAGE_KEYS = {
  currencies: 'sinicar_currencies',
  exchangeRates: 'sinicar_exchange_rates',
  supplierGroups: 'sinicar_supplier_groups',
  qualityCodes: 'sinicar_quality_codes',
  brandCodes: 'sinicar_brand_codes',
  shippingMethods: 'sinicar_shipping_methods',
  shippingZones: 'sinicar_shipping_zones',
  roles: 'sinicar_roles',
};

// Helper functions for localStorage
function loadFromStorage<T>(key: string, defaultValue: T[]): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const AdminInternationalPricingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const isRtl = i18n.dir() === 'rtl';
  
  const [activeTab, setActiveTab] = useState<TabType>('CURRENCIES');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [supplierGroups, setSupplierGroups] = useState<SupplierGroup[]>([]);
  const [qualityCodes, setQualityCodes] = useState<QualityCode[]>([]);
  const [brandCodes, setBrandCodes] = useState<BrandCode[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [roles, setRoles] = useState<LocalRole[]>([]);
  
  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    setLoading(true);
    setCurrencies(loadFromStorage(STORAGE_KEYS.currencies, DEFAULT_CURRENCIES));
    setExchangeRates(loadFromStorage(STORAGE_KEYS.exchangeRates, DEFAULT_EXCHANGE_RATES));
    setSupplierGroups(loadFromStorage(STORAGE_KEYS.supplierGroups, DEFAULT_SUPPLIER_GROUPS));
    setQualityCodes(loadFromStorage(STORAGE_KEYS.qualityCodes, DEFAULT_QUALITY_CODES));
    setBrandCodes(loadFromStorage(STORAGE_KEYS.brandCodes, DEFAULT_BRAND_CODES));
    setShippingMethods(loadFromStorage(STORAGE_KEYS.shippingMethods, DEFAULT_SHIPPING_METHODS));
    setShippingZones(loadFromStorage(STORAGE_KEYS.shippingZones, DEFAULT_SHIPPING_ZONES));
    setRoles(loadFromStorage(STORAGE_KEYS.roles, DEFAULT_ROLES));
    setLoading(false);
  };

  const saveAllData = () => {
    saveToStorage(STORAGE_KEYS.currencies, currencies);
    saveToStorage(STORAGE_KEYS.exchangeRates, exchangeRates);
    saveToStorage(STORAGE_KEYS.supplierGroups, supplierGroups);
    saveToStorage(STORAGE_KEYS.qualityCodes, qualityCodes);
    saveToStorage(STORAGE_KEYS.brandCodes, brandCodes);
    saveToStorage(STORAGE_KEYS.shippingMethods, shippingMethods);
    saveToStorage(STORAGE_KEYS.shippingZones, shippingZones);
    saveToStorage(STORAGE_KEYS.roles, roles);
    addToast('تم حفظ جميع البيانات بنجاح', 'success');
  };

  const TabButton = ({ id, icon, label }: { id: TabType, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setShowAddForm(false); setEditingId(null); }}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        activeTab === id 
          ? 'bg-[#0B1B3A] text-[#C8A04F] shadow-lg' 
          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
      }`}
      data-testid={`tab-${id.toLowerCase()}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // Currency Management
  const CurrenciesTab = () => {
    const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({ code: '', name: '', nameAr: '', nameEn: '', symbol: '', isBase: false, isActive: true });
    const [newRate, setNewRate] = useState<Partial<ExchangeRate>>({ currencyId: '', rateToBase: 1, syncPercent: 0 });

    const handleAddCurrency = () => {
      if (!newCurrency.code || !newCurrency.name || !newCurrency.symbol) {
        addToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
      }
      const currency: Currency = {
        id: generateId(),
        code: newCurrency.code!.toUpperCase(),
        name: newCurrency.name!,
        nameAr: newCurrency.nameAr,
        nameEn: newCurrency.nameEn,
        symbol: newCurrency.symbol!,
        isBase: newCurrency.isBase || false,
        isActive: true,
        sortOrder: currencies.length + 1,
        createdAt: new Date().toISOString(),
      };
      const updated = [...currencies, currency];
      setCurrencies(updated);
      saveToStorage(STORAGE_KEYS.currencies, updated);
      setNewCurrency({ code: '', name: '', nameAr: '', nameEn: '', symbol: '', isBase: false, isActive: true });
      setShowAddForm(false);
      addToast('تمت إضافة العملة بنجاح', 'success');
    };

    const handleAddRate = () => {
      if (!newRate.currencyId || !newRate.rateToBase) {
        addToast('يرجى اختيار العملة وإدخال سعر الصرف', 'error');
        return;
      }
      const rate: ExchangeRate = {
        id: generateId(),
        currencyId: newRate.currencyId!,
        rateToBase: Number(newRate.rateToBase),
        syncPercent: Number(newRate.syncPercent) || 0,
        effectiveFrom: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const updated = [...exchangeRates, rate];
      setExchangeRates(updated);
      saveToStorage(STORAGE_KEYS.exchangeRates, updated);
      setNewRate({ currencyId: '', rateToBase: 1, syncPercent: 0 });
      addToast('تمت إضافة سعر الصرف بنجاح', 'success');
    };

    const handleDeleteCurrency = (id: string) => {
      const updated = currencies.filter(c => c.id !== id);
      setCurrencies(updated);
      saveToStorage(STORAGE_KEYS.currencies, updated);
      // Also remove related exchange rates
      const updatedRates = exchangeRates.filter(r => r.currencyId !== id);
      setExchangeRates(updatedRates);
      saveToStorage(STORAGE_KEYS.exchangeRates, updatedRates);
      addToast('تم حذف العملة', 'success');
    };

    const handleUpdateRate = (id: string, field: keyof ExchangeRate, value: any) => {
      const updated = exchangeRates.map(r => r.id === id ? { ...r, [field]: value, updatedAt: new Date().toISOString() } : r);
      setExchangeRates(updated);
      saveToStorage(STORAGE_KEYS.exchangeRates, updated);
    };

    const getCurrencyName = (currencyId: string) => {
      const currency = currencies.find(c => c.id === currencyId);
      return currency ? `${currency.code} - ${currency.name}` : currencyId;
    };

    return (
      <div className="space-y-6">
        {/* Currencies List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <DollarSign size={20} className="text-[#C8A04F]" />
              العملات المتاحة
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
              data-testid="button-add-currency"
            >
              <Plus size={16} /> إضافة عملة
            </button>
          </div>

          {showAddForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  placeholder="رمز العملة (USD)"
                  value={newCurrency.code}
                  onChange={e => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  maxLength={3}
                  data-testid="input-currency-code"
                />
                <input
                  placeholder="الاسم بالعربي"
                  value={newCurrency.nameAr}
                  onChange={e => setNewCurrency({ ...newCurrency, nameAr: e.target.value, name: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-currency-name-ar"
                />
                <input
                  placeholder="Name in English"
                  value={newCurrency.nameEn}
                  onChange={e => setNewCurrency({ ...newCurrency, nameEn: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  dir="ltr"
                  data-testid="input-currency-name-en"
                />
                <input
                  placeholder="الرمز ($)"
                  value={newCurrency.symbol}
                  onChange={e => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  maxLength={5}
                  data-testid="input-currency-symbol"
                />
                <label className="flex items-center gap-2 p-3">
                  <input
                    type="checkbox"
                    checked={newCurrency.isBase}
                    onChange={e => setNewCurrency({ ...newCurrency, isBase: e.target.checked })}
                    className="w-4 h-4"
                    data-testid="checkbox-currency-base"
                  />
                  <span className="text-sm">عملة أساسية</span>
                </label>
                <button
                  onClick={handleAddCurrency}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                  data-testid="button-save-currency"
                >
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {currencies.map(currency => (
              <div key={currency.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0B1B3A] rounded-xl flex items-center justify-center text-[#C8A04F] font-bold">
                    {currency.symbol}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{currency.code} - {currency.name}</p>
                    <p className="text-sm text-slate-500">{currency.nameEn}</p>
                  </div>
                  {currency.isBase && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      العملة الأساسية
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currency.isActive}
                      onChange={e => {
                        const updated = currencies.map(c => c.id === currency.id ? { ...c, isActive: e.target.checked } : c);
                        setCurrencies(updated);
                        saveToStorage(STORAGE_KEYS.currencies, updated);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-600">نشط</span>
                  </label>
                  {!currency.isBase && (
                    <button
                      onClick={() => handleDeleteCurrency(currency.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      data-testid={`button-delete-currency-${currency.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange Rates */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <RefreshCw size={20} className="text-[#C8A04F]" />
              أسعار الصرف (مقابل العملة الأساسية)
            </h3>
          </div>

          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={newRate.currencyId}
                onChange={e => setNewRate({ ...newRate, currencyId: e.target.value })}
                className="p-3 rounded-lg border border-slate-300 text-sm"
                data-testid="select-rate-currency"
              >
                <option value="">اختر العملة</option>
                {currencies.filter(c => !c.isBase).map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="سعر الصرف"
                value={newRate.rateToBase}
                onChange={e => setNewRate({ ...newRate, rateToBase: parseFloat(e.target.value) || 0 })}
                className="p-3 rounded-lg border border-slate-300 text-sm"
                step="0.01"
                data-testid="input-rate-value"
              />
              <input
                type="number"
                placeholder="نسبة المزامنة %"
                value={newRate.syncPercent}
                onChange={e => setNewRate({ ...newRate, syncPercent: parseFloat(e.target.value) || 0 })}
                className="p-3 rounded-lg border border-slate-300 text-sm"
                step="0.1"
                data-testid="input-rate-sync"
              />
              <button
                onClick={handleAddRate}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
                data-testid="button-add-rate"
              >
                <Plus size={16} /> إضافة سعر
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {exchangeRates.map(rate => (
              <div key={rate.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <DollarSign size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{getCurrencyName(rate.currencyId)}</p>
                    <p className="text-sm text-slate-500">
                      آخر تحديث: {new Date(rate.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <input
                      type="number"
                      value={rate.rateToBase}
                      onChange={e => handleUpdateRate(rate.id, 'rateToBase', parseFloat(e.target.value) || 0)}
                      className="w-24 p-2 text-center rounded-lg border border-slate-200 font-bold"
                      step="0.01"
                    />
                    <p className="text-xs text-slate-500 mt-1">سعر الصرف</p>
                  </div>
                  <div className="text-center">
                    <input
                      type="number"
                      value={rate.syncPercent}
                      onChange={e => handleUpdateRate(rate.id, 'syncPercent', parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 text-center rounded-lg border border-slate-200"
                      step="0.1"
                    />
                    <p className="text-xs text-slate-500 mt-1">نسبة المزامنة %</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = exchangeRates.filter(r => r.id !== rate.id);
                      setExchangeRates(updated);
                      saveToStorage(STORAGE_KEYS.exchangeRates, updated);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Supplier Groups Tab
  const SupplierGroupsTab = () => {
    const [newGroup, setNewGroup] = useState<Partial<SupplierGroup>>({ name: '', nameAr: '', nameEn: '', description: '', defaultMarginPercent: 15 });

    const handleAddGroup = () => {
      if (!newGroup.name) {
        addToast('يرجى إدخال اسم المجموعة', 'error');
        return;
      }
      const group: SupplierGroup = {
        id: generateId(),
        name: newGroup.name!,
        nameAr: newGroup.nameAr,
        nameEn: newGroup.nameEn,
        description: newGroup.description,
        defaultMarginPercent: Number(newGroup.defaultMarginPercent) || 15,
        isActive: true,
        sortOrder: supplierGroups.length + 1,
        createdAt: new Date().toISOString(),
      };
      const updated = [...supplierGroups, group];
      setSupplierGroups(updated);
      saveToStorage(STORAGE_KEYS.supplierGroups, updated);
      setNewGroup({ name: '', nameAr: '', nameEn: '', description: '', defaultMarginPercent: 15 });
      setShowAddForm(false);
      addToast('تمت إضافة مجموعة الموردين بنجاح', 'success');
    };

    const handleUpdateGroup = (id: string, field: keyof SupplierGroup, value: any) => {
      const updated = supplierGroups.map(g => g.id === id ? { ...g, [field]: value, updatedAt: new Date().toISOString() } : g);
      setSupplierGroups(updated);
      saveToStorage(STORAGE_KEYS.supplierGroups, updated);
    };

    const handleDeleteGroup = (id: string) => {
      const updated = supplierGroups.filter(g => g.id !== id);
      setSupplierGroups(updated);
      saveToStorage(STORAGE_KEYS.supplierGroups, updated);
      addToast('تم حذف المجموعة', 'success');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Building2 size={20} className="text-[#C8A04F]" />
              مجموعات الموردين
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
              data-testid="button-add-supplier-group"
            >
              <Plus size={16} /> إضافة مجموعة
            </button>
          </div>

          {showAddForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  placeholder="اسم المجموعة بالعربي"
                  value={newGroup.nameAr}
                  onChange={e => setNewGroup({ ...newGroup, nameAr: e.target.value, name: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-group-name-ar"
                />
                <input
                  placeholder="Group Name in English"
                  value={newGroup.nameEn}
                  onChange={e => setNewGroup({ ...newGroup, nameEn: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  dir="ltr"
                  data-testid="input-group-name-en"
                />
                <input
                  placeholder="الوصف"
                  value={newGroup.description}
                  onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-group-description"
                />
                <input
                  type="number"
                  placeholder="هامش الربح %"
                  value={newGroup.defaultMarginPercent}
                  onChange={e => setNewGroup({ ...newGroup, defaultMarginPercent: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-group-margin"
                />
                <button
                  onClick={handleAddGroup}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                  data-testid="button-save-group"
                >
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {supplierGroups.map(group => (
              <div key={group.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0B1B3A] to-[#1a2e56] rounded-xl flex items-center justify-center text-white font-bold">
                    {group.defaultMarginPercent}%
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{group.name}</p>
                    <p className="text-sm text-slate-500">{group.nameEn}</p>
                    {group.description && <p className="text-xs text-slate-400 mt-1">{group.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <input
                      type="number"
                      value={group.defaultMarginPercent}
                      onChange={e => handleUpdateGroup(group.id, 'defaultMarginPercent', parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 text-center rounded-lg border border-slate-200 font-bold"
                    />
                    <p className="text-xs text-slate-500 mt-1">هامش الربح %</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={group.isActive}
                      onChange={e => handleUpdateGroup(group.id, 'isActive', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-600">نشط</span>
                  </label>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    data-testid={`button-delete-group-${group.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Quality Codes Tab
  const QualityCodesTab = () => {
    const [newCode, setNewCode] = useState<Partial<QualityCode>>({ code: '', label: '', labelAr: '', labelEn: '', description: '', defaultMarginAdjust: 0 });

    const handleAddCode = () => {
      if (!newCode.code || !newCode.label) {
        addToast('يرجى إدخال الكود والتصنيف', 'error');
        return;
      }
      const code: QualityCode = {
        id: generateId(),
        code: newCode.code!.toUpperCase(),
        label: newCode.label!,
        labelAr: newCode.labelAr,
        labelEn: newCode.labelEn,
        description: newCode.description,
        defaultMarginAdjust: Number(newCode.defaultMarginAdjust) || 0,
        isActive: true,
        sortOrder: qualityCodes.length + 1,
        createdAt: new Date().toISOString(),
      };
      const updated = [...qualityCodes, code];
      setQualityCodes(updated);
      saveToStorage(STORAGE_KEYS.qualityCodes, updated);
      setNewCode({ code: '', label: '', labelAr: '', labelEn: '', description: '', defaultMarginAdjust: 0 });
      setShowAddForm(false);
      addToast('تمت إضافة كود الجودة بنجاح', 'success');
    };

    const handleUpdateCode = (id: string, field: keyof QualityCode, value: any) => {
      const updated = qualityCodes.map(c => c.id === id ? { ...c, [field]: value, updatedAt: new Date().toISOString() } : c);
      setQualityCodes(updated);
      saveToStorage(STORAGE_KEYS.qualityCodes, updated);
    };

    const handleDeleteCode = (id: string) => {
      const updated = qualityCodes.filter(c => c.id !== id);
      setQualityCodes(updated);
      saveToStorage(STORAGE_KEYS.qualityCodes, updated);
      addToast('تم حذف كود الجودة', 'success');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Award size={20} className="text-[#C8A04F]" />
              أكواد الجودة
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
              data-testid="button-add-quality-code"
            >
              <Plus size={16} /> إضافة كود
            </button>
          </div>

          {showAddForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  placeholder="الكود (OEM)"
                  value={newCode.code}
                  onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  maxLength={5}
                  data-testid="input-quality-code"
                />
                <input
                  placeholder="التصنيف بالعربي"
                  value={newCode.labelAr}
                  onChange={e => setNewCode({ ...newCode, labelAr: e.target.value, label: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-quality-label-ar"
                />
                <input
                  placeholder="Label in English"
                  value={newCode.labelEn}
                  onChange={e => setNewCode({ ...newCode, labelEn: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  dir="ltr"
                  data-testid="input-quality-label-en"
                />
                <input
                  placeholder="الوصف"
                  value={newCode.description}
                  onChange={e => setNewCode({ ...newCode, description: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-quality-description"
                />
                <input
                  type="number"
                  placeholder="تعديل الهامش %"
                  value={newCode.defaultMarginAdjust}
                  onChange={e => setNewCode({ ...newCode, defaultMarginAdjust: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-quality-margin"
                />
                <button
                  onClick={handleAddCode}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                  data-testid="button-save-quality-code"
                >
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {qualityCodes.map(code => (
              <div key={code.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                    code.defaultMarginAdjust > 0 ? 'bg-emerald-500' : code.defaultMarginAdjust < 0 ? 'bg-orange-500' : 'bg-slate-500'
                  }`}>
                    {code.code}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{code.label}</p>
                    <p className="text-sm text-slate-500">{code.labelEn}</p>
                    {code.description && <p className="text-xs text-slate-400 mt-1">{code.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <input
                      type="number"
                      value={code.defaultMarginAdjust}
                      onChange={e => handleUpdateCode(code.id, 'defaultMarginAdjust', parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 text-center rounded-lg border border-slate-200 font-bold"
                    />
                    <p className="text-xs text-slate-500 mt-1">تعديل الهامش %</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={code.isActive}
                      onChange={e => handleUpdateCode(code.id, 'isActive', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-600">نشط</span>
                  </label>
                  <button
                    onClick={() => handleDeleteCode(code.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    data-testid={`button-delete-quality-${code.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Brand Codes Tab
  const BrandCodesTab = () => {
    const [newBrand, setNewBrand] = useState<Partial<BrandCode>>({ code: '', name: '', nameAr: '', nameEn: '', country: '' });

    const handleAddBrand = () => {
      if (!newBrand.code || !newBrand.name) {
        addToast('يرجى إدخال الكود والاسم', 'error');
        return;
      }
      const brand: BrandCode = {
        id: generateId(),
        code: newBrand.code!.toUpperCase(),
        name: newBrand.name!,
        nameAr: newBrand.nameAr,
        nameEn: newBrand.nameEn,
        country: newBrand.country,
        isActive: true,
        sortOrder: brandCodes.length + 1,
        createdAt: new Date().toISOString(),
      };
      const updated = [...brandCodes, brand];
      setBrandCodes(updated);
      saveToStorage(STORAGE_KEYS.brandCodes, updated);
      setNewBrand({ code: '', name: '', nameAr: '', nameEn: '', country: '' });
      setShowAddForm(false);
      addToast('تمت إضافة العلامة التجارية بنجاح', 'success');
    };

    const handleDeleteBrand = (id: string) => {
      const updated = brandCodes.filter(b => b.id !== id);
      setBrandCodes(updated);
      saveToStorage(STORAGE_KEYS.brandCodes, updated);
      addToast('تم حذف العلامة التجارية', 'success');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Tag size={20} className="text-[#C8A04F]" />
              أكواد العلامات التجارية
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
              data-testid="button-add-brand"
            >
              <Plus size={16} /> إضافة علامة
            </button>
          </div>

          {showAddForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  placeholder="الكود (TOY)"
                  value={newBrand.code}
                  onChange={e => setNewBrand({ ...newBrand, code: e.target.value.toUpperCase() })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  maxLength={5}
                  data-testid="input-brand-code"
                />
                <input
                  placeholder="الاسم بالعربي"
                  value={newBrand.nameAr}
                  onChange={e => setNewBrand({ ...newBrand, nameAr: e.target.value, name: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-brand-name-ar"
                />
                <input
                  placeholder="Name in English"
                  value={newBrand.nameEn}
                  onChange={e => setNewBrand({ ...newBrand, nameEn: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  dir="ltr"
                  data-testid="input-brand-name-en"
                />
                <input
                  placeholder="بلد المنشأ"
                  value={newBrand.country}
                  onChange={e => setNewBrand({ ...newBrand, country: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  data-testid="input-brand-country"
                />
                <button
                  onClick={handleAddBrand}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                  data-testid="button-save-brand"
                >
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {brandCodes.map(brand => (
              <div key={brand.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#C8A04F] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-[#0B1B3A] text-[#C8A04F] font-bold rounded-lg text-sm">
                    {brand.code}
                  </span>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    data-testid={`button-delete-brand-${brand.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="font-bold text-slate-800">{brand.name}</p>
                <p className="text-sm text-slate-500">{brand.nameEn}</p>
                {brand.country && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Globe size={12} /> {brand.country}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Exchange Rates Tab
  const ExchangeRatesTab = () => {
    const [newRate, setNewRate] = useState<Partial<ExchangeRate>>({ currencyId: '', rateToBase: 0, syncPercent: 2.5 });
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddRate = () => {
      if (!newRate.currencyId) {
        addToast('يرجى اختيار العملة', 'error');
        return;
      }
      const rate: ExchangeRate = {
        id: generateId(),
        currencyId: newRate.currencyId!,
        rateToBase: Number(newRate.rateToBase) || 0,
        syncPercent: Number(newRate.syncPercent) || 2.5,
        effectiveFrom: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const updated = [...exchangeRates, rate];
      setExchangeRates(updated);
      saveToStorage(STORAGE_KEYS.exchangeRates, updated);
      setNewRate({ currencyId: '', rateToBase: 0, syncPercent: 2.5 });
      setShowAddForm(false);
      addToast('تم إضافة سعر الصرف بنجاح', 'success');
    };

    const getCurrencyName = (currencyId: string) => {
      const currency = currencies.find(c => c.id === currencyId);
      return currency ? `${currency.code} - ${currency.name}` : currencyId;
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Percent size={20} className="text-[#C8A04F]" />
              أسعار الصرف مقابل العملة الأساسية (SAR)
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
              data-testid="button-add-exchange-rate"
            >
              <Plus size={16} /> إضافة سعر صرف
            </button>
          </div>

          {showAddForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={newRate.currencyId}
                  onChange={e => setNewRate({ ...newRate, currencyId: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                >
                  <option value="">اختر العملة</option>
                  {currencies.filter(c => !c.isBase).map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="سعر الصرف"
                  value={newRate.rateToBase}
                  onChange={e => setNewRate({ ...newRate, rateToBase: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="نسبة المزامنة %"
                  value={newRate.syncPercent}
                  onChange={e => setNewRate({ ...newRate, syncPercent: parseFloat(e.target.value) || 2.5 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  step="0.1"
                />
                <button
                  onClick={handleAddRate}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                >
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {exchangeRates.map(rate => (
              <div key={rate.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white">
                    <Percent size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{getCurrencyName(rate.currencyId)}</p>
                    <p className="text-sm text-slate-500">آخر تحديث: {new Date(rate.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-2xl text-[#0B1B3A]">{rate.rateToBase}</p>
                    <p className="text-xs text-slate-500">ريال/وحدة</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-600">{rate.syncPercent}%</p>
                    <p className="text-xs text-slate-500">مزامنة</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${rate.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {rate.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                  <button
                    onClick={() => {
                      const updated = exchangeRates.filter(r => r.id !== rate.id);
                      setExchangeRates(updated);
                      saveToStorage(STORAGE_KEYS.exchangeRates, updated);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Shipping Methods Tab
  const ShippingMethodsTab = () => {
    const [newMethod, setNewMethod] = useState<Partial<ShippingMethod>>({ code: '', name: '', nameAr: '', nameEn: '', baseRate: 0, perKgRate: 0, minCharge: 0, deliveryDays: 7 });
    const [showMethodForm, setShowMethodForm] = useState(false);

    const handleAddMethod = () => {
      if (!newMethod.code || !newMethod.name) {
        addToast('يرجى إدخال الكود والاسم', 'error');
        return;
      }
      const method: ShippingMethod = {
        id: generateId(),
        code: newMethod.code!.toUpperCase(),
        name: newMethod.name!,
        nameAr: newMethod.nameAr,
        nameEn: newMethod.nameEn,
        baseRate: Number(newMethod.baseRate) || 0,
        perKgRate: Number(newMethod.perKgRate) || 0,
        minCharge: Number(newMethod.minCharge) || 0,
        deliveryDays: Number(newMethod.deliveryDays) || 7,
        isActive: true,
        sortOrder: shippingMethods.length + 1,
        createdAt: new Date().toISOString(),
      };
      const updated = [...shippingMethods, method];
      setShippingMethods(updated);
      saveToStorage(STORAGE_KEYS.shippingMethods, updated);
      setNewMethod({ code: '', name: '', nameAr: '', nameEn: '', baseRate: 0, perKgRate: 0, minCharge: 0, deliveryDays: 7 });
      setShowMethodForm(false);
      addToast('تمت إضافة طريقة الشحن بنجاح', 'success');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Truck size={20} className="text-[#C8A04F]" />
              طرق الشحن
            </h3>
            <button
              onClick={() => setShowMethodForm(!showMethodForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
              data-testid="button-add-shipping-method"
            >
              <Plus size={16} /> إضافة طريقة
            </button>
          </div>

          {showMethodForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <input
                  placeholder="الكود (SEA)"
                  value={newMethod.code}
                  onChange={e => setNewMethod({ ...newMethod, code: e.target.value.toUpperCase() })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  maxLength={5}
                />
                <input
                  placeholder="الاسم بالعربي"
                  value={newMethod.nameAr}
                  onChange={e => setNewMethod({ ...newMethod, nameAr: e.target.value, name: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  placeholder="Name in English"
                  value={newMethod.nameEn}
                  onChange={e => setNewMethod({ ...newMethod, nameEn: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  dir="ltr"
                />
                <input
                  type="number"
                  placeholder="أيام التوصيل"
                  value={newMethod.deliveryDays}
                  onChange={e => setNewMethod({ ...newMethod, deliveryDays: parseInt(e.target.value) || 7 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="number"
                  placeholder="السعر الأساسي (ريال)"
                  value={newMethod.baseRate}
                  onChange={e => setNewMethod({ ...newMethod, baseRate: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  type="number"
                  placeholder="سعر الكيلو (ريال)"
                  value={newMethod.perKgRate}
                  onChange={e => setNewMethod({ ...newMethod, perKgRate: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  type="number"
                  placeholder="الحد الأدنى (ريال)"
                  value={newMethod.minCharge}
                  onChange={e => setNewMethod({ ...newMethod, minCharge: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                />
                <button
                  onClick={handleAddMethod}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                >
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {shippingMethods.map(method => (
              <div key={method.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{method.code} - {method.name}</p>
                    <p className="text-sm text-slate-500">{method.nameEn} | {method.deliveryDays} أيام</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-slate-800">{method.baseRate} ر.س</p>
                    <p className="text-xs text-slate-500">أساسي</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-800">{method.perKgRate} ر.س</p>
                    <p className="text-xs text-slate-500">للكيلو</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-800">{method.minCharge} ر.س</p>
                    <p className="text-xs text-slate-500">حد أدنى</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = shippingMethods.filter(m => m.id !== method.id);
                      setShippingMethods(updated);
                      saveToStorage(STORAGE_KEYS.shippingMethods, updated);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Shipping Zones Tab
  const ShippingZonesTab = () => {
    const [newZone, setNewZone] = useState<Partial<ShippingZone>>({ code: '', name: '', nameAr: '', countries: [], extraRatePerKg: 0 });
    const [showZoneForm, setShowZoneForm] = useState(false);

    const handleAddZone = () => {
      if (!newZone.code || !newZone.name) {
        addToast('يرجى إدخال الكود والاسم', 'error');
        return;
      }
      const zone: ShippingZone = {
        id: generateId(),
        code: newZone.code!.toUpperCase(),
        name: newZone.name!,
        nameAr: newZone.nameAr,
        countries: newZone.countries || [],
        extraRatePerKg: Number(newZone.extraRatePerKg) || 0,
        isActive: true,
        sortOrder: shippingZones.length + 1,
        createdAt: new Date().toISOString(),
      };
      const updated = [...shippingZones, zone];
      setShippingZones(updated);
      saveToStorage(STORAGE_KEYS.shippingZones, updated);
      setNewZone({ code: '', name: '', nameAr: '', countries: [], extraRatePerKg: 0 });
      setShowZoneForm(false);
      addToast('تمت إضافة منطقة الشحن بنجاح', 'success');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <MapPin size={20} className="text-[#C8A04F]" />
              مناطق الشحن
            </h3>
            <button
              onClick={() => setShowZoneForm(!showZoneForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
              data-testid="button-add-shipping-zone"
            >
              <Plus size={16} /> إضافة منطقة
            </button>
          </div>

          {showZoneForm && (
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  placeholder="الكود (GCC)"
                  value={newZone.code}
                  onChange={e => setNewZone({ ...newZone, code: e.target.value.toUpperCase() })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  maxLength={5}
                />
                <input
                  placeholder="اسم المنطقة"
                  value={newZone.nameAr}
                  onChange={e => setNewZone({ ...newZone, nameAr: e.target.value, name: e.target.value })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                />
                <input
                  placeholder="الدول (SA,AE,KW)"
                  value={(newZone.countries || []).join(',')}
                  onChange={e => setNewZone({ ...newZone, countries: e.target.value.split(',').map(c => c.trim().toUpperCase()) })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                  dir="ltr"
                />
                <input
                  type="number"
                  placeholder="رسوم إضافية/كيلو"
                  value={newZone.extraRatePerKg}
                  onChange={e => setNewZone({ ...newZone, extraRatePerKg: parseFloat(e.target.value) || 0 })}
                  className="p-3 rounded-lg border border-slate-300 text-sm"
                />
                <button
                  onClick={handleAddZone}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                >
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {shippingZones.map(zone => (
              <div key={zone.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm">
                    {zone.code}
                  </span>
                  <button
                    onClick={() => {
                      const updated = shippingZones.filter(z => z.id !== zone.id);
                      setShippingZones(updated);
                      saveToStorage(STORAGE_KEYS.shippingZones, updated);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="font-bold text-slate-800">{zone.name}</p>
                <p className="text-sm text-slate-500 mt-1">
                  رسوم إضافية: {zone.extraRatePerKg} ر.س/كيلو
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {zone.countries.map(country => (
                    <span key={country} className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Roles Tab
  const RolesTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Shield size={20} className="text-[#C8A04F]" />
              الأدوار والصلاحيات
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {roles.map(role => (
              <div key={role.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                    role.code === 'SUPER_ADMIN' ? 'bg-purple-600' :
                    role.code === 'ADMIN' ? 'bg-blue-600' :
                    role.code === 'MANAGER' ? 'bg-emerald-600' :
                    role.code === 'SUPPLIER' ? 'bg-orange-600' :
                    role.code === 'TRADER' ? 'bg-amber-600' :
                    role.code === 'CUSTOMER' ? 'bg-slate-600' : 'bg-gray-400'
                  }`}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{role.name}</p>
                    <p className="text-sm text-slate-500">{role.nameEn}</p>
                    {role.description && <p className="text-xs text-slate-400 mt-1">{role.description}</p>}
                  </div>
                  {role.isSystem && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                      نظامي
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-mono rounded">
                    {role.code}
                  </span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={role.isActive}
                      onChange={e => {
                        const updated = roles.map(r => r.id === role.id ? { ...r, isActive: e.target.checked } : r);
                        setRoles(updated);
                        saveToStorage(STORAGE_KEYS.roles, updated);
                      }}
                      className="w-4 h-4"
                      disabled={role.isSystem}
                    />
                    <span className="text-sm text-slate-600">نشط</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-amber-800">ملاحظة</p>
              <p className="text-sm text-amber-700">
                الأدوار النظامية لا يمكن تعديلها أو حذفها. لإضافة صلاحيات مخصصة، يرجى التواصل مع فريق الدعم التقني.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-[#C8A04F]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Globe className="text-[#C8A04F]" size={28} />
            محرك التسعير الدولي
          </h1>
          <p className="text-slate-500 mt-1">إدارة العملات، الموردين، الجودة، والشحن</p>
        </div>
        <button
          onClick={saveAllData}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg"
          data-testid="button-save-all"
        >
          <Save size={18} /> حفظ جميع التغييرات
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="CURRENCIES" icon={<DollarSign size={18} />} label="العملات" />
        <TabButton id="EXCHANGE_RATES" icon={<Percent size={18} />} label="أسعار الصرف" />
        <TabButton id="SUPPLIER_GROUPS" icon={<Building2 size={18} />} label="مجموعات الموردين" />
        <TabButton id="QUALITY_CODES" icon={<Award size={18} />} label="أكواد الجودة" />
        <TabButton id="BRAND_CODES" icon={<Tag size={18} />} label="العلامات التجارية" />
        <TabButton id="SHIPPING_METHODS" icon={<Truck size={18} />} label="طرق الشحن" />
        <TabButton id="SHIPPING_ZONES" icon={<MapPin size={18} />} label="مناطق الشحن" />
        <TabButton id="ROLES" icon={<Shield size={18} />} label="الأدوار" />
      </div>

      {/* Tab Content */}
      {activeTab === 'CURRENCIES' && <CurrenciesTab />}
      {activeTab === 'EXCHANGE_RATES' && <ExchangeRatesTab />}
      {activeTab === 'SUPPLIER_GROUPS' && <SupplierGroupsTab />}
      {activeTab === 'QUALITY_CODES' && <QualityCodesTab />}
      {activeTab === 'BRAND_CODES' && <BrandCodesTab />}
      {activeTab === 'SHIPPING_METHODS' && <ShippingMethodsTab />}
      {activeTab === 'SHIPPING_ZONES' && <ShippingZonesTab />}
      {activeTab === 'ROLES' && <RolesTab />}
    </div>
  );
};

export default AdminInternationalPricingPage;
