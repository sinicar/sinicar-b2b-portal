import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

/**
 * AdminChartsSection (COPY ONLY - from AdminDashboard.tsx lines 607-633, 651-662)
 * NOTE: This component is not wired yet.
 * Contains Revenue Chart (Area) + Orders Mini Chart (Bar)
 */

// Chart colors (copied from AdminDashboard.tsx)
const COLORS = {
  navy: '#0B1B3A',
  gold: '#C8A04F'
};

export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

export interface AdminChartsSectionProps {
  graphData: {
    dailyStats: DailyStats[];
  };
}

// Main Revenue Chart (copied from lines 607-633)
function RevenueChart({ dailyStats }: { dailyStats: DailyStats[] }) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp size={20} className="text-[#C8A04F]" /> {t('adminDashboard.charts.dailyRevenue')} (30)
        </h3>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyStats}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.navy} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS.navy} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              formatter={(value: number) => [`${value.toLocaleString()} ${t('customerDashboard.sar')}`, t('adminDashboard.charts.revenue')]}
            />
            <Area type="monotone" dataKey="revenue" stroke={COLORS.navy} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Orders Mini Chart (copied from lines 651-662)
function OrdersMiniChart({ dailyStats }: { dailyStats: DailyStats[] }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[200px] flex flex-col">
      <h3 className="font-bold text-slate-800 text-sm mb-4">{t('adminDashboard.charts.dailyOrders')}</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyStats}>
            <Bar dataKey="orders" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Exported component - contains both charts
export function AdminChartsSection({ graphData }: AdminChartsSectionProps) {
  return (
    <>
      <RevenueChart dailyStats={graphData.dailyStats} />
      <OrdersMiniChart dailyStats={graphData.dailyStats} />
    </>
  );
}

export default AdminChartsSection;
