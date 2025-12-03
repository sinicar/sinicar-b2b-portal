import React from 'react';
import { ShieldX, ArrowRight, Home, HelpCircle } from 'lucide-react';

interface AccessDeniedProps {
    resourceName?: string;
    onGoBack?: () => void;
    onGoHome?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
    resourceName,
    onGoBack,
    onGoHome
}) => {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldX className="text-red-500" size={48} />
                </div>
                
                <h1 className="text-2xl font-black text-slate-800 mb-3">
                    لا تملك صلاحية للوصول
                </h1>
                
                <p className="text-slate-600 mb-6 leading-relaxed">
                    ليس لديك صلاحية لعرض هذه الصفحة أو تنفيذ هذا الإجراء.
                    <br />
                    الرجاء التواصل مع مسؤول النظام.
                </p>
                
                {resourceName && (
                    <div className="bg-slate-100 rounded-xl p-4 mb-6">
                        <p className="text-sm text-slate-500 mb-1">الصفحة المطلوبة:</p>
                        <p className="font-bold text-slate-700">{resourceName}</p>
                    </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onGoBack && (
                        <button
                            onClick={onGoBack}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            data-testid="button-access-denied-back"
                        >
                            <ArrowRight size={18} />
                            العودة
                        </button>
                    )}
                    {onGoHome && (
                        <button
                            onClick={onGoHome}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#0B1B3A] text-white rounded-xl font-bold hover:bg-[#1a2e56] transition-colors"
                            data-testid="button-access-denied-home"
                        >
                            <Home size={18} />
                            لوحة التحكم
                        </button>
                    )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                        <HelpCircle size={16} />
                        <span>رمز الخطأ: ACCESS_DENIED_403</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AccessDeniedPage: React.FC<{
    onGoHome?: () => void;
}> = ({ onGoHome }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <AccessDenied onGoHome={onGoHome} />
        </div>
    );
};
