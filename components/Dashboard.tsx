

import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { User, BusinessProfile, Product, Order, CartItem, OrderStatus, QuoteRequest, UserRole, SearchHistoryItem, SiteSettings, SearchResultType, GuestModeSettings } from '../types';
import { MockApi } from '../services/mockApi';
import { 
  LayoutDashboard, ShoppingCart, Users, User as UserIcon, Package, LogOut, Search, 
  TrendingUp, Truck, Bell, Box, 
  Clock, CheckCircle,
  Building2, Trash2, Menu, X,
  ShieldCheck, Headphones, History, AlertTriangle, Loader2, Plus, Globe, Lock,
  FileText, Anchor, BarChart3, Briefcase, Car, FileSpreadsheet, Check, Eye, Minus, ShoppingBag, PackageX
} from 'lucide-react';
import { OrdersPage } from './OrdersPage';
import { QuoteRequestPage } from './QuoteRequestPage';
import { AboutPage } from './AboutPage';
import { OrganizationPage } from './OrganizationPage';
import { ProductCard } from './ProductCard';
import { ImportFromChinaPage } from './ImportFromChinaPage';
import { Modal } from './Modal';
import { useLanguage, LanguageSwitcher } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { formatDateTime } from '../utils/dateUtils';
import { searchProducts } from '../utils/arabicSearch';
import { UsageIntroModal } from './UsageIntroModal';
import { NotificationBell } from './NotificationBell';
import { handlePartSearch, createSearchContext, PartSearchResult, filterProductsForCustomer } from '../services/searchService';

interface DashboardProps {
  user: User;
  profile: BusinessProfile | null;
  onLogout: () => void;
  onRefreshUser: () => void; // New prop to refresh user state
}

// --- Ticker Component (Memoized) ---
const ClientTicker = memo(() => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        MockApi.getSettings().then(setSettings);
    }, []);

    if (!settings || !settings.tickerEnabled) return null;

    const duration = 40 - ((settings.tickerSpeed || 5) - 1) * 3; 

    return (
        <div style={{ backgroundColor: settings.tickerBgColor || '#0f172a' }} className="w-full overflow-hidden py-3 relative z-50 shadow-sm border-b border-white/10">
             <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .ticker-content {
                    white-space: nowrap;
                    display: inline-block;
                    animation: marquee ${duration}s linear infinite;
                    min-width: 100%;
                }
                .ticker-content:hover {
                    animation-play-state: paused;
                }
            `}</style>
            <div className="ticker-content px-4">
                <span style={{ color: settings.tickerTextColor || '#f97316' }} className="font-bold text-sm md:text-base mx-4">
                    {settings.tickerText}
                </span>
            </div>
        </div>
    );
});

// --- HELPER COMPONENTS (Memoized) ---

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: number | string | boolean;
}

const SidebarItem = memo(({ icon, label, active, onClick, badge }: SidebarItemProps) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1.5 transition-all ${
            active 
            ? 'bg-brand-800 text-white font-bold shadow-md' 
            : 'text-brand-100 hover:bg-brand-800/50 hover:text-white font-medium'
        }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm md:text-[15px]">{label}</span>
        </div>
        {/* Updated Badge Logic for generic indicators */}
        {badge ? (
            <span className="bg-action-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                {badge === true ? '!' : badge}
            </span>
        ) : null}
    </button>
));

const MarketingCard = memo(({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
        <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 shrink-0">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-slate-800 text-sm md:text-[15px] mb-1.5">{title}</h4>
            <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed">{desc}</p>
        </div>
    </div>
));

// New B2B Info Card Component
const InfoCard = memo(({ icon, title, desc, colorClass = "bg-slate-50 text-brand-600", onClick }: { icon: React.ReactNode, title: string, desc: string, colorClass?: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 transition-all hover:border-brand-200 group h-full ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <h4 className={`font-bold text-slate-800 text-lg mb-2 ${onClick ? 'group-hover:text-brand-700' : ''}`}>{title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
));

// Flying Cart Item Animation Component
interface FlyingCartItemProps {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    onComplete: () => void;
}

const FlyingCartItem = memo(({ startX, startY, endX, endY, onComplete }: FlyingCartItemProps) => {
    const [position, setPosition] = useState({ x: startX, y: startY, scale: 1, opacity: 1 });
    
    useEffect(() => {
        // Start animation after mount
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

// Cart Icon with Badge Component
interface CartIconButtonProps {
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

const CartIconButton = memo(({ 
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
    
    // Report button element to parent
    useEffect(() => {
        onCartIconMount(buttonRef.current);
        return () => onCartIconMount(null);
    }, [onCartIconMount]);
    
    // Close dropdown when clicking outside
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
            
            {/* Cart Dropdown */}
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

// --- Extract Sidebar and Header for better memoization ---
const DashboardSidebar = memo(({ user, profile, view, onViewChange, onLogout, sidebarOpen, setSidebarOpen, t, tDynamic, remainingCredits, isRTL, isGuest, guestSettings, onGuestPageClick }: any) => {
    // RTL: sidebar on right, slides from right. LTR: sidebar on left, slides from left
    const sidebarPosition = isRTL ? 'right-0' : 'left-0';
    const sidebarTransform = isRTL 
        ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
        : (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0');
    
    return (
        <aside className={`fixed lg:static inset-y-0 ${sidebarPosition} w-72 bg-slate-900 text-white transform transition-transform duration-300 z-50 flex flex-col shadow-2xl lg:shadow-none ${sidebarTransform}`}>
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
                        <Box size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xl tracking-wide text-white">{t('siteName')}</h1>
                        <p className="text-[11px] text-slate-400 font-bold tracking-wider uppercase">Wholesale V2.5</p>
                    </div>
                </div>
                <button 
                    onClick={() => setSidebarOpen(false)} 
                    className="lg:hidden text-slate-400 hover:text-white p-2 -m-2 rounded-lg hover:bg-slate-800 transition-colors"
                    data-testid="button-close-sidebar"
                    aria-label="Close sidebar"
                >
                    <X size={24} />
                </button>
            </div>

            {/* User Info Card */}
            <div className="p-4">
                <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-brand-600/20 flex items-center justify-center text-brand-400 border border-brand-500/30 shrink-0">
                            <UserIcon size={20} strokeWidth={2} />
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="font-bold text-[15px] truncate text-slate-100">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate font-mono mt-0.5">{user.clientId}</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-3">
                            <p className="truncate font-bold mb-0.5">{profile.companyName}</p>
                            <p className="text-[10px] text-brand-400">{profile.city}</p>
                        </div>
                    )}
                    <div className="bg-brand-900/50 border border-brand-500/30 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-brand-200 uppercase font-bold mb-1">{t('sidebar.searchCredits')}</p>
                        <p className="text-xl font-mono font-bold text-white">
                            {user.searchLimit === 0 ? t('sidebar.unlimitedSearch') : remainingCredits}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
                <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">{t('sidebar.mainMenu')}</p>
                <SidebarItem icon={<LayoutDashboard size={20} />} label={tDynamic('sidebar.home', 'الرئيسية')} active={view === 'HOME'} onClick={() => onViewChange('HOME')} />
                
                {/* Orders Item: Checks for hasUnreadOrders flag - Guest check */}
                <SidebarItem 
                    icon={<Package size={20} />} 
                    label={tDynamic('sidebar.orders', 'سجل الطلبات')} 
                    active={view === 'ORDERS'} 
                    onClick={() => isGuest ? onGuestPageClick() : onViewChange('ORDERS')} 
                    badge={user.hasUnreadOrders ? true : undefined} 
                />
                
                {/* Quotes Item: Checks for hasUnreadQuotes flag - Guest check */}
                <SidebarItem 
                    icon={<Search size={20} />} 
                    label={tDynamic('sidebar.quotes', 'طلبات التسعير')} 
                    active={view === 'QUOTE_REQUEST'} 
                    onClick={() => isGuest ? onGuestPageClick() : onViewChange('QUOTE_REQUEST')} 
                    badge={user.hasUnreadQuotes ? true : undefined}
                />
                <SidebarItem icon={<Globe size={20} />} label={tDynamic('sidebar.import', 'الاستيراد من الصين')} active={view === 'IMPORT_CHINA'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('IMPORT_CHINA')} />
                <SidebarItem icon={<History size={20} />} label={tDynamic('sidebar.history', 'سجل البحث')} active={view === 'HISTORY'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('HISTORY')} />
                
                <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">{t('sidebar.management')}</p>
                <SidebarItem icon={<Building2 size={20} />} label={tDynamic('sidebar.organization', 'إدارة المنشأة')} active={view === 'ORGANIZATION'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('ORGANIZATION')} />
                
                <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">{t('sidebar.supportSection')}</p>
                <SidebarItem icon={<Headphones size={20} />} label={tDynamic('sidebar.support', 'عن الشركة / الدعم')} active={view === 'ABOUT'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('ABOUT')} />
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors">
                    <LogOut size={20} />
                    <span className="text-sm font-bold">{t('logout')}</span>
                </button>
            </div>
        </aside>
    );
});

const DashboardHeader = memo(({ 
    view, 
    setSidebarOpen, 
    user, 
    tDynamic, 
    t,
    isRTL,
    cart,
    cartTotal,
    onRemoveItem,
    onSubmitOrder,
    showCartDropdown,
    setShowCartDropdown,
    onCartIconMount
}: any) => {
    return (
        <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8 flex-shrink-0 z-30 shadow-sm gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                <button 
                    onClick={() => setSidebarOpen(true)} 
                    className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg shrink-0"
                    data-testid="button-open-sidebar"
                    aria-label="Open sidebar"
                >
                    <Menu size={22} />
                </button>
                <h2 className="text-base md:text-xl lg:text-2xl font-bold md:font-black text-slate-800 tracking-tight truncate">
                    {view === 'HOME' && tDynamic('sidebar.home', 'الرئيسية')}
                    {view === 'ORDERS' && tDynamic('sidebar.orders', 'سجل الطلبات')}
                    {view === 'QUOTE_REQUEST' && tDynamic('sidebar.quotes', 'طلبات التسعير')}
                    {view === 'IMPORT_CHINA' && tDynamic('sidebar.import', 'الاستيراد من الصين')}
                    {view === 'ORGANIZATION' && tDynamic('sidebar.organization', 'إدارة المنشأة')}
                    {view === 'HISTORY' && tDynamic('sidebar.history', 'سجل البحث')}
                    {view === 'ABOUT' && tDynamic('sidebar.support', 'عن الشركة / الدعم')}
                </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-slate-700">
                        <Clock size={16} />
                        <span>{formatDateTime(new Date().toISOString())}</span>
                    </div>
                    
                    {/* Cart Icon with Dropdown */}
                    <CartIconButton
                        cartCount={cart?.length || 0}
                        cartTotal={cartTotal || 0}
                        cart={cart || []}
                        onRemoveItem={onRemoveItem}
                        onSubmitOrder={onSubmitOrder}
                        showDropdown={showCartDropdown}
                        setShowDropdown={setShowCartDropdown}
                        onCartIconMount={onCartIconMount}
                        t={t}
                        isRTL={isRTL}
                    />
                    
                    <NotificationBell user={user} />
                    <LanguageSwitcher />
            </div>
        </header>
    );
});


export const Dashboard: React.FC<DashboardProps> = ({ user, profile, onLogout, onRefreshUser }) => {
    // Add IMPORT_CHINA to view state
    const [view, setView] = useState<'HOME' | 'ORDERS' | 'QUOTE_REQUEST' | 'ORGANIZATION' | 'ABOUT' | 'HISTORY' | 'IMPORT_CHINA'>('HOME');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    
    // Search States (Enhanced)
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [revealedSearchIds, setRevealedSearchIds] = useState<Set<string>>(new Set());
    
    // Search Pipeline States
    const [searchLoading, setSearchLoading] = useState(false);
    const [pipelineResult, setPipelineResult] = useState<PartSearchResult | null>(null);
    
    // History State
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

    // Sidebar Mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Duplicate Item Confirmation State
    const [duplicateConfirmation, setDuplicateConfirmation] = useState<{product: Product, quantity: number} | null>(null);

    // Order Success Modal State
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);

    // Price & Add to Cart Modal State
    const [priceModalProduct, setPriceModalProduct] = useState<Product | null>(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [priceLoading, setPriceLoading] = useState(false);

    // Flying Cart Animation State
    const [flyingItems, setFlyingItems] = useState<Array<{
        id: string;
        startX: number;
        startY: number;
        productName: string;
    }>>([]);
    const [cartIconElement, setCartIconElement] = useState<HTMLButtonElement | null>(null);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    
    // Callback for cart icon mount
    const handleCartIconMount = useCallback((element: HTMLButtonElement | null) => {
        setCartIconElement(element);
    }, []);
    
    // Guest Mode State - Show prompt when guest tries restricted action
    const [showGuestPrompt, setShowGuestPrompt] = useState(false);
    const isGuest = user.isGuest === true;
    
    // Guest Mode Settings Helper Functions
    const guestSettings = settings?.guestSettings;
    
    // Get blur class based on admin settings
    const getBlurClass = () => {
        if (!isGuest) return '';
        const intensity = guestSettings?.blurIntensity || 'medium';
        switch (intensity) {
            case 'light': return 'blur-sm'; // 4px
            case 'medium': return 'blur-md'; // 12px
            case 'heavy': return 'blur-lg'; // 16px
            default: return 'blur-md';
        }
    };
    
    // Check if section should be visible (even if blurred)
    const isSectionVisible = (section: 'businessTypes' | 'mainServices' | 'howItWorks' | 'whySiniCar' | 'cart' | 'marketingCards') => {
        if (!isGuest) return true;
        const settingsMap = {
            businessTypes: guestSettings?.showBusinessTypes,
            mainServices: guestSettings?.showMainServices,
            howItWorks: guestSettings?.showHowItWorks,
            whySiniCar: guestSettings?.showWhySiniCar,
            cart: guestSettings?.showCart,
            marketingCards: guestSettings?.showMarketingCards
        };
        return settingsMap[section] !== false; // Default to true if undefined
    };
    
    // Check if blur overlay should be shown
    const showBlurOverlay = isGuest && guestSettings?.showBlurOverlay !== false;

    const { t, tDynamic, dir } = useLanguage();
    const { addToast } = useToast();

    // Data Loading
    useEffect(() => {
        const loadData = async () => {
             const [ordersData, quotesData, productsData, settingsData] = await Promise.all([
                 MockApi.getOrders(user.id),
                 MockApi.getAllQuoteRequests(),
                 MockApi.searchProducts(''), // Fetch all for client-side search
                 MockApi.getSettings()
             ]);
             setOrders(ordersData);
             setQuoteRequests(quotesData.filter(q => q.userId === user.id));
             setAllProducts(productsData);
             setSettings(settingsData);
             
             // Load History
             setSearchHistory(MockApi.getSearchHistoryForUser(user.id));
        };
        loadData();
    }, [user.id, view]); // Reload when view changes to refresh data

    // Log Page View Logic
    useEffect(() => {
        MockApi.recordActivity({
            userId: user.id,
            userName: user.name,
            role: user.role,
            eventType: 'PAGE_VIEW',
            page: view,
            description: `${t('customerDashboard.pageView')} ${view}`
        });
    }, [view, user.id, user.name, user.role]);

    // Heartbeat for Online Status Tracking
    useEffect(() => {
        // Record initial heartbeat on mount
        MockApi.recordHeartbeat(user.id);
        
        // Update heartbeat every 60 seconds
        const heartbeatInterval = setInterval(() => {
            MockApi.recordHeartbeat(user.id);
        }, 60000);
        
        return () => clearInterval(heartbeatInterval);
    }, [user.id]);

    // Debounce Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle View Change Logic - Wrapped in Callback
    const handleSetView = useCallback(async (newView: typeof view) => {
        setView(newView);
        
        // Mark orders as read when viewing ORDERS
        if (newView === 'ORDERS' && user.hasUnreadOrders) {
             try {
                 await MockApi.markOrdersAsReadForUser(user.id);
                 onRefreshUser(); // Updates the user prop in App.tsx -> Dashboard
             } catch (e) {
                 console.error("Failed to mark orders as read", e);
             }
        }
        
        // Mark quotes as read when viewing QUOTE_REQUEST
        if (newView === 'QUOTE_REQUEST' && user.hasUnreadQuotes) {
            try {
                await MockApi.markQuotesAsReadForUser(user.id);
                onRefreshUser(); // Updates the user prop in App.tsx -> Dashboard
            } catch (e) {
                console.error("Failed to mark quotes as read", e);
            }
        }
    }, [user.hasUnreadOrders, user.hasUnreadQuotes, user.id, onRefreshUser]);

    // Track if we've already recorded a missing part for the current search
    const [missingRecorded, setMissingRecorded] = useState<string | null>(null);

    // Enhanced Search Logic (Memoized) - Apply minVisibleQty filter for customers
    const searchResults = useMemo(() => {
        if (debouncedSearchQuery.trim().length < 2) return [];
        const filteredProducts = filterProductsForCustomer(allProducts);
        const results = searchProducts(debouncedSearchQuery, filteredProducts);
        return results.slice(0, 8);
    }, [debouncedSearchQuery, allProducts]);

    // Reset pipeline result when search query changes
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setPipelineResult(null);
            setMissingRecorded(null);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (debouncedSearchQuery.trim().length >= 2) {
            setShowSearchDropdown(true);
        } else {
            setShowSearchDropdown(false);
        }
    }, [debouncedSearchQuery]);

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Block guests from searching
        if (isGuest) {
            setShowGuestPrompt(true);
            return;
        }
        
        const trimmedQuery = searchQuery.trim();
        
        if (trimmedQuery.length < 2) {
            addToast(t('customerDashboard.enterValidPartNumber'), 'warning');
            return;
        }
        
        setSearchLoading(true);
        setPipelineResult(null);
        
        try {
            const context = createSearchContext(user);
            const result = await handlePartSearch(trimmedQuery, context, 'heroSearch');
            setPipelineResult(result);
            
            if (result.type === 'NOT_FOUND') {
                addToast(result.message, 'info');
            } else if (result.type === 'FOUND_OUT_OF_STOCK') {
                addToast(result.message, 'warning');
            }
            
            setShowSearchDropdown(true);
        } catch (error) {
            console.error('Search error:', error);
            addToast(t('customerDashboard.unexpectedError'), 'error');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleRevealPrice = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        
        // Block guests from viewing prices
        if (isGuest) {
            setShowGuestPrompt(true);
            return;
        }
        
        // Reset quantity for new modal opening
        setModalQuantity(1);

        // Check local state or history first
        if (revealedSearchIds.has(product.id) || MockApi.hasRecentPriceView(user.id, product.id)) {
            setRevealedSearchIds(prev => new Set(prev).add(product.id));
            setPriceModalProduct(product); // Open Modal directly
            return;
        }

        setPriceLoading(true);

        try {
            // Attempt to consume credit
            await MockApi.incrementSearchUsage(user.id);
            await MockApi.logPriceView(user, product);
            
            // Update UI State
            setRevealedSearchIds(prev => new Set(prev).add(product.id));
            setPriceModalProduct(product); // Open Modal after success
            addToast(t('toast.creditDeducted', 'تم خصم نقطة واحدة لعرض السعر'), 'info');
            
            // Refresh User Context to update sidebar count
            onRefreshUser();

        } catch (error: any) {
            if (error.message === 'NO_POINTS_LEFT') {
                addToast(t('toast.noCreditsLeft', 'عذراً، لقد استهلكت جميع نقاط البحث المتاحة لليوم. يرجى التواصل مع الإدارة.'), 'error');
            } else {
                console.error(error);
                addToast(t('toast.priceRevealError', 'حدث خطأ أثناء عرض السعر'), 'error');
            }
        } finally {
            setPriceLoading(false);
        }
    };

    // Trigger flying animation for cart items
    const triggerFlyingAnimation = useCallback((product: Product, quantity: number, startElement?: HTMLElement | null) => {
        if (!cartIconElement) return;
        
        // Get start position (from button or center of screen)
        let startX = window.innerWidth / 2;
        let startY = window.innerHeight / 2;
        
        if (startElement) {
            const rect = startElement.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        }
        
        // Create multiple flying items based on quantity (max 5 for performance)
        const itemCount = Math.min(quantity, 5);
        const newItems: Array<{id: string; startX: number; startY: number; productName: string}> = [];
        
        for (let i = 0; i < itemCount; i++) {
            newItems.push({
                id: `${product.id}-${Date.now()}-${i}`,
                startX: startX + (Math.random() - 0.5) * 40, // Slight random offset
                startY: startY + (Math.random() - 0.5) * 40,
                productName: product.name
            });
        }
        
        // Stagger the animations
        newItems.forEach((item, index) => {
            setTimeout(() => {
                setFlyingItems(prev => [...prev, item]);
                
                // Remove item after animation completes
                setTimeout(() => {
                    setFlyingItems(prev => prev.filter(fi => fi.id !== item.id));
                }, 800);
            }, index * 100); // 100ms delay between each item
        });
    }, [cartIconElement]);

    const handleAddToCart = (product: Product, quantity: number, startElement?: HTMLElement | null) => {
        // Block guests from adding to cart
        if (isGuest) {
            setShowGuestPrompt(true);
            return;
        }
        
        const existingItem = cart.find(item => item.id === product.id);
        
        // Trigger flying animation
        triggerFlyingAnimation(product, quantity, startElement);
        
        if (existingItem) {
            setDuplicateConfirmation({ product, quantity });
        } else {
            setCart([...cart, { ...product, quantity }]);
            addToast(t('toast.addedToCart', 'تمت الإضافة للسلة'), 'success');
        }
    };

    // Called from the Price Modal
    const handleAddToCartFromModal = () => {
        if (priceModalProduct) {
            handleAddToCart(priceModalProduct, modalQuantity);
            setPriceModalProduct(null); // Close modal
            // We can also clear search if needed, but keeping it might be better for multiple adds
            // setSearchQuery(''); 
            // setShowSearchDropdown(false);
        }
    };

    const confirmDuplicateAdd = () => {
        if (!duplicateConfirmation) return;
        
        const { product, quantity } = duplicateConfirmation;
        setCart(cart.map(item => 
            item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
        addToast(t('toast.quantityUpdated', 'تم تحديث الكمية في السلة'), 'success');
        setDuplicateConfirmation(null);
        // If this came from the price modal, make sure it's closed
        setPriceModalProduct(null);
    };

    const handleRemoveFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const handleSubmitOrder = async () => {
        if (cart.length === 0) return;
        try {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.15;
            await MockApi.createOrder({
                userId: user.id,
                items: cart,
                totalAmount: total,
                branchId: user.branchId
            });
            setCart([]);
            
            // Show Success Modal and auto hide after 3 seconds
            setShowOrderSuccess(true);
            setTimeout(() => {
                setShowOrderSuccess(false);
            }, 3000);

            // Fetch updated orders silently to keep state fresh if they navigate later
            MockApi.getOrders(user.id).then(setOrders);

        } catch (e) {
            addToast(t('customerDashboard.orderSubmitError'), 'error');
        }
    };

    const remainingCredits = user.searchLimit === 0 ? '∞' : (user.searchLimit || 50) - (user.searchUsed || 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Get cart icon position for flying animation
    const getCartIconPosition = useCallback(() => {
        if (cartIconElement) {
            const rect = cartIconElement.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        return { x: window.innerWidth - 100, y: 50 };
    }, [cartIconElement]);

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden text-slate-800" dir={dir}>
            
            {/* Flying Cart Items Animation */}
            {flyingItems.map(item => {
                const endPos = getCartIconPosition();
                return (
                    <FlyingCartItem
                        key={item.id}
                        startX={item.startX}
                        startY={item.startY}
                        endX={endPos.x}
                        endY={endPos.y}
                        onComplete={() => setFlyingItems(prev => prev.filter(fi => fi.id !== item.id))}
                    />
                );
            })}
            
            {/* New First Time User Modal */}
            <UsageIntroModal />
            
            {/* Guest Restriction Modal - Professional Marketing Style */}
            <Modal isOpen={showGuestPrompt} onClose={() => setShowGuestPrompt(false)} maxWidth="max-w-lg">
                <div className="bg-white rounded-2xl p-6 md:p-8 w-full mx-auto space-y-6">
                    {/* Header with Logo */}
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200">
                            <Building2 size={40} className="text-white" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-800">
                            {t('guestMode.restrictedTitle')}
                        </h3>
                        <p className="text-brand-600 font-bold text-sm mt-1">
                            {t('guestMode.restrictedSubtitle')}
                        </p>
                    </div>

                    {/* Target Audience */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-slate-600 font-bold text-sm mb-3 text-center">
                            {t('guestMode.restrictedMessage')}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package size={16} className="text-blue-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{t('guestMode.targetAudience.partsStores')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <ShieldCheck size={16} className="text-green-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{t('guestMode.targetAudience.insuranceCompanies')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Car size={16} className="text-amber-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{t('guestMode.targetAudience.rentalCompanies')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Users size={16} className="text-purple-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-700">{t('guestMode.targetAudience.salesReps')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2">
                        <p className="text-slate-800 font-bold text-sm text-center">{t('guestMode.benefitsTitle')}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                <CheckCircle size={12} /> {t('guestMode.benefits.prices')}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                                <CheckCircle size={12} /> {t('guestMode.benefits.catalog')}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                                <CheckCircle size={12} /> {t('guestMode.benefits.orders')}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                                <CheckCircle size={12} /> {t('guestMode.benefits.support')}
                            </span>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl p-4 border border-brand-100 text-center">
                        <p className="text-slate-700 font-bold text-sm leading-relaxed">
                            {t('guestMode.callToAction')}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setShowGuestPrompt(false);
                                    onLogout();
                                }}
                                className="py-3 px-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
                                data-testid="button-guest-login"
                            >
                                <UserIcon size={18} />
                                {t('guestMode.loginButton')}
                            </button>
                            <button
                                onClick={() => {
                                    setShowGuestPrompt(false);
                                    onLogout();
                                }}
                                className="py-3 px-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                                data-testid="button-guest-request-account"
                            >
                                <FileText size={18} />
                                {t('guestMode.requestAccountButton')}
                            </button>
                        </div>
                        <button
                            onClick={() => setShowGuestPrompt(false)}
                            className="w-full py-2.5 px-6 bg-slate-100 text-slate-500 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
                            data-testid="button-guest-cancel"
                        >
                            {t('guestMode.browseOnly')}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Mobile Sidebar Overlay - Must be BEFORE sidebar in DOM but with lower z-index */}
            <div 
                className={`fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`} 
                onClick={() => setSidebarOpen(false)}
                aria-hidden={!sidebarOpen}
            ></div>

            {/* Sidebar (Memoized) */}
            <DashboardSidebar 
                user={user}
                profile={profile}
                view={view}
                onViewChange={handleSetView}
                onLogout={onLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                t={t}
                tDynamic={tDynamic}
                remainingCredits={remainingCredits}
                isRTL={dir === 'rtl'}
                isGuest={isGuest}
                guestSettings={settings?.guestSettings}
                onGuestPageClick={() => setShowGuestPrompt(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-100">
                
                <ClientTicker />

                {/* Top Header (Memoized) */}
                <DashboardHeader 
                    view={view}
                    setSidebarOpen={setSidebarOpen}
                    user={user}
                    tDynamic={tDynamic}
                    t={t}
                    isRTL={dir === 'rtl'}
                    cart={cart}
                    cartTotal={cartTotal}
                    onRemoveItem={handleRemoveFromCart}
                    onSubmitOrder={handleSubmitOrder}
                    showCartDropdown={showCartDropdown}
                    setShowCartDropdown={setShowCartDropdown}
                    onCartIconMount={handleCartIconMount}
                />

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    {/* Wider Container for all views */}
                    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 lg:py-8 h-full">

                        {view === 'HOME' && (
                             <div className="animate-fade-in flex flex-col gap-8">
                                
                                {/* Hero Marketing & Search */}
                                {/* UPDATED: Removed overflow-hidden from here to allow dropdown to overflow */}
                                <div className="relative w-full rounded-3xl bg-gradient-to-r from-[#081a33] to-[#102b57] px-6 py-8 md:px-10 md:py-12 text-center text-white shadow-xl isolate">
                                    {/* UPDATED: Added overflow-hidden here to contain the background blobs */}
                                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
                                         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-brand-600 rounded-full opacity-20 blur-3xl"></div>
                                         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-500 rounded-full opacity-10 blur-3xl"></div>
                                    </div>
                                    
                                    <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
                                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-white font-display">
                                            {t('customerDashboard.heroTitle')}
                                        </h1>
                                        <p className="text-slate-200 text-sm md:text-lg font-medium max-w-2xl mx-auto">
                                            {t('customerDashboard.heroSubtitle')}
                                        </p>
                                        
                                        {/* Prominent Search Bar */}
                                        <div className="relative max-w-2xl mx-auto mt-10 z-20">
                                            <div className="flex justify-center md:justify-end mb-3">
                                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40 backdrop-blur-sm shadow-sm">
                                                    <CheckCircle size={12} />
                                                    {t('customerDashboard.searchTip')}
                                                </div>
                                            </div>
                                            
                                            {/* Search is disabled for guests if allowSearch = false */}
                                            {isGuest && guestSettings?.allowSearch === false ? (
                                                <button
                                                    onClick={() => setShowGuestPrompt(true)}
                                                    className="w-full h-14 md:h-16 px-6 bg-white/90 text-slate-500 rounded-full shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-3 cursor-pointer hover:bg-white transition-colors"
                                                    data-testid="button-guest-search-disabled"
                                                >
                                                    <Lock size={20} className="text-brand-600" />
                                                    <span className="font-bold">{t('guestMode.searchDisabled')}</span>
                                                </button>
                                            ) : (
                                            <form onSubmit={handleSearchSubmit} className="relative group">
                                                <input 
                                                    type="text" 
                                                    className="w-full h-14 md:h-16 pr-16 pl-6 bg-white text-slate-900 rounded-full shadow-2xl shadow-slate-900/30 focus:ring-4 focus:ring-brand-500/30 border-0 text-base md:text-lg font-bold placeholder:text-slate-400 transition-all outline-none"
                                                    placeholder={t('customerDashboard.searchPlaceholder')}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <button 
                                                    type="submit"
                                                    className="absolute right-2 top-2 bottom-2 w-12 h-10 md:h-12 md:w-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                                                >
                                                    <Search size={22} />
                                                </button>
                                            </form>
                                            )}
                                            
                                            {/* Search Dropdown Results */}
                                            {showSearchDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => { setShowSearchDropdown(false); setPipelineResult(null); }}></div>
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-slide-up text-right max-h-[60vh] md:max-h-80 overflow-y-auto">
                                                        {searchLoading ? (
                                                            <div className="p-8 text-center">
                                                                <Loader2 size={32} className="animate-spin text-brand-600 mx-auto mb-3" />
                                                                <p className="text-sm font-bold text-slate-600">{t('customerDashboard.searching')}</p>
                                                            </div>
                                                        ) : pipelineResult?.type === 'FOUND_OUT_OF_STOCK' && pipelineResult.product ? (
                                                            <div className="p-5">
                                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                                                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                                                                        <PackageX size={20} />
                                                                        <span className="font-bold">{t('customerDashboard.outOfStockMessage')}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                                    <div className="p-3 bg-slate-200 rounded-xl text-slate-600">
                                                                        <Box size={24} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-bold text-slate-800 text-base">{pipelineResult.product.name}</p>
                                                                        <p className="text-sm text-slate-500 font-mono mt-1">
                                                                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">{pipelineResult.product.partNumber}</span>
                                                                            {pipelineResult.product.brand && <span className="mr-2">| {pipelineResult.product.brand}</span>}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                                                                        {t('customerDashboard.outOfStock')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : pipelineResult?.type === 'NOT_FOUND' ? (
                                                            <div className="p-6 text-center">
                                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 text-amber-500 rounded-full mb-4">
                                                                    <AlertTriangle size={32} />
                                                                </div>
                                                                <h4 className="text-lg font-bold text-slate-800 mb-2">{t('customerDashboard.partNotAvailable')}</h4>
                                                                <p className="text-sm text-slate-600">
                                                                    {t('customerDashboard.noResultsFor')} <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">"{searchQuery}"</span>
                                                                </p>
                                                            </div>
                                                        ) : searchResults.length > 0 ? (
                                                            <div className="relative">
                                                                {/* Guest Blur Overlay - controlled by admin settings */}
                                                                {isGuest && guestSettings?.showSearchResults !== false && showBlurOverlay && (
                                                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                                                                        <div className="text-center p-6">
                                                                            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                                <Lock size={28} className="text-brand-600" />
                                                                            </div>
                                                                            <h4 className="font-bold text-slate-800 mb-2">{t('guestMode.restrictedTitle')}</h4>
                                                                            <p className="text-sm text-slate-500 mb-4">{t('guestMode.blurredResultsNote')}</p>
                                                                            <button
                                                                                onClick={() => setShowGuestPrompt(true)}
                                                                                className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 mx-auto"
                                                                                data-testid="button-guest-overlay-login"
                                                                            >
                                                                                <UserIcon size={16} />
                                                                                {t('guestMode.loginButton')}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className={`divide-y divide-slate-100 ${isGuest && guestSettings?.showSearchResults !== false ? `${getBlurClass()} pointer-events-none select-none` : ''}`}>
                                                                {searchResults.map(product => {
                                                                    const isRevealed = revealedSearchIds.has(product.id) || MockApi.hasRecentPriceView(user.id, product.id);
                                                                    const qty = product.qtyTotal ?? product.stock ?? 0;
                                                                    const minVisible = MockApi.getMinVisibleQty();
                                                                    const isOutOfStock = qty <= 0;
                                                                    
                                                                    return (
                                                                        <div 
                                                                            key={product.id}
                                                                            className="w-full text-right p-3 md:p-4 hover:bg-brand-50 flex flex-col md:flex-row md:items-center md:justify-between group transition-colors cursor-default gap-2 md:gap-4"
                                                                        >
                                                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                                                <div className="p-2 md:p-2.5 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-white group-hover:text-brand-600 border border-slate-200 shrink-0">
                                                                                    <Box size={18} className="md:w-5 md:h-5" />
                                                                                </div>
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-brand-700 truncate">{product.name}</p>
                                                                                    <p className="text-xs md:text-sm text-slate-500 font-mono mt-0.5 flex flex-wrap items-center gap-1 md:gap-2">
                                                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold">{product.partNumber}</span>
                                                                                        <span className="text-slate-400 hidden md:inline">|</span>
                                                                                        <span className="text-xs">{product.brand}</span>
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center gap-3">
                                                                                <span className={`text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full border ${!isOutOfStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                                                    {!isOutOfStock ? t('customerDashboard.available') : t('customerDashboard.outOfStock')}
                                                                                </span>

                                                                                {isOutOfStock ? (
                                                                                    <span className="text-xs text-slate-400 font-bold">{t('customerDashboard.priceNotAvailable')}</span>
                                                                                ) : isRevealed ? (
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="flex flex-col items-end px-2">
                                                                                            <span className="text-sm font-black text-slate-900">{product.priceWholesale || product.price} {t('customerDashboard.sar')}</span>
                                                                                        </div>
                                                                                        <button 
                                                                                            onClick={(e) => handleRevealPrice(e, product)}
                                                                                            className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 shadow-sm"
                                                                                            title={t('customerDashboard.addToCart')}
                                                                                        >
                                                                                            <ShoppingBag size={16} />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <button 
                                                                                        onClick={(e) => handleRevealPrice(e, product)}
                                                                                        className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                                                                                        title={t('customerDashboard.showPrice')}
                                                                                    >
                                                                                        <Eye size={14} /> <span className="hidden sm:inline">{t('customerDashboard.showPrice')}</span>
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                                </div>
                                                            </div>
                                                        ) : debouncedSearchQuery.trim().length >= 2 ? (
                                                            <div className="p-6 text-center">
                                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-400 rounded-full mb-4">
                                                                    <Search size={32} />
                                                                </div>
                                                                <h4 className="text-lg font-bold text-slate-800 mb-2">{t('customerDashboard.noResults')}</h4>
                                                                <p className="text-sm text-slate-600">
                                                                    {t('customerDashboard.pressSearch')} <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">"{searchQuery}"</span>
                                                                </p>
                                                            </div>
                                                        ) : null}
                                                        {(searchResults.length > 0 || pipelineResult?.type === 'FOUND_AVAILABLE') && (
                                                            <div className="bg-slate-50 p-2.5 text-center text-xs font-bold text-slate-500 border-t border-slate-100 sticky bottom-0">
                                                                {t('customerDashboard.addToCartTip')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                                    {/* Left Content: Corporate Info Sections (Instead of Products) */}
                                    <div className="xl:col-span-3 space-y-12">
                                        
                                        {/* Section: Who We Serve - Blurred for Guest (controlled by admin settings) */}
                                        {isSectionVisible('businessTypes') && (
                                        <section className="relative">
                                            {showBlurOverlay && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                                                    <button 
                                                        onClick={() => setShowGuestPrompt(true)}
                                                        className="flex flex-col items-center gap-3 p-6 bg-white/90 rounded-2xl shadow-xl border border-brand-100 hover:shadow-2xl transition-all"
                                                        data-testid="button-guest-section-cta"
                                                    >
                                                        <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center">
                                                            <Lock size={24} className="text-brand-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-800">{t('guestMode.restrictedTitle')}</span>
                                                        <span className="text-sm text-slate-500">{t('guestMode.loginToAccess')}</span>
                                                    </button>
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1 mb-6">
                                                <Users className="text-brand-600" size={24}/>
                                                {t('customerDashboard.whoWeServe')}
                                            </h3>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isGuest ? `${getBlurClass()} pointer-events-none select-none` : ''}`}>
                                                <InfoCard 
                                                    icon={<Building2 size={24}/>}
                                                    title={t('customerDashboard.partsStores')}
                                                    desc={t('customerDashboard.partsStoresDesc')}
                                                    colorClass="bg-blue-50 text-blue-600"
                                                />
                                                <InfoCard 
                                                    icon={<ShieldCheck size={24}/>}
                                                    title={t('customerDashboard.insuranceCompanies')}
                                                    desc={t('customerDashboard.insuranceDesc')}
                                                    colorClass="bg-green-50 text-green-600"
                                                />
                                                <InfoCard 
                                                    icon={<Car size={24}/>}
                                                    title={t('customerDashboard.rentalCompanies')}
                                                    desc={t('customerDashboard.rentalDesc')}
                                                    colorClass="bg-amber-50 text-amber-600"
                                                />
                                                <InfoCard 
                                                    icon={<Briefcase size={24}/>}
                                                    title={t('customerDashboard.salesReps')}
                                                    desc={t('customerDashboard.salesRepsDesc')}
                                                    colorClass="bg-purple-50 text-purple-600"
                                                />
                                            </div>
                                        </section>
                                        )}

                                        {/* Section: Key Services - Blurred for Guest (controlled by admin settings) */}
                                        {isSectionVisible('mainServices') && (
                                        <section className="relative">
                                            {showBlurOverlay && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                                                    <button 
                                                        onClick={() => setShowGuestPrompt(true)}
                                                        className="flex flex-col items-center gap-3 p-6 bg-white/90 rounded-2xl shadow-xl border border-brand-100 hover:shadow-2xl transition-all"
                                                        data-testid="button-guest-services-cta"
                                                    >
                                                        <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center">
                                                            <Lock size={24} className="text-brand-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-800">{t('guestMode.restrictedTitle')}</span>
                                                        <span className="text-sm text-slate-500">{t('guestMode.loginToAccess')}</span>
                                                    </button>
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1 mb-6">
                                                <Briefcase className="text-brand-600" size={24}/>
                                                {t('customerDashboard.mainServices')}
                                            </h3>
                                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isGuest ? `${getBlurClass()} pointer-events-none select-none` : ''}`}>
                                                <InfoCard 
                                                    onClick={() => isGuest ? setShowGuestPrompt(true) : handleSetView('QUOTE_REQUEST')}
                                                    icon={<FileSpreadsheet size={28}/>}
                                                    title={t('customerDashboard.quoteRequests')}
                                                    desc={t('customerDashboard.quoteRequestsDesc')}
                                                    colorClass="bg-slate-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors"
                                                />
                                                <InfoCard 
                                                    onClick={() => isGuest ? setShowGuestPrompt(true) : handleSetView('IMPORT_CHINA')}
                                                    icon={<Globe size={28}/>}
                                                    title={t('customerDashboard.importFromChina')}
                                                    desc={t('customerDashboard.importFromChinaDesc')}
                                                    colorClass="bg-slate-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors"
                                                />
                                                <InfoCard 
                                                    onClick={() => isGuest ? setShowGuestPrompt(true) : handleSetView('ORDERS')}
                                                    icon={<Package size={28}/>}
                                                    title={t('customerDashboard.wholesaleOrders')}
                                                    desc={t('customerDashboard.wholesaleOrdersDesc')}
                                                    colorClass="bg-slate-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors"
                                                />
                                                <InfoCard 
                                                    onClick={() => isGuest ? setShowGuestPrompt(true) : handleSetView('ORGANIZATION')}
                                                    icon={<Users size={28}/>}
                                                    title={t('customerDashboard.staffBranches')}
                                                    desc={t('customerDashboard.staffBranchesDesc')}
                                                    colorClass="bg-slate-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors"
                                                />
                                            </div>
                                        </section>
                                        )}

                                        {/* Section: How it Works (controlled by admin settings) */}
                                        {isSectionVisible('howItWorks') && (
                                        <section className={`bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative ${isGuest ? `${getBlurClass()} select-none` : ''}`}>
                                            {showBlurOverlay && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-3xl">
                                                    <button 
                                                        onClick={() => setShowGuestPrompt(true)}
                                                        className="flex flex-col items-center gap-3 p-6 bg-white/90 rounded-2xl shadow-xl border border-brand-100 hover:shadow-2xl transition-all"
                                                        data-testid="button-guest-howitworks-cta"
                                                    >
                                                        <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center">
                                                            <Lock size={24} className="text-brand-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-800">{t('guestMode.restrictedTitle')}</span>
                                                        <span className="text-sm text-slate-500">{t('guestMode.loginToAccess')}</span>
                                                    </button>
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-8">
                                                <TrendingUp className="text-brand-600" size={24}/>
                                                {t('customerDashboard.howItWorks')}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                                                {/* Connecting Line (Desktop) */}
                                                <div className="hidden md:block absolute top-12 left-10 right-10 h-1 bg-slate-100 -z-0"></div>
                                                
                                                <div className="relative z-10 flex flex-col items-center text-center">
                                                    <div className="w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-brand-600 mb-4 shadow-sm">
                                                        <Users size={32} />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 mb-2">1. {t('customerDashboard.step1Title')}</h4>
                                                    <p className="text-sm text-slate-500">{t('customerDashboard.step1Desc')}</p>
                                                </div>

                                                <div className="relative z-10 flex flex-col items-center text-center">
                                                    <div className="w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-brand-600 mb-4 shadow-sm">
                                                        <ShieldCheck size={32} />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 mb-2">2. {t('customerDashboard.step2Title')}</h4>
                                                    <p className="text-sm text-slate-500">{t('customerDashboard.step2Desc')}</p>
                                                </div>

                                                <div className="relative z-10 flex flex-col items-center text-center">
                                                    <div className="w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-brand-600 mb-4 shadow-sm">
                                                        <Search size={32} />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 mb-2">3. {t('customerDashboard.step3Title')}</h4>
                                                    <p className="text-sm text-slate-500">{t('customerDashboard.step3Desc')}</p>
                                                </div>

                                                <div className="relative z-10 flex flex-col items-center text-center">
                                                    <div className="w-24 h-24 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-brand-600 mb-4 shadow-sm">
                                                        <Truck size={32} />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 mb-2">4. {t('customerDashboard.step4Title')}</h4>
                                                    <p className="text-sm text-slate-500">{t('customerDashboard.step4Desc')}</p>
                                                </div>
                                            </div>
                                        </section>
                                        )}
                                        
                                        {/* Section: Why Sini Car (controlled by admin settings) */}
                                        {isSectionVisible('whySiniCar') && (
                                        <section className={`relative ${isGuest ? `${getBlurClass()} select-none` : ''}`}>
                                            {showBlurOverlay && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                                                    <button 
                                                        onClick={() => setShowGuestPrompt(true)}
                                                        className="flex flex-col items-center gap-3 p-6 bg-white/90 rounded-2xl shadow-xl border border-brand-100 hover:shadow-2xl transition-all"
                                                        data-testid="button-guest-whysinicar-cta"
                                                    >
                                                        <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center">
                                                            <Lock size={24} className="text-brand-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-800">{t('guestMode.restrictedTitle')}</span>
                                                        <span className="text-sm text-slate-500">{t('guestMode.loginToAccess')}</span>
                                                    </button>
                                                </div>
                                            )}
                                             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 px-1 mb-6">
                                                <CheckCircle className="text-brand-600" size={24}/>
                                                {settings?.whySiniCarTitle || t('customerDashboard.whySiniCar')}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {(settings?.whySiniCarFeatures || [
                                                    { id: '1', title: t('customerDashboard.expertiseTitle'), description: t('customerDashboard.expertiseDesc'), icon: 'box', iconColor: 'text-cyan-400' },
                                                    { id: '2', title: t('customerDashboard.techTitle'), description: t('customerDashboard.techDesc'), icon: 'chart', iconColor: 'text-green-400' },
                                                    { id: '3', title: t('customerDashboard.globalTitle'), description: t('customerDashboard.globalDesc'), icon: 'anchor', iconColor: 'text-amber-400' },
                                                    { id: '4', title: t('customerDashboard.supportTitle'), description: t('customerDashboard.supportDesc'), icon: 'headphones', iconColor: 'text-purple-400' }
                                                ]).map((feature) => (
                                                    <div key={feature.id} className="bg-slate-800 text-white p-6 rounded-2xl shadow-md">
                                                        <div className={`mb-4 ${feature.iconColor}`}>
                                                            {feature.icon === 'box' && <Box size={32} />}
                                                            {feature.icon === 'chart' && <BarChart3 size={32} />}
                                                            {feature.icon === 'anchor' && <Anchor size={32} />}
                                                            {feature.icon === 'headphones' && <Headphones size={32} />}
                                                            {feature.icon === 'truck' && <Truck size={32} />}
                                                            {feature.icon === 'shield' && <ShieldCheck size={32} />}
                                                            {feature.icon === 'globe' && <Globe size={32} />}
                                                            {feature.icon === 'star' && <TrendingUp size={32} />}
                                                            {feature.icon === 'clock' && <Clock size={32} />}
                                                            {feature.icon === 'award' && <Check size={32} />}
                                                        </div>
                                                        <h4 className="font-bold mb-2">{feature.title}</h4>
                                                        <p className="text-xs text-slate-300">{feature.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                        )}

                                    </div>

                                    {/* Right Content: Compact Cart (controlled by admin settings) */}
                                    <div className="xl:col-span-1 space-y-6 sticky top-6">
                                        {isSectionVisible('cart') && (
                                        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative ${isGuest ? `${getBlurClass()} select-none` : ''}`}>
                                            {showBlurOverlay && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                                                    <button 
                                                        onClick={() => setShowGuestPrompt(true)}
                                                        className="flex flex-col items-center gap-2 p-4 bg-white/90 rounded-xl shadow-lg border border-brand-100 hover:shadow-xl transition-all"
                                                        data-testid="button-guest-cart-cta"
                                                    >
                                                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                                                            <Lock size={20} className="text-brand-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-800 text-sm">{t('guestMode.restrictedTitle')}</span>
                                                    </button>
                                                </div>
                                            )}
                                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                                <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                                                    <ShoppingCart className="text-brand-600" size={20} />
                                                    {t('customerDashboard.wholesaleCart')}
                                                </h3>
                                                <span className="bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{cart.length}</span>
                                            </div>
                                            
                                            <div className="max-h-[350px] overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[180px]">
                                                {cart.length > 0 ? cart.map(item => (
                                                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 group hover:border-brand-200 transition-colors shadow-sm">
                                                        <div className="w-9 h-9 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                                                            {item.quantity}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-800 text-xs md:text-sm truncate" title={item.name}>{item.name}</h4>
                                                            <p className="text-[11px] text-slate-500 font-mono truncate font-semibold mt-0.5">{item.partNumber}</p>
                                                        </div>
                                                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-center py-10 text-slate-400">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                            <ShoppingCart size={32} className="opacity-30" />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-500">{t('customerDashboard.emptyCart')}</p>
                                                        <p className="text-xs opacity-70 mt-1">{t('customerDashboard.useSearchToAdd')}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {cart.length > 0 && (
                                                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                                                    <div className="flex justify-between text-sm font-bold text-slate-700">
                                                        <span>{t('customerDashboard.estimatedTotal')}</span>
                                                        <span className="font-black text-slate-900">{cartTotal.toLocaleString()} {t('customerDashboard.sar')}</span>
                                                    </div>
                                                    <button 
                                                        onClick={handleSubmitOrder}
                                                        className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 shadow-md shadow-brand-200 transition-all flex justify-center items-center gap-2"
                                                    >
                                                        <CheckCircle size={18} />
                                                        {t('customerDashboard.submitOrder')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        )}

                                        {/* Quick Info Cards (controlled by admin settings) */}
                                        {isSectionVisible('marketingCards') && (
                                        <div className={`space-y-4 relative ${isGuest ? `${getBlurClass()} select-none` : ''}`}>
                                            {showBlurOverlay && (
                                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
                                                    <button 
                                                        onClick={() => setShowGuestPrompt(true)}
                                                        className="flex flex-col items-center gap-2 p-4 bg-white/90 rounded-xl shadow-lg border border-brand-100 hover:shadow-xl transition-all"
                                                        data-testid="button-guest-marketing-cta"
                                                    >
                                                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                                                            <Lock size={20} className="text-brand-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-800 text-sm">{t('guestMode.restrictedTitle')}</span>
                                                    </button>
                                                </div>
                                            )}
                                            <MarketingCard 
                                                icon={<Truck className="text-blue-600" size={24}/>}
                                                title={t('customerDashboard.fastShipping')}
                                                desc={t('customerDashboard.fastShippingDesc')}
                                            />
                                            <MarketingCard 
                                                icon={<Headphones className="text-purple-600" size={24}/>}
                                                title={t('customerDashboard.techSupport')}
                                                desc={t('customerDashboard.techSupportDesc')}
                                            />
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {view === 'ORDERS' && <OrdersPage orders={orders} quoteRequests={quoteRequests} />}
                        {view === 'QUOTE_REQUEST' && <QuoteRequestPage user={user} onSuccess={() => {}} />}
                        {view === 'IMPORT_CHINA' && <ImportFromChinaPage user={user} userProfile={profile} />}
                        {view === 'ORGANIZATION' && <OrganizationPage user={user} mainProfileUserId={user.role === 'CUSTOMER_STAFF' ? user.parentId! : user.id} />}
                        {view === 'ABOUT' && <AboutPage />}
                        {view === 'HISTORY' && (
                            <div className="animate-fade-in">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <History className="text-brand-600" /> {t('customerDashboard.searchHistory')}
                                </h2>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    {searchHistory.length > 0 ? (
                                        <table className="w-full text-right text-sm">
                                            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-5">{t('customerDashboard.partNumber')}</th>
                                                    <th className="p-5">{t('customerDashboard.productName')}</th>
                                                    <th className="p-5">{t('customerDashboard.viewDate')}</th>
                                                    <th className="p-5">{t('customerDashboard.recordedPrice')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {searchHistory.map(item => (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-5 font-mono font-bold text-brand-600 text-base">{item.partNumber}</td>
                                                        <td className="p-5 font-bold text-slate-800">{item.productName}</td>
                                                        <td className="p-5 text-slate-600 font-medium">
                                                            {formatDateTime(item.viewedAt)}
                                                        </td>
                                                        <td className="p-5 font-black text-slate-900">{item.priceSnapshot} {t('customerDashboard.sar')}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-16 text-center text-slate-400">
                                            <History size={64} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold text-lg text-slate-500">{t('customerDashboard.noSearchHistory')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- ORDER SUCCESS MODAL --- */}
            <Modal
                isOpen={showOrderSuccess}
                onClose={() => setShowOrderSuccess(false)}
                title={t('customerDashboard.orderSuccess.title')}
                maxWidth="max-w-md"
            >
                <div className="text-center p-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-sm animate-bounce">
                        <CheckCircle size={40} strokeWidth={3} />
                    </div>
                    <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
                        {t('customerDashboard.orderSuccess.message')}
                    </p>
                     <button 
                        onClick={() => setShowOrderSuccess(false)}
                        className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        {t('common.confirm')}
                    </button>
                </div>
            </Modal>

            {/* --- PRICE & ADD TO CART MODAL (NEW) --- */}
            {priceModalProduct && (
                <Modal
                    isOpen={!!priceModalProduct}
                    onClose={() => setPriceModalProduct(null)}
                    title={t('customerDashboard.priceModal.productDetails')}
                    maxWidth="max-w-md"
                >
                    <div className="text-center p-3 md:p-4">
                        <div className="mb-4 md:mb-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 mx-auto mb-3 md:mb-4 border border-slate-100">
                                <Box size={32} className="md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug px-2">{priceModalProduct.name}</h3>
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                                <span className="text-xs md:text-sm text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{priceModalProduct.partNumber}</span>
                                <span className="text-xs text-brand-600 font-bold uppercase border border-brand-200 px-2 py-0.5 rounded bg-brand-50">{priceModalProduct.brand}</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 mb-4 md:mb-6">
                             <div className="mb-2 text-slate-500 font-bold text-xs uppercase tracking-wider">{t('customerDashboard.priceModal.wholesalePrice')}</div>
                             <div className="text-3xl md:text-4xl font-black text-slate-900">{priceModalProduct.price} <span className="text-base md:text-lg text-slate-500 font-bold">{t('customerDashboard.sar')}</span></div>
                             {priceModalProduct.stock > 0 ? (
                                 <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                     <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                                     {t('customerDashboard.available')}
                                 </div>
                             ) : (
                                 <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                     <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                     {t('customerDashboard.outOfStock')}
                                 </div>
                             )}
                        </div>

                        <div className="mb-4 md:mb-6">
                             <div className="flex items-center justify-center border border-slate-300 rounded-xl h-11 md:h-12 bg-white w-40 md:w-48 mx-auto shadow-sm overflow-hidden">
                                <button 
                                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))} 
                                    data-testid="button-quantity-decrease"
                                    className="w-10 md:w-12 h-full flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-slate-50 border-l border-slate-200 transition-colors"
                                >
                                    <Minus size={18} />
                                </button>
                                <div className="flex-1 flex items-center justify-center font-black text-base md:text-lg text-slate-800" data-testid="text-quantity-value">
                                    {modalQuantity}
                                </div>
                                <button 
                                    onClick={() => setModalQuantity(modalQuantity + 1)} 
                                    data-testid="button-quantity-increase"
                                    className="w-10 md:w-12 h-full flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-slate-50 border-r border-slate-200 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3">
                            <button
                                onClick={() => setPriceModalProduct(null)}
                                data-testid="button-modal-close"
                                className="w-full md:flex-1 py-3 md:py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                {t('customerDashboard.priceModal.close')}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCartFromModal();
                                }}
                                disabled={priceModalProduct.stock === 0}
                                data-testid="button-modal-add-to-cart"
                                className={`w-full md:flex-1 py-3 md:py-3.5 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-colors ${
                                    priceModalProduct.stock > 0 
                                    ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-200' 
                                    : 'bg-slate-300 cursor-not-allowed shadow-none'
                                }`}
                            >
                                <ShoppingCart size={18} />
                                {t('customerDashboard.priceModal.addToCart')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* --- DUPLICATE ITEM CONFIRMATION MODAL --- */}
            {duplicateConfirmation && (
                <Modal
                    isOpen={!!duplicateConfirmation}
                    onClose={() => setDuplicateConfirmation(null)}
                    title={t('customerDashboard.duplicateConfirm.title')}
                    maxWidth="max-w-md"
                >
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 animate-bounce">
                            <AlertTriangle size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3">
                            {t('customerDashboard.duplicateConfirm.title')}
                        </h3>
                        <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                            {t('customerDashboard.duplicateConfirm.message')}
                            <span className="font-black text-slate-900 mx-1 block my-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
                                {duplicateConfirmation.product.name}
                            </span>
                            (<span className="font-bold text-brand-600 mx-1">{duplicateConfirmation.quantity}</span>)
                        </p>
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setDuplicateConfirmation(null)}
                                className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                {t('customerDashboard.duplicateConfirm.cancel')}
                            </button>
                            <button
                                onClick={confirmDuplicateAdd}
                                className="flex-1 py-3.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-colors"
                            >
                                {t('customerDashboard.duplicateConfirm.confirm')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};