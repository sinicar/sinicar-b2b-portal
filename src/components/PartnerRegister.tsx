/**
 * Partner Registration Page - صفحة تسجيل الشركاء
 * يحتوي على 4 تبويبات: مورد محلي، مورد دولي، مسوق، معلن
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../services/LanguageContext';
import { useToast } from '../services/ToastContext';
import { MockApi } from '../services/mockApi';
import LanguageSwitcher from './LanguageSwitcher';
import {
    Building2, Globe, Megaphone, Sparkles, ArrowRight, ArrowLeft,
    CheckCircle, Phone, Lock, Eye, EyeOff, Send, User, MapPin,
    FileText, Car, Hash, Briefcase, Calendar, Clock, Plus, X,
    Factory, Truck, MessageCircle
} from 'lucide-react';
import {
    CAR_BRANDS, SAUDI_CITIES, MARKETING_CHANNELS, AD_TYPES,
    AD_DURATIONS, COUNTRIES, BUSINESS_TYPES, PARTNER_TYPES
} from '../utils/partnerConstants';

interface PartnerRegisterProps {
    onBack: () => void;
    onCheckStatus?: () => void;
}

type PartnerType = 'LOCAL_SUPPLIER' | 'INTERNATIONAL_SUPPLIER' | 'MARKETER' | 'ADVERTISER';

export const PartnerRegister: React.FC<PartnerRegisterProps> = ({ onBack, onCheckStatus }) => {
    const { t, i18n } = useTranslation();
    const { dir } = useLanguage();
    const { addToast } = useToast();
    const isRTL = i18n.language === 'ar';

    const [activeTab, setActiveTab] = useState<PartnerType>('LOCAL_SUPPLIER');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Status Check Mode
    const [checkStatusMode, setCheckStatusMode] = useState(false);
    const [statusCheckPhone, setStatusCheckPhone] = useState('');
    const [statusCheckPassword, setStatusCheckPassword] = useState('');
    const [statusResult, setStatusResult] = useState<{ status: string; message: string } | null>(null);

    // === Form States ===

    // Local Supplier Form
    const [localSupplier, setLocalSupplier] = useState({
        companyName: '',
        commercialRegNumber: '',
        vatNumber: '',
        nationalAddressNumber: '',
        phone: '',
        password: '',
        confirmPassword: '',
        city: '',
        carBrands: [] as string[],
        ownBrands: [] as string[],
        newOwnBrand: '',
    });

    // International Supplier Form
    const [intlSupplier, setIntlSupplier] = useState({
        companyName: '',
        country: '',
        city: '',
        businessType: '' as 'factory' | 'supplier' | 'agent' | '',
        phone: '',
        password: '',
        confirmPassword: '',
        carBrands: [] as string[],
    });

    // Marketer Form
    const [marketer, setMarketer] = useState({
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        marketingChannels: [] as string[],
        otherChannel: '',
    });

    // Advertiser Form
    const [advertiser, setAdvertiser] = useState({
        companyName: '',
        phone: '',
        adType: '' as 'banner' | 'popup' | 'notification' | '',
        duration: 0,
        startDate: '',
    });

    // === Handlers ===

    const handleAddCarBrand = (brand: string, form: 'local' | 'intl') => {
        if (form === 'local') {
            if (!localSupplier.carBrands.includes(brand)) {
                setLocalSupplier({ ...localSupplier, carBrands: [...localSupplier.carBrands, brand] });
            }
        } else {
            if (!intlSupplier.carBrands.includes(brand)) {
                setIntlSupplier({ ...intlSupplier, carBrands: [...intlSupplier.carBrands, brand] });
            }
        }
    };

    const handleRemoveCarBrand = (brand: string, form: 'local' | 'intl') => {
        if (form === 'local') {
            setLocalSupplier({ ...localSupplier, carBrands: localSupplier.carBrands.filter(b => b !== brand) });
        } else {
            setIntlSupplier({ ...intlSupplier, carBrands: intlSupplier.carBrands.filter(b => b !== brand) });
        }
    };

    const handleAddOwnBrand = () => {
        if (localSupplier.newOwnBrand.trim() && !localSupplier.ownBrands.includes(localSupplier.newOwnBrand.trim())) {
            setLocalSupplier({
                ...localSupplier,
                ownBrands: [...localSupplier.ownBrands, localSupplier.newOwnBrand.trim()],
                newOwnBrand: ''
            });
        }
    };

    const toggleMarketingChannel = (channelId: string) => {
        setMarketer(prev => ({
            ...prev,
            marketingChannels: prev.marketingChannels.includes(channelId)
                ? prev.marketingChannels.filter(c => c !== channelId)
                : [...prev.marketingChannels, channelId]
        }));
    };

    const validateForm = (): boolean => {
        if (activeTab === 'LOCAL_SUPPLIER') {
            if (!localSupplier.companyName) { addToast('الرجاء إدخال اسم الشركة', 'error'); return false; }
            if (!localSupplier.commercialRegNumber) { addToast('الرجاء إدخال رقم السجل التجاري', 'error'); return false; }
            if (!localSupplier.vatNumber) { addToast('الرجاء إدخال الرقم الضريبي', 'error'); return false; }
            if (!localSupplier.nationalAddressNumber) { addToast('الرجاء إدخال رقم العنوان الوطني', 'error'); return false; }
            if (!localSupplier.phone) { addToast('الرجاء إدخال رقم الجوال', 'error'); return false; }
            if (!localSupplier.city) { addToast('الرجاء اختيار المدينة', 'error'); return false; }
            if (localSupplier.carBrands.length === 0) { addToast('الرجاء اختيار ماركة واحدة على الأقل', 'error'); return false; }
            if (!localSupplier.password || localSupplier.password.length < 6) { addToast('كلمة السر يجب أن تكون 6 أحرف على الأقل', 'error'); return false; }
            if (localSupplier.password !== localSupplier.confirmPassword) { addToast('كلمة السر غير متطابقة', 'error'); return false; }
        }

        if (activeTab === 'INTERNATIONAL_SUPPLIER') {
            if (!intlSupplier.companyName) { addToast('الرجاء إدخال اسم الشركة', 'error'); return false; }
            if (!intlSupplier.country) { addToast('الرجاء اختيار البلد', 'error'); return false; }
            if (!intlSupplier.city) { addToast('الرجاء إدخال المدينة', 'error'); return false; }
            if (!intlSupplier.businessType) { addToast('الرجاء اختيار نوع العمل', 'error'); return false; }
            if (!intlSupplier.phone) { addToast('الرجاء إدخال رقم الجوال', 'error'); return false; }
            if (intlSupplier.carBrands.length === 0) { addToast('الرجاء اختيار ماركة واحدة على الأقل', 'error'); return false; }
            if (!intlSupplier.password || intlSupplier.password.length < 6) { addToast('كلمة السر يجب أن تكون 6 أحرف على الأقل', 'error'); return false; }
            if (intlSupplier.password !== intlSupplier.confirmPassword) { addToast('كلمة السر غير متطابقة', 'error'); return false; }
        }

        if (activeTab === 'MARKETER') {
            if (!marketer.fullName) { addToast('الرجاء إدخال الاسم الكامل', 'error'); return false; }
            if (!marketer.phone) { addToast('الرجاء إدخال رقم الجوال', 'error'); return false; }
            if (marketer.marketingChannels.length === 0) { addToast('الرجاء اختيار طريقة تسويق واحدة على الأقل', 'error'); return false; }
            if (!marketer.password || marketer.password.length < 6) { addToast('كلمة السر يجب أن تكون 6 أحرف على الأقل', 'error'); return false; }
            if (marketer.password !== marketer.confirmPassword) { addToast('كلمة السر غير متطابقة', 'error'); return false; }
        }

        if (activeTab === 'ADVERTISER') {
            if (!advertiser.companyName) { addToast('الرجاء إدخال اسم الشركة', 'error'); return false; }
            if (!advertiser.phone) { addToast('الرجاء إدخال رقم الجوال', 'error'); return false; }
            if (!advertiser.adType) { addToast('الرجاء اختيار نوع الإعلان', 'error'); return false; }
            if (!advertiser.duration) { addToast('الرجاء تحديد مدة الإعلان', 'error'); return false; }
            if (!advertiser.startDate) { addToast('الرجاء تحديد تاريخ البداية', 'error'); return false; }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const requestData: any = {
                type: activeTab,
                status: 'NEW',
                createdAt: new Date().toISOString(),
            };

            if (activeTab === 'LOCAL_SUPPLIER') {
                Object.assign(requestData, {
                    companyName: localSupplier.companyName,
                    commercialRegNumber: localSupplier.commercialRegNumber,
                    vatNumber: localSupplier.vatNumber,
                    nationalAddressNumber: localSupplier.nationalAddressNumber,
                    phone: localSupplier.phone,
                    password: localSupplier.password,
                    city: localSupplier.city,
                    carBrands: localSupplier.carBrands,
                    ownBrands: localSupplier.ownBrands,
                });
            } else if (activeTab === 'INTERNATIONAL_SUPPLIER') {
                Object.assign(requestData, {
                    companyName: intlSupplier.companyName,
                    country: intlSupplier.country,
                    city: intlSupplier.city,
                    businessType: intlSupplier.businessType,
                    phone: intlSupplier.phone,
                    password: intlSupplier.password,
                    carBrands: intlSupplier.carBrands,
                });
            } else if (activeTab === 'MARKETER') {
                Object.assign(requestData, {
                    fullName: marketer.fullName,
                    phone: marketer.phone,
                    password: marketer.password,
                    marketingChannels: marketer.marketingChannels,
                    otherChannel: marketer.otherChannel,
                });
            } else if (activeTab === 'ADVERTISER') {
                Object.assign(requestData, {
                    companyName: advertiser.companyName,
                    phone: advertiser.phone,
                    adType: advertiser.adType,
                    duration: advertiser.duration,
                    startDate: advertiser.startDate,
                });
            }

            await MockApi.createPartnerRequest(requestData);
            setSuccess(true);
            addToast('تم إرسال طلبك بنجاح! سنتواصل معك قريباً', 'success');
        } catch (error) {
            addToast('حدث خطأ أثناء إرسال الطلب', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        if (!statusCheckPhone || !statusCheckPassword) {
            addToast('الرجاء إدخال رقم الجوال وكلمة السر', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await MockApi.checkPartnerRequestStatus(statusCheckPhone, statusCheckPassword);
            setStatusResult(result);
        } catch (error) {
            addToast('لم يتم العثور على طلب بهذه البيانات', 'error');
        } finally {
            setLoading(false);
        }
    };

    // === Tab Components ===

    const tabs = [
        { id: 'LOCAL_SUPPLIER' as const, icon: Building2, ...PARTNER_TYPES.LOCAL_SUPPLIER },
        { id: 'INTERNATIONAL_SUPPLIER' as const, icon: Globe, ...PARTNER_TYPES.INTERNATIONAL_SUPPLIER },
        { id: 'MARKETER' as const, icon: Megaphone, ...PARTNER_TYPES.MARKETER },
        { id: 'ADVERTISER' as const, icon: Sparkles, ...PARTNER_TYPES.ADVERTISER },
    ];

    // === Render ===

    // Success View
    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4" dir={dir}>
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-10 text-center animate-fade-in">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8 shadow-sm animate-bounce">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4">تم إرسال طلبك بنجاح!</h2>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        سيتم مراجعة طلبك من قبل فريق العمل وسيتم التواصل معك عبر رقم الجوال المسجل.
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                        <p className="text-sm text-slate-600">
                            يمكنك متابعة حالة طلبك عبر إدخال رقم الجوال وكلمة السر
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setCheckStatusMode(true)}
                            className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-md"
                        >
                            متابعة حالة الطلب
                        </button>
                        <button
                            onClick={onBack}
                            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                        >
                            العودة للرئيسية
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Status Check View
    if (checkStatusMode) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4" dir={dir}>
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4">
                            <Clock size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">متابعة حالة الطلب</h2>
                        <p className="text-slate-500 text-sm">أدخل بياناتك للتحقق من حالة طلبك</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">رقم الجوال</label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="tel"
                                    value={statusCheckPhone}
                                    onChange={(e) => setStatusCheckPhone(e.target.value)}
                                    placeholder="05xxxxxxxx"
                                    className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">كلمة السر</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={statusCheckPassword}
                                    onChange={(e) => setStatusCheckPassword(e.target.value)}
                                    placeholder="كلمة السر"
                                    className="w-full pr-10 pl-12 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {statusResult && (
                            <div className={`p-4 rounded-xl border ${statusResult.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-700' :
                                    statusResult.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700' :
                                        statusResult.status === 'NEEDS_MODIFICATION' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                            'bg-yellow-50 border-yellow-200 text-yellow-700'
                                }`}>
                                <p className="font-bold text-sm">{statusResult.message}</p>
                            </div>
                        )}

                        <button
                            onClick={handleCheckStatus}
                            disabled={loading}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-md disabled:opacity-50"
                        >
                            {loading ? 'جارٍ البحث...' : 'تحقق من الحالة'}
                        </button>

                        <button
                            onClick={() => {
                                setCheckStatusMode(false);
                                setStatusResult(null);
                            }}
                            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                        >
                            العودة
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Registration View
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4" dir={dir}>
            {/* Language Switcher */}
            <div className={`fixed top-4 z-50 ${dir === 'rtl' ? 'left-4' : 'right-4'}`}>
                <LanguageSwitcher variant="floating" size="md" />
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 font-medium"
                    >
                        <ArrowRight size={18} className="rtl:rotate-180" />
                        العودة لتسجيل الدخول
                    </button>
                    <h1 className="text-4xl font-black text-slate-800 mb-3">كن شريكنا</h1>
                    <p className="text-slate-500 text-lg">انضم لشبكة شركاء صيني كار</p>
                </div>

                {/* Check Status Link */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => setCheckStatusMode(true)}
                        className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-sm underline"
                    >
                        <Clock size={16} />
                        لديك طلب سابق؟ تابع حالته من هنا
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${activeTab === tab.id
                                    ? `${tab.color} text-white border-transparent shadow-lg scale-105`
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow'
                                }`}
                        >
                            <tab.icon size={24} />
                            <div className="text-start">
                                <p className="font-bold">{tab.label}</p>
                                <p className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-slate-400'}`}>
                                    {tab.labelEn}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-fade-in">

                    {/* Local Supplier Form */}
                    {activeTab === 'LOCAL_SUPPLIER' && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        اسم الشركة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={localSupplier.companyName}
                                        onChange={(e) => setLocalSupplier({ ...localSupplier, companyName: e.target.value })}
                                        placeholder="اسم الشركة أو المؤسسة"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        رقم السجل التجاري <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={localSupplier.commercialRegNumber}
                                        onChange={(e) => setLocalSupplier({ ...localSupplier, commercialRegNumber: e.target.value })}
                                        placeholder="1010xxxxxx"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        الرقم الضريبي <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={localSupplier.vatNumber}
                                        onChange={(e) => setLocalSupplier({ ...localSupplier, vatNumber: e.target.value })}
                                        placeholder="3xxxxxxxxxxxxxxx"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        رقم العنوان الوطني <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={localSupplier.nationalAddressNumber}
                                        onChange={(e) => setLocalSupplier({ ...localSupplier, nationalAddressNumber: e.target.value })}
                                        placeholder="AAAA1234"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        رقم الجوال <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={localSupplier.phone}
                                        onChange={(e) => setLocalSupplier({ ...localSupplier, phone: e.target.value })}
                                        placeholder="05xxxxxxxx"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        المدينة <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={localSupplier.city}
                                        onChange={(e) => setLocalSupplier({ ...localSupplier, city: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="">اختر المدينة</option>
                                        {SAUDI_CITIES.map((city) => (
                                            <option key={city.id} value={city.id}>{city.label} - {city.region}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Car Brands Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    ماركات السيارات التي توردها <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {localSupplier.carBrands.map((brand) => (
                                        <span key={brand} className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-bold">
                                            {CAR_BRANDS.find(b => b.id === brand)?.label || brand}
                                            <button onClick={() => handleRemoveCarBrand(brand, 'local')} className="hover:text-red-600">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                                    {CAR_BRANDS.filter(b => !localSupplier.carBrands.includes(b.id)).map((brand) => (
                                        <button
                                            key={brand.id}
                                            type="button"
                                            onClick={() => handleAddCarBrand(brand.id, 'local')}
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                                        >
                                            {brand.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Own Brands */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    علامات تجارية خاصة بك (اختياري)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={localSupplier.newOwnBrand}
                                        onChange={(e) => setLocalSupplier({ ...localSupplier, newOwnBrand: e.target.value })}
                                        placeholder="اسم العلامة التجارية"
                                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddOwnBrand()}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddOwnBrand}
                                        className="px-4 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                {localSupplier.ownBrands.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {localSupplier.ownBrands.map((brand) => (
                                            <span key={brand} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                                {brand}
                                                <button onClick={() => setLocalSupplier({ ...localSupplier, ownBrands: localSupplier.ownBrands.filter(b => b !== brand) })} className="hover:text-red-600">
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        كلمة السر <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={localSupplier.password}
                                            onChange={(e) => setLocalSupplier({ ...localSupplier, password: e.target.value })}
                                            placeholder="6 أحرف على الأقل"
                                            className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        تأكيد كلمة السر <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={localSupplier.confirmPassword}
                                            onChange={(e) => setLocalSupplier({ ...localSupplier, confirmPassword: e.target.value })}
                                            placeholder="أعد كتابة كلمة السر"
                                            className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* International Supplier Form */}
                    {activeTab === 'INTERNATIONAL_SUPPLIER' && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        اسم الشركة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={intlSupplier.companyName}
                                        onChange={(e) => setIntlSupplier({ ...intlSupplier, companyName: e.target.value })}
                                        placeholder="Company Name"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        البلد <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={intlSupplier.country}
                                        onChange={(e) => setIntlSupplier({ ...intlSupplier, country: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value="">اختر البلد</option>
                                        {COUNTRIES.map((country) => (
                                            <option key={country.code} value={country.code}>{country.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        المدينة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={intlSupplier.city}
                                        onChange={(e) => setIntlSupplier({ ...intlSupplier, city: e.target.value })}
                                        placeholder="City Name"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        نوع العمل <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {BUSINESS_TYPES.map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setIntlSupplier({ ...intlSupplier, businessType: type.id as any })}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 text-center font-bold transition-all ${intlSupplier.businessType === type.id
                                                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                    رقم الجوال (WhatsApp) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={intlSupplier.phone}
                                    onChange={(e) => setIntlSupplier({ ...intlSupplier, phone: e.target.value })}
                                    placeholder="+86 xxx xxxx xxxx"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                />
                            </div>

                            {/* Car Brands Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    ماركات السيارات <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {intlSupplier.carBrands.map((brand) => (
                                        <span key={brand} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                            {CAR_BRANDS.find(b => b.id === brand)?.label || brand}
                                            <button onClick={() => handleRemoveCarBrand(brand, 'intl')} className="hover:text-red-600">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
                                    {CAR_BRANDS.filter(b => !intlSupplier.carBrands.includes(b.id)).map((brand) => (
                                        <button
                                            key={brand.id}
                                            type="button"
                                            onClick={() => handleAddCarBrand(brand.id, 'intl')}
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100"
                                        >
                                            {brand.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        كلمة السر <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={intlSupplier.password}
                                        onChange={(e) => setIntlSupplier({ ...intlSupplier, password: e.target.value })}
                                        placeholder="Password"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        تأكيد كلمة السر <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={intlSupplier.confirmPassword}
                                        onChange={(e) => setIntlSupplier({ ...intlSupplier, confirmPassword: e.target.value })}
                                        placeholder="Confirm Password"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Marketer Form */}
                    {activeTab === 'MARKETER' && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        الاسم الكامل <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={marketer.fullName}
                                        onChange={(e) => setMarketer({ ...marketer, fullName: e.target.value })}
                                        placeholder="الاسم الثلاثي"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        رقم الجوال <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={marketer.phone}
                                        onChange={(e) => setMarketer({ ...marketer, phone: e.target.value })}
                                        placeholder="05xxxxxxxx"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Marketing Channels */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    كيف ستسوق لنا؟ <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {MARKETING_CHANNELS.map((channel) => (
                                        <button
                                            key={channel.id}
                                            type="button"
                                            onClick={() => toggleMarketingChannel(channel.id)}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${marketer.marketingChannels.includes(channel.id)
                                                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            <MessageCircle size={24} className="mx-auto mb-2" />
                                            <span className="text-sm font-bold block">{channel.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {marketer.marketingChannels.includes('other') && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        طريقة التسويق الأخرى
                                    </label>
                                    <input
                                        type="text"
                                        value={marketer.otherChannel}
                                        onChange={(e) => setMarketer({ ...marketer, otherChannel: e.target.value })}
                                        placeholder="حدد طريقة التسويق"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Password */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        كلمة السر <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={marketer.password}
                                        onChange={(e) => setMarketer({ ...marketer, password: e.target.value })}
                                        placeholder="6 أحرف على الأقل"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        تأكيد كلمة السر <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={marketer.confirmPassword}
                                        onChange={(e) => setMarketer({ ...marketer, confirmPassword: e.target.value })}
                                        placeholder="أعد كتابة كلمة السر"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advertiser Form */}
                    {activeTab === 'ADVERTISER' && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        اسم الشركة / الجهة <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={advertiser.companyName}
                                        onChange={(e) => setAdvertiser({ ...advertiser, companyName: e.target.value })}
                                        placeholder="اسم الشركة أو الفرد"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        رقم الجوال <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={advertiser.phone}
                                        onChange={(e) => setAdvertiser({ ...advertiser, phone: e.target.value })}
                                        placeholder="05xxxxxxxx"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Ad Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    نوع الإعلان <span className="text-red-500">*</span>
                                </label>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {AD_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setAdvertiser({ ...advertiser, adType: type.id as any })}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${advertiser.adType === type.id
                                                    ? 'border-amber-600 bg-amber-50 text-amber-700'
                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                        >
                                            <Sparkles size={28} className="mx-auto mb-2" />
                                            <p className="font-bold">{type.label}</p>
                                            <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        مدة الإعلان <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={advertiser.duration}
                                        onChange={(e) => setAdvertiser({ ...advertiser, duration: parseInt(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                    >
                                        <option value={0}>اختر المدة</option>
                                        {AD_DURATIONS.map((dur) => (
                                            <option key={dur.days} value={dur.days}>{dur.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                                        تاريخ بداية الإعلان <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={advertiser.startDate}
                                        onChange={(e) => setAdvertiser({ ...advertiser, startDate: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="animate-pulse">جارٍ الإرسال...</span>
                            ) : (
                                <>
                                    <Send size={20} className="rtl:rotate-180" />
                                    إرسال الطلب
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerRegister;
