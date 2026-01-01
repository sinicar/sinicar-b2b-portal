import React, { memo } from 'react';

/**
 * SupplierSidebarItem - عنصر قائمة جانبية للمورد
 * مكون UI صرف بدون logic
 */
export interface SupplierSidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number | string;
  collapsed: boolean;
  testId?: string;
}

export const SupplierSidebarItem = memo(({ 
  icon, 
  label, 
  active, 
  onClick, 
  badge, 
  collapsed, 
  testId 
}: SupplierSidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-3.5 rounded-2xl mb-2 transition-all duration-300 group relative overflow-hidden ${active
      ? 'bg-gradient-to-l from-emerald-600 to-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/40 scale-[1.02]'
      : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium hover:scale-[1.01]'
    }`}
    title={collapsed ? label : undefined}
    data-testid={testId}
  >
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50"></div>
    )}
    <div className={`flex items-center relative z-10 ${collapsed ? '' : 'gap-3.5'}`}>
      <span className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>{icon}</span>
      {!collapsed && <span className="text-sm md:text-[15px] truncate tracking-wide">{label}</span>}
    </div>
    {badge && !collapsed && (
      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center justify-center min-w-[22px] shadow-md animate-bounce relative z-10">
        {badge}
      </span>
    )}
    {badge && collapsed && (
      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse shadow-lg"></span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-3 px-4 py-2.5 bg-slate-800/95 backdrop-blur-sm text-white text-sm font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-2xl border border-slate-700/50">
        {label}
        {badge && <span className="mr-2 text-orange-400 font-black">({badge})</span>}
      </div>
    )}
  </button>
));

SupplierSidebarItem.displayName = 'SupplierSidebarItem';
