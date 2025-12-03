
import React, { useState, useEffect } from 'react';
import { Banner, SiteSettings, StatusLabelsConfig } from '../types';
import { MockApi } from '../services/mockApi';
import { Settings, Image as ImageIcon, Server, Palette, Save, Upload, Plus, Trash2, Eye, EyeOff, RefreshCcw, Check, X, ShieldAlert, Monitor, Wifi, Activity, Type, Radio, Megaphone, Tags, Pencil, Link2, Database, Package, ShoppingCart, Users, FileText, Warehouse, DollarSign, RefreshCw, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Webhook, Settings2, Anchor, Headphones, Truck, ShieldCheck, Globe, Star, Clock, Award } from 'lucide-react';
import { useToast } from '../services/ToastContext';
import { useLanguage } from '../services/LanguageContext';

export const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'BANNERS' | 'API' | 'APPEARANCE' | 'TEXTS' | 'STATUS_LABELS' | 'FEATURES'>('GENERAL');
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

    const defaultFeatures = [
        { id: '1', title: 'خبرة متخصصة', description: 'متخصصون في قطع الغيار الصينية فقط، مما يضمن دقة القطع.', icon: 'box' as const, iconColor: 'text-cyan-400' },
        { id: '2', title: 'تكامل تقني', description: 'ربط مباشر مع المخزون والنظام المحاسبي لتحديث فوري.', icon: 'chart' as const, iconColor: 'text-green-400' },
        { id: '3', title: 'تواجد دولي', description: 'مكاتب خاصة للاستيراد والتصدير في 3 مدن صينية رئيسية.', icon: 'anchor' as const, iconColor: 'text-amber-400' },
        { id: '4', title: 'دعم فني B2B', description: 'فريق مبيعات مخصص لخدمة الجملة متاح طوال أيام الأسبوع.', icon: 'headphones' as const, iconColor: 'text-purple-400' }
    ];

    const loadData = async () => {
        setLoading(true);
        try {
            const [s, b] = await Promise.all([
                MockApi.getSettings(),
                MockApi.getBanners()
            ]);
            if (!s.whySiniCarFeatures || s.whySiniCarFeatures.length === 0) {
                s.whySiniCarFeatures = defaultFeatures;
            }
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

    if (loading || !settings) return <div className="p-10 text-center">{t('adminSettings.loading')}</div>;

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
                    <h3 className="font-black text-xl text-slate-800 mb-6 px-2">{t('adminSettings.systemSettings')}</h3>
                    <nav>
                        <TabButton id="GENERAL" icon={<Settings size={20} />} label={t('adminSettings.generalSettings')} />
                        <TabButton id="BANNERS" icon={<ImageIcon size={20} />} label={t('adminSettings.bannerManagement')} />
                        <TabButton id="FEATURES" icon={<Check size={20} />} label={t('adminSettings.whySiniCar')} />
                        <TabButton id="TEXTS" icon={<Type size={20} />} label={t('adminSettings.textManagement')} />
                        <TabButton id="STATUS_LABELS" icon={<Tags size={20} />} label={t('adminSettings.statusLabels')} />
                        <TabButton id="API" icon={<Server size={20} />} label={t('adminSettings.apiIntegration')} />
                        <TabButton id="APPEARANCE" icon={<Palette size={20} />} label={t('adminSettings.appearanceIdentity')} />
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === 'GENERAL' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Settings className="text-brand-600" /> {t('adminSettings.siteSettings')}
                            </h2>
                            <button onClick={handleSaveGeneral} disabled={saving} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2">
                                <Save size={18} /> {saving ? t('adminSettings.saving') : t('adminSettings.saveChanges')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.siteName')}</label>
                                <input 
                                    type="text" 
                                    value={settings.siteName}
                                    onChange={e => setSettings({...settings, siteName: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.supportPhone')}</label>
                                <input 
                                    type="text" 
                                    value={settings.supportPhone}
                                    onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    dir="ltr"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.salesWhatsApp')}</label>
                                <input 
                                    type="text" 
                                    value={settings.supportWhatsapp || ''}
                                    onChange={e => setSettings({...settings, supportWhatsapp: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                    dir="ltr"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.supportEmail')}</label>
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
                                 <h3 className="font-bold text-lg text-slate-800">{t('adminSettings.newsTicker')}</h3>
                             </div>
                             
                             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                 <div className="flex items-center justify-between mb-2">
                                     <span className="font-bold text-slate-700">{t('adminSettings.enableTicker')}</span>
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
                                     <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.tickerText')}</label>
                                     <textarea 
                                        rows={2}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm"
                                        value={settings.tickerText}
                                        onChange={e => setSettings({...settings, tickerText: e.target.value})}
                                     ></textarea>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div>
                                         <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.tickerSpeed')}</label>
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
                                         <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.bgColor')}</label>
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
                                         <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.textColor')}</label>
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

                        {/* Product Visibility & Search Settings */}
                        <div className="mt-8 border-t border-slate-100 pt-8">
                             <div className="flex items-center gap-3 mb-6">
                                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Eye size={20} /></div>
                                 <h3 className="font-bold text-lg text-slate-800">{t('adminSettings.productDisplaySettings')}</h3>
                             </div>
                             
                             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                                         <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.minVisibleQty')}</label>
                                         <input 
                                            type="number" 
                                            min={0}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg"
                                            value={settings.minVisibleQty ?? 1}
                                            onChange={e => setSettings({...settings, minVisibleQty: parseInt(e.target.value) || 0})}
                                         />
                                         <p className="text-xs text-slate-500 mt-1">{t('adminSettings.minVisibleQtyNote')}</p>
                                     </div>
                                     <div>
                                         <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.stockThreshold')}</label>
                                         <input 
                                            type="number" 
                                            min={0}
                                            className="w-full p-3 bg-white border border-slate-300 rounded-lg"
                                            value={settings.stockThreshold ?? 0}
                                            onChange={e => setSettings({...settings, stockThreshold: parseInt(e.target.value) || 0})}
                                         />
                                         <p className="text-xs text-slate-500 mt-1">{t('adminSettings.stockThresholdNote')}</p>
                                     </div>
                                 </div>
                                 <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                                     <strong>{t('common.note')}:</strong> {t('adminSettings.settingsNote')}
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
                                        <h4 className="font-bold text-red-900 text-lg">{t('adminSettings.maintenanceMode')}</h4>
                                        <p className="text-red-700 text-sm">{t('adminSettings.maintenanceModeDesc')}</p>
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
                                 <h2 className="text-2xl font-bold text-slate-800">{t('adminSettings.bannerAds')}</h2>
                                 <p className="text-slate-500 text-sm">{t('adminSettings.bannerAdsDesc')}</p>
                             </div>
                             <button onClick={() => setShowBannerForm(true)} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800">
                                 <Plus size={16} /> {t('adminSettings.addNewBanner')}
                             </button>
                         </div>

                         {showBannerForm && (
                             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-fade-in">
                                 <h4 className="font-bold mb-4">{t('adminSettings.newBannerData')}</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                     <input placeholder={t('adminSettings.mainTitle')} className="p-3 rounded-lg border-slate-200" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} />
                                     <input placeholder={t('adminSettings.subtitle')} className="p-3 rounded-lg border-slate-200" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                                     <input placeholder={t('adminSettings.buttonText')} className="p-3 rounded-lg border-slate-200" value={newBanner.buttonText} onChange={e => setNewBanner({...newBanner, buttonText: e.target.value})} />
                                     <select className="p-3 rounded-lg border-slate-200" value={newBanner.colorClass} onChange={e => setNewBanner({...newBanner, colorClass: e.target.value})}>
                                         <option value="from-slate-700 to-slate-900">{t('adminSettings.darkGray')}</option>
                                         <option value="from-primary-600 to-primary-900">{t('adminSettings.royalBlue')}</option>
                                         <option value="from-secondary-500 to-secondary-700">{t('adminSettings.vibrantOrange')}</option>
                                         <option value="from-green-600 to-green-800">{t('adminSettings.darkGreen')}</option>
                                     </select>
                                     <input placeholder={t('adminSettings.imageUrl')} className="p-3 rounded-lg border-slate-200 col-span-2" value={newBanner.imageUrl} onChange={e => setNewBanner({...newBanner, imageUrl: e.target.value})} />
                                 </div>
                                 <div className="flex gap-3">
                                     <button onClick={handleAddBanner} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">{t('adminSettings.saveAndPublish')}</button>
                                     <button onClick={() => setShowBannerForm(false)} className="bg-white border border-slate-300 text-slate-600 px-6 py-2 rounded-lg font-bold">{t('common.cancel')}</button>
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
                                         <button onClick={() => toggleBanner(banner.id)} className={`p-2 rounded-lg transition-colors ${banner.isActive ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`} title={banner.isActive ? t('adminSettings.hide') : t('adminSettings.show')}>
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
                                    <Type className="text-brand-600" /> {t('adminSettings.uiTextManagement')}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">{t('adminSettings.uiTextManagementDesc')}</p>
                            </div>
                            <button onClick={handleSaveGeneral} disabled={saving} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2">
                                <Save size={18} /> {saving ? t('adminSettings.saving') : t('adminSettings.saveTexts')}
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
                     <div className="space-y-6 animate-slide-up">
                        {/* Header */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                        <Server className="text-brand-600" /> {t('adminSettings.erpIntegration')}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">{t('adminSettings.erpIntegrationDesc')}</p>
                                </div>
                                <button onClick={handleSaveGeneral} disabled={saving} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2">
                                    <Save size={18} /> {saving ? t('adminSettings.saving') : t('adminSettings.saveSettings')}
                                </button>
                            </div>
                        </div>

                        {/* Connection Settings */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                                <Link2 size={20} className="text-brand-600" />
                                {t('adminSettings.connectionSettings')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.cloudErpUrl')}</label>
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
                                            data-testid="input-api-url"
                                        />
                                    </div>
                                </div>
                                
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.apiToken')}</label>
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
                                            data-testid="input-api-token"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.syncFrequency')}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.apiConfig.syncInterval}
                                        onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, syncInterval: e.target.value as any}})}
                                        data-testid="select-sync-interval"
                                    >
                                        <option value="REALTIME">{t('adminSettings.realtime')}</option>
                                        <option value="15MIN">{t('adminSettings.every15Min')}</option>
                                        <option value="HOURLY">{t('adminSettings.hourly')}</option>
                                        <option value="DAILY">{t('adminSettings.daily')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.environment')}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.apiConfig.environment}
                                        onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, environment: e.target.value as any}})}
                                        data-testid="select-environment"
                                    >
                                        <option value="PRODUCTION">{t('adminSettings.production')}</option>
                                        <option value="SANDBOX">{t('adminSettings.sandbox')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 mt-6">
                                <button 
                                    id="test-conn-btn"
                                    onClick={handleTestConnection}
                                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-400 transition-all flex justify-center items-center gap-2"
                                    data-testid="button-test-connection"
                                >
                                    <Wifi size={20} /> {t('adminSettings.testConnection')}
                                </button>
                            </div>
                        </div>

                        {/* Data Sharing Settings */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                                <Database size={20} className="text-green-600" />
                                {t('adminSettings.sharedData')}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">{t('adminSettings.sharedDataDesc')}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { key: 'products', label: t('adminSettings.productsAndItems'), icon: Package, desc: t('adminSettings.productsDesc') },
                                    { key: 'orders', label: t('adminSettings.ordersLabel'), icon: ShoppingCart, desc: t('adminSettings.ordersDesc') },
                                    { key: 'customers', label: t('adminSettings.customersLabel'), icon: Users, desc: t('adminSettings.customersDesc') },
                                    { key: 'quotes', label: t('adminSettings.quotesLabel'), icon: FileText, desc: t('adminSettings.quotesDesc') },
                                    { key: 'inventory', label: t('adminSettings.inventoryLabel'), icon: Warehouse, desc: t('adminSettings.inventoryDesc') },
                                    { key: 'prices', label: t('adminSettings.pricesLabel'), icon: DollarSign, desc: t('adminSettings.pricesDesc') },
                                ].map((item) => (
                                    <label 
                                        key={item.key}
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            settings.apiConfig.sharedData?.includes(item.key)
                                                ? 'border-brand-500 bg-brand-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                                        }`}
                                        data-testid={`checkbox-share-${item.key}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={settings.apiConfig.sharedData?.includes(item.key) || false}
                                            onChange={(e) => {
                                                const current = settings.apiConfig.sharedData || [];
                                                const updated = e.target.checked
                                                    ? [...current, item.key]
                                                    : current.filter(k => k !== item.key);
                                                setSettings({
                                                    ...settings, 
                                                    apiConfig: {...settings.apiConfig, sharedData: updated}
                                                });
                                            }}
                                            className="mt-1 w-4 h-4 text-brand-600 rounded"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <item.icon size={16} className="text-slate-600" />
                                                <span className="font-bold text-slate-800">{item.label}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sync Direction */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                                <RefreshCw size={20} className="text-blue-600" />
                                {t('adminSettings.syncDirection')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { value: 'PULL', label: t('adminSettings.pullOnly'), desc: t('adminSettings.pullOnlyDesc'), icon: ArrowDownCircle },
                                    { value: 'PUSH', label: t('adminSettings.pushOnly'), desc: t('adminSettings.pushOnlyDesc'), icon: ArrowUpCircle },
                                    { value: 'BIDIRECTIONAL', label: t('adminSettings.bidirectional'), desc: t('adminSettings.bidirectionalDesc'), icon: ArrowLeftRight },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 cursor-pointer transition-all text-center ${
                                            settings.apiConfig.syncDirection === option.value
                                                ? 'border-brand-500 bg-brand-50'
                                                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                                        }`}
                                        data-testid={`radio-sync-${option.value.toLowerCase()}`}
                                    >
                                        <input
                                            type="radio"
                                            name="syncDirection"
                                            value={option.value}
                                            checked={settings.apiConfig.syncDirection === option.value}
                                            onChange={(e) => setSettings({
                                                ...settings, 
                                                apiConfig: {...settings.apiConfig, syncDirection: e.target.value as any}
                                            })}
                                            className="sr-only"
                                        />
                                        <option.icon size={32} className={settings.apiConfig.syncDirection === option.value ? 'text-brand-600' : 'text-slate-400'} />
                                        <div>
                                            <span className="font-bold text-slate-800 block">{option.label}</span>
                                            <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Webhooks */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                                <Webhook size={20} className="text-purple-600" />
                                {t('adminSettings.webhooks')}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">{t('adminSettings.webhooksDesc')}</p>
                            
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <input
                                        type="url"
                                        dir="ltr"
                                        placeholder="https://your-webhook-url.com/endpoint"
                                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                                        id="webhook-url-input"
                                        data-testid="input-webhook-url"
                                    />
                                    <button 
                                        onClick={() => {
                                            const input = document.getElementById('webhook-url-input') as HTMLInputElement;
                                            if (input?.value) {
                                                const webhooks = settings.apiConfig.webhooks || [];
                                                setSettings({
                                                    ...settings,
                                                    apiConfig: {
                                                        ...settings.apiConfig,
                                                        webhooks: [...webhooks, { url: input.value, events: ['order.created'], active: true }]
                                                    }
                                                });
                                                input.value = '';
                                                addToast('تم إضافة Webhook بنجاح', 'success');
                                            }
                                        }}
                                        className="px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 flex items-center gap-2"
                                        data-testid="button-add-webhook"
                                    >
                                        <Plus size={18} /> {t('common.add')}
                                    </button>
                                </div>

                                {settings.apiConfig.webhooks?.length > 0 && (
                                    <div className="space-y-2">
                                        {settings.apiConfig.webhooks.map((webhook, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                <div className={`w-2 h-2 rounded-full ${webhook.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                                                <code className="flex-1 text-sm font-mono text-slate-600 truncate">{webhook.url}</code>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                                                        {webhook.events?.length || 0} {t('adminSettings.events')}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            const webhooks = [...(settings.apiConfig.webhooks || [])];
                                                            webhooks.splice(idx, 1);
                                                            setSettings({...settings, apiConfig: {...settings.apiConfig, webhooks}});
                                                        }}
                                                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                        data-testid={`button-delete-webhook-${idx}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                                <Settings2 size={20} className="text-slate-600" />
                                {t('adminSettings.advancedSettings')}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.rateLimit')}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.apiConfig.rateLimit || '100'}
                                        onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, rateLimit: e.target.value}})}
                                        data-testid="select-rate-limit"
                                    >
                                        <option value="50">{t('adminSettings.reqPerMin', { count: 50 })}</option>
                                        <option value="100">{t('adminSettings.reqPerMin', { count: 100 })}</option>
                                        <option value="500">{t('adminSettings.reqPerMin', { count: 500 })}</option>
                                        <option value="1000">{t('adminSettings.reqPerMin', { count: 1000 })}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.timeout')}</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                        value={settings.apiConfig.timeout || '30'}
                                        onChange={e => setSettings({...settings, apiConfig: {...settings.apiConfig, timeout: e.target.value}})}
                                        data-testid="select-timeout"
                                    >
                                        <option value="10">{t('adminSettings.seconds', { count: 10 })}</option>
                                        <option value="30">{t('adminSettings.seconds', { count: 30 })}</option>
                                        <option value="60">{t('adminSettings.seconds', { count: 60 })}</option>
                                        <option value="120">{t('adminSettings.seconds', { count: 120 })}</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.apiConfig.debugMode || false}
                                            onChange={(e) => setSettings({
                                                ...settings, 
                                                apiConfig: {...settings.apiConfig, debugMode: e.target.checked}
                                            })}
                                            className="w-5 h-5 text-brand-600 rounded"
                                            data-testid="checkbox-debug-mode"
                                        />
                                        <div>
                                            <span className="font-bold text-slate-800">{t('adminSettings.debugMode')}</span>
                                            <p className="text-xs text-slate-500">{t('adminSettings.debugModeDesc')}</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.apiConfig.retryOnFail || true}
                                            onChange={(e) => setSettings({
                                                ...settings, 
                                                apiConfig: {...settings.apiConfig, retryOnFail: e.target.checked}
                                            })}
                                            className="w-5 h-5 text-brand-600 rounded"
                                            data-testid="checkbox-retry-on-fail"
                                        />
                                        <div>
                                            <span className="font-bold text-slate-800">{t('adminSettings.retryOnFail')}</span>
                                            <p className="text-xs text-slate-500">{t('adminSettings.retryOnFailDesc')}</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                     </div>
                )}

                {activeTab === 'FEATURES' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
                        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                    <Check className="text-brand-600" /> {t('adminSettings.whySiniCarSection')}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">{t('adminSettings.whySiniCarSectionDesc')}</p>
                            </div>
                            <button onClick={handleSaveGeneral} disabled={saving} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2">
                                <Save size={18} /> {saving ? t('adminSettings.saving') : t('adminSettings.saveChanges')}
                            </button>
                        </div>

                        {/* Section Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">{t('adminSettings.sectionTitle')}</label>
                            <input 
                                type="text" 
                                value={settings.whySiniCarTitle || t('adminSettings.whySiniCar')}
                                onChange={e => setSettings({...settings, whySiniCarTitle: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                placeholder={t('adminSettings.whySiniCar')}
                                data-testid="input-why-title"
                            />
                        </div>

                        {/* Feature Cards */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">{t('adminSettings.featureCards')}</h3>
                                <button
                                    onClick={() => {
                                        const features = settings.whySiniCarFeatures || [];
                                        setSettings({
                                            ...settings,
                                            whySiniCarFeatures: [
                                                ...features,
                                                {
                                                    id: `F-${Date.now()}`,
                                                    title: t('adminSettings.newFeature'),
                                                    description: t('adminSettings.featureDescPlaceholder'),
                                                    icon: 'star',
                                                    iconColor: 'text-amber-400'
                                                }
                                            ]
                                        });
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
                                    data-testid="button-add-feature"
                                >
                                    <Plus size={18} /> {t('adminSettings.addCard')}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(settings.whySiniCarFeatures || [
                                    { id: '1', title: 'خبرة متخصصة', description: 'متخصصون في قطع الغيار الصينية فقط، مما يضمن دقة القطع.', icon: 'box', iconColor: 'text-cyan-400' },
                                    { id: '2', title: 'تكامل تقني', description: 'ربط مباشر مع المخزون والنظام المحاسبي لتحديث فوري.', icon: 'chart', iconColor: 'text-green-400' },
                                    { id: '3', title: 'تواجد دولي', description: 'مكاتب خاصة للاستيراد والتصدير في 3 مدن صينية رئيسية.', icon: 'anchor', iconColor: 'text-amber-400' },
                                    { id: '4', title: 'دعم فني B2B', description: 'فريق مبيعات مخصص لخدمة الجملة متاح طوال أيام الأسبوع.', icon: 'headphones', iconColor: 'text-purple-400' }
                                ]).map((feature, idx) => (
                                    <div key={feature.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-slate-400">{t('adminSettings.card')} {idx + 1}</span>
                                            <button
                                                onClick={() => {
                                                    const features = settings.whySiniCarFeatures || [];
                                                    setSettings({
                                                        ...settings,
                                                        whySiniCarFeatures: features.filter(f => f.id !== feature.id)
                                                    });
                                                }}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                data-testid={`button-delete-feature-${idx}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">{t('adminSettings.title')}</label>
                                            <input 
                                                type="text" 
                                                value={feature.title}
                                                onChange={e => {
                                                    const features = [...(settings.whySiniCarFeatures || [])];
                                                    const index = features.findIndex(f => f.id === feature.id);
                                                    if (index !== -1) {
                                                        features[index] = { ...features[index], title: e.target.value };
                                                        setSettings({ ...settings, whySiniCarFeatures: features });
                                                    }
                                                }}
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                data-testid={`input-feature-title-${idx}`}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">{t('adminSettings.description')}</label>
                                            <textarea 
                                                value={feature.description}
                                                onChange={e => {
                                                    const features = [...(settings.whySiniCarFeatures || [])];
                                                    const index = features.findIndex(f => f.id === feature.id);
                                                    if (index !== -1) {
                                                        features[index] = { ...features[index], description: e.target.value };
                                                        setSettings({ ...settings, whySiniCarFeatures: features });
                                                    }
                                                }}
                                                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm resize-none"
                                                rows={2}
                                                data-testid={`input-feature-desc-${idx}`}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-1">{t('adminSettings.icon')}</label>
                                                <select 
                                                    value={feature.icon}
                                                    onChange={e => {
                                                        const features = [...(settings.whySiniCarFeatures || [])];
                                                        const index = features.findIndex(f => f.id === feature.id);
                                                        if (index !== -1) {
                                                            features[index] = { ...features[index], icon: e.target.value as any };
                                                            setSettings({ ...settings, whySiniCarFeatures: features });
                                                        }
                                                    }}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                    data-testid={`select-feature-icon-${idx}`}
                                                >
                                                    <option value="box">{t('adminSettings.iconBox')}</option>
                                                    <option value="chart">{t('adminSettings.iconChart')}</option>
                                                    <option value="anchor">{t('adminSettings.iconAnchor')}</option>
                                                    <option value="headphones">{t('adminSettings.iconHeadphones')}</option>
                                                    <option value="truck">{t('adminSettings.iconTruck')}</option>
                                                    <option value="shield">{t('adminSettings.iconShield')}</option>
                                                    <option value="globe">{t('adminSettings.iconGlobe')}</option>
                                                    <option value="star">{t('adminSettings.iconStar')}</option>
                                                    <option value="clock">{t('adminSettings.iconClock')}</option>
                                                    <option value="award">{t('adminSettings.iconAward')}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-1">{t('adminSettings.iconColor')}</label>
                                                <select 
                                                    value={feature.iconColor}
                                                    onChange={e => {
                                                        const features = [...(settings.whySiniCarFeatures || [])];
                                                        const index = features.findIndex(f => f.id === feature.id);
                                                        if (index !== -1) {
                                                            features[index] = { ...features[index], iconColor: e.target.value };
                                                            setSettings({ ...settings, whySiniCarFeatures: features });
                                                        }
                                                    }}
                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                    data-testid={`select-feature-color-${idx}`}
                                                >
                                                    <option value="text-cyan-400">{t('adminSettings.colorCyan')}</option>
                                                    <option value="text-green-400">{t('adminSettings.colorGreen')}</option>
                                                    <option value="text-amber-400">{t('adminSettings.colorGold')}</option>
                                                    <option value="text-purple-400">{t('adminSettings.colorPurple')}</option>
                                                    <option value="text-red-400">{t('adminSettings.colorRed')}</option>
                                                    <option value="text-blue-400">{t('adminSettings.colorBlue')}</option>
                                                    <option value="text-pink-400">{t('adminSettings.colorPink')}</option>
                                                    <option value="text-orange-400">{t('adminSettings.colorOrange')}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        <div className="bg-slate-800 text-white p-4 rounded-xl mt-2">
                                            <div className={`mb-2 ${feature.iconColor}`}>
                                                {feature.icon === 'box' && <Package size={28} />}
                                                {feature.icon === 'chart' && <Activity size={28} />}
                                                {feature.icon === 'anchor' && <Anchor size={28} />}
                                                {feature.icon === 'headphones' && <Headphones size={28} />}
                                                {feature.icon === 'truck' && <Truck size={28} />}
                                                {feature.icon === 'shield' && <ShieldCheck size={28} />}
                                                {feature.icon === 'globe' && <Globe size={28} />}
                                                {feature.icon === 'star' && <Star size={28} />}
                                                {feature.icon === 'clock' && <Clock size={28} />}
                                                {feature.icon === 'award' && <Award size={28} />}
                                            </div>
                                            <h4 className="font-bold text-sm">{feature.title}</h4>
                                            <p className="text-xs text-slate-300 mt-1">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'APPEARANCE' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8 animate-slide-up">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Palette className="text-purple-500" /> {t('adminSettings.appearanceCustomization')}
                            </h2>
                            <button onClick={handleSaveGeneral} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50">
                                {t('adminSettings.saveChanges')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-4">{t('adminSettings.primaryColor')}</label>
                                 <div className="flex items-center gap-4">
                                     <div className="w-16 h-16 rounded-xl shadow-md border-4 border-white ring-1 ring-slate-200" style={{backgroundColor: settings.primaryColor}}></div>
                                     <input 
                                        type="color" 
                                        value={settings.primaryColor}
                                        onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                                        className="h-12 w-32 p-1 rounded-lg cursor-pointer" 
                                     />
                                 </div>
                                 <p className="text-xs text-slate-500 mt-2">{t('adminSettings.primaryColorDesc')}</p>
                             </div>

                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-4">{t('adminSettings.siteLogo')}</label>
                                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                                     {settings.logoUrl ? (
                                         <div className="relative w-fit mx-auto">
                                             <img src={settings.logoUrl} alt="Logo" className="h-16 object-contain" />
                                             <button onClick={() => setSettings({...settings, logoUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                                         </div>
                                     ) : (
                                         <div className="text-slate-400 cursor-pointer" onClick={() => addToast(t('adminSettings.uploadNotAvailable'), 'info')}>
                                             <Upload className="mx-auto mb-2" />
                                             <span className="text-xs font-bold">{t('adminSettings.clickToUploadLogo')}</span>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                        
                        <div className="bg-slate-900 text-white p-6 rounded-xl flex items-center justify-between">
                             <div>
                                 <h4 className="font-bold">{t('adminSettings.livePreview')}</h4>
                                 <p className="text-sm opacity-70">{t('adminSettings.livePreviewDesc')}</p>
                             </div>
                             <button style={{backgroundColor: settings.primaryColor}} className="px-6 py-3 rounded-lg font-bold shadow-lg">
                                 {t('adminSettings.primaryButtonExample')}
                             </button>
                        </div>
                    </div>
                )}

                {activeTab === 'STATUS_LABELS' && (
                    <StatusLabelsManager 
                        settings={settings}
                        onUpdate={(newSettings) => setSettings(newSettings)}
                        onSave={handleSaveGeneral}
                        saving={saving}
                    />
                )}
            </div>
        </div>
    );
};

// Status Labels Manager Component
interface StatusLabelsManagerProps {
    settings: SiteSettings;
    onUpdate: (settings: SiteSettings) => void;
    onSave: () => void;
    saving: boolean;
}

interface StatusDefinition {
    label: string;
    color: string;
    bgColor: string;
    icon?: string;
    isSystem?: boolean;
    isDefault?: boolean;
    sortOrder?: number;
}

const getStatusCategories = (t: (key: string) => string) => [
    { key: 'orderStatus', label: t('adminSettings.statusCategories.orderStatus'), icon: <ShoppingCart size={16} /> },
    { key: 'orderInternalStatus', label: t('adminSettings.statusCategories.orderInternalStatus'), icon: <Warehouse size={16} /> },
    { key: 'accountRequestStatus', label: t('adminSettings.statusCategories.accountRequestStatus'), icon: <Users size={16} /> },
    { key: 'quoteRequestStatus', label: t('adminSettings.statusCategories.quoteRequestStatus'), icon: <DollarSign size={16} /> },
    { key: 'quoteItemStatus', label: t('adminSettings.statusCategories.quoteItemStatus'), icon: <FileText size={16} /> },
    { key: 'missingStatus', label: t('adminSettings.statusCategories.missingStatus'), icon: <Package size={16} /> },
    { key: 'importRequestStatus', label: t('adminSettings.statusCategories.importRequestStatus'), icon: <Truck size={16} /> },
    { key: 'customerStatus', label: t('adminSettings.statusCategories.customerStatus'), icon: <Globe size={16} /> },
    { key: 'staffStatus', label: t('adminSettings.statusCategories.staffStatus'), icon: <Users size={16} /> }
];

const StatusLabelsManager: React.FC<StatusLabelsManagerProps> = ({ settings, onUpdate, onSave, saving }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('orderStatus');
    const [editingStatus, setEditingStatus] = useState<string | null>(null);
    const [tempLabel, setTempLabel] = useState('');
    const [tempColor, setTempColor] = useState('#000000');
    const [tempBgColor, setTempBgColor] = useState('#ffffff');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStatusKey, setNewStatusKey] = useState('');
    const [newStatusLabel, setNewStatusLabel] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#6b7280');
    const [newStatusBgColor, setNewStatusBgColor] = useState('#f3f4f6');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [checkingUsage, setCheckingUsage] = useState(false);
    const { addToast } = useToast();
    const { t } = useLanguage();

    const STATUS_CATEGORIES = getStatusCategories(t);
    const statusLabels = settings.statusLabels;
    if (!statusLabels) return null;

    const currentCategory = statusLabels[selectedCategory as keyof StatusLabelsConfig] as Record<string, StatusDefinition>;
    const categoryInfo = STATUS_CATEGORIES.find(c => c.key === selectedCategory);

    const sortedEntries = Object.entries(currentCategory).sort((a, b) => {
        const orderA = a[1].sortOrder || 999;
        const orderB = b[1].sortOrder || 999;
        return orderA - orderB;
    });

    const handleEditStart = (statusKey: string) => {
        const status = currentCategory[statusKey];
        if (status) {
            setEditingStatus(statusKey);
            setTempLabel(status.label);
            setTempColor(status.color);
            setTempBgColor(status.bgColor);
        }
    };

    const handleEditSave = async () => {
        if (!editingStatus || !tempLabel.trim()) return;
        
        const existing = currentCategory[editingStatus];
        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: {
                ...currentCategory,
                [editingStatus]: {
                    ...existing,
                    label: tempLabel.trim(),
                    color: tempColor,
                    bgColor: tempBgColor
                }
            }
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        setEditingStatus(null);
        addToast(t('adminSettings.statusUpdated'), 'success');
    };

    const handleEditCancel = () => {
        setEditingStatus(null);
    };

    const handleAddStatus = async () => {
        if (!newStatusKey.trim() || !newStatusLabel.trim()) {
            addToast(t('adminSettings.fillKeyAndName'), 'error');
            return;
        }
        
        const keyFormatted = newStatusKey.trim().toUpperCase().replace(/\s+/g, '_');
        if (currentCategory[keyFormatted]) {
            addToast(t('adminSettings.keyExists'), 'error');
            return;
        }

        const existingLabels = Object.values(currentCategory);
        const maxOrder = existingLabels.reduce((max, item) => Math.max(max, item.sortOrder || 0), 0);

        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: {
                ...currentCategory,
                [keyFormatted]: {
                    label: newStatusLabel.trim(),
                    color: newStatusColor,
                    bgColor: newStatusBgColor,
                    isSystem: false,
                    sortOrder: maxOrder + 1
                }
            }
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        setShowAddForm(false);
        setNewStatusKey('');
        setNewStatusLabel('');
        setNewStatusColor('#6b7280');
        setNewStatusBgColor('#f3f4f6');
        addToast(t('adminSettings.statusAdded'), 'success');
    };

    const handleDeleteStatus = async (statusKey: string) => {
        const status = currentCategory[statusKey];
        if (status.isSystem) {
            addToast(t('adminSettings.cannotDeleteSystem'), 'error');
            return;
        }

        setCheckingUsage(true);
        const usageCount = await MockApi.checkStatusUsage(selectedCategory as any, statusKey);
        setCheckingUsage(false);

        if (usageCount > 0) {
            addToast(t('adminSettings.cannotDeleteInUse', { count: usageCount }), 'error');
            setDeleteConfirm(null);
            return;
        }

        const updatedCategory = { ...currentCategory };
        delete updatedCategory[statusKey];

        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: updatedCategory
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        setDeleteConfirm(null);
        addToast(t('adminSettings.statusDeleted'), 'success');
    };

    const handleSetDefault = async (statusKey: string) => {
        const updatedCategory = { ...currentCategory };
        Object.keys(updatedCategory).forEach(key => {
            updatedCategory[key] = { ...updatedCategory[key], isDefault: key === statusKey };
        });

        const updatedLabels = {
            ...statusLabels,
            [selectedCategory]: updatedCategory
        };
        
        onUpdate({
            ...settings,
            statusLabels: updatedLabels
        });
        
        await MockApi.updateStatusLabels(updatedLabels);
        addToast(t('adminSettings.defaultStatusSet'), 'success');
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Tags className="text-orange-500" /> {t('adminSettings.statusLabelsManagement')}
                </h2>
                <button onClick={onSave} disabled={saving} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-100 disabled:opacity-50 flex items-center gap-2" data-testid="button-save-status-labels">
                    <Save size={18} /> {saving ? t('adminSettings.saving') : t('adminSettings.saveChanges')}
                </button>
            </div>

            <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl">
                {t('adminSettings.statusLabelsDescription')}
            </p>

            {/* Category Selector */}
            <div className="flex flex-wrap gap-2">
                {STATUS_CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => { setSelectedCategory(cat.key); setShowAddForm(false); setEditingStatus(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            selectedCategory === cat.key 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        data-testid={`button-category-${cat.key}`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Status Labels List */}
            <div className="border border-slate-200 rounded-xl overflow-visible">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">{categoryInfo?.icon} {categoryInfo?.label}</h3>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors"
                        data-testid="button-add-new-status"
                    >
                        <Plus size={16} /> {t('adminSettings.addNewStatus')}
                    </button>
                </div>

                {/* Add New Status Form */}
                {showAddForm && (
                    <div className="bg-brand-50 p-6 border-b border-brand-200 animate-slide-up">
                        <h4 className="font-bold text-brand-800 mb-4 flex items-center gap-2"><Plus size={18} /> {t('adminSettings.addNewStatus')}</h4>
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs text-slate-500 mb-1">{t('adminSettings.statusKey')}</label>
                                <input
                                    type="text"
                                    value={newStatusKey}
                                    onChange={e => setNewStatusKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono"
                                    placeholder="NEW_STATUS"
                                    data-testid="input-new-status-key"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs text-slate-500 mb-1">{t('adminSettings.statusLabel')}</label>
                                <input
                                    type="text"
                                    value={newStatusLabel}
                                    onChange={e => setNewStatusLabel(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm font-bold"
                                    placeholder={t('adminSettings.newStatus')}
                                    data-testid="input-new-status-label"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500">{t('adminSettings.textColor')}:</label>
                                <input
                                    type="color"
                                    value={newStatusColor}
                                    onChange={e => setNewStatusColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                    data-testid="input-new-status-color"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500">{t('adminSettings.backgroundColor')}:</label>
                                <input
                                    type="color"
                                    value={newStatusBgColor}
                                    onChange={e => setNewStatusBgColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                    data-testid="input-new-status-bgcolor"
                                />
                            </div>
                            <div 
                                className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{ backgroundColor: newStatusBgColor, color: newStatusColor }}
                            >
                                {newStatusLabel || t('adminSettings.preview')}
                            </div>
                            <button 
                                onClick={handleAddStatus}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                                data-testid="button-confirm-add-status"
                            >
                                {t('adminSettings.add')}
                            </button>
                            <button 
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                                data-testid="button-cancel-add-status"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-slate-100">
                    {sortedEntries.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" data-testid={`row-status-${key}`}>
                            {editingStatus === key ? (
                                <div className="flex-1 flex items-center gap-4 flex-wrap">
                                    <input
                                        type="text"
                                        value={tempLabel}
                                        onChange={e => setTempLabel(e.target.value)}
                                        className="flex-1 min-w-[150px] p-2 border border-slate-300 rounded-lg text-sm font-bold"
                                        placeholder={t('adminSettings.statusLabel')}
                                        data-testid="input-edit-status-label"
                                    />
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-500">{t('adminSettings.textColor')}:</label>
                                        <input
                                            type="color"
                                            value={tempColor}
                                            onChange={e => setTempColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                            data-testid="input-edit-status-color"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-500">{t('adminSettings.backgroundColor')}:</label>
                                        <input
                                            type="color"
                                            value={tempBgColor}
                                            onChange={e => setTempBgColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                                            data-testid="input-edit-status-bgcolor"
                                        />
                                    </div>
                                    <div 
                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                        style={{ backgroundColor: tempBgColor, color: tempColor }}
                                    >
                                        {tempLabel || t('adminSettings.preview')}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleEditSave}
                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                            data-testid="button-confirm-edit-status"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button 
                                            onClick={handleEditCancel}
                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                            data-testid="button-cancel-edit-status"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : deleteConfirm === key ? (
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-red-600 font-bold text-sm">
                                        {checkingUsage ? t('adminSettings.checkingUsage') : t('adminSettings.confirmDelete')}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleDeleteStatus(key)}
                                            disabled={checkingUsage}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                            data-testid="button-confirm-delete-status"
                                        >
                                            {t('adminSettings.yesDelete')}
                                        </button>
                                        <button 
                                            onClick={() => setDeleteConfirm(null)}
                                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors"
                                            data-testid="button-cancel-delete-status"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-500">{key}</code>
                                        <span 
                                            className="px-3 py-1 rounded-full text-xs font-bold"
                                            style={{ backgroundColor: value.bgColor, color: value.color }}
                                        >
                                            {value.label}
                                        </span>
                                        {value.isSystem && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold flex items-center gap-1">
                                                <ShieldCheck size={10} /> {t('adminSettings.systemStatus')}
                                            </span>
                                        )}
                                        {value.isDefault && (
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold flex items-center gap-1">
                                                <Star size={10} /> {t('adminSettings.defaultStatus')}
                                            </span>
                                        )}
                                        {value.sortOrder && (
                                            <span className="text-[10px] text-slate-400">#{value.sortOrder}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!value.isDefault && (
                                            <button 
                                                onClick={() => handleSetDefault(key)}
                                                className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                                title={t('adminSettings.setAsDefault')}
                                                data-testid={`button-set-default-${key}`}
                                            >
                                                <Star size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleEditStart(key)}
                                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                            title={t('common.edit')}
                                            data-testid={`button-edit-status-${key}`}
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        {!value.isSystem && (
                                            <button 
                                                onClick={() => setDeleteConfirm(key)}
                                                className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t('common.delete')}
                                                data-testid={`button-delete-status-${key}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2"><ShieldCheck size={16} /> {t('adminSettings.systemStatuses')}</div>
                    {t('adminSettings.systemStatusesDesc')}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                    <div className="flex items-center gap-2 font-bold mb-2"><Star size={16} /> {t('adminSettings.defaultStatusInfo')}</div>
                    {t('adminSettings.defaultStatusInfoDesc')}
                </div>
            </div>
        </div>
    );
};
