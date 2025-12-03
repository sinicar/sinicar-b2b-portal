
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string; // e.g., 'max-w-lg', 'max-w-2xl'
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-lg' 
}) => {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      // تأخير بسيط جداً للسماح للـ DOM بالتحميل قبل تفعيل كلاس الحركة
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      // انتظار انتهاء الحركة (200ms) قبل إزالة العنصر
      const timer = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* خلفية داكنة مع حركة تدرج */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          animate ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* صندوق المودال مع حركة تكبير/تصغير */}
      <div 
        className={`
          relative z-10 w-full ${maxWidth} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]
          transform transition-all duration-200 ease-out
          ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
      >
        {/* رأس المودال */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          {title && <h3 className="text-xl font-bold text-slate-800">{title}</h3>}
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-50 rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* محتوى المودال */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
