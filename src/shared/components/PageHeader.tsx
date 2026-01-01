import React from 'react';

/**
 * PageHeader - رأس الصفحة الموحد
 * يُستخدم في جميع الصفحات لعرض العنوان والأزرار
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  testId?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  backButton,
  className = '',
  testId,
}) => (
  <div
    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}
    data-testid={testId}
  >
    <div className="flex items-center gap-4">
      {backButton && (
        <button
          onClick={backButton.onClick}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

PageHeader.displayName = 'PageHeader';
