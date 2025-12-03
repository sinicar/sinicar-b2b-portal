
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Search, ShoppingCart, FileText, Globe, Users, CheckCircle, Info } from 'lucide-react';

export const UsageIntroModal: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('siniCar_hasSeenUsageIntro');
        if (!hasSeen) {
            // Show modal after a short delay
            setTimeout(() => setIsOpen(true), 1500);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (dontShowAgain) {
            localStorage.setItem('siniCar_hasSeenUsageIntro', 'true');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="طريقة استخدام بوابة صيني كار"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 flex items-start gap-3">
                    <Info className="text-brand-600 shrink-0 mt-1" />
                    <p className="text-brand-800 text-sm leading-relaxed font-medium">
                        أهلاً بك في نظام الجملة الموحد. تم تصميم هذه البوابة لتسهيل عمليات طلب قطع الغيار للمحلات والشركات.
                        إليك أبرز المميزات التي يمكنك الاستفادة منها:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Search size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">البحث الذكي</h4>
                            <p className="text-xs text-slate-500 mt-1">أفضل نتيجة تحصل عليها عند البحث برقم القطعة (مثال: 218102K700).</p>
                        </div>
                    </div>

                    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                            <ShoppingCart size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">سلة المشتريات</h4>
                            <p className="text-xs text-slate-500 mt-1">أضف الأصناف للسلة ثم أرسل طلب الجملة مباشرة للمخزن للمعالجة.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">طلبات التسعير (Bulk)</h4>
                            <p className="text-xs text-slate-500 mt-1">ارفع ملف Excel يحتوي على مئات الأصناف للحصول على تسعير فوري.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm">الاستيراد الخاص</h4>
                            <p className="text-xs text-slate-500 mt-1">اطلب شحنات خاصة مباشرة من الصين عبر خدمة الاستيراد المباشر.</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4">
                     <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-slate-400" />
                        <span className="text-xs text-slate-500">نصيحة: يمكنك إنشاء حسابات فرعية لموظفيك من خلال صفحة "إدارة المنشأة".</span>
                     </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                            <input 
                                type="checkbox" 
                                className="rounded text-brand-600 focus:ring-brand-500"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                            />
                            لا تظهر هذه الرسالة مرة أخرى
                        </label>
                        
                        <button 
                            onClick={handleClose}
                            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
                        >
                            فهمت، بدء الاستخدام <CheckCircle size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
