import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatError, getErrorMessage } from '../errorMessages';
import i18n from '../../i18n';
import { containsJapaneseCharacters } from '../../../shared/utils/language';

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

      it('should return localized message from i18n for AppError with code', () => {
        const error = {
          code: 'EPUB_PARSE_ERROR',
          userMessage: '古いメッセージ', // Old hardcoded message (should be ignored)
          message: 'Failed to parse EPUB file',
        };

        const result = formatError(error);
        // Should use i18n translation, not the userMessage
        expect(result).toBe('EPUBファイルの解析に失敗しました');
        expect(result).not.toBe('古いメッセージ');
      });

      it('should return localized Japanese messages for different error codes', () => {
        const testCases = [
          {
            error: {
              code: 'FILE_NOT_FOUND',
              userMessage: '違うメッセージ', // Wrong message
              message: 'File not found',
            },
            expected: 'ファイルが見つかりません', // From i18n
          },
          {
            error: {
              code: 'INVALID_EPUB_FORMAT',
              userMessage: '違うメッセージ', // Wrong message
              message: 'Invalid EPUB format',
            },
            expected: '無効なEPUB形式です', // From i18n
          },
          {
            error: {
              code: 'ZIP_EXTRACTION_ERROR',
              userMessage: '違うメッセージ', // Wrong message
              message: 'Failed to extract ZIP file',
            },
            expected: 'ZIPファイルの展開に失敗しました', // From i18n
          },
        ];

        testCases.forEach(({ error, expected }) => {
          const result = formatError(error);
          expect(result).toBe(expected); // Should use i18n translation
          expect(result).not.toBe(error.userMessage); // Should NOT use userMessage
          expect(containsJapaneseCharacters(result)).toBe(true);
        });
      });

      it('should handle unknown error codes', () => {
        const error = {
          code: 'UNKNOWN_ERROR_CODE',
          message: 'Some error occurred',
        };

        const result = formatError(error);
        expect(result).toBe('不明なエラーが発生しました'); // Default from i18n
      });

      it('should fallback to userMessage when code is empty', () => {
        const error = {
          code: '', // Empty code
          userMessage: 'フォールバックメッセージ',
          message: 'Fallback message',
        };

        const result = formatError(error);
        expect(result).toBe('フォールバックメッセージ');
      });
    });

    describe('English language (en)', () => {
      beforeEach(async () => {
        await i18n.changeLanguage('en');
      });

      it('should return localized English message from i18n for AppError with code', () => {
        const error = {
          code: 'EPUB_PARSE_ERROR',
          userMessage: 'EPUBファイルの解析に失敗しました', // Japanese userMessage (should be ignored)
          message: 'Some other message',
        };

        const result = formatError(error);
        // Should use i18n English translation
        expect(result).toBe('Failed to parse EPUB file');
        expect(result).not.toBe('EPUBファイルの解析に失敗しました'); // Not the Japanese userMessage
        expect(result).not.toBe('Some other message'); // Not the message field
        expect(result).not.toContain('EPUB_PARSE_ERROR'); // Should not show error code
      });

      it('should return English messages from i18n, not from message field', () => {
        const testCases = [
          {
            error: {
              code: 'FILE_NOT_FOUND',
              userMessage: 'ファイルが見つかりません',
              message: 'Wrong: file was not found', // Different from i18n
            },
            expected: 'File not found', // From i18n
          },
          {
            error: {
              code: 'INVALID_EPUB_FORMAT',
              userMessage: '無効なEPUB形式です',
              message: 'Wrong: EPUB format is invalid', // Different from i18n
            },
            expected: 'Invalid EPUB format', // From i18n
          },
          {
            error: {
              code: 'ZIP_EXTRACTION_ERROR',
              userMessage: 'ZIPファイルの展開に失敗しました',
              message: 'Wrong: could not extract ZIP', // Different from i18n
            },
            expected: 'Failed to extract ZIP file', // From i18n
          },
          {
            error: {
              code: 'OUTPUT_DIR_ERROR',
              userMessage: '出力ディレクトリの作成に失敗しました',
              message: 'Wrong: output directory creation failed', // Different from i18n
            },
            expected: 'Failed to create output directory', // From i18n
          },
        ];

        testCases.forEach(({ error, expected }) => {
          const result = formatError(error);
          expect(result).toBe(expected); // Should use i18n
          expect(result).not.toBe(error.message); // Should NOT use message field
          expect(result).not.toBe(error.userMessage); // Should NOT use userMessage
          expect(containsJapaneseCharacters(result)).toBe(false); // No Japanese characters
        });
      });

      it('should return default i18n message for errors without code', () => {
        const error = {
          message: 'Some error occurred',
          // No code field at all
        };

        const result = formatError(error);
        expect(result).toBe('An unknown error occurred'); // Default from i18n
        expect(result).not.toBe('Some error occurred'); // Should NOT use message field
      });

      it('should use i18n for unknown error codes', () => {
        const error = {
          code: 'COMPLETELY_UNKNOWN_CODE',
          message: 'Fallback message text',
          userMessage: 'Japanese fallback',
        };

        const result = formatError(error);
        expect(result).toBe('An unknown error occurred'); // Default from i18n
        expect(result).not.toBe('Fallback message text'); // NOT the message field
        expect(result).not.toBe('Japanese fallback'); // NOT the userMessage
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
          expect(containsJapaneseCharacters(enMessage)).toBe(false); // No Japanese
          expect(enMessage).not.toBe(code); // Should not return the code itself

          // Test Japanese
          await i18n.changeLanguage('ja');
          const jaMessage = getErrorMessage(code);
          expect(containsJapaneseCharacters(jaMessage)).toBe(true); // Has Japanese
          expect(jaMessage).not.toBe(code); // Should not return the code itself
        }
      });
    });
  });
});
