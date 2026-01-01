/**
 * FeatureToggleCard - Toggle card for feature permissions
 * كارت تبديل الميزة
 */

import React from 'react';
import { Check, X } from 'lucide-react';

interface FeatureToggleCardProps {
  id: string;
  name: string;
  enabled: boolean;
  onToggle: (id: string) => void;
  colorScheme?: 'emerald' | 'purple' | 'blue';
}

export const FeatureToggleCard: React.FC<FeatureToggleCardProps> = ({
  id,
  name,
  enabled,
  onToggle,
  colorScheme = 'emerald'
}) => {
  const colors = {
    emerald: {
      bg: enabled ? 'bg-emerald-50' : 'bg-slate-50',
      border: enabled ? 'border-emerald-200' : 'border-slate-200',
      icon: enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400',
      toggle: enabled ? 'bg-emerald-500' : 'bg-slate-300'
    },
    purple: {
      bg: enabled ? 'bg-purple-50' : 'bg-slate-50',
      border: enabled ? 'border-purple-200' : 'border-slate-200',
      icon: enabled ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400',
      toggle: enabled ? 'bg-purple-500' : 'bg-slate-300'
    },
    blue: {
      bg: enabled ? 'bg-blue-50' : 'bg-slate-50',
      border: enabled ? 'border-blue-200' : 'border-slate-200',
      icon: enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400',
      toggle: enabled ? 'bg-blue-500' : 'bg-slate-300'
    }
  };

  const c = colors[colorScheme];

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${c.bg} ${c.border}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          {enabled ? <Check size={20} /> : <X size={20} />}
        </div>
        <span className="font-bold text-slate-700">{name}</span>
      </div>
      <button
        onClick={() => onToggle(id)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${c.toggle}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
};

export default FeatureToggleCard;
