import React, { useEffect, useState } from 'react';
import { MockApi } from '../services/mockApi';
import { Product, CartItem } from '../types';
import { ProductCard } from './ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NewArrivalsPageProps {
  onAdd: (product: Product, quantity: number) => void;
  onBack: () => void;
  cart: CartItem[];
}

export const NewArrivalsPage: React.FC<NewArrivalsPageProps> = ({ onAdd, onBack, cart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await MockApi.getFeaturedProducts();
        setProducts(data.newArrivals);
      } catch (error) {
        console.error("Failed to load new arrivals", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-sm p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-800 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10">
          <button 
            onClick={onBack} 
            className="flex items-center text-gray-300 hover:text-white mb-6 transition-colors font-medium text-sm"
          >
            <ArrowRight className="ml-2 w-4 h-4" /> العودة للرئيسية
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-sm backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">وصل حديثاً</h2>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            استكشف أحدث قطع الغيار التي وصلت لمستودعاتنا. نوفر لك الأفضل دائماً لضمان الجودة والأداء العالي.
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} cart={cart} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400">
              لا توجد منتجات جديدة حالياً.
            </div>
          )}
        </div>
      )}
    </div>
  );
};