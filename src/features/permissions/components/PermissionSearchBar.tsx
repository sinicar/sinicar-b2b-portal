/**
 * PermissionSearchBar - Search component for permissions
 * شريط البحث
 */

import React from 'react';
import { Search } from 'lucide-react';

interface PermissionSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PermissionSearchBar: React.FC<PermissionSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'بحث...'
}) => {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full"
      />
    </div>
  );
};

export default PermissionSearchBar;
