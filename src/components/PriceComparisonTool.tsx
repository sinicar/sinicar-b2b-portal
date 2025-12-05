import { useState, useEffect, type FormEvent } from 'react';
import { 
  Scale, Search, Loader2, ArrowUpDown, TrendingUp, TrendingDown,
  CheckCircle, AlertTriangle, Star, Package, Building2, Clock, 
  DollarSign, Percent, ShoppingCart, X
} from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { toolsAccessService } from '../services/toolsAccess';
import { User, BusinessProfile } from '../types';
import { MockApi } from '../services/mockApi';

interface PriceComparisonToolProps {
  user: User;
  profile: BusinessProfile | null;
  onClose: () => void;
}

interface SupplierPrice {
  supplierId: string;
  supplierName: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
  stockQuantity?: number;
  deliveryDays: number;
  rating: number;
  isRecommended?: boolean;
  isBestPrice?: boolean;
  isFastest?: boolean;
}

interface ComparisonResult {
  partNumber: string;
  partName: string;
  suppliers: SupplierPrice[];
  searchedAt: string;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  priceDifference: number;
}

interface SearchHistoryItem {
  partNumber: string;
  partName: string;
  searchedAt: string;
  lowestPrice: number;
  suppliersCount: number;
}

const MOCK_SUPPLIERS = [
  { id: 'sup1', name: 'مورد القطع الأصلية', rating: 4.8 },
  { id: 'sup2', name: 'قطع غيار السيارات', rating: 4.5 },
  { id: 'sup3', name: 'مستودع السيارات', rating: 4.2 },
  { id: 'sup4', name: 'قطع الخليج', rating: 4.6 },
  { id: 'sup5', name: 'المورد السريع', rating: 4.0 },
];

const generateMockPrices = (basePrice: number): SupplierPrice[] => {
  const shuffledSuppliers = [...MOCK_SUPPLIERS].sort(() => Math.random() - 0.5);
  const supplierCount = 3 + Math.floor(Math.random() * 3);
  
  return shuffledSuppliers.slice(0, supplierCount).map((supplier, index) => {
    const priceVariation = 0.7 + Math.random() * 0.6;
    const price = Math.round(basePrice * priceVariation);
    const hasDiscount = Math.random() > 0.6;
    const originalPrice = hasDiscount ? Math.round(price * (1 + Math.random() * 0.3)) : undefined;
    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;
    
    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      price,
      originalPrice,
      discount,
      inStock: Math.random() > 0.2,
      stockQuantity: Math.floor(Math.random() * 50) + 1,
      deliveryDays: Math.floor(Math.random() * 5) + 1,
      rating: supplier.rating,
    };
  }).sort((a, b) => a.price - b.price).map((supplier, index) => ({
    ...supplier,
    isBestPrice: index === 0,
    isFastest: supplier.deliveryDays === Math.min(...shuffledSuppliers.slice(0, supplierCount).map(() => Math.floor(Math.random() * 5) + 1)),
    isRecommended: index === 0 && supplier.rating >= 4.5,
  }));
};

export const PriceComparisonTool = ({ user, profile, onClose }: PriceComparisonToolProps) => {
  const { t, dir } = useLanguage();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'delivery'>('price');
  
  useEffect(() => {
    const savedHistory = localStorage.getItem(`price_comparison_history_${user.id}`);
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, [user.id]);
  
  const saveToHistory = (result: ComparisonResult) => {
    const historyItem: SearchHistoryItem = {
      partNumber: result.partNumber,
      partName: result.partName,
      searchedAt: result.searchedAt,
      lowestPrice: result.lowestPrice,
      suppliersCount: result.suppliers.length,
    };
    
    const newHistory = [historyItem, ...searchHistory.filter(h => h.partNumber !== result.partNumber)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem(`price_comparison_history_${user.id}`, JSON.stringify(newHistory));
  };
  
  const handleSearch = async (e?: FormEvent, partNumber?: string) => {
    e?.preventDefault();
    
    const query = partNumber || searchQuery.trim();
    if (!query) return;
    
    setIsSearching(true);
    const startTime = Date.now();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const products = await MockApi.searchProducts(query);
      const product = products[0];
      
      if (!product) {
        addToast({
          type: 'warning',
          message: t('priceComparison.noProductFound', 'لم يتم العثور على منتج بهذا الرقم')
        });
        setIsSearching(false);
        return;
      }
      
      const basePrice = product.price || 100 + Math.random() * 500;
      const suppliers = generateMockPrices(basePrice);
      
      const prices = suppliers.map(s => s.price);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      
      const comparisonResult: ComparisonResult = {
        partNumber: product.partNumber,
        partName: product.name,
        suppliers,
        searchedAt: new Date().toISOString(),
        averagePrice,
        lowestPrice,
        highestPrice,
        priceDifference: highestPrice - lowestPrice,
      };
      
      setResult(comparisonResult);
      saveToHistory(comparisonResult);
      
      await toolsAccessService.recordToolUsage(
        'PRICE_COMPARISON',
        user.id,
        true,
        1,
        undefined,
        Date.now() - startTime,
        { partNumber: product.partNumber, suppliersCount: suppliers.length }
      );
      
      addToast({
        type: 'success',
        message: t('priceComparison.searchComplete', 'تمت المقارنة بنجاح')
      });
      
    } catch (error) {
      console.error('Search failed:', error);
      addToast({
        type: 'error',
        message: t('priceComparison.searchError', 'حدث خطأ أثناء البحث')
      });
      
      await toolsAccessService.recordToolUsage(
        'PRICE_COMPARISON',
        user.id,
        false,
        0,
        'Search failed'
      );
    } finally {
      setIsSearching(false);
    }
  };
  
  const getSortedSuppliers = () => {
    if (!result) return [];
    
    const suppliers = [...result.suppliers];
    
    switch (sortBy) {
      case 'price':
        return suppliers.sort((a, b) => a.price - b.price);
      case 'rating':
        return suppliers.sort((a, b) => b.rating - a.rating);
      case 'delivery':
        return suppliers.sort((a, b) => a.deliveryDays - b.deliveryDays);
      default:
        return suppliers;
    }
  };
  
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(`price_comparison_history_${user.id}`);
    addToast({
      type: 'success',
      message: t('priceComparison.historyCleared', 'تم مسح سجل البحث')
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Scale size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {t('priceComparison.title', 'مقارنة الأسعار')}
            </h2>
            <p className="text-purple-100 mt-1">
              {t('priceComparison.subtitle', 'قارن أسعار القطع بين الموردين واحصل على أفضل سعر')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-slate-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('priceComparison.searchPlaceholder', 'أدخل رقم القطعة للمقارنة...')}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent`}
              data-testid="input-part-search"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
            data-testid="button-compare-prices"
          >
            {isSearching ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {t('priceComparison.searching', 'جاري البحث...')}
              </>
            ) : (
              <>
                <Scale size={20} />
                {t('priceComparison.compare', 'مقارنة')}
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Product Info & Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{result.partName}</h3>
                <p className="text-slate-500 font-mono">{result.partNumber}</p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                data-testid="button-close-results"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <TrendingDown size={24} className="text-green-600 mx-auto mb-2" />
                <p className="text-xs text-green-600 font-medium">{t('priceComparison.lowestPrice', 'أقل سعر')}</p>
                <p className="text-xl font-bold text-green-700">{result.lowestPrice} {t('common.sar', 'ر.س')}</p>
              </div>
              
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <TrendingUp size={24} className="text-red-600 mx-auto mb-2" />
                <p className="text-xs text-red-600 font-medium">{t('priceComparison.highestPrice', 'أعلى سعر')}</p>
                <p className="text-xl font-bold text-red-700">{result.highestPrice} {t('common.sar', 'ر.س')}</p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <DollarSign size={24} className="text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-blue-600 font-medium">{t('priceComparison.avgPrice', 'متوسط السعر')}</p>
                <p className="text-xl font-bold text-blue-700">{result.averagePrice} {t('common.sar', 'ر.س')}</p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Percent size={24} className="text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-purple-600 font-medium">{t('priceComparison.savings', 'التوفير المحتمل')}</p>
                <p className="text-xl font-bold text-purple-700">{result.priceDifference} {t('common.sar', 'ر.س')}</p>
              </div>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{t('priceComparison.sortBy', 'ترتيب حسب')}:</span>
            <div className="flex gap-2">
              {[
                { key: 'price', label: t('priceComparison.sortPrice', 'السعر') },
                { key: 'rating', label: t('priceComparison.sortRating', 'التقييم') },
                { key: 'delivery', label: t('priceComparison.sortDelivery', 'التوصيل') },
              ].map(option => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key as typeof sortBy)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    sortBy === option.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  data-testid={`button-sort-${option.key}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Suppliers List */}
          <div className="space-y-3">
            {getSortedSuppliers().map((supplier, index) => (
              <div 
                key={supplier.supplierId}
                className={`bg-white rounded-2xl border-2 p-4 transition-all ${
                  supplier.isBestPrice 
                    ? 'border-green-400 bg-green-50/30' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                      index === 0 
                        ? 'bg-green-600 text-white' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800">{supplier.supplierName}</h4>
                        {supplier.isRecommended && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            {t('priceComparison.recommended', 'موصى به')}
                          </span>
                        )}
                        {supplier.isBestPrice && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                            {t('priceComparison.bestPrice', 'أفضل سعر')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          {supplier.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {supplier.deliveryDays} {t('priceComparison.days', 'أيام')}
                        </span>
                        <span className={`flex items-center gap-1 ${
                          supplier.inStock ? 'text-green-600' : 'text-red-500'
                        }`}>
                          <Package size={14} />
                          {supplier.inStock 
                            ? `${supplier.stockQuantity} ${t('priceComparison.inStock', 'متوفر')}`
                            : t('priceComparison.outOfStock', 'غير متوفر')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-${isRTL ? 'left' : 'right'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-800">
                        {supplier.price}
                      </span>
                      <span className="text-slate-500">{t('common.sar', 'ر.س')}</span>
                    </div>
                    
                    {supplier.originalPrice && supplier.discount && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="line-through text-slate-400">{supplier.originalPrice}</span>
                        <span className="text-green-600 font-bold">-{supplier.discount}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Search History */}
      {searchHistory.length > 0 && !result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">
              {t('priceComparison.recentSearches', 'عمليات البحث الأخيرة')}
            </h3>
            <button
              onClick={clearHistory}
              className="text-sm text-slate-500 hover:text-red-500 font-medium"
              data-testid="button-clear-history"
            >
              {t('priceComparison.clearHistory', 'مسح السجل')}
            </button>
          </div>
          
          <div className="space-y-2">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearch(undefined, item.partNumber)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left"
                data-testid={`button-history-${index}`}
              >
                <div>
                  <p className="font-medium text-slate-800">{item.partName}</p>
                  <p className="text-sm text-slate-500 font-mono">{item.partNumber}</p>
                </div>
                <div className={`text-${isRTL ? 'left' : 'right'}`}>
                  <p className="font-bold text-green-600">{item.lowestPrice} {t('common.sar', 'ر.س')}</p>
                  <p className="text-xs text-slate-400">{item.suppliersCount} {t('priceComparison.suppliers', 'موردين')}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!result && searchHistory.length === 0 && (
        <div className="text-center py-12">
          <Scale size={64} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">
            {t('priceComparison.emptyState', 'ابدأ بالبحث عن قطعة لمقارنة الأسعار')}
          </h3>
          <p className="text-slate-500 mt-2">
            {t('priceComparison.emptyStateDesc', 'أدخل رقم القطعة في مربع البحث أعلاه')}
          </p>
        </div>
      )}
      
      {/* Tips */}
      <div className="bg-purple-50 rounded-2xl p-6">
        <h3 className="font-bold text-purple-800 mb-3">
          {t('priceComparison.tips', 'نصائح للحصول على أفضل الأسعار')}
        </h3>
        <ul className={`text-sm text-purple-700 space-y-2 ${isRTL ? 'list-disc list-inside' : 'list-disc list-inside'}`}>
          <li>{t('priceComparison.tip1', 'قارن الأسعار بين عدة موردين قبل الشراء')}</li>
          <li>{t('priceComparison.tip2', 'انتبه لوقت التوصيل إذا كنت بحاجة للقطعة بشكل عاجل')}</li>
          <li>{t('priceComparison.tip3', 'تحقق من تقييم المورد وتوفر المخزون')}</li>
          <li>{t('priceComparison.tip4', 'الأسعار قد تتغير، احفظ سجل البحث للمقارنة لاحقاً')}</li>
        </ul>
      </div>
    </div>
  );
};

export default PriceComparisonTool;
