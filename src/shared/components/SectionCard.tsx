import React from 'react';

/**
 * SectionCard - بطاقة قسم موحدة
 * تُستخدم لتغليف محتوى الأقسام بشكل متسق
 */
export interface SectionCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
  testId?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
  headerAction,
  noPadding = false,
  testId,
}) => (
  <div
    className={`bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden ${className}`}
    data-testid={testId}
  >
    {(title || icon || headerAction) && (
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className="font-bold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {headerAction}
      </div>
    )}
    <div className={noPadding ? '' : 'p-5'}>{children}</div>
  </div>
);

SectionCard.displayName = 'SectionCard';
