import React, { memo } from 'react';
import { 
    LayoutDashboard, Users, User as UserIcon, Package, LogOut, Search, 
    Box, ChevronLeft, Building2, X, Globe, Clock, History, Headphones,
    Wrench, Layers
} from 'lucide-react';

export interface CollapsibleSidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: number | string | boolean;
    collapsed: boolean;
}

export const CollapsibleSidebarItem = memo(({ icon, label, active, onClick, badge, collapsed }: CollapsibleSidebarItemProps) => (
    <button 
        onClick={onClick} 
        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3.5 rounded-2xl mb-2 transition-all duration-300 group relative overflow-hidden ${
            active 
            ? 'bg-gradient-to-l from-brand-600 to-brand-700 text-white font-bold shadow-lg shadow-brand-900/40 scale-[1.02]' 
            : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium hover:scale-[1.01]'
        }`}
        title={collapsed ? label : undefined}
    >
        {active && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50"></div>
        )}
        <div className={`flex items-center relative z-10 ${collapsed ? '' : 'gap-3.5'}`}>
            <span className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</span>
            {!collapsed && <span className="text-sm md:text-[15px] truncate tracking-wide">{label}</span>}
        </div>
        {badge && !collapsed && (
            <span className="bg-gradient-to-r from-action-500 to-action-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center justify-center min-w-[22px] shadow-md shadow-action-500/30 animate-bounce relative z-10">
                {badge === true ? '!' : badge}
            </span>
        )}
        {badge && collapsed && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-r from-action-500 to-red-500 rounded-full animate-pulse shadow-lg shadow-action-500/50"></span>
        )}
        {collapsed && (
            <div className="absolute left-full ml-3 px-4 py-2.5 bg-slate-800/95 backdrop-blur-sm text-white text-sm font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl border border-slate-700/50">
                {label}
                {badge && <span className="mr-2 text-action-400 font-black">({badge === true ? '!' : badge})</span>}
            </div>
        )}
    </button>
));

export interface DashboardSidebarProps {
    user: any;
    profile: any;
    view: string;
    onViewChange: (view: string) => void;
    onLogout: () => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    t: (key: string, fallback?: string) => string;
    tDynamic: (key: string, fallback?: string) => string;
    remainingCredits: number;
    isRTL: boolean;
    isGuest: boolean;
    guestSettings: any;
    onGuestPageClick: () => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    hasPermission: (key: string) => boolean;
    isOwner: boolean;
}

export const DashboardSidebar = memo(({ 
    user, profile, view, onViewChange, onLogout, sidebarOpen, setSidebarOpen, 
    t, tDynamic, remainingCredits, isRTL, isGuest, guestSettings, onGuestPageClick, 
    collapsed, setCollapsed, hasPermission, isOwner 
}: DashboardSidebarProps) => {
    const canAccessFeature = (permissionKey: string): boolean => {
        if (isOwner) return true;
        if (user.role === 'CUSTOMER' && !user.parentId) return true;
        return hasPermission ? hasPermission(permissionKey) : false;
    };
    
    const sidebarPosition = isRTL ? 'right-0' : 'left-0';
    const sidebarTransform = isRTL 
        ? (sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
        : (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0');
    
    const sidebarWidth = collapsed ? 'w-20' : 'w-72';
    const sidebarPointerEvents = sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none lg:pointer-events-auto';
    
    return (
        <aside className={`fixed lg:static inset-y-0 ${sidebarPosition} ${sidebarWidth} bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950 text-white transform transition-all duration-300 z-50 flex flex-col shadow-2xl lg:shadow-xl ${sidebarTransform} ${sidebarPointerEvents}`}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-600/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-0 w-32 h-32 bg-action-500/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className={`relative p-4 ${collapsed ? 'px-3' : 'p-5'} border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed ? (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 ring-2 ring-white/20">
                                <Box size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="font-display font-black text-xl tracking-wide text-white">{t('siteName')}</h1>
                                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">B2B Wholesale</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSidebarOpen(false)} 
                            className="lg:hidden text-slate-400 hover:text-white p-2.5 -m-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                            data-testid="button-close-sidebar"
                            aria-label="Close sidebar"
                        >
                            <X size={22} />
                        </button>
                    </>
                ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 ring-2 ring-white/20">
                        <Box size={24} strokeWidth={2.5} />
                    </div>
                )}
            </div>

            <button 
                onClick={() => setCollapsed(!collapsed)}
                className={`hidden lg:flex absolute ${isRTL ? '-left-4' : '-right-4'} top-20 w-8 h-8 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 text-white rounded-full items-center justify-center transition-all duration-500 shadow-xl shadow-brand-500/50 z-50 ring-2 ring-white/30 hover:ring-white/50 hover:shadow-2xl hover:shadow-brand-400/60 hover:scale-110 active:scale-95 group`}
                data-testid="button-toggle-sidebar"
                title={collapsed ? t('sidebar.expand', 'توسيع') : t('sidebar.collapse', 'طي')}
            >
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                <ChevronLeft 
                    size={18} 
                    className={`transition-transform duration-500 ease-in-out ${collapsed ? (isRTL ? 'rotate-180' : 'rotate-0') : (isRTL ? 'rotate-0' : 'rotate-180')}`}
                />
            </button>

            {!collapsed ? (
                <div className="p-4 relative">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 shadow-inner">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-600/20 flex items-center justify-center text-brand-300 border border-brand-400/30 shrink-0 shadow-inner">
                                <UserIcon size={22} strokeWidth={2} />
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="font-bold text-[15px] truncate text-white">{user.name}</p>
                                <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5 bg-slate-800/50 px-2 py-0.5 rounded-md w-fit">{user.clientId}</p>
                            </div>
                        </div>
                        {profile && (
                            <div className="text-xs text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-white/5 mb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 size={14} className="text-brand-400" />
                                    <p className="truncate font-bold">{profile.companyName}</p>
                                </div>
                                <p className="text-[10px] text-brand-400 mt-1 mr-5">{profile.city}</p>
                            </div>
                        )}
                        <div className="bg-gradient-to-r from-brand-600/20 to-brand-500/10 border border-brand-400/30 rounded-xl p-3.5 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                            <p className="text-[10px] text-brand-200 uppercase font-bold mb-1.5 tracking-wider relative z-10">{t('sidebar.searchCredits')}</p>
                            <div className="flex items-center justify-center gap-2 relative z-10">
                                <span className="text-2xl font-black text-white tabular-nums">
                                    {user.searchLimit === 0 ? t('sidebar.unlimitedSearch') : remainingCredits}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-3 flex flex-col items-center relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-600/20 flex items-center justify-center text-brand-300 border border-brand-400/30 mb-3 shadow-inner">
                        <UserIcon size={20} strokeWidth={2} />
                    </div>
                    <div className="bg-gradient-to-r from-brand-600/20 to-brand-500/10 border border-brand-400/30 rounded-lg p-2 text-center w-full">
                        <p className="text-lg font-black text-white tabular-nums">
                            {user.searchLimit === 0 ? '∞' : remainingCredits}
                        </p>
                    </div>
                </div>
            )}

            <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-4'} py-2 custom-scrollbar relative`}>
                {!collapsed && (
                    <div className="flex items-center gap-2 px-3 py-2 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('sidebar.mainMenu')}</p>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                )}
                <CollapsibleSidebarItem icon={<LayoutDashboard size={20} />} label={tDynamic('sidebar.home', 'الرئيسية')} active={view === 'HOME'} onClick={() => onViewChange('HOME')} collapsed={collapsed} />
                
                <CollapsibleSidebarItem 
                    icon={<Package size={20} />} 
                    label={tDynamic('sidebar.orders', 'سجل الطلبات')} 
                    active={view === 'ORDERS'} 
                    onClick={() => isGuest ? onGuestPageClick() : onViewChange('ORDERS')} 
                    badge={user.hasUnreadOrders ? true : undefined}
                    collapsed={collapsed}
                />
                
                <CollapsibleSidebarItem 
                    icon={<Search size={20} />} 
                    label={tDynamic('sidebar.quotes', 'طلبات التسعير')} 
                    active={view === 'QUOTE_REQUEST'} 
                    onClick={() => isGuest ? onGuestPageClick() : onViewChange('QUOTE_REQUEST')} 
                    badge={user.hasUnreadQuotes ? true : undefined}
                    collapsed={collapsed}
                />
                <CollapsibleSidebarItem icon={<Globe size={20} />} label={tDynamic('sidebar.import', 'الاستيراد من الصين')} active={view === 'IMPORT_CHINA'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('IMPORT_CHINA')} collapsed={collapsed} />
                {canAccessFeature('cust_use_trader_tools') && (
                    <CollapsibleSidebarItem icon={<Wrench size={20} />} label={tDynamic('sidebar.traderTools', 'أدوات التاجر')} active={view === 'TRADER_TOOLS'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('TRADER_TOOLS')} collapsed={collapsed} />
                )}
                {canAccessFeature('cust_use_trader_tools') && (
                    <CollapsibleSidebarItem icon={<Clock size={20} />} label={tDynamic('sidebar.toolsHistory', 'سجل الأدوات')} active={view === 'TOOLS_HISTORY'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('TOOLS_HISTORY')} collapsed={collapsed} />
                )}
                <CollapsibleSidebarItem icon={<Package size={20} />} label={tDynamic('sidebar.productSearch', 'بحث المنتجات')} active={view === 'PRODUCT_SEARCH'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('PRODUCT_SEARCH')} collapsed={collapsed} />
                <CollapsibleSidebarItem icon={<Layers size={20} />} label={tDynamic('sidebar.alternatives', 'بدائل الأصناف')} active={view === 'ALTERNATIVES'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('ALTERNATIVES')} collapsed={collapsed} />
                <CollapsibleSidebarItem icon={<History size={20} />} label={tDynamic('sidebar.history', 'سجل البحث')} active={view === 'HISTORY'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('HISTORY')} collapsed={collapsed} />
                
                {!collapsed && (
                    <div className="flex items-center gap-2 px-3 py-2 mt-6 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('sidebar.management')}</p>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                )}
                <CollapsibleSidebarItem icon={<Building2 size={20} />} label={tDynamic('sidebar.organization', 'إدارة المنشأة')} active={view === 'ORGANIZATION'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('ORGANIZATION')} collapsed={collapsed} />
                {canAccessFeature('org_manage_team') && (
                    <CollapsibleSidebarItem icon={<Users size={20} />} label={tDynamic('sidebar.teamManagement', 'إدارة الفريق')} active={view === 'TEAM_MANAGEMENT'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('TEAM_MANAGEMENT')} collapsed={collapsed} />
                )}
                
                {!collapsed && (
                    <div className="flex items-center gap-2 px-3 py-2 mt-6 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('sidebar.supportSection')}</p>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                )}
                <CollapsibleSidebarItem icon={<Headphones size={20} />} label={tDynamic('sidebar.support', 'عن الشركة / الدعم')} active={view === 'ABOUT'} onClick={() => isGuest ? onGuestPageClick() : onViewChange('ABOUT')} collapsed={collapsed} />
            </nav>

            <div className={`${collapsed ? 'p-2' : 'p-4'} border-t border-white/10 relative`}>
                <button 
                    onClick={onLogout} 
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 group relative border border-transparent hover:border-red-500/30`}
                    title={collapsed ? t('logout') : undefined}
                >
                    <LogOut size={20} className="transition-transform duration-300 group-hover:scale-110" />
                    {!collapsed && <span className="text-sm font-bold tracking-wide">{t('logout')}</span>}
                    {collapsed && (
                        <div className="absolute left-full ml-3 px-4 py-2.5 bg-slate-800/95 backdrop-blur-sm text-red-300 text-sm font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl border border-red-500/30">
                            {t('logout')}
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
});
