import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
};

// ローカルストレージから保存された言語を取得
const savedLanguage = localStorage.getItem('app-language') || 'ja';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage, // 保存された言語またはデフォルト日本語
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false, // ReactはXSSから保護されている
  },

  // 名前空間を使用しない（シンプルにするため）
  defaultNS: 'translation',
  ns: ['translation'],

  // デバッグモード（開発時のみ）
  debug: process.env.NODE_ENV === 'development',
});

// 言語変更時にローカルストレージに保存
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('app-language', lng);
});

export default i18n;
