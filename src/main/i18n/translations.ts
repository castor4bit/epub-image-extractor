import { LanguageCode, DEFAULT_LANGUAGE } from '../../shared/constants/languages';

// メインプロセス用の翻訳定義
export const translations = {
  ja: {
    exitDialog: {
      title: '処理中のファイルがあります',
      message: '処理中のファイルがあります',
      detail: '処理を中断して終了してもよろしいですか？',
      buttons: {
        quit: '終了',
        cancel: 'キャンセル',
      },
    },
    menu: {
      // 将来のメニュー翻訳用
      file: 'ファイル',
      edit: '編集',
      view: '表示',
      help: 'ヘルプ',
    },
  },
  en: {
    exitDialog: {
      title: 'Files are being processed',
      message: 'Files are being processed',
      detail: 'Are you sure you want to quit and interrupt the processing?',
      buttons: {
        quit: 'Quit',
        cancel: 'Cancel',
      },
    },
    menu: {
      // For future menu translations
      file: 'File',
      edit: 'Edit',
      view: 'View',
      help: 'Help',
    },
  },
} as const;

export type TranslationKey = typeof translations;

export function getTranslation(lang?: LanguageCode): TranslationKey[LanguageCode] {
  const language = lang || DEFAULT_LANGUAGE;
  return translations[language] || translations[DEFAULT_LANGUAGE];
}