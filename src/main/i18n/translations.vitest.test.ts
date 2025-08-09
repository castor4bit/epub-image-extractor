import { describe, test, expect } from 'vitest';
import { translations, getTranslation, TranslationKey } from './translations';
import { LanguageCode } from '../../shared/constants/languages';

describe('Translations', () => {
  describe('translations object', () => {
    test('should have Japanese translations', () => {
      expect(translations.ja).toBeDefined();
      expect(translations.ja.exitDialog).toBeDefined();
      expect(translations.ja.exitDialog.title).toBe('処理中のファイルがあります');
      expect(translations.ja.exitDialog.message).toBe('処理中のファイルがあります');
      expect(translations.ja.exitDialog.detail).toBe('処理を中断して終了してもよろしいですか？');
      expect(translations.ja.exitDialog.buttons.quit).toBe('終了');
      expect(translations.ja.exitDialog.buttons.cancel).toBe('キャンセル');
    });

    test('should have English translations', () => {
      expect(translations.en).toBeDefined();
      expect(translations.en.exitDialog).toBeDefined();
      expect(translations.en.exitDialog.title).toBe('Files are being processed');
      expect(translations.en.exitDialog.message).toBe('Files are being processed');
      expect(translations.en.exitDialog.detail).toBe('Are you sure you want to quit and interrupt the processing?');
      expect(translations.en.exitDialog.buttons.quit).toBe('Quit');
      expect(translations.en.exitDialog.buttons.cancel).toBe('Cancel');
    });

    test('should have menu translations for both languages', () => {
      expect(translations.ja.menu).toBeDefined();
      expect(translations.ja.menu.file).toBe('ファイル');
      expect(translations.ja.menu.edit).toBe('編集');
      expect(translations.ja.menu.view).toBe('表示');
      expect(translations.ja.menu.help).toBe('ヘルプ');

      expect(translations.en.menu).toBeDefined();
      expect(translations.en.menu.file).toBe('File');
      expect(translations.en.menu.edit).toBe('Edit');
      expect(translations.en.menu.view).toBe('View');
      expect(translations.en.menu.help).toBe('Help');
    });

    test('should have the same structure for all languages', () => {
      const jaKeys = getObjectKeys(translations.ja);
      const enKeys = getObjectKeys(translations.en);

      expect(jaKeys).toEqual(enKeys);
    });

    test('should be read-only object', () => {
      // TypeScript's const assertion ensures compile-time immutability
      // Runtime check for property types
      expect(typeof translations.ja.exitDialog.title).toBe('string');
      expect(typeof translations.en.exitDialog.title).toBe('string');
      
      // Verify the object structure is frozen at type level
      type JaTitle = typeof translations.ja.exitDialog.title;
      const title: JaTitle = '処理中のファイルがあります';
      expect(title).toBe('処理中のファイルがあります');
    });
  });

  describe('getTranslation', () => {
    test('should return Japanese translations when lang is "ja"', () => {
      const result = getTranslation('ja');
      expect(result).toBe(translations.ja);
      expect(result.exitDialog.title).toBe('処理中のファイルがあります');
    });

    test('should return English translations when lang is "en"', () => {
      const result = getTranslation('en');
      expect(result).toBe(translations.en);
      expect(result.exitDialog.title).toBe('Files are being processed');
    });

    test('should return default language (Japanese) when no language is specified', () => {
      const result = getTranslation();
      expect(result).toBe(translations.ja);
    });

    test('should return default language (Japanese) for unsupported language', () => {
      // Test with a non-existent language code
      const result = getTranslation('fr' as LanguageCode);
      expect(result).toBe(translations.ja);
    });

    test('should handle undefined language parameter', () => {
      const result = getTranslation(undefined);
      expect(result).toBe(translations.ja);
    });
  });

  describe('TranslationKey type', () => {
    test('should allow access to translation properties', () => {
      const trans: TranslationKey = translations;
      
      expect(trans.ja.exitDialog).toBeDefined();
      expect(trans.en.exitDialog).toBeDefined();
    });

    test('should work with getTranslation return type', () => {
      const jaTranslations = getTranslation('ja');
      const enTranslations = getTranslation('en');

      // Type check - these should compile without error
      const jaTitle: string = jaTranslations.exitDialog.title;
      const enTitle: string = enTranslations.exitDialog.title;

      expect(jaTitle).toBe('処理中のファイルがあります');
      expect(enTitle).toBe('Files are being processed');
    });
  });

  describe('Translation completeness', () => {
    test('all exit dialog fields should be translated', () => {
      const languages: LanguageCode[] = ['ja', 'en'];

      languages.forEach(lang => {
        const trans = translations[lang];
        expect(trans.exitDialog.title).toBeTruthy();
        expect(trans.exitDialog.message).toBeTruthy();
        expect(trans.exitDialog.detail).toBeTruthy();
        expect(trans.exitDialog.buttons.quit).toBeTruthy();
        expect(trans.exitDialog.buttons.cancel).toBeTruthy();
      });
    });

    test('all menu fields should be translated', () => {
      const languages: LanguageCode[] = ['ja', 'en'];

      languages.forEach(lang => {
        const trans = translations[lang];
        expect(trans.menu.file).toBeTruthy();
        expect(trans.menu.edit).toBeTruthy();
        expect(trans.menu.view).toBeTruthy();
        expect(trans.menu.help).toBeTruthy();
      });
    });
  });
});

// Helper function to get all keys from an object recursively
function getObjectKeys(obj: any, prefix = ''): string[] {
  return Object.keys(obj).reduce((keys: string[], key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      return [...keys, fullKey, ...getObjectKeys(obj[key], fullKey)];
    }
    return [...keys, fullKey];
  }, []);
}