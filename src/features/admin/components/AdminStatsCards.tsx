import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, ShoppingBag, Users, FileText } from 'lucide-react';

/**
 * AdminStatsCards (COPY ONLY - from AdminDashboard.tsx lines 402-419, 620-653)
 * NOTE: This component is not wired yet.
 * Extracted the Stats Cards JSX/CSS from AdminDashboard.tsx.
 * className and data-testid are EXACT from original.
 */

export interface AdminStatsCardsProps {
  kpiData: {
    todayRevenue: number;
    totalRevenue: number;
    pendingOrders: number;
    approvedOrders: number;
    shippedOrders: number;
    activeBusinesses: number;
    pendingAccounts: number;
    pendingQuotes: number;
  };
}

// StatCard sub-component (copied from AdminDashboard.tsx lines 402-419)
const StatCard = ({ title, value, subValue, icon, colorClass, delay }: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactElement;
  colorClass: string;
  delay: string;
}) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group animate-slide-up" style={{ animationDelay: delay }}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-800 group-hover:text-brand-600 transition-colors">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { size: 20, className: colorClass.replace('bg-', 'text-') } as React.Attributes & { size: number; className: string })}
      </div>
    </div>
    {subValue && (
      <div className="pt-3 border-t border-slate-50">
        <p className="text-xs font-bold text-slate-400">{subValue}</p>
      </div>
    )}
  </div>
);

// Main component - KPI Grid (copied from AdminDashboard.tsx lines 620-653)
export function AdminStatsCards({ kpiData }: AdminStatsCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title={t('adminDashboard.stats.todayRevenue')}
        value={`${kpiData.todayRevenue.toLocaleString()} ${t('customerDashboard.sar')}`}
        subValue={`${t('adminDashboard.stats.totalRevenue')}: ${kpiData.totalRevenue.toLocaleString()} ${t('customerDashboard.sar')}`}
        icon={<BarChart3 />}
        colorClass="text-emerald-600 bg-emerald-100"
        delay="0ms"
      />
      <StatCard
        title={t('adminDashboard.stats.pendingOrders')}
        value={kpiData.pendingOrders}
        subValue={`${kpiData.approvedOrders} ${t('adminDashboard.stats.approvedOrders')} | ${kpiData.shippedOrders} ${t('adminDashboard.stats.shippedOrders')}`}
        icon={<ShoppingBag />}
        colorClass="text-blue-600 bg-blue-100"
        delay="50ms"
      />
      <StatCard
        title={t('adminDashboard.stats.activeBusinesses')}
        value={kpiData.activeBusinesses}
        subValue={`${kpiData.pendingAccounts} ${t('adminDashboard.stats.pendingAccounts')}`}
        icon={<Users />}
        colorClass="text-[#C8A04F] bg-amber-100"
        delay="100ms"
      />
      <StatCard
        title={t('adminDashboard.stats.pendingQuotes')}
        value={kpiData.pendingQuotes}
        subValue={t('common.noData')}
        icon={<FileText />}
        colorClass="text-slate-600 bg-slate-200"
        delay="150ms"
      />
    </div>
  );
}

export default AdminStatsCards;
