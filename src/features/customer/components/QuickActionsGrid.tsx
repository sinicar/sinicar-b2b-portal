import React from 'react';

/**
 * QuickActionsGrid - شبكة الإجراءات السريعة
 * مكون UI صرف للوحة التحكم
 */
export interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  color: string;
  badge?: number | string;
  testId?: string;
}

export interface QuickActionsGridProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  columns = 4,
}) => {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className={`relative bg-gradient-to-br ${action.color} rounded-2xl p-5 text-white text-right shadow-lg hover:scale-[1.02] transition-transform group overflow-hidden`}
          data-testid={action.testId}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                {action.icon}
              </div>
              {action.badge && (
                <span className="bg-white/30 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {action.badge}
                </span>
              )}
            </div>
            <p className="font-bold text-lg">{action.label}</p>
            {action.description && (
              <p className="text-white/70 text-sm mt-1">{action.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

QuickActionsGrid.displayName = 'QuickActionsGrid';
