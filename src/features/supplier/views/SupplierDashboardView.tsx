/**
 * SupplierDashboardView - Dashboard View for Supplier Portal
 * عرض لوحة التحكم - بوابة المورد
 * 
 * Extracted from SupplierPortal.tsx - NO LOGIC CHANGES
 */

import React, { memo } from 'react';
import { Package, FileText, CheckCircle, DollarSign, Plus, Upload, Star } from 'lucide-react';
import { SupplierDashboardStats, SupplierRequest } from '../../../types';
import { formatDateTime } from '../../../utils/dateUtils';

// StatCard component (inline for now)
const StatCard = memo(({ icon, label, value, color, subValue }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  subValue?: string;
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
      {subValue && (
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {subValue}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Type for supplier view navigation
type SupplierView = 'DASHBOARD' | 'PRODUCTS' | 'PURCHASE_ORDERS' | 'REQUESTS' | 'SETTINGS' | 'NOTIFICATIONS' | 'TEAM' | 'IMAGES' | 'QUICK_ORDER' | 'EXCEL_PURCHASE';

export interface SupplierDashboardViewProps {
  stats: SupplierDashboardStats;
  t: (key: string) => string;
  onNavigate: (view: SupplierView) => void;
  recentRequests: SupplierRequest[];
}

export const SupplierDashboardView = memo(({
  stats,
  t,
  onNavigate,
  recentRequests
}: SupplierDashboardViewProps) => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Package size={24} className="text-white" />}
        label={t('supplier.totalProducts')}
        value={stats.totalProducts}
        color="from-emerald-500 to-emerald-600"
        subValue={`${stats.activeProducts} ${t('supplier.active')}`}
      />
      <StatCard
        icon={<FileText size={24} className="text-white" />}
        label={t('supplier.pendingRequests')}
        value={stats.pendingRequests}
        color="from-orange-500 to-orange-600"
      />
      <StatCard
        icon={<CheckCircle size={24} className="text-white" />}
        label={t('supplier.quotesSubmitted')}
        value={stats.quotesSubmitted}
        color="from-blue-500 to-blue-600"
        subValue={`${stats.quotesAccepted} ${t('supplier.accepted')}`}
      />
      <StatCard
        icon={<DollarSign size={24} className="text-white" />}
        label={t('supplier.totalRevenue')}
        value={`${stats.totalRevenue.toLocaleString()} ${t('currency')}`}
        color="from-purple-500 to-purple-600"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800">{t('supplier.recentRequests')}</h3>
          <button
            onClick={() => onNavigate('REQUESTS')}
            className="text-emerald-600 text-sm font-bold hover:underline"
            data-testid="link-view-all-requests"
          >
            {t('supplier.viewAll')}
          </button>
        </div>
        {recentRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p>{t('supplier.noRequests')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => onNavigate('REQUESTS')}
                data-testid={`request-item-${req.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${req.status === 'NEW' ? 'bg-orange-500' :
                    req.status === 'QUOTED' ? 'bg-blue-500' :
                      req.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-slate-400'
                    }`} />
                  <div>
                    <p className="font-bold text-slate-800">{req.partName || req.partNumber}</p>
                    <p className="text-xs text-slate-500">{req.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{formatDateTime(req.createdAt)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${req.status === 'NEW' ? 'bg-orange-100 text-orange-700' :
                    req.status === 'QUOTED' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                    {t(`supplier.status.${req.status.toLowerCase()}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-bold text-lg text-slate-800 mb-4">{t('supplier.quickActions')}</h3>
        <div className="space-y-3">
          <button
            onClick={() => onNavigate('PRODUCTS')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
            data-testid="button-add-product-quick"
          >
            <Plus size={20} />
            {t('supplier.addProduct')}
          </button>
          <button
            onClick={() => onNavigate('PRODUCTS')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
            data-testid="button-import-products-quick"
          >
            <Upload size={20} />
            {t('supplier.importProducts')}
          </button>
          <button
            onClick={() => onNavigate('REQUESTS')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold hover:bg-orange-100 transition-colors"
            data-testid="button-view-requests-quick"
          >
            <FileText size={20} />
            {t('supplier.viewRequests')}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="font-bold text-slate-700 mb-3">{t('supplier.performance')}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t('supplier.avgResponseTime')}</span>
              <span className="font-bold text-slate-800">{stats.averageResponseTime}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{t('supplier.rating')}</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-slate-800">{stats.supplierRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

SupplierDashboardView.displayName = 'SupplierDashboardView';

export default SupplierDashboardView;
