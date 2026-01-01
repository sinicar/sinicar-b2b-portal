import React, { memo } from 'react';

/**
 * SupplierStatCard - بطاقة إحصائية للمورد
 * مكون UI صرف بدون logic
 */
export interface SupplierStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  subValue?: string;
}

export const SupplierStatCard = memo(({ 
  icon, 
  label, 
  value, 
  color, 
  subValue 
}: SupplierStatCardProps) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-lg`}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-3xl font-black text-white">{value}</span>
    </div>
    <p className="text-white/80 text-sm font-medium">{label}</p>
    {subValue && <p className="text-white/60 text-xs mt-1">{subValue}</p>}
  </div>
));

SupplierStatCard.displayName = 'SupplierStatCard';
