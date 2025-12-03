import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from '../locales/ar.json';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
  hi: { translation: hi },
  zh: { translation: zh }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en', 'hi', 'zh'],
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export const languages = [
  { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'hi', name: 'हिंदी', nativeName: 'हिंदी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'zh', name: '中文', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' }
];

export const getDirection = (lang: string): 'rtl' | 'ltr' => {
  return lang === 'ar' ? 'rtl' : 'ltr';
};

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  const dir = getDirection(lang);
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  localStorage.setItem('i18nextLng', lang);
};

export default i18n;
