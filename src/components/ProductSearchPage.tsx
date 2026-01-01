import { useState, useEffect, useMemo, useCallback, KeyboardEvent } from 'react';
import { Search, Plus, Minus, Trash2, Send, Loader2, Package, ShoppingCart, Layers, X, Download, Upload, FileSpreadsheet, ChevronLeft, ChevronRight, Eye, EyeOff, Coins } from 'lucide-react';
import { User, Product, BusinessProfile, AlternativePart } from '../types';
import Api from '../services/api';
import { normalizeListResponse } from '../services/normalize';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import ProductImageViewer from './ProductImageViewer';
import { getAvailabilityBadgeProps } from '../utils/availabilityHelpers';

interface ProductSearchPageProps {
    user: User;
    profile?: BusinessProfile;
    onBack?: () => void;
}

interface RequestItem {
    productId: string;
    partNumber: string;
    productName: string;
    quantity: number;
    priceAtRequest?: number;
    notes?: string;
}

const STORAGE_KEY = 'siniCar_productSearch_requestDraft';

export function ProductSearchPage({ user, profile, onBack }: ProductSearchPageProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [searchQuery, setSearchQuery] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [makeFilter, setMakeFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');

    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const pageSize = 20;

    const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [alternativesModal, setAlternativesModal] = useState<{ open: boolean; partNumber: string; productName: string }>({ open: false, partNumber: '', productName: '' });
    const [alternatives, setAlternatives] = useState<AlternativePart[]>([]);
    const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

    const [brands, setBrands] = useState<string[]>([]);

    // Points system for viewing prices
    const [searchPointsRemaining, setSearchPointsRemaining] = useState<number>(() => {
        return profile?.searchPointsRemaining || user?.searchLimit || 50;
    });
    const [revealedPrices, setRevealedPrices] = useState<Set<string>>(new Set());

    // View price function - deducts points
    const viewPrice = useCallback((productId: string) => {
        if (revealedPrices.has(productId)) return; // Already revealed
        if (searchPointsRemaining <= 0) return; // No points

        setRevealedPrices(prev => new Set(prev).add(productId));
        setSearchPointsRemaining(prev => Math.max(0, prev - 1));

        // Update user profile points (persist to localStorage)
        if (profile) {
            const newBalance = Math.max(0, searchPointsRemaining - 1);
            const profiles = JSON.parse(localStorage.getItem('sinicar_profiles') || '[]');
            const idx = profiles.findIndex((p: any) => p.userId === profile.userId);
            if (idx >= 0) {
                profiles[idx].searchPointsRemaining = newBalance;
                localStorage.setItem('sinicar_profiles', JSON.stringify(profiles));
            }
        }
    }, [revealedPrices, searchPointsRemaining, profile]);

    // Get price with supplier margin applied
    const getMarginedPrice = useCallback((product: any): number => {
        const basePrice = product.priceWholesale || product.price || 0;
        // Check for product-level margin override first
        if (product.profitMarginOverride !== undefined && product.profitMarginOverride > 0) {
            return Math.round(basePrice * (1 + product.profitMarginOverride / 100));
        }
        // Then check supplier margin from localStorage
        try {
            const settings = JSON.parse(localStorage.getItem('sinicar_supplier_marketplace') || '{}');
            const defaultMargin = settings.defaultMarkupPercent || settings.minProfitMargin || 0;
            // If product has supplierId, look for specific supplier margin
            if (product.supplierId && settings.supplierPriorities) {
                const supplierConfig = settings.supplierPriorities.find((s: any) => s.supplierId === product.supplierId);
                if (supplierConfig?.minProfitMargin) {
                    return Math.round(basePrice * (1 + supplierConfig.minProfitMargin / 100));
                }
            }
            // Apply default margin
            if (defaultMargin > 0) {
                return Math.round(basePrice * (1 + defaultMargin / 100));
            }
        } catch (e) {
            console.error('Error loading margin settings:', e);
        }
        return basePrice;
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setRequestItems(parsed);
                }
            } catch { }
        }

        Api.searchProducts('').then(products => {
            const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))] as string[];
            setBrands(uniqueBrands);
        });
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requestItems));
    }, [requestItems]);

    const handleSearch = async () => {
        if (!searchQuery.trim() && !brandFilter && !makeFilter && !yearFilter) return;

        setIsSearching(true);
        setCurrentPage(1);

        try {
            const result = await Api.advancedSearchProducts({
                q: searchQuery,
                brand: brandFilter || undefined,
                make: makeFilter || undefined,
                year: yearFilter || undefined,
                page: 1,
                pageSize
            });

            // استخدام normalizeListResponse لضمان items دائماً array
            const { items, total } = normalizeListResponse<Product>(result);
            setSearchResults(items);
            setTotalResults(total);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handlePageChange = async (newPage: number) => {
        setIsSearching(true);
        setCurrentPage(newPage);

        try {
            const result = await Api.advancedSearchProducts({
                q: searchQuery,
                brand: brandFilter || undefined,
                make: makeFilter || undefined,
                year: yearFilter || undefined,
                page: newPage,
                pageSize
            });

            // استخدام normalizeListResponse لضمان items دائماً array
            const { items, total } = normalizeListResponse<Product>(result);
            setSearchResults(items);
            setTotalResults(total);
        } catch (error) {
            console.error('Page change error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const addToRequest = useCallback((product: Product) => {
        setRequestItems(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                partNumber: product.partNumber,
                productName: product.name,
                quantity: 1,
                priceAtRequest: product.priceWholesale || product.price
            }];
        });
    }, []);

    const updateQuantity = (productId: string, delta: number) => {
        setRequestItems(prev =>
            prev.map(item => {
                if (item.productId === productId) {
                    const newQty = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const removeFromRequest = (productId: string) => {
        setRequestItems(prev => prev.filter(item => item.productId !== productId));
    };

    const handleSendRequest = async () => {
        if (requestItems.length === 0) return;

        setIsSending(true);
        setSuccessMessage('');

        try {
            // Convert request items to match backend schema: productId, partNumber, name, quantity, unitPrice
            const orderItems = requestItems.map(item => ({
                productId: item.productId, // Backend expects 'productId' not 'id'
                partNumber: item.partNumber,
                name: item.productName,
                quantity: item.quantity,
                unitPrice: item.priceAtRequest || 0 // Backend expects 'unitPrice' not 'price'
            }));

            const totalAmount = orderItems.reduce((sum, item) => (item.unitPrice || 0) * item.quantity + sum, 0);

            console.log('📦 Creating order with items:', orderItems);
            console.log('📦 Total amount:', totalAmount);
            console.log('📦 User ID:', user.id);

            // Create a proper Order object using createOrder
            const newOrder = await Api.createOrder({
                items: orderItems,
                notes: 'طلب سريع من بوابة البحث',
                totalAmount: totalAmount, // Required for Api fallback
                userId: user.id // Required for Api fallback
            });

            console.log('✅ Order created:', newOrder);

            // Verify the order was saved to localStorage
            const savedOrders = JSON.parse(localStorage.getItem('b2b_orders_sini_v2') || '[]');
            console.log('📋 All orders in localStorage:', savedOrders);

            if (newOrder && newOrder.id) {
                setSuccessMessage(isRtl
                    ? `تم إرسال الطلب بنجاح! رقم الطلب: ${newOrder.id}`
                    : `Order sent successfully! Order ID: ${newOrder.id}`
                );
                setRequestItems([]);
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.error('❌ Send request error:', error);
        } finally {
            setIsSending(false);
        }
    };



    const openAlternativesModal = async (partNumber: string, productName: string) => {
        setAlternativesModal({ open: true, partNumber, productName });
        setIsLoadingAlternatives(true);
        setAlternatives([]);

        try {
            const results = await Api.searchAlternatives(partNumber);
            setAlternatives(results);
        } catch (error) {
            console.error('Alternatives search error:', error);
        } finally {
            setIsLoadingAlternatives(false);
        }
    };

    const closeAlternativesModal = () => {
        setAlternativesModal({ open: false, partNumber: '', productName: '' });
        setAlternatives([]);
    };

    const totalPages = Math.ceil(totalResults / pageSize);

    const getStockDisplay = (product: Product) => {
        const total = product.qtyTotal ?? product.stock ?? 0;
        if (total > 10) return { text: isRtl ? 'متوفر' : 'In Stock', color: 'text-green-600' };
        if (total > 0) return { text: isRtl ? 'كمية محدودة' : 'Limited', color: 'text-yellow-600' };
        return { text: isRtl ? 'غير متوفر' : 'Out of Stock', color: 'text-red-600' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Search className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {isRtl ? 'الطلبات السريعة' : 'Quick Orders'}
                            </h1>
                            <p className="text-sm text-gray-400">
                                {isRtl ? 'ابحث عن المنتجات وأضفها لطلب الشراء' : 'Search products and add to purchase request'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${searchPointsRemaining > 10
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : searchPointsRemaining > 0
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}>
                                    <Coins size={14} />
                                    {isRtl ? `${searchPointsRemaining} نقطة متبقية` : `${searchPointsRemaining} points left`}
                                </span>
                            </div>
                        </div>
                    </div>
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors"
                            data-testid="button-back"
                        >
                            {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                            {isRtl ? 'رجوع' : 'Back'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
                            <div className="flex flex-wrap gap-3 mb-4">
                                <div className="flex-1 min-w-[200px]">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={isRtl ? 'رقم القطعة أو الاسم...' : 'Part number or name...'}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        data-testid="input-search-query"
                                    />
                                </div>
                                <select
                                    value={brandFilter}
                                    onChange={e => setBrandFilter(e.target.value)}
                                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-testid="select-brand-filter"
                                >
                                    <option value="" className="bg-slate-800">{isRtl ? 'كل الماركات' : 'All Brands'}</option>
                                    {brands.map(b => (
                                        <option key={b} value={b} className="bg-slate-800">{b}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={makeFilter}
                                    onChange={e => setMakeFilter(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isRtl ? 'نوع السيارة' : 'Car Make'}
                                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                                    data-testid="input-make-filter"
                                />
                                <input
                                    type="text"
                                    value={yearFilter}
                                    onChange={e => setYearFilter(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isRtl ? 'السنة' : 'Year'}
                                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                                    data-testid="input-year-filter"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                                    data-testid="button-search"
                                >
                                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    {isRtl ? 'بحث' : 'Search'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    {isRtl ? 'نتائج البحث' : 'Search Results'}
                                    {totalResults > 0 && (
                                        <span className="text-sm text-gray-400">({totalResults})</span>
                                    )}
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-2 py-3 text-center text-xs font-medium text-gray-400 uppercase w-12">{t('productImages.mainImage', 'صورة')}</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'رقم القطعة' : 'Part #'}</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'الاسم' : 'Name'}</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'الماركة' : 'Brand'}</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">{isRtl ? 'السعر' : 'Price'}</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'التوفر' : 'Stock'}</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">{isRtl ? 'العمليات' : 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {searchResults.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                                    {isSearching ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            {isRtl ? 'جاري البحث...' : 'Searching...'}
                                                        </div>
                                                    ) : (
                                                        isRtl ? 'ابدأ البحث للعثور على المنتجات' : 'Start searching to find products'
                                                    )}
                                                </td>
                                            </tr>
                                        ) : (
                                            searchResults.map(product => {
                                                const stock = getStockDisplay(product);
                                                const isInCart = requestItems.some(item => item.productId === product.id);

                                                return (
                                                    <tr key={product.id} className="hover:bg-white/5 transition-colors" data-testid={`row-product-${product.id}`}>
                                                        <td className="px-2 py-3 text-center">
                                                            <ProductImageViewer
                                                                mainImageUrl={product.mainImageUrl || product.image}
                                                                imageGallery={product.imageGallery}
                                                                productName={product.name}
                                                                partNumber={product.partNumber}
                                                                size="sm"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-white font-mono">{product.partNumber}</td>
                                                        <td className="px-4 py-3 text-sm text-white">{product.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-300">{product.brand || '-'}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {revealedPrices.has(product.id) ? (
                                                                <span className="text-emerald-400 font-bold">
                                                                    {getMarginedPrice(product).toLocaleString()} ر.س
                                                                </span>
                                                            ) : searchPointsRemaining > 0 ? (
                                                                <button
                                                                    onClick={() => viewPrice(product.id)}
                                                                    className="px-3 py-1.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-amber-500/30 mx-auto"
                                                                    data-testid={`button-view-price-${product.id}`}
                                                                >
                                                                    <Eye size={14} />
                                                                    {isRtl ? 'مشاهدة السعر' : 'View Price'}
                                                                </button>
                                                            ) : (
                                                                <span className="text-gray-500 text-xs flex items-center gap-1 justify-center">
                                                                    <EyeOff size={14} />
                                                                    {isRtl ? 'لا توجد نقاط' : 'No points'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {/* Availability Badge */}
                                                            {(() => {
                                                                const badge = getAvailabilityBadgeProps(product);
                                                                return (
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${badge.className}`}>
                                                                        <span>{badge.icon}</span>
                                                                        <span>{badge.text}</span>
                                                                    </span>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => addToRequest(product)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${isInCart
                                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                                                                        }`}
                                                                    data-testid={`button-add-${product.id}`}
                                                                >
                                                                    <Plus size={14} />
                                                                    {isRtl ? 'أضف' : 'Add'}
                                                                </button>
                                                                <button
                                                                    onClick={() => openAlternativesModal(product.partNumber, product.name)}
                                                                    className="px-3 py-1.5 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-purple-500/30"
                                                                    data-testid={`button-alternatives-${product.id}`}
                                                                >
                                                                    <Layers size={14} />
                                                                    {isRtl ? 'بدائل' : 'Alt'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1 || isSearching}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors"
                                        data-testid="button-prev-page"
                                    >
                                        {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                                        {isRtl ? 'السابق' : 'Prev'}
                                    </button>
                                    <span className="text-sm text-gray-400">
                                        {isRtl ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages || isSearching}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-colors"
                                        data-testid="button-next-page"
                                    >
                                        {isRtl ? 'التالي' : 'Next'}
                                        {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 sticky top-4">
                            <div className="p-4 border-b border-white/10">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    {isRtl ? 'طلب الشراء' : 'Purchase Request'}
                                    {requestItems.length > 0 && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            {requestItems.length}
                                        </span>
                                    )}
                                </h2>
                            </div>

                            <div className="p-4 max-h-96 overflow-y-auto">
                                {requestItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>{isRtl ? 'لا توجد أصناف' : 'No items yet'}</p>
                                        <p className="text-sm mt-1">{isRtl ? 'أضف منتجات من نتائج البحث' : 'Add products from search results'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requestItems.map(item => (
                                            <div
                                                key={item.productId}
                                                className="bg-white/5 rounded-xl p-3 border border-white/10"
                                                data-testid={`cart-item-${item.productId}`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                                                        <p className="text-xs text-gray-400 font-mono">{item.partNumber}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromRequest(item.productId)}
                                                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                                        data-testid={`button-remove-${item.productId}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, -1)}
                                                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                        data-testid={`button-decrease-${item.productId}`}
                                                    >
                                                        <Minus size={14} className="text-white" />
                                                    </button>
                                                    <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, 1)}
                                                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                                        data-testid={`button-increase-${item.productId}`}
                                                    >
                                                        <Plus size={14} className="text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {requestItems.length > 0 && (
                                <div className="p-4 border-t border-white/10">
                                    <div className="flex items-center justify-between mb-4 text-sm">
                                        <span className="text-gray-400">{isRtl ? 'إجمالي الأصناف:' : 'Total Items:'}</span>
                                        <span className="text-white font-medium">
                                            {requestItems.reduce((sum, item) => sum + item.quantity, 0)}
                                        </span>
                                    </div>

                                    {successMessage && (
                                        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm" data-testid="text-success-message">
                                            {successMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSendRequest}
                                        disabled={isSending || requestItems.length === 0}
                                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
                                        data-testid="button-send-request"
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                        {isRtl ? 'إرسال طلب الشراء' : 'Send Purchase Request'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {alternativesModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl border border-white/20 w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Layers className="w-5 h-5" />
                                    {isRtl ? 'البدائل المتاحة' : 'Available Alternatives'}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {alternativesModal.productName} - {alternativesModal.partNumber}
                                </p>
                            </div>
                            <button
                                onClick={closeAlternativesModal}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                data-testid="button-close-alternatives"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4 max-h-96 overflow-y-auto">
                            {isLoadingAlternatives ? (
                                <div className="flex items-center justify-center py-12 text-gray-400">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    {isRtl ? 'جاري البحث عن البدائل...' : 'Searching for alternatives...'}
                                </div>
                            ) : alternatives.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{isRtl ? 'لا توجد بدائل متاحة' : 'No alternatives found'}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5">
                                            <tr>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'الرقم الأساسي' : 'Main Part'}</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'الرقم البديل' : 'Alt Part'}</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'الوصف' : 'Description'}</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">{isRtl ? 'الماركة' : 'Brand'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {alternatives.map(alt => (
                                                <tr key={alt.id} className="hover:bg-white/5" data-testid={`row-alternative-${alt.id}`}>
                                                    <td className="px-4 py-2 text-sm text-white font-mono">{alt.mainPartNumber}</td>
                                                    <td className="px-4 py-2 text-sm text-blue-400 font-mono">{alt.altPartNumber}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-300">{alt.description || '-'}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-300">{alt.brand || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
