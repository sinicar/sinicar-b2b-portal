import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { languages, changeLanguage, getDirection } from '../services/i18n';

interface LanguageSwitcherProps {
    variant?: 'dark' | 'light' | 'floating';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const LanguageSwitcher = ({ 
    variant = 'light', 
    size = 'md',
    showLabel = true 
}: LanguageSwitcherProps) => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    useEffect(() => {
        const dir = getDirection(i18n.language);
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);
    
    const handleLanguageChange = (langCode: string) => {
        changeLanguage(langCode);
        setIsOpen(false);
    };

    const sizeClasses = {
        sm: 'px-2 py-1.5 text-xs gap-1.5',
        md: 'px-3 py-2 text-sm gap-2',
        lg: 'px-4 py-2.5 text-base gap-2.5'
    };

    const variantClasses = {
        dark: 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md',
        light: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm hover:shadow-md',
        floating: 'bg-[#0B1B3A] hover:bg-[#1a2e56] text-white border-[#C8A04F]/30 shadow-lg'
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center rounded-xl border transition-all duration-200 font-medium ${sizeClasses[size]} ${variantClasses[variant]}`}
                data-testid="button-language-switcher"
            >
                <span className="text-lg leading-none">{currentLang.flag}</span>
                {showLabel && (
                    <span className="font-bold">{currentLang.nativeName}</span>
                )}
                <ChevronDown size={size === 'sm' ? 12 : 14} className={`transition-transform opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className={`absolute top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 ${
                    document.dir === 'rtl' ? 'left-0' : 'right-0'
                }`}>
                    <div className="p-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-500 px-2">{t('settings.selectLanguage')}</p>
                    </div>
                    <div className="p-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-start transition-all duration-150 ${
                                    lang.code === i18n.language 
                                        ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-800' 
                                        : 'hover:bg-slate-50 text-slate-700'
                                }`}
                                data-testid={`button-language-${lang.code}`}
                            >
                                <span className="text-2xl">{lang.flag}</span>
                                <div className="flex-1">
                                    <p className={`font-bold ${lang.code === i18n.language ? 'text-amber-800' : 'text-slate-800'}`}>
                                        {lang.nativeName}
                                    </p>
                                    <p className="text-xs text-slate-500">{lang.name}</p>
                                </div>
                                {lang.code === i18n.language && (
                                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const LanguageSwitcherLight = () => <LanguageSwitcher variant="light" size="md" />;
export const LanguageSwitcherDark = () => <LanguageSwitcher variant="dark" size="md" />;
export const LanguageSwitcherFloating = () => <LanguageSwitcher variant="floating" size="lg" />;

export const LanguageSwitcherMinimal = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all border border-white/20 backdrop-blur-sm"
                data-testid="button-language-minimal"
            >
                <Globe size={18} className="text-[#C8A04F]" />
                <span className="text-sm font-bold">{currentLang.code.toUpperCase()}</span>
            </button>
            
            {isOpen && (
                <div className={`absolute top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border overflow-hidden z-[100] ${
                    document.dir === 'rtl' ? 'left-0' : 'right-0'
                }`}>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                changeLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-start transition-colors ${
                                lang.code === i18n.language ? 'bg-amber-50 text-amber-700' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="flex-1 font-medium">{lang.nativeName}</span>
                            {lang.code === i18n.language && <Check size={16} className="text-amber-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
