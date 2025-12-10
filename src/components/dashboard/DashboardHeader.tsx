import { memo } from 'react';
import { Menu } from 'lucide-react';
import { LanguageSwitcher } from '../../services/LanguageContext';
import { NotificationBell } from '../NotificationBell';
import { CartIconButton } from './CartIconButton';
import { CartItem } from '../../types';

export interface DashboardHeaderProps {
    view: string;
    setSidebarOpen: (open: boolean) => void;
    user: any;
    profile: any;
    tDynamic: (key: string, fallback?: string) => string;
    t: (key: string, fallback?: string) => string;
    isRTL: boolean;
    cart: CartItem[];
    cartTotal: number;
    onRemoveItem: (id: string) => void;
    onSubmitOrder: () => void;
    showCartDropdown: boolean;
    setShowCartDropdown: (show: boolean) => void;
    onCartIconMount: (element: HTMLButtonElement | null) => void;
    onViewAllNotifications: () => void;
}

export const DashboardHeader = memo(({ 
    view, 
    setSidebarOpen, 
    user, 
    profile,
    tDynamic, 
    t,
    isRTL,
    cart,
    cartTotal,
    onRemoveItem,
    onSubmitOrder,
    showCartDropdown,
    setShowCartDropdown,
    onCartIconMount,
    onViewAllNotifications
}: DashboardHeaderProps) => {
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
                    {view === 'TRADER_TOOLS' && tDynamic('sidebar.traderTools', 'أدوات التاجر')}
                    {view === 'TOOLS_HISTORY' && tDynamic('sidebar.toolsHistory', 'سجل الأدوات')}
                    {view === 'PRODUCT_SEARCH' && tDynamic('sidebar.productSearch', 'بحث المنتجات')}
                    {view === 'ALTERNATIVES' && tDynamic('sidebar.alternatives', 'بدائل الأصناف')}
                    {view === 'ORGANIZATION' && tDynamic('sidebar.organization', 'إدارة المنشأة')}
                    {view === 'TEAM_MANAGEMENT' && tDynamic('sidebar.teamManagement', 'إدارة الفريق')}
                    {view === 'HISTORY' && tDynamic('sidebar.history', 'سجل البحث')}
                    {view === 'ABOUT' && tDynamic('sidebar.support', 'عن الشركة / الدعم')}
                    {view === 'NOTIFICATIONS' && tDynamic('sidebar.notifications', 'الإشعارات')}
                </h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <LanguageSwitcher />
                {user?.id && (
                    <NotificationBell 
                        user={user} 
                        onViewAll={onViewAllNotifications}
                    />
                )}
                <CartIconButton 
                    cartCount={cart.length}
                    cartTotal={cartTotal}
                    cart={cart}
                    onRemoveItem={onRemoveItem}
                    onSubmitOrder={onSubmitOrder}
                    showDropdown={showCartDropdown}
                    setShowDropdown={setShowCartDropdown}
                    onCartIconMount={onCartIconMount}
                    t={t}
                    isRTL={isRTL}
                />
            </div>
        </header>
    );
});
