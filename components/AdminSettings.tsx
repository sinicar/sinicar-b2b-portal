
import React, { useState, useEffect } from 'react';
import { Banner, SiteSettings } from '../types';
import { MockApi } from '../services/mockApi';
import { Settings, Image as ImageIcon, Server, Palette, Save, Upload, Plus, Trash2, Eye, EyeOff, RefreshCcw, Check, X, ShieldAlert, Monitor, Wifi, Activity, Type, Radio, Megaphone } from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';

export const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'BANNERS' | 'API' | 'APPEARANCE' | 'TEXTS'>('GENERAL');
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Banner Form State
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [newBanner, setNewBanner] = useState<Partial<Banner>>({ 
        title: '', subtitle: '', buttonText: 'تصفح الآن', colorClass: 'from-slate-700 to-slate-900', isActive: true 
    });

    const { addToast } = useToast();
    const { t } = useLanguage();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [s, b] = await Promise.all([
                MockApi.getSettings(),
                MockApi.getBanners()
            ]);
            setSettings(s);
            setBanners(b);
        } catch (e) {
            addToast('فشل في تحميل الإعدادات', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGeneral = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await MockApi.updateSettings(settings);
            addToast('تم حفظ الإعدادات بنجاح', 'success');
            // We might need to reload window or notify context to update texts immediately
            // For now, next route change will pick it up or we can force reload
        } catch (e) {
            addToast('حدث خطأ أثناء الحفظ', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        const btn = document.getElementById('test-conn-btn');
        if(btn) btn.innerText = 'جاري الاتصال...';
        
        // Simulation
        setTimeout(() => {
            if(settings?.apiConfig.authToken) {
                addToast('تم الاتصال بالسيرفر بنجاح (200 OK)', 'success');
            } else {
                addToast('فشل الاتصال: رمز المصادقة مفقود', 'error');
            }
            if(btn) btn.innerText = 'اختبار الاتصال';
        }, 1500);
    };

    const handleAddBanner = async () => {
        if (!newBanner.title || !newBanner.subtitle) {
            addToast('يرجى تعبئة العنوان والوصف', 'error');
            return;
        }
        const bannerToAdd: Banner = {
            id: `b-${Date.now()}`,
            title: newBanner.title || '',
            subtitle: newBanner.subtitle || '',
            buttonText: newBanner.buttonText || 'تصفح',
            colorClass: newBanner.colorClass || 'from-slate-700 to-slate-900',
            imageUrl: newBanner.imageUrl,
            isActive: true
        };
        const updated = [...banners, bannerToAdd];
        setBanners(updated);
        await MockApi.updateBanners(updated);
        setShowBannerForm(false);
        setNewBanner({ title: '', subtitle: '', buttonText: 'تصفح الآن', colorClass: 'from-slate-700 to-slate-900', isActive: true });
        addToast('تم إضافة البنر', 'success');
    };

    const handleDeleteBanner = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا البنر؟')) {
            const updated = banners.filter(b => b.id !== id);
            setBanners(updated);
            await MockApi.updateBanners(updated);
            addToast('تم حذف البنر', 'info');
        }
    };

    const toggleBanner = async (id: string) => {
        const updated = banners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
        setBanners(updated);
        await MockApi.updateBanners(updated);
    };

    // Text Manager Handler
    const handleTextChange = (key: string, value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            uiTexts: {
                ...settings.uiTexts,
                [key]: value
            }
        });
    };

    if (loading || !settings) return <div className="p-10 text-center">جاري التحميل...</div>;

    const TabButton = ({ id, icon, label }: { id: string, icon: React.ReactNode, label: string }) => (
        <button 
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all mb-2 font-bold ${activeTab === id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in max-w-7xl mx-auto">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-72 flex-shrink-0">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 sticky top-6">
                    <h3 className="font-black text-xl text-slate-800 mb-6 px-2">إعدادات النظام</h3>
                    <nav>
                        <TabButton id="GENERAL" icon={<Settings size={20} />} label="الإعدادات العامة" />
                        <TabButton id="BANNERS" icon={<ImageIcon size={20} />} label="إدارة البنرات" />
                        <TabButton id="TEXTS" icon={<Type size={20} />} label="إدارة النصوص" />
                        <TabButton id="API" icon={<Server size={20} />} label="الربط البرمجي (API)" />
                        <TabButton id="APPEARANCE" icon={<Palette size={20} />} label="المظهر والهوية" />
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === 'GENERAL' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Settings className="text-primary-600" /> إعدادات الموقع الأساسية
                            </h2>
                            <button onClick={handleSaveGeneral} disabled={saving} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 flex items-center gap-2">
                                <Save size={18} /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموقع / المتجر</label>
                                <input 
                                    type="text" 
                                    value={settings.siteName}
                                    onChange={e => setSettings({...settings, siteName: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الدعم الفني</label>
                                <input 
                                    type="text" 
                                    value={settings.supportPhone}
                                    onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">رقم واتساب المبيعات</label>
                                <input 
                                    type="text" 
                                    value={settings.supportWhatsapp || ''}
                                    onChange={e => setSettings({...settings, supportWhatsapp: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    dir="ltr"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني للدعم</label>
                                <input 
                                    type="email" 
                                    value={settings.supportEmail}
                                    onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* News Ticker Section */}
                        <div className="mt-8 border-t border-slate-100 pt-8">
                             <div className="flex items-center gap-3 mb-6">
                                 <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Megaphone size={20} /></div>
                                 <h3 className="font-bold text-lg text-slate-800">شريط الأخبار المتحرك</h3>
                             </div>
                             
                             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                 <div className="flex items-center justify-between mb-2">
                                     <span className="font-bold text-slate-700">تفعيل الشريط</span>
                                     <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={settings.tickerEnabled} 
                                            onChange={e => setSettings({...settings, tickerEnabled: e.target.checked})}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                 </div>

                                 <div>
                                     <label className="block text-sm font-bold text-slate-700 mb-2">نص الشريط</label>
                                     <textarea 
                                        rows={2}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm"
                                        value={settings.tickerText}
                                        onChange={e => setSettings({...settings, tickerText: e.target.value})}
                                        placeholder="اكتب النص الذي سيظهر للعملاء..."
                                     ></textarea>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div>
                                         <label className="block text-sm font-bold text-slate-700 mb-2">السرعة (1-10)</label>
                                         <input 
                                            type="number" 
                                            min={1} 
                                            max={10}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg"
                                            value={settings.tickerSpeed}
                                            onChange={e => setSettings({...settings, tickerSpeed: parseInt(e.target.value)})}
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-sm font-bold text-slate-700 mb-2">لون الخلفية (Hex)</label>
                                         <div className="flex gap-2">
                                             <div className="w-10 h-10 rounded border border-slate-300" style={{backgroundColor: settings.tickerBgColor}}></div>
                                             <input 
                                                type="text" 
                                                className="w-full p-3 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                                                value={settings.tickerBgColor}
                                                onChange={e => setSettings({...settings, tickerBgColor: e.target.value})}
                                             />
                                         </div>
                                     </div>
                                     <div>
                                         <label className="block text-sm font-bold text-slate-700 mb-2">لون النص (Hex)</label>
                                         <div className="flex gap-2">
                                             <div className="w-10 h-10 rounded border border-slate-300" style={{backgroundColor: settings.tickerTextColor}}></div>
                                             <input 
                                                type="text" 
                                                className="w-full p-3 bg-white border border-slate-300 rounded-lg font-mono text-sm"
                                                value={settings.tickerTextColor}
                                                onChange={e => setSettings({...settings, tickerTextColor: e.target.value})}
                                             />
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="bg-red-50 p-6 rounded-xl border border-red-100 mt-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                                        <ShieldAlert />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 text-lg">وضع الصيانة</h4>
                                        <p className="text-red-700 text-sm">عند تفعيل هذا الخيار، سيظهر الموقع كـ "مغلق للصيانة" لجميع العملاء.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.maintenanceMode} 
                                        onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] peer-checked:after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'BANNERS' && (
                    <div className="space-y-6 animate-slide-up">
                         <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                             <div>
                                 <h2 className="text-2xl font-bold text-slate-800">إدارة البنرات الإعلانية</h2>
                                 <p className="text-slate-500 text-sm">تحكم في الصور والعروض التي تظهر في الصفحة الرئيسية</p>
                             </div>
                             <button onClick={() => setShowBannerForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800">
                                 <Plus size={16} /> إضافة بنر جديد
                             </button>
                         </div>

                         {showBannerForm && (
                             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-fade-in">
                                 <h4 className="font-bold mb-4">بيانات البنر الجديد</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                     <input placeholder="العنوان الرئيسي" className="p-3 rounded-lg border-slate-200" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                                     <input placeholder="الوصف الفرعي" className="p-3 rounded-lg border-slate-200" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                                     <input placeholder="نص الزر (مثال: تسوق الآن)" className="p-3 rounded-lg border-slate-200" value={newBanner.buttonText} onChange={e => setNewBanner({...newBanner, buttonText: e.target.value})} />
                                     <select className="p-3 rounded-lg border-slate-200" value={newBanner.colorClass} onChange={e => setNewBanner({...newBanner, colorClass: e.target.value})}>
                                         <option value="from-slate-700 to-slate-900">رمادي داكن (افتراضي)</option>
                                         <option value="from-primary-600 to-primary-900">أزرق ملكي</option>
                                         <option value="from-secondary-500 to-secondary-700">برتقالي حيوي</option>
                                         <option value="from-green-600 to-green-800">أخضر داكن</option>
                                     </select>
                                     <input placeholder="رابط الصورة (اختياري)" className="p-3 rounded-lg border-slate-200 col-span-2" value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} />
                                 </div>
                                 <div className="flex gap-3">
                                     <button onClick={handleAddBanner} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">حفظ ونشر</button>
                                     <button onClick={() => setShowBannerForm(false)} className="bg-white border border-slate-300 text-slate-600 px-6 py-2 rounded-lg font-bold">إلغاء</button>
                                 </div>
                             </div>
                         )}

                         <div className="grid gap-4">
                             {banners.map(banner => (
                                 <div key={banner.id} className={`bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-6 ${banner.isActive ? 'border-slate-200' : 'border-red-100 bg-red-50 opacity-70'}`}>
                                     <div className={`w-full md:w-32 h-20 rounded-lg bg-gradient-to-r ${banner.colorClass} flex items-center justify-center text-white shadow-inner flex-shrink-0`}>
                                         {banner.imageUrl ? <img src={banner.imageUrl} className="w-full h-full object-cover rounded-lg" alt="" /> : <ImageIcon />}
                                     </div>
                                     <div className="flex-1 text-center md:text-right">
                                         <h4 className="font-bold text-lg text-slate-800">{banner.title}</h4>
                                         <p className="text-sm text-slate-500">{banner.subtitle}</p>
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <button onClick={() => toggleBanner(banner.id)} className={`p-2 rounded-lg transition-colors ${banner.isActive ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`} title={banner.isActive ? "إخفاء" : "إظهار"}>
                                             {banner.isActive ? <Eye size={20} /> : <EyeOff size={20} />}
                                         </button>
                                         <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                             <Trash2 size={20} />
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>
                )}

                {activeTab === 'TEXTS' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <Type className="text-brand-600" /> إدارة نصوص واجهة المستخدم
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">يمكنك تعديل المسميات والعناوين الظاهرة للعملاء مباشرة من هنا.</p>
                            </div>
                            <button onClick={handleSaveGeneral} disabled={saving} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 flex items-center gap-2">
                                <Save size={18} /> {saving ? 'جاري الحفظ...' : 'حفظ النصوص'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.uiTexts && Object.entries(settings.uiTexts).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors">
                                    <div className="text-sm font-mono text-slate-500 md:col-span-1 break-all">
                                        {key}
                                    </div>
                                    <div className="md:col-span-2">
                                        <input 
                                            type="text" 
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                            value={value}
                                            onChange={(e) => handleTextChange(key, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'API' && (
                     <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Server className="text-secondary-500" /> إعدادات الربط (ERP Integration)
                            </h2>
                            <button onClick={handleSaveGeneral} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200">
                                حفظ الإعدادات
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">رابط النظام المحاسبي (Cloud ERP URL)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Monitor size={16} />
                                    </div>
                                    <input 
                                        type="url" 
                                        dir="ltr"
                                        placeholder="https://api.your-erp.com/v1"
                                        value={settings.apiConfig.baseUrl}
                                        onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, baseUrl: e.target.value}})}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                                    />
                                </div>
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">مفتاح الربط (API Token)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <ShieldAlert size={16} />
                                    </div>
                                    <input 
                                        type="password" 
                                        dir="ltr"
                                        value={settings.apiConfig.authToken}
                                        onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, authToken: e.target.value}})}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                                        placeholder="sk_live_xxxxxxxxxxxxxxxx"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">تكرار المزامنة (Sync Frequency)</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    value={settings.apiConfig.syncInterval}
                                    onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, syncInterval: e.target.value as any}})}
                                >
                                    <option value="REALTIME">فوري (Real-time)</option>
                                    <option value="15MIN">كل 15 دقيقة</option>
                                    <option value="HOURLY">كل ساعة</option>
                                    <option value="DAILY">يومي</option>
                                </select>
                            </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">بيئة التشغيل</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    value={settings.apiConfig.environment}
                                    onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, environment: e.target.value as any}})}
                                >
                                    <option value="PRODUCTION">Production (Live)</option>
                                    <option value="SANDBOX">Sandbox (Test)</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6 mt-4">
                             <button 
                                id="test-conn-btn"
                                onClick={handleTestConnection}
                                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-400 transition-all flex justify-center items-center gap-2"
                             >
                                 <Wifi size={20} /> اختبار الاتصال بالنظام
                             </button>
                        </div>
                     </div>
                )}

                {activeTab === 'APPEARANCE' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8 animate-slide-up">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Palette className="text-purple-500" /> المظهر والتخصيص
                            </h2>
                            <button onClick={handleSaveGeneral} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200">
                                حفظ التغييرات
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-4">لون الهوية الأساسي</label>
                                 <div className="flex items-center gap-4">
                                     <div className="w-16 h-16 rounded-xl shadow-md border-4 border-white ring-1 ring-slate-200" style={{backgroundColor: settings.primaryColor}}></div>
                                     <input 
                                        type="color" 
                                        value={settings.primaryColor}
                                        onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                                        className="h-12 w-32 p-1 rounded-lg cursor-pointer" 
                                     />
                                 </div>
                                 <p className="text-xs text-slate-500 mt-2">يؤثر هذا اللون على الأزرار، الروابط، والعناوين الرئيسية.</p>
                             </div>

                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-4">شعار الموقع (Logo)</label>
                                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                                     {settings.logoUrl ? (
                                         <div className="relative w-fit mx-auto">
                                             <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" />
                                             <button onClick={() => setSettings({...settings, logoUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                                         </div>
                                     ) : (
                                         <div className="text-slate-400 cursor-pointer" onClick={() => addToast('خاصية الرفع غير مفعلة في النسخة التجريبية', 'info')}>
                                             <Upload className="mx-auto mb-2" />
                                             <span className="text-xs font-bold">اضغط لرفع الشعار</span>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                        
                        <div className="bg-slate-900 text-white p-6 rounded-xl flex items-center justify-between">
                             <div>
                                 <h4 className="font-bold">معاينة حية</h4>
                                 <p className="text-sm opacity-70">هكذا سيظهر الزر الرئيسي باللون المختار</p>
                             </div>
                             <button style={{backgroundColor: settings.primaryColor}} className="px-6 py-3 rounded-lg font-bold shadow-lg">
                                 مثال للزر الرئيسي
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
