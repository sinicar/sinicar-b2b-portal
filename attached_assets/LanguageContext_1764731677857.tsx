import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { MockApi } from './mockApi';

export type Language = 'ar' | 'en' | 'hi' | 'zh';

type Translations = {
    [key in Language]: {
        [key: string]: string;
    }
};

const translations: Translations = {
    ar: {
        // Identity & Auth
        siteName: 'صيني كار',
        subtitle: 'بوابة عملاء الجملة المعتمدة',
        login: 'تسجيل الدخول',
        register: 'تسجيل منشأة جديدة',
        register_title: 'طلب اعتماد حساب منشأة',
        clientId: 'رقم العميل',
        password: 'كلمة المرور',
        rememberMe: 'حفظ بيانات الدخول',
        forgotPassword: 'هل نسيت كلمة المرور؟',
        enter: 'دخول آمن',
        noAccount: 'ليس لديك حساب معتمد؟',
        requestAccount: 'تقديم طلب تسجيل',
        welcome: 'مرحباً بك',
        online_system: 'نظام الطلبات الموحد',
        
        // Navigation
        dashboard: 'الصفحة الرئيسية',
        market: 'كتالوج المنتجات',
        orders: 'سجل الطلبات',
        business: 'إدارة الفروع والموظفين',
        about: 'عن الشركة',
        logout: 'تسجيل الخروج',
        
        // Market & Product
        search_placeholder: 'بحث برقم القطعة، الاسم، أو الموديل...',
        search: 'بحث',
        cart: 'سلة المشتريات',
        cart_title: 'سلة المشتريات',
        total: 'الإجمالي الكلي',
        sar: 'ر.س',
        submit_order: 'اعتماد وإرسال الطلب',
        items: 'صنف',
        new_arrivals: 'أحدث القطع',
        special_offers: 'عروض وتخفيضات',
        add_to_cart: 'إضافة للسلة',
        stock_label: 'الكمية المتوفرة',
        remaining: 'المتبقي',
        only: 'فقط',
        brand: 'الماركة',
        price: 'السعر',
        part_number: 'رقم القطعة',
        
        // Registration Steps
        step1: 'بيانات المفوض',
        step2: 'بيانات المنشأة',
        step3: 'التصنيف والمرفقات',
        next: 'التالي',
        prev: 'السابق',
        submit_register: 'إرسال طلب الاعتماد',
        
        // Form Fields
        name: 'الاسم الرباعي',
        email: 'البريد الإلكتروني الرسمي',
        phone: 'رقم الجوال',
        company_name: 'اسم المنشأة (حسب السجل)',
        region: 'المنطقة الإدارية',
        city: 'المدينة',
        address: 'العنوان الوطني',
        cr_number: 'رقم السجل التجاري',
        tax_number: 'الرقم الضريبي',
        customer_type: 'نشاط المنشأة',
        
        // Admin & Status
        admin_panel: 'لوحة الإدارة العامة',
        stats: 'مؤشرات الأداء',
        users_manage: 'إدارة العملاء',
        products_manage: 'المخزون والأسعار',
        banners_manage: 'إدارة الإعلانات',
        news_manage: 'شريط التنبيهات',
        settings: 'إعدادات التكامل (API)',
        
        // Order Status
        pending: 'بانتظار المعالجة',
        approved: 'تم الاعتماد',
        rejected: 'مرفوض',
        shipped: 'تم الشحن',

        // Settings & API (New)
        general_settings: 'الإعدادات العامة',
        integration_hub: 'مركز التكامل (API)',
        site_identity: 'هوية الموقع',
        support_contact: 'بيانات الدعم الفني',
        primary_font: 'الخط الأساسي',
        save_general: 'حفظ الإعدادات',
        
        connection_tab: 'الاتصال والربط',
        sync_tab: 'المزامنة',
        webhooks_tab: 'الويب هوك',
        logs_tab: 'السجلات',
        
        erp_connection: 'ربط نظام ERP',
        erp_desc: 'إعداد خصائص الاتصال بالنظام المحاسبي الخلفي',
        base_url: 'رابط السيرفر (Base URL)',
        auth_token: 'مفتاح المصادقة (API Key)',
        webhook_secret: 'مفتاح التشفير (Secret)',
        environment: 'بيئة التشغيل',
        test_connection: 'اختبار الاتصال',
        save_changes: 'حفظ التغييرات',
        
        sync_settings: 'إعدادات المزامنة الآلية',
        sync_interval_label: 'فترة التحديث',
        sync_entities_label: 'البيانات المتزامنة',
        field_mapping_label: 'ربط الحقول (Field Mapping)',
        field_mapping_desc: 'تعيين مسميات حقول JSON لتتوافق مع النظام المحلي',
        
        webhooks_title: 'نقاط الاتصال (Webhooks)',
        webhooks_desc: 'إدارة التنبيهات الصادرة للأنظمة الخارجية',
        add_endpoint: 'إضافة نقطة اتصال',
        no_webhooks: 'لم يتم إعداد أي نقاط اتصال',
        system_healthy: 'حالة النظام: متصل',
        api_control: 'لوحة التحكم API'
    },
    en: {
        // Identity & Auth
        siteName: 'Sini Car',
        subtitle: 'Authorized Wholesale Portal',
        login: 'Secure Login',
        register: 'Register New Business',
        register_title: 'Business Account Registration',
        clientId: 'Customer ID',
        password: 'Password',
        rememberMe: 'Remember Device',
        forgotPassword: 'Forgot Password?',
        enter: 'Login',
        noAccount: 'No authorized account?',
        requestAccount: 'Request Access',
        welcome: 'Welcome',
        online_system: 'B2B Unified System',

        // Navigation
        dashboard: 'Home Page',
        market: 'Product Catalog',
        orders: 'Order History',
        business: 'Branch & Employee Mgmt',
        about: 'Corporate Info',
        logout: 'Logout',

        // Market & Product
        search_placeholder: 'Search by Part No, Name, or Model...',
        search: 'Search',
        cart: 'Purchase Cart',
        cart_title: 'Purchase Cart',
        total: 'Grand Total',
        sar: 'SAR',
        submit_order: 'Submit Order',
        items: 'Items',
        new_arrivals: 'New Arrivals',
        special_offers: 'Special Offers',
        add_to_cart: 'Add to Order',
        stock_label: 'Available Stock',
        remaining: 'Remaining',
        only: 'Only',
        brand: 'Brand',
        price: 'Price',
        part_number: 'Part No.',

        // Registration Steps
        step1: 'Contact Info',
        step2: 'Business Details',
        step3: 'Documents',
        next: 'Next',
        prev: 'Previous',
        submit_register: 'Submit Application',

        // Form Fields
        name: 'Full Name',
        email: 'Official Email',
        phone: 'Mobile Number',
        company_name: 'Company Name (Legal)',
        region: 'Region',
        city: 'City',
        address: 'National Address',
        cr_number: 'Commercial Reg. No.',
        tax_number: 'VAT Number',
        customer_type: 'Business Activity',

        // Admin & Status
        admin_panel: 'Admin Console',
        stats: 'KPIs & Stats',
        users_manage: 'Customer Management',
        products_manage: 'Inventory & Pricing',
        banners_manage: 'Banners',
        news_manage: 'News Ticker',
        settings: 'Integration Settings',

        // Order Status
        pending: 'Processing',
        approved: 'Approved',
        rejected: 'Rejected',
        shipped: 'Shipped',

        // Settings & API
        general_settings: 'General Settings',
        integration_hub: 'Integration Hub',
        site_identity: 'Site Identity',
        support_contact: 'Support Contact',
        primary_font: 'Primary Font',
        save_general: 'Save Settings',
        
        connection_tab: 'Connection',
        sync_tab: 'Data Sync',
        webhooks_tab: 'Webhooks',
        logs_tab: 'Traffic Logs',
        
        erp_connection: 'ERP Connection',
        erp_desc: 'Configure backend system connection parameters',
        base_url: 'Base URL',
        auth_token: 'API Key / Token',
        webhook_secret: 'Webhook Secret',
        environment: 'Environment',
        test_connection: 'Test Connection',
        save_changes: 'Save Changes',
        
        sync_settings: 'Synchronization Settings',
        sync_interval_label: 'Sync Interval',
        sync_entities_label: 'Entities to Sync',
        field_mapping_label: 'Field Mapping',
        field_mapping_desc: 'Map local database fields to external JSON keys',
        
        webhooks_title: 'Webhooks',
        webhooks_desc: 'Manage outbound notifications',
        add_endpoint: 'Add Endpoint',
        no_webhooks: 'No webhooks configured',
        system_healthy: 'System Healthy',
        api_control: 'API Control'
    },
    zh: {
        // Identity & Auth
        siteName: 'Sini Car 汽配',
        subtitle: '授权批发门户',
        login: '安全登录',
        register: '注册新企业',
        register_title: '企业账户注册',
        clientId: '客户编号',
        password: '密码',
        rememberMe: '记住设备',
        forgotPassword: '忘记密码？',
        enter: '登录系统',
        noAccount: '没有授权账户？',
        requestAccount: '申请访问权限',
        welcome: '欢迎',
        online_system: 'B2B 统一系统',

        // Navigation
        dashboard: '仪表盘',
        market: '产品目录',
        orders: '订单记录',
        business: '账户管理',
        about: '关于我们',
        logout: '退出登录',

        // Market & Product
        search_placeholder: '输入零件号、名称或车型搜索...',
        search: '搜索',
        cart: '采购清单',
        cart_title: '采购清单',
        total: '总金额',
        sar: '沙特里亚尔',
        submit_order: '提交订单',
        items: '项',
        new_arrivals: '最新到货',
        special_offers: '特惠活动',
        add_to_cart: '加入清单',
        stock_label: '库存数量',
        remaining: '剩余',
        only: '仅',
        brand: '品牌',
        price: '单价',
        part_number: '零件号',

        // Registration Steps
        step1: '联系人信息',
        step2: '企业详情',
        step3: '资质文件',
        next: '下一步',
        prev: '上一步',
        submit_register: '提交申请',

        // Form Fields
        name: '全名',
        email: '官方邮箱',
        phone: '手机号码',
        company_name: '公司注册名称',
        region: '行政区域',
        city: '城市',
        address: '详细地址',
        cr_number: '商业登记证号',
        tax_number: '税务登记号',
        customer_type: '业务类型',

        // Admin & Status
        admin_panel: '管理控制台',
        stats: '关键指标',
        users_manage: '客户管理',
        products_manage: '库存与定价',
        banners_manage: '横幅广告',
        news_manage: '新闻通告',
        settings: '集成设置',

        // Order Status
        pending: '待处理',
        approved: '已批准',
        rejected: '已拒绝',
        shipped: '已发货',

        // Settings & API
        general_settings: '常规设置',
        integration_hub: '集成中心 (API)',
        site_identity: '网站标识',
        support_contact: '支持联系方式',
        primary_font: '主要字体',
        save_general: '保存设置',
        
        connection_tab: '连接配置',
        sync_tab: '数据同步',
        webhooks_tab: '网络钩子',
        logs_tab: '流量日志',
        
        erp_connection: 'ERP 连接',
        erp_desc: '配置后端系统连接参数',
        base_url: '基础 URL',
        auth_token: 'API 密钥/令牌',
        webhook_secret: 'Webhooks 密钥',
        environment: '运行环境',
        test_connection: '测试连接',
        save_changes: '保存更改',
        
        sync_settings: '同步设置',
        sync_interval_label: '同步间隔',
        sync_entities_label: '同步实体',
        field_mapping_label: '字段映射',
        field_mapping_desc: '将本地数据库字段映射到外部 JSON 键',
        
        webhooks_title: '网络钩子管理',
        webhooks_desc: '管理出站通知',
        add_endpoint: '添加端点',
        no_webhooks: '未配置网络钩子',
        system_healthy: '系统正常',
        api_control: 'API 控制'
    },
    hi: {
        // Identity & Auth
        siteName: 'Sini Car',
        subtitle: 'अधिकृत थोक पोर्टल',
        login: 'लॉग इन करें',
        register: 'नया व्यवसाय पंजीकृत करें',
        register_title: 'व्यवसाय खाता पंजीकरण',
        clientId: 'ग्राहक आईडी',
        password: 'पासवर्ड',
        rememberMe: 'डिवाइस याद रखें',
        forgotPassword: 'पासवर्ड भूल गए?',
        enter: 'प्रवेश करें',
        noAccount: 'खाता नहीं है?',
        requestAccount: 'एक्सेस का अनुरोध करें',
        welcome: 'स्वागत है',
        online_system: 'B2B एकीकृत प्रणाली',

        // Navigation
        dashboard: 'डैशबोर्ड',
        market: 'उत्पाद सूची',
        orders: 'ऑर्डर इतिहास',
        business: 'खाता प्रबंधन',
        about: 'कंपनी के बारे में',
        logout: 'लॉग आउट',

        // Market & Product
        search_placeholder: 'पार्ट नंबर, नाम या मॉडल द्वारा खोजें...',
        search: 'खोजें',
        cart: 'खरीद सूची',
        cart_title: 'खरीद सूची',
        total: 'कुल राशि',
        sar: 'SAR',
        submit_order: 'ऑर्डर भेजें',
        items: 'वस्तुएं',
        new_arrivals: 'नया आगमन',
        special_offers: 'विशेष प्रस्ताव',
        add_to_cart: 'ऑर्डर में जोड़ें',
        stock_label: 'उपलब्ध स्टॉक',
        remaining: 'शेष',
        only: 'केवल',
        brand: 'ब्रांड',
        price: 'कीमत',
        part_number: 'पार्ट नंबर',

        // Registration Steps
        step1: 'संपर्क जानकारी',
        step2: 'व्यवसाय विवरण',
        step3: 'दस्तावेज़',
        next: 'अगला',
        prev: 'पिछला',
        submit_register: 'आवेदन जमा करें',

        // Form Fields
        name: 'पूरा नाम',
        email: 'आधिकारिक ईमेल',
        phone: 'मोबाइल नंबर',
        company_name: 'कंपनी का नाम',
        region: 'क्षेत्र',
        city: 'शहर',
        address: 'पता',
        cr_number: 'वाणिज्यिक पंजीकरण संख्या',
        tax_number: 'वैट (VAT) नंबर',
        customer_type: 'व्यवसाय गतिविधि',

        // Admin & Status
        admin_panel: 'व्यवस्थापक कंसोल',
        stats: 'आंकड़े',
        users_manage: 'ग्राहक प्रबंधन',
        products_manage: 'इन्वेंटरी और मूल्य निर्धारण',
        banners_manage: 'बैनर प्रबंधन',
        news_manage: 'समाचार टिकर',
        settings: 'एकीकरण सेटिंग्स',

        // Order Status
        pending: 'प्रक्रियाधीन',
        approved: 'स्वीकृत',
        rejected: 'अस्वीकृत',
        shipped: 'भेजा गया',

        // Settings & API
        general_settings: 'सामान्य सेटिंग्स',
        integration_hub: 'एकीकरण हब (API)',
        site_identity: 'साइट पहचान',
        support_contact: 'समर्थन संपर्क',
        primary_font: 'प्राथमिक फ़ॉन्ट',
        save_general: 'सेटिंग्स सहेजें',
        
        connection_tab: 'कनेक्शन',
        sync_tab: 'डेटा सिंक',
        webhooks_tab: 'वेबहुक (Webhooks)',
        logs_tab: 'ट्रैफ़िक लॉग',
        
        erp_connection: 'ERP कनेक्शन',
        erp_desc: 'बैकएंड सिस्टम कनेक्शन पैरामीटर कॉन्फ़िगर करें',
        base_url: 'बेस URL',
        auth_token: 'API कुंजी / टोकन',
        webhook_secret: 'वेबहुक सीक्रेट',
        environment: 'वातावरण',
        test_connection: 'कनेक्शन का परीक्षण करें',
        save_changes: 'परिवर्तन सहेजें',
        
        sync_settings: 'तुल्यकालन सेटिंग्स',
        sync_interval_label: 'सिंक अंतराल',
        sync_entities_label: 'सिंक करने के लिए इकाइयाँ',
        field_mapping_label: 'फ़ील्ड मैपिंग',
        field_mapping_desc: 'स्थानीय डेटाबेस फ़ील्ड को बाहरी JSON कुंजियों में मैप करें',
        
        webhooks_title: 'वेबहुक प्रबंधन',
        webhooks_desc: 'आउटबाउंड सूचनाएं प्रबंधित करें',
        add_endpoint: 'अंतिम बिंदु जोड़ें',
        no_webhooks: 'कोई वेबहुक कॉन्फ़िगर नहीं किया गया',
        system_healthy: 'सिस्टम स्वस्थ',
        api_control: 'API नियंत्रण'
    }
};

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    tDynamic: (key: string, fallback: string) => string;
    dir: 'rtl' | 'ltr';
    fontFamily: string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ar');
    const [uiTexts, setUiTexts] = useState<Record<string, string>>({});

    useEffect(() => {
        // Force direction change on HTML element
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
        
        // Ensure sans font class is active
        document.body.classList.remove('font-serif');
        document.body.classList.add('font-sans'); // Uses Tajawal/System via Tailwind
    }, [language]);

    // Load dynamic texts from settings
    useEffect(() => {
        const loadTexts = async () => {
            try {
                const settings = await MockApi.getSettings();
                if (settings.uiTexts) {
                    setUiTexts(settings.uiTexts);
                }
            } catch (e) {
                console.error("Failed to load UI texts");
            }
        };
        loadTexts();
    }, []);

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    // Get dynamic text from settings, or fallback to default
    const tDynamic = (key: string, fallback: string): string => {
        // Only apply dynamic texts for Arabic currently, or strictly as requested
        // If we want it to work for all, we check uiTexts directly
        return uiTexts[key] || fallback;
    };

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const fontFamily = 'Tajawal, system-ui, sans-serif';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tDynamic, dir, fontFamily }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageSwitcher: React.FC<{className?: string, variant?: 'light' | 'dark'}> = ({className, variant = 'light'}) => {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    
    const languages = [
        { code: 'ar', label: 'العربية', flag: '🇸🇦' },
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'zh', label: '中文 (Business)', flag: '🇨🇳' },
        { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    ] as const;

    return (
        <div className={`relative ${className}`}>
            <button 
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    variant === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md' 
                    : 'bg-white border-gray-200 text-slate-700 hover:border-amber-500 shadow-sm hover:shadow-md'
                }`}
            >
                <Globe size={14} className={variant === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                <span className="text-xs font-bold uppercase tracking-wider">{language}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} opacity-70`} />
            </button>

            {open && (
                 <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className={`absolute top-full mt-2 w-40 py-1 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in ${document.dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                        {languages.map((lang) => (
                             <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as any);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors ${
                                    language === lang.code 
                                    ? 'bg-amber-50 text-amber-700' 
                                    : 'text-slate-600 hover:bg-gray-50'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-sm">{lang.flag}</span>
                                    {lang.label}
                                </span>
                                {language === lang.code && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};