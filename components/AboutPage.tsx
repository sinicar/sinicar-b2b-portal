
import React from 'react';
import { Phone, MessageCircle, Store, Zap, Clock, Smartphone, Globe, ShieldCheck, Users, Target } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-10">
        {/* Hero Section */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative mb-10 text-white">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
             <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary-900/50 to-transparent"></div>
             
             <div className="relative z-10 p-12 md:p-20 text-center">
                 <h1 className="text-4xl md:text-6xl font-black mb-4">SINI PRO</h1>
                 <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto">
                     المنصة الرقمية الأولى لقطاع غيار السيارات الصينية بالجملة في المملكة العربية السعودية.
                 </p>
             </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 hover:border-primary-200 transition-colors group">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                    <Target size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">رؤيتنا</h3>
                <p className="text-slate-600 leading-relaxed">
                    أن نكون الشريك الاستراتيجي الأول لكل مركز صيانة ومتجر قطع غيار في الشرق الأوسط، من خلال توفير بنية تحتية رقمية تضمن توفر القطع وسرعة الوصول إليها بأعلى معايير الجودة.
                </p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100 hover:border-secondary-200 transition-colors group">
                <div className="w-12 h-12 bg-secondary-100 rounded-2xl flex items-center justify-center text-secondary-600 mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">التزامنا</h3>
                <p className="text-slate-600 leading-relaxed">
                    نلتزم بتوفير قطع غيار أصلية ومعتمدة لماركات شانجان، إم جي، جيلي، وهافال، مع ضمان سياسات إرجاع مرنة ودعم فني متخصص لمساعدتكم في اختيار القطع الصحيحة.
                </p>
            </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200 divide-x-reverse">
                <div>
                    <h4 className="text-4xl font-black text-primary-600 mb-2">20k+</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">صنف متوفر</p>
                </div>
                <div>
                    <h4 className="text-4xl font-black text-slate-800 mb-2">500+</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">عميل جملة</p>
                </div>
                <div>
                    <h4 className="text-4xl font-black text-secondary-500 mb-2">12</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">ساعة توصيل</p>
                </div>
                <div>
                    <h4 className="text-4xl font-black text-slate-800 mb-2">24/7</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">نظام آلي</p>
                </div>
            </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Phone size={28} />
                </div>
                <div>
                    <p className="text-sm text-slate-400 font-bold uppercase">الرقم الموحد</p>
                    <p className="text-2xl font-black text-slate-900 font-mono">9200 00000</p>
                </div>
            </div>
            
            <div className="h-12 w-px bg-slate-100 hidden md:block"></div>
            
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-green-600 shadow-sm">
                    <MessageCircle size={28} />
                </div>
                <div>
                    <p className="text-sm text-slate-400 font-bold uppercase">واتساب المبيعات</p>
                    <p className="text-2xl font-black text-slate-900 font-mono">050 000 0000</p>
                </div>
            </div>

            <div className="h-12 w-px bg-slate-100 hidden md:block"></div>

            <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                    <Globe size={28} />
                </div>
                <div>
                    <p className="text-sm text-slate-400 font-bold uppercase">الإدارة العامة</p>
                    <p className="text-lg font-bold text-slate-900">الرياض، طريق الملك فهد</p>
                </div>
            </div>
        </div>
    </div>
  );
};
