import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { languages, changeLanguage, getDirection } from '../services/i18n';

export const LanguageSwitcher = () => {
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
    
    useEffect(() => {
        const dir = getDirection(i18n.language);
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);
    
    const handleLanguageChange = (langCode: string) => {
        changeLanguage(langCode);
        setIsOpen(false);
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-white border border-white/20"
                data-testid="button-language-switcher"
            >
                <Globe size={18} />
                <span className="text-sm font-medium">{currentLang.nativeName}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full mt-2 end-0 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-slate-50 transition-colors ${
                                lang.code === i18n.language ? 'bg-amber-50' : ''
                            }`}
                            data-testid={`button-language-${lang.code}`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className={`flex-1 text-sm font-medium ${
                                lang.code === i18n.language ? 'text-amber-700' : 'text-slate-700'
                            }`}>
                                {lang.nativeName}
                            </span>
                            {lang.code === i18n.language && (
                                <Check size={16} className="text-amber-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const LanguageSwitcherLight = () => {
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
    
    useEffect(() => {
        const dir = getDirection(i18n.language);
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);
    
    const handleLanguageChange = (langCode: string) => {
        changeLanguage(langCode);
        setIsOpen(false);
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 text-slate-700 border border-slate-200"
                data-testid="button-language-switcher-light"
            >
                <Globe size={18} />
                <span className="text-sm font-medium">{currentLang.nativeName}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-full mt-2 end-0 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-slate-50 transition-colors ${
                                lang.code === i18n.language ? 'bg-amber-50' : ''
                            }`}
                            data-testid={`button-language-light-${lang.code}`}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className={`flex-1 text-sm font-medium ${
                                lang.code === i18n.language ? 'text-amber-700' : 'text-slate-700'
                            }`}>
                                {lang.nativeName}
                            </span>
                            {lang.code === i18n.language && (
                                <Check size={16} className="text-amber-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
