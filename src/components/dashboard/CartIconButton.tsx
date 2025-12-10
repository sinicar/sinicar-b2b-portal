import { memo, useRef, useEffect, useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { CartItem } from '../../types';

export interface FlyingCartItemProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    onComplete: () => void;
}

export const FlyingCartItem = memo(({ startX, startY, endX, endY, onComplete }: FlyingCartItemProps) => {
    const [position, setPosition] = useState({ x: startX, y: startY, scale: 1, opacity: 1 });
    
    useEffect(() => {
        requestAnimationFrame(() => {
            setPosition({ x: endX, y: endY, scale: 0.3, opacity: 0.5 });
        });
        
        const timer = setTimeout(onComplete, 800);
        return () => clearTimeout(timer);
    }, [endX, endY, onComplete]);
    
    return (
        <div
            className="fixed z-[9999] pointer-events-none"
            style={{
                left: position.x,
                top: position.y,
                transform: `translate(-50%, -50%) scale(${position.scale})`,
                opacity: position.opacity,
                transition: 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
        >
            <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-600/50">
                <ShoppingCart size={18} className="text-white" />
            </div>
        </div>
    );
});

export interface CartIconButtonProps {
    cartCount: number;
    cartTotal: number;
    cart: CartItem[];
    onRemoveItem: (id: string) => void;
    onSubmitOrder: () => void;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
    onCartIconMount: (element: HTMLButtonElement | null) => void;
    t: (key: string, fallback?: string) => string;
    isRTL: boolean;
}

export const CartIconButton = memo(({ 
    cartCount, 
    cartTotal, 
    cart, 
    onRemoveItem, 
    onSubmitOrder, 
    showDropdown, 
    setShowDropdown, 
    onCartIconMount,
    t,
    isRTL
}: CartIconButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        onCartIconMount(buttonRef.current);
        return () => onCartIconMount(null);
    }, [onCartIconMount]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowDropdown]);
    
    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className={`relative p-2.5 rounded-xl transition-all ${
                    cartCount > 0 
                        ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-600/30' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                data-testid="button-cart"
                aria-label="Shopping Cart"
            >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                        {cartCount}
                    </span>
                )}
            </button>
            
            {showDropdown && (
                <div 
                    ref={dropdownRef}
                    className={`absolute top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 ${
                        isRTL ? 'left-0' : 'right-0'
                    }`}
                >
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <ShoppingCart size={18} />
                            {t('customerDashboard.cart', 'سلة المشتريات')}
                            <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>
                        </h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                        {cart.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">{t('customerDashboard.emptyCart', 'السلة فارغة')}</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {item.quantity} × {item.price.toLocaleString()} {t('customerDashboard.sar', 'ر.س')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-brand-600">
                                                {(item.quantity * item.price).toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                data-testid={`button-remove-item-${item.id}`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {cart.length > 0 && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-slate-600">{t('customerDashboard.total', 'الإجمالي')}:</span>
                                <span className="text-lg font-black text-slate-900">
                                    {cartTotal.toLocaleString()} {t('customerDashboard.sar', 'ر.س')}
                                </span>
                            </div>
                            <button
                                onClick={onSubmitOrder}
                                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-brand-600/30"
                                data-testid="button-submit-order-dropdown"
                            >
                                {t('customerDashboard.confirmOrder', 'تأكيد الطلب')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
