import { describe, it, expect } from 'vitest';
import { isJapaneseLanguage, containsJapaneseCharacters } from '../language';

describe('Language Utilities', () => {
  describe('isJapaneseLanguage', () => {
    it('should return true for Japanese language code', () => {
      expect(isJapaneseLanguage('ja')).toBe(true);
    });

    it('should return false for non-Japanese language codes', () => {
      expect(isJapaneseLanguage('en')).toBe(false);
      expect(isJapaneseLanguage('fr')).toBe(false);
      expect(isJapaneseLanguage('de')).toBe(false);
      expect(isJapaneseLanguage('ja-JP')).toBe(false); // Exact match only
      expect(isJapaneseLanguage('')).toBe(false);
    });
  });

  describe('containsJapaneseCharacters', () => {
    it('should detect hiragana characters', () => {
      expect(containsJapaneseCharacters('ひらがな')).toBe(true);
      expect(containsJapaneseCharacters('これはテストです')).toBe(true);
      expect(containsJapaneseCharacters('Hello ひらがな')).toBe(true);
    });

    it('should detect katakana characters', () => {
      expect(containsJapaneseCharacters('カタカナ')).toBe(true);
      expect(containsJapaneseCharacters('テスト')).toBe(true);
      expect(containsJapaneseCharacters('Hello カタカナ')).toBe(true);
    });

    it('should not detect kanji-only text as Japanese', () => {
      // Pure kanji without kana is not detected as definitively Japanese
      expect(containsJapaneseCharacters('漢字')).toBe(false);
      expect(containsJapaneseCharacters('日本語')).toBe(false); // Only kanji
      expect(containsJapaneseCharacters('中国')).toBe(false); // Chinese characters
    });

    it('should detect text with kana as Japanese', () => {
      expect(containsJapaneseCharacters('にほんご')).toBe(true); // Hiragana
      expect(containsJapaneseCharacters('漢字です')).toBe(true); // Kanji + kana
      expect(containsJapaneseCharacters('これはテストです')).toBe(true);
    });

    it('should detect mixed Japanese text', () => {
      expect(containsJapaneseCharacters('EPUBファイルの解析に失敗しました')).toBe(true);
      expect(containsJapaneseCharacters('ファイルが見つかりません')).toBe(true);
      expect(containsJapaneseCharacters('無効なEPUB形式です')).toBe(true);
    });

    it('should return false for non-Japanese text', () => {
      expect(containsJapaneseCharacters('Hello World')).toBe(false);
      expect(containsJapaneseCharacters('Failed to parse EPUB file')).toBe(false);
      expect(containsJapaneseCharacters('123456789')).toBe(false);
      expect(containsJapaneseCharacters('')).toBe(false);
      expect(containsJapaneseCharacters('EPUB_PARSE_ERROR')).toBe(false);
    });

    it('should return false for other Unicode characters', () => {
      expect(containsJapaneseCharacters('Привет')).toBe(false); // Cyrillic
      expect(containsJapaneseCharacters('مرحبا')).toBe(false); // Arabic
      expect(containsJapaneseCharacters('你好')).toBe(false); // Chinese (simplified)
      expect(containsJapaneseCharacters('한글')).toBe(false); // Korean
    });
  });
});
