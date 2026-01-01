import { useState, useEffect, useMemo, useCallback, FC, ReactNode, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Api from '../services/api';
import { simulatePriceCalculation, invalidatePricingCache } from '../services/pricingEngine';
import {
    ConfigurablePriceLevel,
    ProductPriceEntry,
    CustomerPricingProfile,
    GlobalPricingSettings,
    PriceCalculationResult,
    PricePrecedenceOption,
    CustomerCustomPriceRule,
    Product,
    User,
    BusinessProfile
} from '../types';
import { useToast } from '../services/ToastContext';
import {
    Layers, DollarSign, Users, Settings, Plus, Trash2, Edit2, Save, X, Copy,
    ChevronUp, ChevronDown, Calculator, RefreshCw, Download, Upload, Search,
    Check, AlertCircle, Info, Percent, Tag, Clock, ArrowRight, FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';

type TabType = 'LEVELS' | 'MATRIX' | 'CUSTOMERS' | 'SETTINGS';

interface AdminPricingCenterProps {
    onRefresh?: () => void;
}

export const AdminPricingCenter: FC<AdminPricingCenterProps> = ({ onRefresh }) => {
    const { t, i18n } = useTranslation();
    const { addToast } = useToast();
    const isRtl = i18n.dir() === 'rtl';

    const [activeTab, setActiveTab] = useState<TabType>('LEVELS');
    const [isLoading, setIsLoading] = useState(true);

    // Data states
    const [levels, setLevels] = useState<ConfigurablePriceLevel[]>([]);
    const [matrix, setMatrix] = useState<ProductPriceEntry[]>([]);
    const [profiles, setProfiles] = useState<CustomerPricingProfile[]>([]);
    const [settings, setSettings] = useState<GlobalPricingSettings | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Array<{ user: User; profile: BusinessProfile }>>([]);

    // Load all data
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Use individual try-catch for each to prevent total failure
            let fetchedLevels: ConfigurablePriceLevel[] = [];
            let fetchedMatrix: ProductPriceEntry[] = [];
            let fetchedProfiles: CustomerPricingProfile[] = [];
            let fetchedSettings: GlobalPricingSettings | null = null;
            let fetchedProducts: Product[] = [];
            let fetchedCustomers: Array<{ user: User; profile: BusinessProfile }> = [];

            // Load each data source individually
            try { fetchedLevels = (await Api.getPriceLevels()) || []; } 
            catch (e) { console.warn('Failed to load price levels:', e); }

            try { fetchedMatrix = (await Api.getProductPriceMatrix()) || []; } 
            catch (e) { console.warn('Failed to load price matrix:', e); }

            try { fetchedProfiles = (await Api.getAllCustomerPricingProfiles()) || []; } 
            catch (e) { console.warn('Failed to load customer profiles:', e); }

            try { 
                fetchedSettings = await Api.getGlobalPricingSettings();
                // Keep null as fallback - the type requires specific fields
            } catch (e) { 
                console.warn('Failed to load pricing settings:', e);
                // fetchedSettings remains null
            }

            try { fetchedProducts = (await Api.searchProducts('')) || []; } 
            catch (e) { console.warn('Failed to load products:', e); }

            try { fetchedCustomers = (await Api.getAllUsers()) || []; } 
            catch (e) { console.warn('Failed to load customers:', e); }

            setLevels(Array.isArray(fetchedLevels) ? fetchedLevels : []);
            setMatrix(Array.isArray(fetchedMatrix) ? fetchedMatrix : []);
            setProfiles(Array.isArray(fetchedProfiles) ? fetchedProfiles : []);
            setSettings(fetchedSettings);
            setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
            setCustomers(Array.isArray(fetchedCustomers) ? fetchedCustomers : []);
        } catch (error) {
            console.error('Error loading pricing data:', error);
            addToast('خطأ في تحميل بيانات التسعير', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = () => {
        invalidatePricingCache();
        loadData();
        onRefresh?.();
    };

    const tabs = [
        { id: 'LEVELS' as TabType, label: 'مستويات التسعير', icon: <Layers size={18} /> },
        { id: 'MATRIX' as TabType, label: 'مصفوفة الأسعار', icon: <DollarSign size={18} /> },
        { id: 'CUSTOMERS' as TabType, label: 'تسعير العملاء', icon: <Users size={18} /> },
        { id: 'SETTINGS' as TabType, label: 'الإعدادات والمحاكاة', icon: <Settings size={18} /> }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C8A04F] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">مركز التسعيرات</h2>
                    <p className="text-sm text-slate-500 mt-1">إدارة مستويات الأسعار ومصفوفة التسعير وإعدادات العملاء</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors"
                    data-testid="button-refresh-pricing"
                >
                    <RefreshCw size={16} />
                    تحديث
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="مستويات التسعير"
                    value={levels.filter(l => l.isActive).length}
                    total={levels.length}
                    icon={<Layers />}
                    color="blue"
                />
                <StatCard
                    label="أسعار المنتجات"
                    value={matrix.length}
                    icon={<DollarSign />}
                    color="green"
                />
                <StatCard
                    label="ملفات العملاء"
                    value={profiles.length}
                    icon={<Users />}
                    color="amber"
                />
                <StatCard
                    label="القواعد المخصصة"
                    value={profiles.reduce((acc, p) => acc + (p.customRules?.length || 0), 0)}
                    icon={<Tag />}
                    color="purple"
                />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-[#0B1B3A] text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                            data-testid={`tab-${tab.id.toLowerCase()}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'LEVELS' && (
                        <PriceLevelsTab
                            levels={levels}
                            onUpdate={loadData}
                            addToast={addToast}
                        />
                    )}
                    {activeTab === 'MATRIX' && (
                        <PriceMatrixTab
                            matrix={matrix}
                            levels={levels}
                            products={products}
                            onUpdate={loadData}
                            addToast={addToast}
                        />
                    )}
                    {activeTab === 'CUSTOMERS' && (
                        <CustomerProfilesTab
                            profiles={profiles}
                            levels={levels}
                            customers={customers}
                            products={products}
                            onUpdate={loadData}
                            addToast={addToast}
                        />
                    )}
                    {activeTab === 'SETTINGS' && settings && (
                        <SettingsTab
                            settings={settings}
                            levels={levels}
                            products={products}
                            customers={customers}
                            onUpdate={loadData}
                            addToast={addToast}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: FC<{
    label: string;
    value: number;
    total?: number;
    icon: ReactNode;
    color: 'blue' | 'green' | 'amber' | 'purple';
}> = ({ label, value, total, icon, color }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-emerald-100 text-emerald-600',
        amber: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">
                        {value}
                        {total !== undefined && <span className="text-sm text-slate-400 font-normal">/{total}</span>}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

// ============================================================
// Price Levels Tab
// ============================================================
const PriceLevelsTab: FC<{
    levels: ConfigurablePriceLevel[];
    onUpdate: () => void;
    addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}> = ({ levels, onUpdate, addToast }) => {
    const [editingLevel, setEditingLevel] = useState<ConfigurablePriceLevel | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newLevel, setNewLevel] = useState<Partial<ConfigurablePriceLevel>>({
        code: '',
        name: '',
        description: '',
        isBaseLevel: true,
        isActive: true,
        sortOrder: levels.length + 1
    });

    const handleSaveLevel = async () => {
        if (!newLevel.code || !newLevel.name) {
            addToast('error', 'الرمز والاسم مطلوبان');
            return;
        }

        try {
            await Api.addPriceLevel(newLevel as any);
            addToast('success', 'تمت إضافة المستوى بنجاح');
            setIsAdding(false);
            setNewLevel({
                code: '',
                name: '',
                description: '',
                isBaseLevel: true,
                isActive: true,
                sortOrder: levels.length + 2
            });
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في إضافة المستوى');
        }
    };

    const handleUpdateLevel = async () => {
        if (!editingLevel) return;

        try {
            await Api.updatePriceLevel(editingLevel.id, editingLevel);
            addToast('success', 'تم تحديث المستوى بنجاح');
            setEditingLevel(null);
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في تحديث المستوى');
        }
    };

    const handleDeleteLevel = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستوى؟')) return;

        try {
            await Api.deletePriceLevel(id);
            addToast('success', 'تم حذف المستوى بنجاح');
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في حذف المستوى');
        }
    };

    const handleToggleActive = async (level: ConfigurablePriceLevel) => {
        try {
            await Api.updatePriceLevel(level.id, { isActive: !level.isActive });
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في تحديث الحالة');
        }
    };

    const baseLevels = levels.filter(l => l.isBaseLevel);

    return (
        <div className="space-y-6">
            {/* Add New Level Form */}
            {isAdding ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4">إضافة مستوى جديد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">الرمز *</label>
                            <input
                                type="text"
                                value={newLevel.code || ''}
                                onChange={e => setNewLevel({ ...newLevel, code: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="مثال: L2"
                                data-testid="input-level-code"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">الاسم *</label>
                            <input
                                type="text"
                                value={newLevel.name || ''}
                                onChange={e => setNewLevel({ ...newLevel, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="مثال: مستوى الجملة"
                                data-testid="input-level-name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">الوصف</label>
                            <input
                                type="text"
                                value={newLevel.description || ''}
                                onChange={e => setNewLevel({ ...newLevel, description: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="وصف اختياري"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={newLevel.isBaseLevel}
                                onChange={e => setNewLevel({ ...newLevel, isBaseLevel: e.target.checked })}
                                className="rounded"
                            />
                            <span className="text-sm text-slate-600">مستوى أساسي</span>
                        </label>
                    </div>

                    {!newLevel.isBaseLevel && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-50 p-4 rounded-lg">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">المستوى الأساس</label>
                                <select
                                    value={newLevel.baseLevelId || ''}
                                    onChange={e => setNewLevel({ ...newLevel, baseLevelId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="">اختر المستوى</option>
                                    {baseLevels.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">نوع التعديل</label>
                                <select
                                    value={newLevel.adjustmentType || ''}
                                    onChange={e => setNewLevel({ ...newLevel, adjustmentType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="">اختر النوع</option>
                                    <option value="PERCENT">نسبة مئوية %</option>
                                    <option value="FIXED">مبلغ ثابت</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">القيمة</label>
                                <input
                                    type="number"
                                    value={newLevel.adjustmentValue || ''}
                                    onChange={e => setNewLevel({ ...newLevel, adjustmentValue: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    placeholder="مثال: 10"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={handleSaveLevel}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                            data-testid="button-save-level"
                        >
                            <Save size={16} /> حفظ
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-xl text-sm font-bold hover:bg-[#1a2e56] transition-colors"
                    data-testid="button-add-level"
                >
                    <Plus size={16} /> إضافة مستوى جديد
                </button>
            )}

            {/* Levels Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">الترتيب</th>
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">الرمز</th>
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">الاسم</th>
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">النوع</th>
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">التعديل</th>
                            <th className="text-center px-4 py-3 text-sm font-bold text-slate-600">الحالة</th>
                            <th className="text-center px-4 py-3 text-sm font-bold text-slate-600">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.sort((a, b) => a.sortOrder - b.sortOrder).map((level, index) => (
                            <tr key={level.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="px-4 py-3">
                                    <span className="text-slate-400 text-sm">{index + 1}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-slate-200 rounded text-sm font-mono">{level.code}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="font-bold text-slate-800">{level.name}</span>
                                    {level.description && (
                                        <p className="text-xs text-slate-500">{level.description}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {level.isBaseLevel ? (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">أساسي</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">مشتق</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {!level.isBaseLevel && level.adjustmentType && (
                                        <span className="text-sm text-slate-600">
                                            {level.adjustmentType === 'PERCENT' ? `${level.adjustmentValue}%` : `${level.adjustmentValue} ر.س`}
                                            {' '}من{' '}
                                            <span className="font-bold">{levels.find(l => l.id === level.baseLevelId)?.name || '-'}</span>
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleToggleActive(level)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            level.isActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {level.isActive ? 'نشط' : 'معطل'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setEditingLevel(level)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                                            title="تعديل"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLevel(level.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                                            title="حذف"
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

            {/* Edit Modal */}
            {editingLevel && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">تعديل المستوى</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الرمز</label>
                                <input
                                    type="text"
                                    value={editingLevel.code}
                                    onChange={e => setEditingLevel({ ...editingLevel, code: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الاسم</label>
                                <input
                                    type="text"
                                    value={editingLevel.name}
                                    onChange={e => setEditingLevel({ ...editingLevel, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">الوصف</label>
                                <input
                                    type="text"
                                    value={editingLevel.description || ''}
                                    onChange={e => setEditingLevel({ ...editingLevel, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleUpdateLevel}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                            >
                                حفظ التغييرات
                            </button>
                            <button
                                onClick={() => setEditingLevel(null)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// Price Matrix Tab
// ============================================================
const PriceMatrixTab: FC<{
    matrix: ProductPriceEntry[];
    levels: ConfigurablePriceLevel[];
    products: Product[];
    onUpdate: () => void;
    addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}> = ({ matrix, levels, products, onUpdate, addToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);
    const [newEntry, setNewEntry] = useState<Partial<ProductPriceEntry>>({
        productId: '',
        priceLevelId: '',
        price: 0
    });
    const [editingEntry, setEditingEntry] = useState<ProductPriceEntry | null>(null);

    const filteredMatrix = useMemo(() => {
        return matrix.filter(entry => {
            const product = products.find(p => p.id === entry.productId);
            const matchesSearch = !searchTerm || 
                product?.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = !filterLevel || entry.priceLevelId === filterLevel;
            return matchesSearch && matchesLevel;
        });
    }, [matrix, products, searchTerm, filterLevel]);

    const handleAddEntry = async () => {
        if (!newEntry.productId || !newEntry.priceLevelId || !newEntry.price) {
            addToast('error', 'جميع الحقول مطلوبة');
            return;
        }

        try {
            await Api.addProductPriceEntry(newEntry as any);
            addToast('success', 'تمت إضافة السعر بنجاح');
            setIsAdding(false);
            setNewEntry({ productId: '', priceLevelId: '', price: 0 });
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في إضافة السعر');
        }
    };

    const handleUpdateEntry = async () => {
        if (!editingEntry) return;

        try {
            await Api.updateProductPriceEntry(editingEntry.id, editingEntry);
            addToast('success', 'تم تحديث السعر بنجاح');
            setEditingEntry(null);
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في تحديث السعر');
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا السعر؟')) return;

        try {
            await Api.deleteProductPriceEntry(id);
            addToast('success', 'تم حذف السعر بنجاح');
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في حذف السعر');
        }
    };

    const handleExport = () => {
        const exportData = matrix.map(entry => {
            const product = products.find(p => p.id === entry.productId);
            const level = levels.find(l => l.id === entry.priceLevelId);
            return {
                'رقم القطعة': product?.partNumber || '',
                'اسم المنتج': product?.name || '',
                'المستوى': level?.name || '',
                'السعر': entry.price
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Price Matrix');
        XLSX.writeFile(wb, 'price_matrix.xlsx');
        addToast('success', 'تم تصدير مصفوفة الأسعار');
    };

    const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const entries: Array<{ productId: string; priceLevelId: string; price: number }> = [];
                
                for (const row of jsonData as any[]) {
                    const partNumber = row['رقم القطعة'] || row['partNumber'];
                    const levelName = row['المستوى'] || row['level'];
                    const price = parseFloat(row['السعر'] || row['price']);

                    const product = products.find(p => p.partNumber === partNumber);
                    const level = levels.find(l => l.name === levelName || l.code === levelName);

                    if (product && level && !isNaN(price)) {
                        entries.push({
                            productId: product.id,
                            priceLevelId: level.id,
                            price
                        });
                    }
                }

                if (entries.length > 0) {
                    const result = await Api.bulkImportPriceMatrix(entries);
                    addToast('success', `تم استيراد ${result.imported} سعر جديد وتحديث ${result.updated} سعر`);
                    if (result.errors.length > 0) {
                        console.error('Import errors:', result.errors);
                    }
                    invalidatePricingCache();
                    onUpdate();
                } else {
                    addToast('warning', 'لم يتم العثور على بيانات صالحة للاستيراد');
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            addToast('error', 'خطأ في استيراد الملف');
        }

        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="بحث برقم القطعة أو الاسم..."
                            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg text-sm"
                            data-testid="input-search-matrix"
                        />
                    </div>
                    <select
                        value={filterLevel}
                        onChange={e => setFilterLevel(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                        <option value="">جميع المستويات</option>
                        {levels.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0B1B3A] text-white rounded-lg text-sm font-bold hover:bg-[#1a2e56]"
                        data-testid="button-add-price"
                    >
                        <Plus size={16} /> إضافة سعر
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                    >
                        <Download size={16} /> تصدير
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 cursor-pointer">
                        <Upload size={16} /> استيراد
                        <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Add Entry Form */}
            {isAdding && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4">إضافة سعر جديد</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">المنتج *</label>
                            <select
                                value={newEntry.productId || ''}
                                onChange={e => setNewEntry({ ...newEntry, productId: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                data-testid="select-product"
                            >
                                <option value="">اختر المنتج</option>
                                {products.slice(0, 100).map(p => (
                                    <option key={p.id} value={p.id}>{p.partNumber} - {p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">المستوى *</label>
                            <select
                                value={newEntry.priceLevelId || ''}
                                onChange={e => setNewEntry({ ...newEntry, priceLevelId: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                data-testid="select-level"
                            >
                                <option value="">اختر المستوى</option>
                                {levels.filter(l => l.isActive).map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">السعر *</label>
                            <input
                                type="number"
                                value={newEntry.price || ''}
                                onChange={e => setNewEntry({ ...newEntry, price: parseFloat(e.target.value) })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                placeholder="0.00"
                                data-testid="input-price"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={handleAddEntry}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                            data-testid="button-save-price"
                        >
                            <Save size={16} /> حفظ
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {/* Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">رقم القطعة</th>
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">اسم المنتج</th>
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">المستوى</th>
                            <th className="text-right px-4 py-3 text-sm font-bold text-slate-600">السعر</th>
                            <th className="text-center px-4 py-3 text-sm font-bold text-slate-600">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMatrix.slice(0, 50).map(entry => {
                            const product = products.find(p => p.id === entry.productId);
                            const level = levels.find(l => l.id === entry.priceLevelId);
                            return (
                                <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-sm">{product?.partNumber || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-slate-700">{product?.name || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-slate-200 rounded text-sm">{level?.name || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-emerald-600">{entry.price.toFixed(2)} ر.س</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setEditingEntry(entry)}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEntry(entry.id)}
                                                className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredMatrix.length > 50 && (
                    <p className="text-center text-sm text-slate-500 mt-4">
                        عرض 50 من {filteredMatrix.length} سجل
                    </p>
                )}
            </div>

            {/* Edit Modal */}
            {editingEntry && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">تعديل السعر</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">السعر</label>
                                <input
                                    type="number"
                                    value={editingEntry.price}
                                    onChange={e => setEditingEntry({ ...editingEntry, price: parseFloat(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleUpdateEntry}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                            >
                                حفظ التغييرات
                            </button>
                            <button
                                onClick={() => setEditingEntry(null)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// Customer Profiles Tab
// ============================================================
const CustomerProfilesTab: FC<{
    profiles: CustomerPricingProfile[];
    levels: ConfigurablePriceLevel[];
    customers: Array<{ user: User; profile: BusinessProfile }>;
    products: Product[];
    onUpdate: () => void;
    addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}> = ({ profiles, levels, customers, products, onUpdate, addToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
    const [editingProfile, setEditingProfile] = useState<CustomerPricingProfile | null>(null);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        return customers.filter(c =>
            c.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user.clientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.profile.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const getCustomerProfile = (customerId: string): CustomerPricingProfile | null => {
        return profiles.find(p => p.customerId === customerId) || null;
    };

    const handleSelectCustomer = (customerId: string) => {
        setSelectedCustomer(customerId);
        const existingProfile = getCustomerProfile(customerId);
        if (existingProfile) {
            setEditingProfile(existingProfile);
        } else {
            setEditingProfile({
                customerId,
                defaultPriceLevelId: levels[0]?.id || '',
                allowCustomRules: false,
                customRules: []
            });
        }
    };

    const handleSaveProfile = async () => {
        if (!editingProfile) return;

        try {
            await Api.upsertCustomerPricingProfile(editingProfile);
            addToast('success', 'تم حفظ ملف التسعير بنجاح');
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في حفظ ملف التسعير');
        }
    };

    const handleDeleteProfile = async () => {
        if (!selectedCustomer) return;
        if (!confirm('هل أنت متأكد من حذف ملف التسعير لهذا العميل؟')) return;

        try {
            await Api.deleteCustomerPricingProfile(selectedCustomer);
            addToast('success', 'تم حذف ملف التسعير');
            setSelectedCustomer(null);
            setEditingProfile(null);
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في حذف ملف التسعير');
        }
    };

    const handleAddCustomRule = () => {
        if (!editingProfile) return;
        const newRule: CustomerCustomPriceRule = {
            id: `CR${Date.now()}`,
            useFixedPrice: false,
            usePercentOfLevel: false
        };
        setEditingProfile({
            ...editingProfile,
            customRules: [...(editingProfile.customRules || []), newRule]
        });
    };

    const handleUpdateRule = (ruleId: string, updates: Partial<CustomerCustomPriceRule>) => {
        if (!editingProfile) return;
        setEditingProfile({
            ...editingProfile,
            customRules: (editingProfile.customRules || []).map(r =>
                r.id === ruleId ? { ...r, ...updates } : r
            )
        });
    };

    const handleDeleteRule = (ruleId: string) => {
        if (!editingProfile) return;
        setEditingProfile({
            ...editingProfile,
            customRules: (editingProfile.customRules || []).filter(r => r.id !== ruleId)
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customers List */}
            <div className="lg:col-span-1 bg-slate-50 rounded-xl p-4 max-h-[600px] overflow-y-auto">
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="بحث بالاسم أو رقم العميل..."
                            className="w-full pr-10 pl-4 py-2 border border-slate-300 rounded-lg text-sm"
                            data-testid="input-search-customers"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    {filteredCustomers.map(({ user, profile: businessProfile }) => {
                        const hasPricingProfile = getCustomerProfile(user.id) !== null;
                        return (
                            <button
                                key={user.id}
                                onClick={() => handleSelectCustomer(user.id)}
                                className={`w-full text-right p-3 rounded-lg transition-colors ${
                                    selectedCustomer === user.id
                                        ? 'bg-[#0B1B3A] text-white'
                                        : 'bg-white hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm">{businessProfile.companyName || user.name}</p>
                                        <p className={`text-xs ${selectedCustomer === user.id ? 'text-slate-300' : 'text-slate-500'}`}>
                                            {user.clientId}
                                        </p>
                                    </div>
                                    {hasPricingProfile && (
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            selectedCustomer === user.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            مخصص
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Profile Editor */}
            <div className="lg:col-span-2">
                {editingProfile ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-slate-800">ملف تسعير العميل</h4>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveProfile}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                                    data-testid="button-save-profile"
                                >
                                    <Save size={16} /> حفظ
                                </button>
                                {getCustomerProfile(editingProfile.customerId) && (
                                    <button
                                        onClick={handleDeleteProfile}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                                    >
                                        <Trash2 size={16} /> حذف
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Basic Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">المستوى الافتراضي</label>
                                <select
                                    value={editingProfile.defaultPriceLevelId}
                                    onChange={e => setEditingProfile({ ...editingProfile, defaultPriceLevelId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    data-testid="select-default-level"
                                >
                                    {levels.filter(l => l.isActive).map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">هامش إضافي %</label>
                                    <input
                                        type="number"
                                        value={editingProfile.extraMarkupPercent || ''}
                                        onChange={e => setEditingProfile({ ...editingProfile, extraMarkupPercent: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">خصم إضافي %</label>
                                    <input
                                        type="number"
                                        value={editingProfile.extraDiscountPercent || ''}
                                        onChange={e => setEditingProfile({ ...editingProfile, extraDiscountPercent: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Rules */}
                        <div className="border-t border-slate-200 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editingProfile.allowCustomRules}
                                        onChange={e => setEditingProfile({ ...editingProfile, allowCustomRules: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm font-bold text-slate-700">تفعيل القواعد المخصصة</span>
                                </label>
                                {editingProfile.allowCustomRules && (
                                    <button
                                        onClick={handleAddCustomRule}
                                        className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200"
                                    >
                                        <Plus size={14} /> إضافة قاعدة
                                    </button>
                                )}
                            </div>

                            {editingProfile.allowCustomRules && (editingProfile.customRules?.length || 0) > 0 && (
                                <div className="space-y-4">
                                    {editingProfile.customRules?.map(rule => (
                                        <div key={rule.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-sm font-bold text-slate-700">قاعدة مخصصة</span>
                                                <button
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">المنتج (اختياري)</label>
                                                    <select
                                                        value={rule.productId || ''}
                                                        onChange={e => handleUpdateRule(rule.id, { productId: e.target.value || undefined })}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                    >
                                                        <option value="">جميع المنتجات</option>
                                                        {products.slice(0, 50).map(p => (
                                                            <option key={p.id} value={p.id}>{p.partNumber}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-1">نوع التسعير</label>
                                                    <select
                                                        value={rule.useFixedPrice ? 'FIXED' : rule.usePercentOfLevel ? 'PERCENT' : ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            handleUpdateRule(rule.id, {
                                                                useFixedPrice: val === 'FIXED',
                                                                usePercentOfLevel: val === 'PERCENT'
                                                            });
                                                        }}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                    >
                                                        <option value="">اختر النوع</option>
                                                        <option value="FIXED">سعر ثابت</option>
                                                        <option value="PERCENT">نسبة من مستوى</option>
                                                    </select>
                                                </div>
                                                {rule.useFixedPrice && (
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">السعر الثابت</label>
                                                        <input
                                                            type="number"
                                                            value={rule.fixedPrice || ''}
                                                            onChange={e => handleUpdateRule(rule.id, { fixedPrice: parseFloat(e.target.value) })}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                )}
                                                {rule.usePercentOfLevel && (
                                                    <>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 mb-1">النسبة %</label>
                                                            <input
                                                                type="number"
                                                                value={rule.percentOfLevel || ''}
                                                                onChange={e => handleUpdateRule(rule.id, { percentOfLevel: parseFloat(e.target.value) })}
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 mb-1">من مستوى</label>
                                                            <select
                                                                value={rule.priceLevelIdForPercent || ''}
                                                                onChange={e => handleUpdateRule(rule.id, { priceLevelIdForPercent: e.target.value })}
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                            >
                                                                <option value="">اختر المستوى</option>
                                                                {levels.filter(l => l.isActive).map(l => (
                                                                    <option key={l.id} value={l.id}>{l.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">ملاحظات</label>
                            <textarea
                                value={editingProfile.notes || ''}
                                onChange={e => setEditingProfile({ ...editingProfile, notes: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                rows={3}
                                placeholder="ملاحظات اختيارية..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-xl p-8 text-center">
                        <Users size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500">اختر عميلاً من القائمة لتعديل ملف التسعير</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================
// Settings Tab
// ============================================================
const SettingsTab: FC<{
    settings: GlobalPricingSettings;
    levels: ConfigurablePriceLevel[];
    products: Product[];
    customers: Array<{ user: User; profile: BusinessProfile }>;
    onUpdate: () => void;
    addToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}> = ({ settings: initialSettings, levels, products, customers, onUpdate, addToast }) => {
    const [settings, setSettings] = useState<GlobalPricingSettings>(initialSettings);
    const [simulationProductId, setSimulationProductId] = useState('');
    const [simulationCustomerId, setSimulationCustomerId] = useState('');
    const [simulationResult, setSimulationResult] = useState<PriceCalculationResult | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSaveSettings = async () => {
        try {
            await Api.saveGlobalPricingSettings(settings);
            addToast('success', 'تم حفظ الإعدادات بنجاح');
            invalidatePricingCache();
            onUpdate();
        } catch (error) {
            addToast('error', 'خطأ في حفظ الإعدادات');
        }
    };

    const handleSimulate = async () => {
        if (!simulationProductId) {
            addToast('error', 'يرجى اختيار منتج');
            return;
        }

        setIsSimulating(true);
        try {
            const result = await simulatePriceCalculation(
                simulationProductId,
                simulationCustomerId || null
            );
            setSimulationResult(result);
        } catch (error) {
            addToast('error', 'خطأ في المحاكاة');
        } finally {
            setIsSimulating(false);
        }
    };

    const movePrecedence = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...settings.pricePrecedenceOrder];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newOrder.length) return;
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        setSettings({ ...settings, pricePrecedenceOrder: newOrder });
    };

    const precedenceLabels: Record<PricePrecedenceOption, string> = {
        'CUSTOM_RULE': 'القواعد المخصصة',
        'LEVEL_EXPLICIT': 'السعر الصريح',
        'LEVEL_DERIVED': 'السعر المشتق'
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Settings Form */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">الإعدادات العامة</h4>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">المستوى الافتراضي</label>
                                <select
                                    value={settings.defaultPriceLevelId || ''}
                                    onChange={e => setSettings({ ...settings, defaultPriceLevelId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                    data-testid="select-default-global-level"
                                >
                                    <option value="">بدون</option>
                                    {levels.filter(l => l.isActive).map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">العملة</label>
                                <input
                                    type="text"
                                    value={settings.currency}
                                    onChange={e => setSettings({ ...settings, currency: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">نمط التقريب</label>
                                <select
                                    value={settings.roundingMode}
                                    onChange={e => setSettings({ ...settings, roundingMode: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="NONE">بدون تقريب</option>
                                    <option value="ROUND">تقريب عادي</option>
                                    <option value="CEIL">تقريب للأعلى</option>
                                    <option value="FLOOR">تقريب للأسفل</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">عدد الخانات العشرية</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="4"
                                    value={settings.roundingDecimals}
                                    onChange={e => setSettings({ ...settings, roundingDecimals: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.allowNegativeDiscounts}
                                    onChange={e => setSettings({ ...settings, allowNegativeDiscounts: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm text-slate-700">السماح بالخصومات السالبة</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.allowFallbackToOtherLevels}
                                    onChange={e => setSettings({ ...settings, allowFallbackToOtherLevels: e.target.checked })}
                                    className="rounded"
                                />
                                <span className="text-sm text-slate-700">السماح بالرجوع لمستويات أخرى</span>
                            </label>
                        </div>

                        {settings.allowFallbackToOtherLevels && (
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">المستوى الاحتياطي</label>
                                <select
                                    value={settings.fallbackLevelId || ''}
                                    onChange={e => setSettings({ ...settings, fallbackLevelId: e.target.value || null })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                >
                                    <option value="">تلقائي (أول مستوى أساسي)</option>
                                    {levels.filter(l => l.isActive).map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Precedence Order */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <h5 className="font-bold text-slate-700 mb-3">ترتيب الأولويات</h5>
                        <div className="space-y-2">
                            {settings.pricePrecedenceOrder.map((precedence, index) => (
                                <div key={precedence} className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                                    <span className="w-6 h-6 flex items-center justify-center bg-[#0B1B3A] text-white rounded-full text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 text-sm font-bold text-slate-700">
                                        {precedenceLabels[precedence]}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => movePrecedence(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => movePrecedence(index, 'down')}
                                            disabled={index === settings.pricePrecedenceOrder.length - 1}
                                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSaveSettings}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700"
                        data-testid="button-save-settings"
                    >
                        <Save size={18} /> حفظ الإعدادات
                    </button>
                </div>
            </div>

            {/* Simulation */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Calculator size={20} /> محاكاة التسعير
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">اختبر كيف سيتم حساب السعر لمنتج وعميل معين</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">المنتج *</label>
                            <select
                                value={simulationProductId}
                                onChange={e => setSimulationProductId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                data-testid="select-simulation-product"
                            >
                                <option value="">اختر المنتج</option>
                                {products.slice(0, 100).map(p => (
                                    <option key={p.id} value={p.id}>{p.partNumber} - {p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">العميل (اختياري)</label>
                            <select
                                value={simulationCustomerId}
                                onChange={e => setSimulationCustomerId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                data-testid="select-simulation-customer"
                            >
                                <option value="">زائر (بدون عميل)</option>
                                {customers.map(({ user, profile }) => (
                                    <option key={user.id} value={user.id}>
                                        {profile.companyName || user.name} ({user.clientId})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0B1B3A] text-white rounded-xl text-sm font-bold hover:bg-[#1a2e56] disabled:opacity-50"
                            data-testid="button-simulate"
                        >
                            {isSimulating ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" /> جارٍ الحساب...
                                </>
                            ) : (
                                <>
                                    <Calculator size={18} /> احسب السعر
                                </>
                            )}
                        </button>
                    </div>

                    {/* Simulation Result */}
                    {simulationResult && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h5 className="font-bold text-slate-700 mb-3">نتيجة المحاكاة</h5>
                            
                            <div className={`p-4 rounded-xl mb-4 ${
                                simulationResult.finalPrice !== null
                                    ? 'bg-emerald-50 border border-emerald-200'
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                {simulationResult.finalPrice !== null ? (
                                    <div className="text-center">
                                        <p className="text-sm text-slate-600">السعر النهائي</p>
                                        <p className="text-3xl font-black text-emerald-600" data-testid="text-final-price">
                                            {simulationResult.finalPrice.toFixed(2)} ر.س
                                        </p>
                                        {simulationResult.sourceLevelName && (
                                            <p className="text-sm text-slate-500 mt-1">
                                                المستوى: {simulationResult.sourceLevelName}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                                        <p className="text-red-600 font-bold">لم يتم العثور على سعر</p>
                                    </div>
                                )}
                            </div>

                            {/* Calculation Steps */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h6 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <FileText size={16} /> خطوات الحساب
                                </h6>
                                <div className="space-y-1">
                                    {simulationResult.calculationSteps.map((step, index) => (
                                        <div key={index} className="flex items-start gap-2 text-xs text-slate-600">
                                            <ArrowRight size={12} className="mt-0.5 text-slate-400" />
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {simulationResult.errors && simulationResult.errors.length > 0 && (
                                <div className="mt-4 bg-red-50 rounded-xl p-4">
                                    <h6 className="text-sm font-bold text-red-700 mb-2">أخطاء</h6>
                                    {simulationResult.errors.map((error, index) => (
                                        <p key={index} className="text-xs text-red-600">{error}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPricingCenter;
