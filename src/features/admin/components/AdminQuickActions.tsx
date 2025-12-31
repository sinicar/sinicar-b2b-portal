import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Plus, RefreshCw, Clock, Download } from 'lucide-react';

/**
 * AdminQuickActions (COPY ONLY - from AdminDashboard.tsx lines 612-624, 907-911)
 * NOTE: This component is not wired yet.
 * Contains Quick Actions panel with 4 buttons.
 */

export interface AdminQuickActionsProps {
  setView: (view: 'PRODUCTS' | 'QUOTES') => void;
  addToast: (message: string, type: string) => void;
}

// QuickActionBtn sub-component (copied from line 907-911)
const QuickActionBtn = ({ label, icon, onClick }: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button onClick={onClick} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl font-bold text-xs transition-all border border-white/5 backdrop-blur-sm">
    {icon} {label}
  </button>
);

// Main component (copied from lines 612-624)
export function AdminQuickActions({ setView, addToast }: AdminQuickActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-[#0B1B3A] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A04F] rounded-full blur-[60px] opacity-20"></div>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
        <Zap size={20} className="text-[#C8A04F]" /> {t('dashboard.quickActions')}
      </h3>
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <QuickActionBtn label={t('products.addProduct')} icon={<Plus size={16} />} onClick={() => setView('PRODUCTS')} />
        <QuickActionBtn label={t('common.refresh')} icon={<RefreshCw size={16} />} onClick={() => setView('PRODUCTS')} />
        <QuickActionBtn label={t('adminDashboard.stats.pendingOrders')} icon={<Clock size={16} />} onClick={() => setView('QUOTES')} />
        <QuickActionBtn label={t('common.export')} icon={<Download size={16} />} onClick={() => addToast(t('common.loading'), 'success')} />
      </div>
    </div>
  );
}

export default AdminQuickActions;
