/**
 * SaveBar - Footer bar with save button
 * شريط الحفظ
 */

import React from 'react';
import { Save } from 'lucide-react';

interface SaveBarProps {
  onSave: () => void;
  disabled?: boolean;
  label?: string;
  colorScheme?: 'emerald' | 'purple' | 'blue';
  infoText?: string;
}

export const SaveBar: React.FC<SaveBarProps> = ({
  onSave,
  disabled = false,
  label = 'حفظ الإعدادات',
  colorScheme = 'emerald',
  infoText
}) => {
  const colors = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    blue: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="flex items-center justify-between">
      {infoText && (
        <p className="text-sm text-slate-500">{infoText}</p>
      )}
      <button
        onClick={onSave}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold disabled:opacity-50 ${colors[colorScheme]}`}
      >
        <Save size={18} />
        {label}
      </button>
    </div>
  );
};

export default SaveBar;
