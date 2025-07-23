// サポートされている言語の定義
export const SUPPORTED_LANGUAGES = {
  ja: {
    code: 'ja',
    name: '日本語',
    englishName: 'Japanese',
  },
  en: {
    code: 'en', 
    name: 'English',
    englishName: 'English',
  },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = 'ja';