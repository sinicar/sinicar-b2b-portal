import React from 'react';
import { Loader2, AlertTriangle, PackageX } from 'lucide-react';

/**
 * AsyncState - مكون موحد لعرض حالات التحميل والخطأ والفراغ
 * 
 * @example
 * <AsyncState
 *   loading={isLoading}
 *   error={error}
 *   empty={data.length === 0}
 *   emptyMessage="لا توجد بيانات"
 * >
 *   <DataList data={data} />
 * </AsyncState>
 */

interface AsyncStateProps {
  /** حالة التحميل */
  loading?: boolean;
  /** رسالة الخطأ (إن وجدت) */
  error?: string | null;
  /** هل البيانات فارغة */
  empty?: boolean;
  /** رسالة عند الفراغ */
  emptyMessage?: string;
  /** أيقونة مخصصة للفراغ */
  emptyIcon?: React.ReactNode;
  /** المحتوى عند النجاح */
  children: React.ReactNode;
  /** حجم spinner التحميل */
  loadingSize?: 'sm' | 'md' | 'lg';
  /** لون الخلفية الشفافة */
  transparent?: boolean;
}

export const AsyncState: React.FC<AsyncStateProps> = ({
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'لا توجد بيانات',
  emptyIcon,
  children,
  loadingSize = 'md',
  transparent = false,
}) => {
  // حالة التحميل
  if (loading) {
    const sizeClasses = {
      sm: 'w-6 h-6',
      md: 'w-10 h-10',
      lg: 'w-16 h-16',
    };

    return (
      <div className={`flex flex-col items-center justify-center py-12 ${transparent ? '' : 'bg-white rounded-xl'}`}>
        <Loader2 className={`${sizeClasses[loadingSize]} text-brand-500 animate-spin`} />
        <p className="mt-4 text-slate-500 font-medium">جاري التحميل...</p>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${transparent ? '' : 'bg-red-50 rounded-xl border border-red-200'}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 font-bold text-lg mb-2">حدث خطأ</p>
        <p className="text-red-500 text-sm max-w-md text-center">{error}</p>
      </div>
    );
  }

  // حالة البيانات الفارغة
  if (empty) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${transparent ? '' : 'bg-slate-50 rounded-xl border border-slate-200'}`}>
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          {emptyIcon || <PackageX className="w-8 h-8 text-slate-400" />}
        </div>
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  // البيانات موجودة - عرض المحتوى
  return <>{children}</>;
};

/**
 * مكون تحميل بسيط (Spinner فقط)
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <Loader2 className={`${sizeClasses[size]} text-brand-500 animate-spin ${className}`} />
  );
};

/**
 * مكون Skeleton للتحميل
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  );
};

export default AsyncState;
