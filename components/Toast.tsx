
import React from 'react';
import { useToast, Toast as ToastType } from '../services/ToastContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useLanguage } from '../services/LanguageContext';

const ToastItem: React.FC<{ toast: ToastType; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const { dir } = useLanguage();
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  const bgStyles = {
    success: 'border-green-500 bg-white shadow-green-100',
    error: 'border-red-500 bg-white shadow-red-100',
    info: 'border-blue-500 bg-white shadow-blue-100'
  };

  return (
    <div 
      className={`
        pointer-events-auto 
        flex items-center gap-3 w-auto min-w-[320px] max-w-md
        rounded-lg border-l-4 rtl:border-l-0 rtl:border-r-4 shadow-xl ring-1 ring-black ring-opacity-5 
        px-5 py-4 transform transition-all duration-500 ease-out animate-slide-up
        hover:scale-105 cursor-pointer
        ${bgStyles[toast.type]}
      `}
      onClick={() => onDismiss(toast.id)}
      role="alert"
    >
      <div className="flex-shrink-0 animate-pulse">
        {icons[toast.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-800 leading-snug">
          {toast.message}
        </p>
      </div>
      <div className="flex flex-shrink-0 ml-1 rtl:mr-1">
        <button
          className="inline-flex rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toast.id);
          }}
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 items-center pointer-events-none w-full px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
