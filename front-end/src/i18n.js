import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import vi from './locales/vi.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            vi: { translation: vi },
        },
        lng: localStorage.getItem("language") || "en", // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'en'
        fallbackLng: "vi",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

