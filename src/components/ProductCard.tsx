import React, { useState, useEffect } from 'react';
import { Product, CartItem, User } from '../types';
import { Package, Plus, Check, Minus, ShoppingCart, Lock, Info, Search, Eye, Settings, Disc, Box } from 'lucide-react';
import { useToast } from '../services/ToastContext';
import Api from '../services/api';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, quantity: number) => void;
  cart: CartItem[];
  user?: User; // Pass user to check history
  onPriceReveal?: () => void; // Callback to refresh credits in Dashboard
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, cart, user, onPriceReveal }) => {
  const [quantity, setQuantity] = useState(1);
  const [isPriceRevealed, setIsPriceRevealed] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
      // Check if price was recently viewed
      if (user && Api.hasRecentPriceView(user.id, product.id)) {
          setIsPriceRevealed(true);
      }
  }, [user, product.id]);

  const handleAdd = () => {
      onAdd(product, quantity);
      setQuantity(1);
  };

  const handleRevealPrice = async () => {
      if (!user) return;
      
      setLoadingPrice(true);
      
      // 1. Check history again (client-side safety)
      if (Api.hasRecentPriceView(user.id, product.id)) {
          setIsPriceRevealed(true);
          setLoadingPrice(false);
          return;
      }

      // 2. Check Credits
      if (!Api.canShowPrice(user)) {
           addToast("لقد استهلكت جميع نقاط البحث المتاحة لهذا اليوم.", "error");
           setLoadingPrice(false);
           return;
      }

      // 3. Deduct & Log
      try {
          await Api.incrementSearchUsage(user.id);
          await Api.logPriceView(user, product);
          setIsPriceRevealed(true);
          if (onPriceReveal) onPriceReveal();
          addToast("تم خصم نقطة واحدة لعرض السعر", "info");
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingPrice(false);
      }
  };

  const getIcon = () => {
      const cat = product.category?.toLowerCase() || '';
      if(cat.includes('فرامل') || cat.includes('brake')) return <Disc size={22} className="text-slate-500" />;
      if(cat.includes('محرك') || cat.includes('engine')) return <Settings size={22} className="text-slate-500" />;
      return <Box size={22} className="text-slate-500" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-card-hover transition-all duration-200 flex flex-col p-5 group h-full">
        {/* Header: Brand & Part Number */}
        <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-400 uppercase mb-1 tracking-wider">{product.brand}</span>
                <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 w-fit">
                    {product.partNumber}
                </span>
            </div>
            <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${product.stock > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
               {product.stock > 0 ? 'متوفر' : 'غير متوفر'}
            </div>
        </div>

        {/* Body: Icon & Name */}
        <div className="flex gap-4 mb-5 items-start flex-1">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:shadow-sm transition-colors">
                {getIcon()}
            </div>
            <h3 className="text-[15px] font-bold text-slate-800 leading-snug pt-0.5 group-hover:text-brand-700 transition-colors" title={product.name}>
                {product.name}
            </h3>
        </div>

        {/* Footer: Price & Actions */}
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-end gap-3 justify-between">
             {/* Price Section */}
             <div className="flex-1">
                {isPriceRevealed ? (
                    <div className="flex flex-col">
                        {product.oldPrice && <span className="text-xs text-slate-400 line-through font-medium">{product.oldPrice}</span>}
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900">{product.price}</span>
                            <span className="text-xs font-bold text-slate-500">ر.س</span>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={handleRevealPrice}
                        disabled={loadingPrice}
                        className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg border border-amber-200 flex items-center gap-1.5 transition-colors w-fit shadow-sm"
                    >
                         {loadingPrice ? <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div> : <Eye size={14} />}
                         <span>عرض السعر</span>
                    </button>
                )}
             </div>

             {/* Actions */}
             <div className="flex items-center gap-2">
                 <div className="flex items-center border border-slate-300 rounded-lg h-10 bg-slate-50 shadow-sm overflow-hidden">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-full flex items-center justify-center text-slate-600 hover:text-brand-600 hover:bg-white border-l border-slate-200 transition-colors">
                            <Minus size={16} strokeWidth={2.5} />
                        </button>
                        <input 
                            type="number" 
                            className="w-12 h-full text-center text-sm font-black border-none p-0 focus:ring-0 bg-white text-slate-900 appearance-none placeholder-slate-400"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-full flex items-center justify-center text-slate-600 hover:text-brand-600 hover:bg-white border-r border-slate-200 transition-colors">
                            <Plus size={16} strokeWidth={2.5} />
                        </button>
                 </div>
                 
                 <button 
                    onClick={handleAdd}
                    disabled={!isPriceRevealed || product.stock === 0}
                    className={`h-10 w-10 flex items-center justify-center rounded-lg shadow-sm transition-all ${isPriceRevealed && product.stock > 0 ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200 hover:shadow-md' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    title="إضافة للسلة"
                 >
                     <ShoppingCart size={20} />
                 </button>
             </div>
        </div>
    </div>
  );
};