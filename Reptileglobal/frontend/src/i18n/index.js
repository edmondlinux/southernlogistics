
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';


const resources = {
  en: { translation: en }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'], // languages to not persist (only cookie)
      convertDetectedLanguage: (lng) => {
        // Extract the primary language code from browser locale (e.g., 'en-US' -> 'en')
        const primaryLng = lng.split('-')[0].toLowerCase();
        
        // Check if we support this language
        const supportedLanguages = ['en'];
        
        return supportedLanguages.includes(primaryLng) ? primaryLng : 'en';
      }
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
