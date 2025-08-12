/**
 * Utility functions for language detection and validation
 */

/**
 * Check if the current language is Japanese
 */
export function isJapaneseLanguage(language: string): boolean {
  return language === 'ja';
}

/**
 * Check if a string contains Japanese characters (specifically hiragana or katakana)
 * Note: We check for hiragana or katakana as they are unique to Japanese.
 * Kanji alone could be Chinese, so we only consider text with kana as definitively Japanese.
 */
export function containsJapaneseCharacters(text: string): boolean {
  // Hiragana: \u3040-\u309F
  // Katakana: \u30A0-\u30FF
  const hiraganaKatakanaPattern = /[\u3040-\u309F\u30A0-\u30FF]/;
  return hiraganaKatakanaPattern.test(text);
}
