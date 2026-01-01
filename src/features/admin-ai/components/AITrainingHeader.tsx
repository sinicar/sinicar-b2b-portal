/**
 * AITrainingHeader - Header component for AI Training page
 * عنوان صفحة تدريب الذكاء الاصطناعي
 * Supports slot-based injection for stats and actions
 */

import React, { ReactNode, ChangeEvent } from 'react';
import { Brain, Upload, Download, RefreshCw } from 'lucide-react';

interface AITrainingHeaderProps {
  title: string;
  subtitle: string;
  isRTL?: boolean;
  // Slot-based props for flexible content injection
  statsSlot?: ReactNode;
  actionsSlot?: ReactNode;
  // Optional built-in handlers (used if actionsSlot not provided)
  onExport?: () => void;
  onImport?: (e: ChangeEvent<HTMLInputElement>) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const AITrainingHeader: React.FC<AITrainingHeaderProps> = ({
  title,
  subtitle,
  isRTL = false,
  statsSlot,
  actionsSlot,
  onExport,
  onImport,
  onRefresh,
  loading = false
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              {title}
            </h1>
            <p className="text-purple-100 text-sm">{subtitle}</p>
          </div>
        </div>
        
        {/* Actions: use slot if provided, otherwise render built-in buttons */}
        {actionsSlot ? actionsSlot : (
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
              </button>
            )}
            {onImport && (
              <label className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl font-bold cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                {isRTL ? 'استيراد' : 'Import'}
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
              </label>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                {isRTL ? 'تصدير' : 'Export'}
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Stats slot - rendered below header row */}
      {statsSlot && (
        <div className="mt-6">
          {statsSlot}
        </div>
      )}
    </div>
  );
};

export default AITrainingHeader;

