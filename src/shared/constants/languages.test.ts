import { describe, test, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LanguageCode } from './languages';

describe('Language Constants', () => {
  describe('SUPPORTED_LANGUAGES', () => {
    test('should export supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toBeDefined();
      expect(SUPPORTED_LANGUAGES.ja).toBeDefined();
      expect(SUPPORTED_LANGUAGES.en).toBeDefined();
    });

    test('should have correct Japanese language properties', () => {
      expect(SUPPORTED_LANGUAGES.ja).toEqual({
        code: 'ja',
        name: '日本語',
        englishName: 'Japanese',
      });
    });

    test('should have correct English language properties', () => {
      expect(SUPPORTED_LANGUAGES.en).toEqual({
        code: 'en',
        name: 'English',
        englishName: 'English',
      });
    });

    test('should have const assertion properties', () => {
      // TypeScript's const assertion ensures compile-time immutability
      // Runtime check for property types
      expect(typeof SUPPORTED_LANGUAGES.ja.code).toBe('string');
      expect(typeof SUPPORTED_LANGUAGES.ja.name).toBe('string');
      expect(typeof SUPPORTED_LANGUAGES.ja.englishName).toBe('string');

      // Verify the object structure is frozen at type level
      type JaCode = typeof SUPPORTED_LANGUAGES.ja.code;
      const code: JaCode = 'ja';
      expect(code).toBe('ja');
    });
  });

  describe('LanguageCode type', () => {
    test('should accept valid language codes', () => {
      const jaCode: LanguageCode = 'ja';
      const enCode: LanguageCode = 'en';

      expect(jaCode).toBe('ja');
      expect(enCode).toBe('en');
    });

    test('should have matching keys in SUPPORTED_LANGUAGES', () => {
      const codes: LanguageCode[] = ['ja', 'en'];
      codes.forEach((code) => {
        expect(SUPPORTED_LANGUAGES[code]).toBeDefined();
        expect(SUPPORTED_LANGUAGES[code].code).toBe(code);
      });
    });
  });

  describe('DEFAULT_LANGUAGE', () => {
    test('should be Japanese', () => {
      expect(DEFAULT_LANGUAGE).toBe('ja');
    });

    test('should be a valid language code', () => {
      expect(SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE]).toBeDefined();
    });

    test('should be assignable to LanguageCode type', () => {
      const code: LanguageCode = DEFAULT_LANGUAGE;
      expect(code).toBe('ja');
    });
  });

  describe('Usage patterns', () => {
    test('should support iteration over languages', () => {
      const languageCodes = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
      expect(languageCodes).toContain('ja');
      expect(languageCodes).toContain('en');
      expect(languageCodes.length).toBe(2);
    });

    test('should support getting language info by code', () => {
      const getLanguageInfo = (code: LanguageCode) => SUPPORTED_LANGUAGES[code];

      expect(getLanguageInfo('ja').name).toBe('日本語');
      expect(getLanguageInfo('en').name).toBe('English');
    });

    test('should support language selection', () => {
      const selectLanguage = (code: LanguageCode) => {
        return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
      };

      expect(selectLanguage('ja').code).toBe('ja');
      expect(selectLanguage('en').code).toBe('en');
    });
  });
});
