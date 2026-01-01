/**
 * PermissionHeader - Header component for Permission Center
 * عنوان مركز الصلاحيات
 */

import React from 'react';
import { Shield } from 'lucide-react';

interface PermissionHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export const PermissionHeader: React.FC<PermissionHeaderProps> = ({
  title,
  subtitle,
  actions
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <Shield className="text-[#C8A04F]" size={28} />
          {title}
        </h1>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default PermissionHeader;
