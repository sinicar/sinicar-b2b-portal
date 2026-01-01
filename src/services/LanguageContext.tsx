import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Api } from './api';
import i18n, { languages, changeLanguage as i18nChangeLanguage, getDirection } from './i18n';

export type Language = 'ar' | 'en' | 'hi' | 'zh';

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, options?: any) => string;
    tDynamic: (key: string, fallback: string) => string;
    dir: 'rtl' | 'ltr';
    fontFamily: string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t: i18nT, i18n: i18nInstance } = useTranslation();
    const [language, setLanguageState] = useState<Language>((i18nInstance.language as Language) || 'ar');
    const [uiTexts, setUiTexts] = useState<Record<string, string>>({});

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        i18nChangeLanguage(lang);
    };

    useEffect(() => {
        const handleLanguageChanged = (lng: string) => {
            setLanguageState(lng as Language);
            const dir = getDirection(lng);
            document.documentElement.dir = dir;
            document.documentElement.lang = lng;
        };
        
        i18nInstance.on('languageChanged', handleLanguageChanged);
        
        // Set initial direction
        const dir = getDirection(i18nInstance.language);
        document.documentElement.dir = dir;
        document.documentElement.lang = i18nInstance.language;
        
        return () => {
            i18nInstance.off('languageChanged', handleLanguageChanged);
        };
    }, [i18nInstance]);

    // Load dynamic texts from settings
    useEffect(() => {
        const loadTexts = async () => {
            try {
                const settings = await Api.getSettings();
                if (settings.uiTexts) {
                    setUiTexts(settings.uiTexts);
                }
            } catch (e) {
                console.error("Failed to load UI texts");
            }
        };
        loadTexts();
    }, []);

    const t = (key: string, options?: any): string => {
        const result = i18nT(key, options);
        return typeof result === 'string' ? result : key;
    };

    // Get dynamic text from settings, or fallback to default
    const tDynamic = (key: string, fallback: string): string => {
        return uiTexts[key] || fallback;
    };

    const dir = getDirection(language);
    const fontFamily = 'Tajawal, system-ui, sans-serif';
    const isRTL = dir === 'rtl';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tDynamic, dir, fontFamily, isRTL }}>
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

    return (
        <div className={`relative ${className}`}>
            <button 
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    variant === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md' 
                    : 'bg-white border-gray-200 text-slate-700 hover:border-amber-500 shadow-sm hover:shadow-md'
                }`}
                data-testid="button-language-switcher"
            >
                <Globe size={14} className={variant === 'dark' ? 'text-amber-400' : 'text-amber-600'} />
                <span className="text-xs font-bold uppercase tracking-wider">{language}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} opacity-70`} />
            </button>

            {open && (
                 <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className={`absolute top-full mt-2 w-44 py-1 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in ${document.dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                        {languages.map((lang) => (
                             <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as Language);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${language === lang.code ? 'bg-amber-50 font-bold text-amber-700' : 'text-slate-700'}`}
                                data-testid={`button-lang-${lang.code}`}
                             >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="flex-1 text-start">{lang.nativeName}</span>
                                {language === lang.code && <Check size={16} className="text-amber-600" />}
                             </button>
                        ))}
                    </div>
                 </>
            )}
        </div>
    );
};

// For Admin Dashboard (light theme)
export const LanguageSwitcherAdmin: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 text-slate-700 border border-slate-200"
                data-testid="button-admin-language-switcher"
            >
                <Globe size={18} />
                <span className="text-sm font-medium">{languages.find(l => l.code === language)?.nativeName || language}</span>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className="absolute top-full mt-2 end-0 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as Language);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-slate-50 transition-colors ${
                                    lang.code === language ? 'bg-amber-50' : ''
                                }`}
                                data-testid={`button-admin-lang-${lang.code}`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className={`flex-1 text-sm font-medium ${
                                    lang.code === language ? 'text-amber-700' : 'text-slate-700'
                                }`}>
                                    {lang.nativeName}
                                </span>
                                {lang.code === language && (
                                    <Check size={16} className="text-amber-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
