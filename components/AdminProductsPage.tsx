import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MockApi } from '../services/mockApi';
import { Product, ExcelColumnPreset, ExcelColumnMapping, INTERNAL_PRODUCT_FIELDS } from '../types';
import { 
    Upload, Download, Search, Package, AlertTriangle, CheckCircle, 
    XCircle, Edit2, Trash2, Plus, RefreshCw, FileSpreadsheet, 
    ChevronLeft, ChevronRight, Filter, Eye, X, Settings, Save, Star, StarOff
} from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { Modal } from './Modal';

interface AdminProductsPageProps {
    onRefresh?: () => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ onRefresh }) => {
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [importing, setImporting] = useState(false);
    
    const [showImportModal, setShowImportModal] = useState(false);
    const [importResult, setImportResult] = useState<{ imported: number; updated: number; skipped: number; errors: string[] } | null>(null);
    
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState<Partial<Product>>({});
    
    // Column Preset State
    const [showColumnModal, setShowColumnModal] = useState(false);
    const [columnPresets, setColumnPresets] = useState<ExcelColumnPreset[]>([]);
    const [editingPreset, setEditingPreset] = useState<ExcelColumnPreset | null>(null);
    const [presetForm, setPresetForm] = useState<{ name: string; mappings: ExcelColumnMapping[] }>({ name: '', mappings: [] });
    const [presetMode, setPresetMode] = useState<'list' | 'edit' | 'create'>('list');

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        loadProducts();
        loadColumnPresets();
    }, []);
    
    const loadColumnPresets = () => {
        const presets = MockApi.getExcelColumnPresets();
        setColumnPresets(presets);
    };
    
    const initializeNewPreset = () => {
        const defaultMappings: ExcelColumnMapping[] = INTERNAL_PRODUCT_FIELDS.map(field => ({
            internalField: field.key,
            excelHeader: field.label,
            isEnabled: field.required,
            isRequired: field.required,
            defaultValue: undefined
        }));
        setPresetForm({ name: '', mappings: defaultMappings });
        setEditingPreset(null);
        setPresetMode('create');
    };
    
    const handleEditPreset = (preset: ExcelColumnPreset) => {
        setEditingPreset(preset);
        setPresetForm({ name: preset.name, mappings: [...preset.mappings] });
        setPresetMode('edit');
    };
    
    const handleSavePreset = () => {
        if (!presetForm.name.trim()) {
            addToast('الرجاء إدخال اسم الإعداد', 'error');
            return;
        }
        
        if (presetMode === 'create') {
            MockApi.createExcelColumnPreset({
                name: presetForm.name,
                isDefault: columnPresets.length === 0,
                mappings: presetForm.mappings
            });
            addToast('تم إنشاء الإعداد بنجاح', 'success');
        } else if (editingPreset) {
            MockApi.updateExcelColumnPreset(editingPreset.id, {
                name: presetForm.name,
                mappings: presetForm.mappings
            });
            addToast('تم حفظ التعديلات', 'success');
        }
        
        loadColumnPresets();
        setPresetMode('list');
    };
    
    const handleDeletePreset = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الإعداد؟')) {
            MockApi.deleteExcelColumnPreset(id);
            addToast('تم حذف الإعداد', 'info');
            loadColumnPresets();
        }
    };
    
    const handleSetDefault = (id: string) => {
        MockApi.setDefaultExcelColumnPreset(id);
        addToast('تم تعيين الإعداد الافتراضي', 'success');
        loadColumnPresets();
    };
    
    const updateMapping = (index: number, field: keyof ExcelColumnMapping, value: any) => {
        const newMappings = [...presetForm.mappings];
        newMappings[index] = { ...newMappings[index], [field]: value };
        setPresetForm({ ...presetForm, mappings: newMappings });
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await MockApi.getProducts();
            setProducts(data);
        } catch (err) {
            addToast('فشل في تحميل المنتجات', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase();
        return products.filter(p => 
            p.partNumber.toLowerCase().includes(q) ||
            p.name.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.carName && p.carName.toLowerCase().includes(q))
        );
    }, [products, searchQuery]);

    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, page]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportResult(null);
        setShowImportModal(true);

        try {
            const defaultPreset = MockApi.getDefaultExcelColumnPreset();
            const result = await MockApi.importProductsFromOnyxExcel(file, defaultPreset?.id);
            setImportResult(result);
            const usedPresetName = defaultPreset ? `باستخدام "${defaultPreset.name}"` : '';
            addToast(`تم الاستيراد: ${result.imported} جديد، ${result.updated} محدث ${usedPresetName}`, 'success');
            loadProducts();
            onRefresh?.();
        } catch (err: any) {
            addToast(err.message || 'فشل في الاستيراد', 'error');
            setImportResult({ imported: 0, updated: 0, skipped: 0, errors: [err.message] });
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownloadTemplate = () => {
        try {
            MockApi.generateOnyxExcelTemplate();
            addToast('تم تحميل نموذج Excel', 'success');
        } catch (err) {
            addToast('فشل في تحميل النموذج', 'error');
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({ ...product });
        setShowProductModal(true);
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setProductForm({ partNumber: '', name: '', price: 0, stock: 0 });
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        if (!productForm.partNumber || !productForm.name) {
            addToast('رقم الصنف والاسم مطلوبان', 'error');
            return;
        }

        try {
            if (editingProduct) {
                await MockApi.updateProduct(editingProduct.id, productForm);
                addToast('تم تحديث المنتج', 'success');
            } else {
                await MockApi.addProduct(productForm as Omit<Product, 'id' | 'createdAt'>);
                addToast('تم إضافة المنتج', 'success');
            }
            loadProducts();
            setShowProductModal(false);
            onRefresh?.();
        } catch (err: any) {
            addToast(err.message || 'حدث خطأ', 'error');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
        
        try {
            await MockApi.deleteProduct(id);
            addToast('تم حذف المنتج', 'success');
            loadProducts();
            onRefresh?.();
        } catch (err) {
            addToast('فشل في حذف المنتج', 'error');
        }
    };

    const formatPrice = (price: number | null | undefined) => {
        if (price === null || price === undefined) return '-';
        return `${price.toLocaleString()} ر.س`;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Package className="text-[#C8A04F]" size={24} />
                            إدارة المنتجات
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {products.length} منتج في قاعدة البيانات
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => { setShowColumnModal(true); setPresetMode('list'); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-sm transition-colors"
                            data-testid="button-column-settings"
                        >
                            <Settings size={18} />
                            إعداد الأعمدة
                        </button>
                        
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                        >
                            <Download size={18} />
                            تحميل نموذج Excel
                        </button>

                        <div className="relative group">
                            <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-colors">
                                <Upload size={18} />
                                استيراد من أونيكس
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </label>
                            {columnPresets.find(p => p.isDefault) && (
                                <div className="absolute -bottom-6 right-0 text-xs text-slate-500 whitespace-nowrap">
                                    سيستخدم: {columnPresets.find(p => p.isDefault)?.name}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddProduct}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3A] hover:bg-[#1a2e56] text-white rounded-xl font-bold text-sm transition-colors"
                        >
                            <Plus size={18} />
                            إضافة منتج
                        </button>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="ابحث برقم الصنف أو الاسم أو الماركة..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pr-12 pl-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent transition-all"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="animate-spin text-[#C8A04F]" size={32} />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">لا توجد منتجات</p>
                        <p className="text-sm text-slate-400 mt-1">قم باستيراد المنتجات من ملف Excel</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-600">
                                        <th className="px-4 py-3 text-right font-bold rounded-tr-xl">رقم الصنف</th>
                                        <th className="px-4 py-3 text-right font-bold">اسم المنتج</th>
                                        <th className="px-4 py-3 text-right font-bold">سعر الجملة</th>
                                        <th className="px-4 py-3 text-right font-bold">سعر التجزئة</th>
                                        <th className="px-4 py-3 text-right font-bold">الكمية</th>
                                        <th className="px-4 py-3 text-right font-bold">الماركة</th>
                                        <th className="px-4 py-3 text-center font-bold rounded-tl-xl">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-slate-700">{product.partNumber}</td>
                                            <td className="px-4 py-3 font-bold text-slate-800">{product.name}</td>
                                            <td className="px-4 py-3 text-emerald-600 font-bold">
                                                {formatPrice(product.priceWholesale || product.price)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {formatPrice(product.priceRetail)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                    (product.qtyTotal || product.stock || 0) > 10 
                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                        : (product.qtyTotal || product.stock || 0) > 0 
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {product.qtyTotal ?? product.stock ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{product.brand || '-'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 text-slate-400 hover:text-[#C8A04F] hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-500">
                                    عرض {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, filteredProducts.length)} من {filteredProducts.length}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                    <span className="px-4 py-2 font-bold text-slate-700">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showImportModal && (
                <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)}>
                    <div className="p-6 max-w-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-xl ${importing ? 'bg-blue-100' : importResult?.imported || importResult?.updated ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {importing ? (
                                    <RefreshCw size={24} className="animate-spin text-blue-600" />
                                ) : importResult?.imported || importResult?.updated ? (
                                    <CheckCircle size={24} className="text-emerald-600" />
                                ) : (
                                    <AlertTriangle size={24} className="text-red-600" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                    {importing ? 'جاري الاستيراد...' : 'نتيجة الاستيراد'}
                                </h3>
                            </div>
                        </div>

                        {importing ? (
                            <div className="text-center py-8">
                                <p className="text-slate-600">جاري معالجة الملف...</p>
                            </div>
                        ) : importResult && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black text-emerald-600">{importResult.imported}</p>
                                        <p className="text-xs font-bold text-emerald-700">جديد</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black text-blue-600">{importResult.updated}</p>
                                        <p className="text-xs font-bold text-blue-700">محدث</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-black text-slate-600">{importResult.skipped}</p>
                                        <p className="text-xs font-bold text-slate-700">تم تجاهله</p>
                                    </div>
                                </div>

                                {importResult.errors.length > 0 && (
                                    <div className="bg-red-50 rounded-xl p-4">
                                        <p className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                            <AlertTriangle size={16} />
                                            أخطاء ({importResult.errors.length})
                                        </p>
                                        <ul className="text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                                            {importResult.errors.slice(0, 10).map((err, i) => (
                                                <li key={i}>• {err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="w-full py-3 bg-[#0B1B3A] hover:bg-[#1a2e56] text-white rounded-xl font-bold transition-colors"
                                >
                                    إغلاق
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {showProductModal && (
                <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)}>
                    <div className="p-6 max-w-lg">
                        <h3 className="font-bold text-xl text-slate-800 mb-6">
                            {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">رقم الصنف *</label>
                                    <input
                                        type="text"
                                        value={productForm.partNumber || ''}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, partNumber: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                        placeholder="مثال: ABC-123"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">الماركة</label>
                                    <input
                                        type="text"
                                        value={productForm.brand || ''}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                        placeholder="مثال: Changan"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنتج *</label>
                                <input
                                    type="text"
                                    value={productForm.name || ''}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                    placeholder="اسم المنتج"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">سعر الجملة</label>
                                    <input
                                        type="number"
                                        value={productForm.priceWholesale || productForm.price || ''}
                                        onChange={(e) => setProductForm(prev => ({ 
                                            ...prev, 
                                            priceWholesale: parseFloat(e.target.value) || 0,
                                            price: parseFloat(e.target.value) || 0 
                                        }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">سعر التجزئة</label>
                                    <input
                                        type="number"
                                        value={productForm.priceRetail || ''}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, priceRetail: parseFloat(e.target.value) || null }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">الكمية الإجمالية</label>
                                    <input
                                        type="number"
                                        value={productForm.qtyTotal ?? productForm.stock ?? ''}
                                        onChange={(e) => setProductForm(prev => ({ 
                                            ...prev, 
                                            qtyTotal: parseInt(e.target.value) || 0,
                                            stock: parseInt(e.target.value) || 0 
                                        }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">السيارة</label>
                                    <input
                                        type="text"
                                        value={productForm.carName || ''}
                                        onChange={(e) => setProductForm(prev => ({ ...prev, carName: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent"
                                        placeholder="اسم السيارة"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">المواصفات</label>
                                <textarea
                                    value={productForm.description || ''}
                                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#C8A04F] focus:border-transparent resize-none"
                                    rows={3}
                                    placeholder="وصف المنتج..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowProductModal(false)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSaveProduct}
                                    className="flex-1 py-3 bg-[#0B1B3A] hover:bg-[#1a2e56] text-white rounded-xl font-bold transition-colors"
                                >
                                    {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Column Configuration Modal */}
            {showColumnModal && (
                <Modal isOpen={showColumnModal} onClose={() => { setShowColumnModal(false); setPresetMode('list'); }}>
                    <div className="p-6 min-w-[600px] max-h-[80vh] overflow-y-auto">
                        {presetMode === 'list' ? (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                                            <Settings className="text-blue-600" size={24} />
                                            إعدادات أعمدة الاستيراد
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">إدارة تعيينات أعمدة ملفات Excel</p>
                                    </div>
                                    <button
                                        onClick={initializeNewPreset}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
                                        data-testid="button-add-preset"
                                    >
                                        <Plus size={18} />
                                        إضافة إعداد
                                    </button>
                                </div>

                                {columnPresets.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                                        <FileSpreadsheet size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-500 font-bold">لا توجد إعدادات</p>
                                        <p className="text-sm text-slate-400 mt-1">أنشئ إعدادًا جديدًا لتعيين أعمدة الإكسل</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {columnPresets.map(preset => (
                                            <div 
                                                key={preset.id}
                                                className={`flex items-center justify-between p-4 rounded-xl border ${preset.isDefault ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {preset.isDefault && (
                                                        <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                            <Star size={16} />
                                                        </span>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-slate-800">{preset.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {preset.mappings.filter(m => m.isEnabled).length} حقل مفعل
                                                            {preset.isDefault && <span className="mr-2 text-blue-600">(الافتراضي)</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!preset.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefault(preset.id)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="تعيين كافتراضي"
                                                        >
                                                            <StarOff size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEditPreset(preset)}
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="تعديل"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePreset(preset.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="حذف"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowColumnModal(false)}
                                    className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                >
                                    إغلاق
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-xl text-slate-800">
                                        {presetMode === 'create' ? 'إنشاء إعداد جديد' : `تعديل: ${editingPreset?.name}`}
                                    </h3>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">اسم الإعداد *</label>
                                    <input
                                        type="text"
                                        value={presetForm.name}
                                        onChange={(e) => setPresetForm({ ...presetForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="مثال: Onyx Export"
                                        data-testid="input-preset-name"
                                    />
                                </div>

                                <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                                    <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 px-2 mb-2 sticky top-0 bg-white py-2 border-b">
                                        <div className="col-span-1">تفعيل</div>
                                        <div className="col-span-4">الحقل الداخلي</div>
                                        <div className="col-span-4">اسم العمود في Excel</div>
                                        <div className="col-span-3">القيمة الافتراضية</div>
                                    </div>
                                    {presetForm.mappings.map((mapping, index) => (
                                        <div key={mapping.internalField} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-slate-50">
                                            <div className="col-span-1">
                                                <input
                                                    type="checkbox"
                                                    checked={mapping.isEnabled}
                                                    onChange={(e) => updateMapping(index, 'isEnabled', e.target.checked)}
                                                    disabled={mapping.isRequired}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <span className={`text-sm ${mapping.isRequired ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                                                    {INTERNAL_PRODUCT_FIELDS.find(f => f.key === mapping.internalField)?.label || mapping.internalField}
                                                    {mapping.isRequired && <span className="text-red-500 mr-1">*</span>}
                                                </span>
                                            </div>
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    value={mapping.excelHeader}
                                                    onChange={(e) => updateMapping(index, 'excelHeader', e.target.value)}
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="اسم العمود"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="text"
                                                    value={mapping.defaultValue || ''}
                                                    onChange={(e) => updateMapping(index, 'defaultValue', e.target.value || undefined)}
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="-"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-6 mt-6 border-t border-slate-100">
                                    <button
                                        onClick={() => setPresetMode('list')}
                                        className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleSavePreset}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                                        data-testid="button-save-preset"
                                    >
                                        <Save size={18} />
                                        حفظ الإعداد
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};
