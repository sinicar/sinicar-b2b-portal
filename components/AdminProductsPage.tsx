import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MockApi } from '../services/mockApi';
import { Product } from '../types';
import { 
    Upload, Download, Search, Package, AlertTriangle, CheckCircle, 
    XCircle, Edit2, Trash2, Plus, RefreshCw, FileSpreadsheet, 
    ChevronLeft, ChevronRight, Filter, Eye, X
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

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        loadProducts();
    }, []);

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
            const result = await MockApi.importProductsFromOnyxExcel(file);
            setImportResult(result);
            addToast(`تم الاستيراد: ${result.imported} جديد، ${result.updated} محدث`, 'success');
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
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                        >
                            <Download size={18} />
                            تحميل نموذج Excel
                        </button>

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
                <Modal onClose={() => setShowImportModal(false)}>
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
                <Modal onClose={() => setShowProductModal(false)}>
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
        </div>
    );
};
