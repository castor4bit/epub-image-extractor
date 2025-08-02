import { describe, test, expect } from '@jest/globals';
import { 
  ErrorCode, 
  AppError, 
  getDefaultUserMessage, 
  wrapError,
  ProcessingError 
} from './error-types';

describe('Error Types', () => {
  describe('ErrorCode enum', () => {
    test('should export all error codes', () => {
      expect(ErrorCode.EPUB_PARSE_ERROR).toBe('EPUB_PARSE_ERROR');
      expect(ErrorCode.FILE_NOT_FOUND).toBe('FILE_NOT_FOUND');
      expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    test('should have unique values', () => {
      const values = Object.values(ErrorCode);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });
  });

  describe('AppError class', () => {
    test('should create error with all properties', () => {
      const error = new AppError(
        ErrorCode.EPUB_PARSE_ERROR,
        'Parse failed',
        'EPUBファイルの解析に失敗しました',
        { filePath: '/test/file.epub' },
        new Error('Original error')
      );

      expect(error.name).toBe('AppError');
      expect(error.code).toBe(ErrorCode.EPUB_PARSE_ERROR);
      expect(error.message).toBe('Parse failed');
      expect(error.userMessage).toBe('EPUBファイルの解析に失敗しました');
      expect(error.context).toEqual({ filePath: '/test/file.epub' });
      expect(error.originalError).toBeInstanceOf(Error);
    });

    test('should be instanceof Error', () => {
      const error = new AppError(
        ErrorCode.UNKNOWN_ERROR,
        'Test error',
        'テストエラー'
      );
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    test('should implement ProcessingError interface', () => {
      const error: ProcessingError = new AppError(
        ErrorCode.FILE_NOT_FOUND,
        'File not found',
        'ファイルが見つかりません'
      );
      
      expect(error.code).toBe(ErrorCode.FILE_NOT_FOUND);
      expect(error.message).toBeDefined();
      expect(error.userMessage).toBeDefined();
    });
  });

  describe('getDefaultUserMessage', () => {
    test('should return Japanese message for each error code', () => {
      expect(getDefaultUserMessage(ErrorCode.EPUB_PARSE_ERROR))
        .toBe('EPUBファイルの解析に失敗しました');
      
      expect(getDefaultUserMessage(ErrorCode.FILE_NOT_FOUND))
        .toBe('ファイルが見つかりません');
      
      expect(getDefaultUserMessage(ErrorCode.MEMORY_LIMIT_EXCEEDED))
        .toBe('メモリ使用量が上限を超えました');
    });

    test('should return default message for unknown error code', () => {
      // Test with a non-existent error code
      const unknownCode = 'UNKNOWN_CODE' as ErrorCode;
      expect(getDefaultUserMessage(unknownCode))
        .toBe('不明なエラーが発生しました');
    });
  });

  describe('wrapError', () => {
    test('should wrap standard Error to AppError', () => {
      const originalError = new Error('Original message');
      const wrapped = wrapError(
        originalError,
        ErrorCode.EPUB_PARSE_ERROR,
        { filePath: '/test.epub' }
      );

      expect(wrapped).toBeInstanceOf(AppError);
      expect(wrapped.code).toBe(ErrorCode.EPUB_PARSE_ERROR);
      expect(wrapped.message).toBe('Original message');
      expect(wrapped.context).toEqual({ filePath: '/test.epub' });
      expect(wrapped.originalError).toBe(originalError);
    });

    test('should return AppError as-is', () => {
      const appError = new AppError(
        ErrorCode.FILE_NOT_FOUND,
        'Not found',
        'ファイルが見つかりません'
      );

      const wrapped = wrapError(appError, ErrorCode.UNKNOWN_ERROR);
      expect(wrapped).toBe(appError);
    });

    test('should detect ENOENT errors', () => {
      const error = new Error('ENOENT: no such file or directory');
      const wrapped = wrapError(error, ErrorCode.UNKNOWN_ERROR);

      expect(wrapped.code).toBe(ErrorCode.FILE_NOT_FOUND);
      expect(wrapped.userMessage).toBe('ファイルが見つかりません');
    });

    test('should detect EACCES errors', () => {
      const error = new Error('EACCES: permission denied');
      const wrapped = wrapError(error, ErrorCode.UNKNOWN_ERROR);

      expect(wrapped.code).toBe(ErrorCode.FILE_ACCESS_DENIED);
      expect(wrapped.userMessage).toBe('ファイルへのアクセス権限がありません');
    });

    test('should handle non-Error objects', () => {
      const wrapped = wrapError('String error', ErrorCode.UNKNOWN_ERROR);
      
      expect(wrapped).toBeInstanceOf(AppError);
      expect(wrapped.message).toBe('String error');
      expect(wrapped.originalError).toBeInstanceOf(Error);
    });
  });
});