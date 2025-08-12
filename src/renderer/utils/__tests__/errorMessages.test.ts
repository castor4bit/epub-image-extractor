import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatError, getErrorMessage } from '../errorMessages';
import i18n from '../../i18n';

describe('errorMessages', () => {
  describe('formatError', () => {
    beforeEach(() => {
      // Mock console.error to prevent test output pollution
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('Japanese language (ja)', () => {
      beforeEach(async () => {
        await i18n.changeLanguage('ja');
      });

      it('should return Japanese userMessage for AppError with code', () => {
        const error = {
          code: 'EPUB_PARSE_ERROR',
          userMessage: 'EPUBファイルの解析に失敗しました',
          message: 'Failed to parse EPUB file',
        };
        
        const result = formatError(error);
        expect(result).toBe('EPUBファイルの解析に失敗しました');
      });

      it('should return Japanese userMessage for different error codes', () => {
        const errors = [
          {
            code: 'FILE_NOT_FOUND',
            userMessage: 'ファイルが見つかりません',
            message: 'File not found',
          },
          {
            code: 'INVALID_EPUB_FORMAT',
            userMessage: '無効なEPUB形式です',
            message: 'Invalid EPUB format',
          },
          {
            code: 'ZIP_EXTRACTION_ERROR',
            userMessage: 'ZIPファイルの展開に失敗しました',
            message: 'Failed to extract ZIP file',
          },
        ];

        errors.forEach((error) => {
          const result = formatError(error);
          expect(result).toBe(error.userMessage);
          // Check that it contains Japanese characters (hiragana, katakana, or kanji)
          expect(result).toMatch(/[぀-ゟ゠-ヿ一-龯]/);
        });
      });

      it('should handle errors without userMessage', () => {
        const error = {
          code: 'SOME_ERROR',
          message: 'Some error occurred',
        };
        
        const result = formatError(error);
        expect(result).toBe('不明なエラーが発生しました');
      });
    });

    describe('English language (en)', () => {
      beforeEach(async () => {
        await i18n.changeLanguage('en');
      });

      it('should return English message for AppError with code', () => {
        const error = {
          code: 'EPUB_PARSE_ERROR',
          userMessage: 'EPUBファイルの解析に失敗しました',
          message: 'Failed to parse EPUB file',
        };
        
        const result = formatError(error);
        expect(result).toBe('Failed to parse EPUB file');
        expect(result).not.toContain('EPUB_PARSE_ERROR'); // Should not show error code
      });

      it('should return English messages for different error codes', () => {
        const testCases = [
          {
            error: {
              code: 'FILE_NOT_FOUND',
              userMessage: 'ファイルが見つかりません',
              message: 'File not found',
            },
            expected: 'File not found',
          },
          {
            error: {
              code: 'INVALID_EPUB_FORMAT',
              userMessage: '無効なEPUB形式です',
              message: 'Invalid EPUB format',
            },
            expected: 'Invalid EPUB format',
          },
          {
            error: {
              code: 'ZIP_EXTRACTION_ERROR',
              userMessage: 'ZIPファイルの展開に失敗しました',
              message: 'Failed to extract ZIP file',
            },
            expected: 'Failed to extract ZIP file',
          },
          {
            error: {
              code: 'OUTPUT_DIR_ERROR',
              userMessage: '出力ディレクトリの作成に失敗しました',
              message: 'Failed to create output directory',
            },
            expected: 'Failed to create output directory',
          },
        ];

        testCases.forEach(({ error, expected }) => {
          const result = formatError(error);
          expect(result).toBe(expected);
          expect(result).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/); // No Japanese characters
        });
      });

      it('should handle errors without code', () => {
        const error = {
          message: 'Some error occurred',
        };
        
        const result = formatError(error);
        expect(result).toBe('An unknown error occurred');
      });

      it('should handle string errors', () => {
        const error = 'Simple error message';
        
        const result = formatError(error);
        // String errors are returned as-is unless they look like error codes
        expect(result).toBe('Simple error message');
      });
    });

    describe('getErrorMessage', () => {
      it('should return Japanese message for known error codes when language is ja', async () => {
        await i18n.changeLanguage('ja');
        
        expect(getErrorMessage('EPUB_PARSE_ERROR')).toBe('EPUBファイルの解析に失敗しました');
        expect(getErrorMessage('FILE_NOT_FOUND')).toBe('ファイルが見つかりません');
        expect(getErrorMessage('INVALID_EPUB_FORMAT')).toBe('無効なEPUB形式です');
      });

      it('should return English message for known error codes when language is en', async () => {
        await i18n.changeLanguage('en');
        
        expect(getErrorMessage('EPUB_PARSE_ERROR')).toBe('Failed to parse EPUB file');
        expect(getErrorMessage('FILE_NOT_FOUND')).toBe('File not found');
        expect(getErrorMessage('INVALID_EPUB_FORMAT')).toBe('Invalid EPUB format');
      });

      it('should return default message for unknown error codes', async () => {
        await i18n.changeLanguage('en');
        const enMessage = getErrorMessage('UNKNOWN_CODE');
        expect(enMessage).toContain('unknown');
        
        await i18n.changeLanguage('ja');
        const jaMessage = getErrorMessage('UNKNOWN_CODE');
        expect(jaMessage).toContain('不明');
      });
    });

    describe('Language switching', () => {
      it('should dynamically switch error messages when language changes', async () => {
        const error = {
          code: 'EPUB_PARSE_ERROR',
          userMessage: 'EPUBファイルの解析に失敗しました',
          message: 'Failed to parse EPUB file',
        };

        // Start with Japanese
        await i18n.changeLanguage('ja');
        expect(formatError(error)).toBe('EPUBファイルの解析に失敗しました');

        // Switch to English
        await i18n.changeLanguage('en');
        expect(formatError(error)).toBe('Failed to parse EPUB file');

        // Switch back to Japanese
        await i18n.changeLanguage('ja');
        expect(formatError(error)).toBe('EPUBファイルの解析に失敗しました');
      });

      it('should handle all error codes correctly in both languages', async () => {
        const errorCodes = [
          'EPUB_PARSE_ERROR',
          'FILE_NOT_FOUND',
          'INVALID_EPUB_FORMAT',
          'ZIP_EXTRACTION_ERROR',
          'OUTPUT_DIR_ERROR',
          'IMAGE_EXTRACTION_ERROR',
          'CHAPTER_ORGANIZATION_ERROR',
          'PERMISSION_DENIED',
          'DISK_FULL',
          'NETWORK_ERROR',
        ];

        for (const code of errorCodes) {
          // Test English
          await i18n.changeLanguage('en');
          const enMessage = getErrorMessage(code);
          expect(enMessage).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/); // No Japanese
          expect(enMessage).not.toBe(code); // Should not return the code itself

          // Test Japanese
          await i18n.changeLanguage('ja');
          const jaMessage = getErrorMessage(code);
          expect(jaMessage).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/); // Has Japanese
          expect(jaMessage).not.toBe(code); // Should not return the code itself
        }
      });
    });
  });
});