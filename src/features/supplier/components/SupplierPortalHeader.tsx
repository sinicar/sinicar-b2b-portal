/**
 * SupplierPortalHeader - Top header with title, time, and actions
 * هيدر بوابة المورد - يحتوي العنوان والوقت والأزرار
 */

import React, { ReactNode } from 'react';
import { Menu, Clock } from 'lucide-react';
import { formatDateTime } from '../../../utils/dateUtils';

export type SupplierView = 'DASHBOARD' | 'PRODUCTS' | 'PURCHASE_ORDERS' | 'REQUESTS' | 'NOTIFICATIONS' | 'SETTINGS' | 'TEAM' | 'IMAGES' | 'QUICK_ORDER' | 'EXCEL_PURCHASE';

interface SupplierPortalHeaderProps {
  view: SupplierView;
  onOpenSidebar: () => void;
  notificationSlot?: ReactNode;
  languageSwitcherSlot?: ReactNode;
  t: (key: string, fallback?: string) => string;
}

const getViewTitle = (view: SupplierView, t: (key: string, fallback?: string) => string): string => {
  switch (view) {
    case 'DASHBOARD': return t('supplier.dashboard');
    case 'PRODUCTS': return t('supplier.products');
    case 'REQUESTS': return t('supplier.requests');
    case 'SETTINGS': return t('supplier.settings');
    case 'NOTIFICATIONS': return t('supplier.notifications');
    case 'TEAM': return t('supplier.team');
    case 'IMAGES': return t('supplier.images', 'صور المنتجات');
    case 'PURCHASE_ORDERS': return 'أوامر الشراء';
    case 'QUICK_ORDER': return t('supplier.quickOrder', 'أمر سريع');
    case 'EXCEL_PURCHASE': return t('supplier.excelPurchase', 'طلب بالجملة');
    default: return '';
  }
};

export const SupplierPortalHeader: React.FC<SupplierPortalHeaderProps> = ({
  view,
  onOpenSidebar,
  notificationSlot,
  languageSwitcherSlot,
  t
}) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8 flex-shrink-0 z-30 shadow-sm gap-2">
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg shrink-0"
          data-testid="button-open-sidebar"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-base md:text-xl lg:text-2xl font-bold md:font-black text-slate-800 tracking-tight truncate">
          {getViewTitle(view, t)}
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs md:text-sm font-bold text-slate-700">
          <Clock size={16} />
          <span>{formatDateTime(new Date().toISOString())}</span>
        </div>
        {notificationSlot}
        {languageSwitcherSlot}
      </div>
    </header>
  );
};

export default SupplierPortalHeader;
