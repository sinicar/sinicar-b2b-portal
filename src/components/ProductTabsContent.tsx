import React from 'react';
import {
    Database, Palette, AlertCircle, Truck, Globe2, Upload, Plus, Edit2
} from 'lucide-react';
import { Product } from '../types';

interface ProductTabsContentProps {
    activeTab: string;
    products: Product[];
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductTabsContent: React.FC<ProductTabsContentProps> = ({
    activeTab,
    products,
    onFileSelect
}) => {
    // Ensure products is always an array
    const safeProducts = Array.isArray(products) ? products : [];

    // =====================================================
    // ALL HOOKS MUST BE AT THE TOP - NOT INSIDE CONDITIONS
    // =====================================================

    // Quality Settings State
    const QUALITY_STORAGE_KEY = 'sinicar_quality_codes';
    const DEFAULT_CODES = [
        { id: '1', code: 'OEM', label: 'أصلي وكالة', labelAr: 'أصلي وكالة', labelEn: 'Original Equipment', description: 'قطع أصلية من المصنع الأصلي', defaultMarginAdjust: 5, isActive: true, sortOrder: 1 },
        { id: '2', code: 'OES', label: 'أصلي مصنع', labelAr: 'أصلي مصنع', labelEn: 'OES Quality', description: 'نفس جودة الأصلي من مصنع معتمد', defaultMarginAdjust: 3, isActive: true, sortOrder: 2 },
        { id: '3', code: 'AFT', label: 'بديل ممتاز', labelAr: 'بديل ممتاز', labelEn: 'Aftermarket Premium', description: 'بديل عالي الجودة', defaultMarginAdjust: 0, isActive: true, sortOrder: 3 },
        { id: '4', code: 'CPY', label: 'تجاري', labelAr: 'تجاري', labelEn: 'Commercial Copy', description: 'نسخة تجارية اقتصادية', defaultMarginAdjust: -3, isActive: true, sortOrder: 4 },
    ];
    
    const [qualityCodes, setQualityCodes] = React.useState<{
        id: string;
        code: string;
        label: string;
        labelAr?: string;
        labelEn?: string;
        description?: string;
        defaultMarginAdjust?: number;
        isActive: boolean;
        sortOrder: number;
    }[]>(DEFAULT_CODES);
    
    const [newCode, setNewCode] = React.useState({ code: '', labelAr: '', labelEn: '', description: '' });
    const [showAddForm, setShowAddForm] = React.useState(false);

    // Name Priority State
    const PRIORITY_STORAGE_KEY = 'sinicar_name_priorities';
    const [namePriorities, setNamePriorities] = React.useState<{
        partNumber: string;
        prioritySource: 'SINI_CAR' | string;
        productNames: { source: string; name: string; isActive: boolean }[];
    }[]>([]);

    // Load quality codes from localStorage
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem(QUALITY_STORAGE_KEY);
            if (stored) setQualityCodes(JSON.parse(stored));
        } catch {
            // Use defaults
        }
    }, []);

    // Load name priorities from localStorage
    React.useEffect(() => {
        try {
            const stored = localStorage.getItem(PRIORITY_STORAGE_KEY);
            if (stored) setNamePriorities(JSON.parse(stored));
        } catch {
            // Use empty
        }
    }, []);

    // Find duplicate part numbers in products
    const duplicates = React.useMemo(() => {
        const partMap = new Map<string, { source: string; name: string; image?: string }[]>();
        safeProducts.forEach(p => {
            const existing = partMap.get(p.partNumber) || [];
            existing.push({
                source: (p as any).supplierId || 'SINI_CAR',
                name: p.name,
                image: p.imageUrl || (p as any).image
            });
            partMap.set(p.partNumber, existing);
        });
        return Array.from(partMap.entries())
            .filter(([_, arr]) => arr.length > 1)
            .map(([pn, arr]) => ({ partNumber: pn, sources: arr }));
    }, [safeProducts]);

    // Helper functions for quality codes
    const saveQualityCodes = (codes: typeof qualityCodes) => {
        localStorage.setItem(QUALITY_STORAGE_KEY, JSON.stringify(codes));
        setQualityCodes(codes);
    };

    const handleAddCode = () => {
        if (!newCode.code || !newCode.labelAr) return;
        const code = {
            id: `${Date.now()}`,
            code: newCode.code.toUpperCase(),
            label: newCode.labelAr,
            labelAr: newCode.labelAr,
            labelEn: newCode.labelEn,
            description: newCode.description,
            defaultMarginAdjust: 0,
            isActive: true,
            sortOrder: qualityCodes.length + 1,
        };
        saveQualityCodes([...qualityCodes, code]);
        setNewCode({ code: '', labelAr: '', labelEn: '', description: '' });
        setShowAddForm(false);
    };

    const handleToggleActive = (id: string) => {
        const updated = qualityCodes.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
        saveQualityCodes(updated);
    };

    const handleDeleteCode = (id: string) => {
        saveQualityCodes(qualityCodes.filter(c => c.id !== id));
    };

    // Helper functions for name priorities
    const setPriority = (partNumber: string, source: string) => {
        const updated = [...namePriorities];
        const idx = updated.findIndex(p => p.partNumber === partNumber);
        if (idx >= 0) {
            updated[idx].prioritySource = source;
        } else {
            updated.push({
                partNumber,
                prioritySource: source,
                productNames: []
            });
        }
        setNamePriorities(updated);
        localStorage.setItem(PRIORITY_STORAGE_KEY, JSON.stringify(updated));
    };

    const getPriority = (partNumber: string): string => {
        return namePriorities.find(p => p.partNumber === partNumber)?.prioritySource || 'SINI_CAR';
    };

    // =====================================================
    // RENDER LOGIC - CONDITIONS CAN BE USED HERE
    // =====================================================

    // Items Database Tab
    if (activeTab === 'ITEMS_DATABASE') {
        return (
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">قاعدة الأصناف الرئيسية</h3>
                            <p className="text-sm text-slate-500">جميع الأصناف المسجلة في النظام ({safeProducts.length} صنف)</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-colors">
                            <Upload size={18} />
                            رفع ملف أصناف
                            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFileSelect} />
                        </label>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-indigo-100">
                        <p className="text-2xl font-black text-indigo-600">{safeProducts.length}</p>
                        <p className="text-xs text-slate-500 font-bold">إجمالي الأصناف</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-green-100">
                        <p className="text-2xl font-black text-green-600">{safeProducts.filter(p => (p.stock || 0) > 0).length}</p>
                        <p className="text-xs text-slate-500 font-bold">متوفر</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-amber-100">
                        <p className="text-2xl font-black text-amber-600">{safeProducts.filter(p => (p.stock || 0) === 0).length}</p>
                        <p className="text-xs text-slate-500 font-bold">غير متوفر</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-100">
                        <p className="text-2xl font-black text-slate-600">{new Set(safeProducts.map(p => p.brand)).size}</p>
                        <p className="text-xs text-slate-500 font-bold">ماركات</p>
                    </div>
                </div>

                <p className="text-xs text-indigo-600 bg-indigo-100 px-3 py-2 rounded-lg">
                    💡 هذه قاعدة بيانات شاملة لجميع الأصناف. يمكنك رفع ملف Excel يحتوي على رقم الصنف واسمه وسعره لإضافتها للقاعدة.
                </p>
            </div>
        );
    }

    // Quality Settings Tab - Using hooks from top level
    if (activeTab === 'QUALITY_SETTINGS') {
        return (
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">إعدادات رموز الجودة</h3>
                            <p className="text-sm text-slate-500">تحديد أكواد الجودة المستخدمة في ملفات Excel ({qualityCodes.length} رمز)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm transition-colors"
                    >
                        <Plus size={18} />
                        إضافة رمز جودة
                    </button>
                </div>

                {showAddForm && (
                    <div className="mb-6 p-4 bg-white rounded-xl border border-amber-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                            <input
                                placeholder="الكود (مثال: OEM)"
                                value={newCode.code}
                                onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                                className="p-3 rounded-lg border border-slate-300 text-sm"
                                maxLength={5}
                            />
                            <input
                                placeholder="التسمية بالعربي"
                                value={newCode.labelAr}
                                onChange={e => setNewCode({ ...newCode, labelAr: e.target.value })}
                                className="p-3 rounded-lg border border-slate-300 text-sm"
                            />
                            <input
                                placeholder="Label in English"
                                value={newCode.labelEn}
                                onChange={e => setNewCode({ ...newCode, labelEn: e.target.value })}
                                className="p-3 rounded-lg border border-slate-300 text-sm"
                                dir="ltr"
                            />
                            <input
                                placeholder="الوصف"
                                value={newCode.description}
                                onChange={e => setNewCode({ ...newCode, description: e.target.value })}
                                className="p-3 rounded-lg border border-slate-300 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleAddCode} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm">حفظ</button>
                            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm">إلغاء</button>
                        </div>
                    </div>
                )}

                {/* Quality Codes List */}
                <div className="space-y-3">
                    {qualityCodes.map(quality => (
                        <div key={quality.id} className={`flex items-center justify-between p-4 bg-white rounded-xl border ${quality.isActive ? 'border-amber-100' : 'border-slate-200 opacity-60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${(quality.defaultMarginAdjust || 0) > 0 ? 'bg-emerald-500' :
                                    (quality.defaultMarginAdjust || 0) < 0 ? 'bg-orange-500' : 'bg-slate-500'
                                    }`}>
                                    {quality.code}
                                </div>
                                <div>
                                    <span className="font-bold text-slate-800">{quality.label}</span>
                                    <span className="text-xs text-slate-400 mr-2">({quality.code})</span>
                                    {quality.labelEn && <p className="text-sm text-slate-500">{quality.labelEn}</p>}
                                    {quality.description && <p className="text-xs text-slate-400">{quality.description}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">أولوية: {quality.sortOrder}</span>
                                <button
                                    onClick={() => handleToggleActive(quality.id)}
                                    className={`p-2 rounded-lg ${quality.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                    {quality.isActive ? '✓ نشط' : '✗ معطل'}
                                </button>
                                <button
                                    onClick={() => handleDeleteCode(quality.id)}
                                    className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                >
                                    <AlertCircle size={16} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-4 text-xs text-amber-600 bg-amber-100 px-3 py-2 rounded-lg">
                    💡 رموز الجودة تُستخدم في ملفات Excel لتحديد نوع القطعة (أصلي، بديل، تجاري...)
                </p>
            </div>
        );
    }

    // Unmatched Tab
    if (activeTab === 'UNMATCHED') {
        return (
            <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">أصناف غير متطابقة</h3>
                        <p className="text-sm text-slate-500">الأصناف التي بها رموز جودة غير معروفة</p>
                    </div>
                </div>

                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-red-200">
                    <AlertCircle size={48} className="mx-auto text-red-200 mb-4" />
                    <p className="text-slate-500 font-bold">لا توجد أصناف غير متطابقة حالياً</p>
                    <p className="text-sm text-slate-400 mt-1">الأصناف ذات رموز الجودة غير المعروفة ستظهر هنا</p>
                </div>
            </div>
        );
    }

    // Local Supplier Tab
    if (activeTab === 'LOCAL_SUPPLIER') {
        return (
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">منتجات الموردين المحليين</h3>
                            <p className="text-sm text-slate-500">رفع وإدارة منتجات الموردين داخل المملكة</p>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-colors">
                        <Upload size={18} />
                        رفع ملف Excel
                        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileSelect} />
                    </label>
                </div>
                <p className="text-xs text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                    📦 قم برفع ملف Excel يحتوي على: رقم الصنف، اسم الصنف، رمز الجودة، الكمية، السعر
                </p>
            </div>
        );
    }

    // International Supplier Tab
    if (activeTab === 'INTERNATIONAL_SUPPLIER') {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Globe2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">منتجات الموردين الدوليين</h3>
                            <p className="text-sm text-slate-500">رفع منتجات الموردين الخارجيين مع تحويل العملة</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select className="px-3 py-2 border border-purple-200 rounded-lg text-sm font-bold">
                            <option value="USD">🇺🇸 دولار أمريكي</option>
                            <option value="EUR">🇪🇺 يورو</option>
                            <option value="CNY">🇨🇳 يوان صيني</option>
                            <option value="AED">🇦🇪 درهم إماراتي</option>
                        </select>
                        <label className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-colors">
                            <Upload size={18} />
                            رفع ملف Excel
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileSelect} />
                        </label>
                    </div>
                </div>
                <p className="text-xs text-purple-600 bg-purple-100 px-3 py-2 rounded-lg">
                    🌍 سيتم تحويل الأسعار تلقائياً للريال السعودي وترجمة أسماء المنتجات
                </p>
            </div>
        );
    }

    // Name Priority Tab - Using hooks from top level
    if (activeTab === 'NAME_PRIORITY') {
        return (
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">مركز أولوية الأسماء</h3>
                            <p className="text-sm text-slate-500">إدارة الأسماء للأصناف المتكررة من موردين مختلفين</p>
                        </div>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-bold text-sm">
                        {duplicates.length} صنف متكرر
                    </span>
                </div>

                {duplicates.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-bold">لا توجد أصناف متكررة حالياً</p>
                        <p className="text-sm">عند وجود نفس رقم الصنف من موردين مختلفين، ستظهر هنا</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {duplicates.slice(0, 50).map(dup => {
                            const currentPriority = getPriority(dup.partNumber);
                            return (
                                <div key={dup.partNumber} className="bg-white rounded-xl border border-orange-100 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                                            {dup.partNumber}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {dup.sources.length} مصادر
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {dup.sources.map((src, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setPriority(dup.partNumber, src.source)}
                                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${currentPriority === src.source
                                                        ? 'bg-orange-100 border-2 border-orange-400'
                                                        : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${src.source === 'SINI_CAR' ? 'bg-brand-600' : 'bg-blue-500'
                                                        }`}></div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-700">{src.name}</p>
                                                        <p className="text-xs text-slate-400">
                                                            {src.source === 'SINI_CAR' ? 'صيني كار' : `مورد: ${src.source}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                {currentPriority === src.source && (
                                                    <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded">
                                                        ⭐ الأولوية
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-xs text-orange-600 bg-orange-100 px-3 py-2 rounded-lg mt-4">
                    💡 انقر على أي اسم لجعله الاسم المعروض للعميل. صيني كار لها الأولوية افتراضياً.
                </p>
            </div>
        );
    }

    // OUR_PRODUCTS - return null, will show the main products table
    return null;
};
