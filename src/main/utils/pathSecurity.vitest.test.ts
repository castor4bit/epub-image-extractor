import { describe, test, expect } from 'vitest';
import path from 'path';
import {
  resolveSecurePath,
  isPathSafe,
  sanitizeFileName,
  RESOURCE_LIMITS,
  checkResourceLimits,
} from './pathSecurity';
import { AppError, ErrorCode } from '@shared/error-types';

describe('Path Security Utils', () => {
  describe('resolveSecurePath', () => {
    test('should resolve safe relative paths', () => {
      const basePath = '/home/user/data';
      const relativePath = 'subfolder/file.txt';
      const resolved = resolveSecurePath(basePath, relativePath);
      
      expect(resolved).toBe(path.normalize('/home/user/data/subfolder/file.txt'));
    });

    test('should handle nested paths', () => {
      const basePath = '/home/user/data';
      const relativePath = './subfolder/../another/file.txt';
      const resolved = resolveSecurePath(basePath, relativePath);
      
      expect(resolved).toBe(path.normalize('/home/user/data/another/file.txt'));
    });

    test('should throw error for path traversal attempts', () => {
      const basePath = '/home/user/data';
      const relativePath = '../../etc/passwd';
      
      expect(() => resolveSecurePath(basePath, relativePath)).toThrow(AppError);
      
      try {
        resolveSecurePath(basePath, relativePath);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCode.PATH_TRAVERSAL_DETECTED);
        expect((error as AppError).userMessage).toContain('セキュリティエラー');
      }
    });

    test('should handle Windows-style paths', () => {
      const basePath = 'C:\\Users\\user\\data';
      const relativePath = 'subfolder\\file.txt';
      const resolved = resolveSecurePath(basePath, relativePath);
      
      // path.normalize converts paths to platform-specific format
      const expected = path.join(path.normalize(basePath), path.normalize(relativePath));
      expect(resolved).toBe(expected);
    });
  });

  describe('isPathSafe', () => {
    test('should accept safe paths', () => {
      expect(isPathSafe('file.txt')).toBe(true);
      expect(isPathSafe('subfolder/file.txt')).toBe(true);
      expect(isPathSafe('sub_folder/file-name.txt')).toBe(true);
      expect(isPathSafe('日本語ファイル.txt')).toBe(true);
    });

    test('should reject paths with parent directory references', () => {
      expect(isPathSafe('../file.txt')).toBe(false);
      expect(isPathSafe('folder/../../../etc/passwd')).toBe(false);
      expect(isPathSafe('..\\windows\\system32')).toBe(false);
    });

    test('should reject absolute paths', () => {
      expect(isPathSafe('/etc/passwd')).toBe(false);
      expect(isPathSafe('\\windows\\system32')).toBe(false);
      expect(isPathSafe('C:\\Windows\\System32')).toBe(false);
    });

    test('should reject paths with invalid characters', () => {
      expect(isPathSafe('file<name>.txt')).toBe(false);
      expect(isPathSafe('file:name.txt')).toBe(false);
      expect(isPathSafe('file|name.txt')).toBe(false);
      expect(isPathSafe('file*name.txt')).toBe(false);
      expect(isPathSafe('file?name.txt')).toBe(false);
      expect(isPathSafe('file"name".txt')).toBe(false);
    });

    test('should reject paths with null characters', () => {
      expect(isPathSafe('file\0name.txt')).toBe(false);
      expect(isPathSafe('file\x00name.txt')).toBe(false);
    });
  });

  describe('sanitizeFileName', () => {
    test('should sanitize invalid characters', () => {
      expect(sanitizeFileName('file<name>.txt')).toBe('file_name_.txt');
      expect(sanitizeFileName('file:name|test.txt')).toBe('file_name_test.txt');
      expect(sanitizeFileName('file/name\\test.txt')).toBe('file_name_test.txt');
    });

    test('should replace spaces with underscores', () => {
      expect(sanitizeFileName('file name.txt')).toBe('file_name.txt');
      expect(sanitizeFileName('file   name.txt')).toBe('file_name.txt');
    });

    test('should handle dots correctly', () => {
      expect(sanitizeFileName('file...name.txt')).toBe('file.name.txt');
      expect(sanitizeFileName('.hidden')).toBe('hidden');
      expect(sanitizeFileName('file.')).toBe('file');
      expect(sanitizeFileName('file..')).toBe('file');
    });

    test('should handle Windows reserved names', () => {
      expect(sanitizeFileName('CON')).toBe('_CON');
      expect(sanitizeFileName('con.txt')).toBe('_con.txt');
      expect(sanitizeFileName('PRN.doc')).toBe('_PRN.doc');
      expect(sanitizeFileName('aux.log')).toBe('_aux.log');
      expect(sanitizeFileName('COM1')).toBe('_COM1');
      expect(sanitizeFileName('LPT1.txt')).toBe('_LPT1.txt');
    });

    test('should handle long file names', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const sanitized = sanitizeFileName(longName);
      
      expect(sanitized.length).toBeLessThanOrEqual(255);
      expect(sanitized.endsWith('.txt')).toBe(true);
    });

    test('should return default name for empty input', () => {
      expect(sanitizeFileName('')).toBe('unnamed');
      expect(sanitizeFileName('   ')).toBe('_'); // Spaces become underscores
      expect(sanitizeFileName('...')).toBe('unnamed'); // Only dots become empty
    });

    test('should preserve valid Unicode characters', () => {
      expect(sanitizeFileName('日本語ファイル.txt')).toBe('日本語ファイル.txt');
      expect(sanitizeFileName('файл.txt')).toBe('файл.txt');
      expect(sanitizeFileName('🎨image.png')).toBe('🎨image.png');
    });
  });

  describe('RESOURCE_LIMITS', () => {
    test('should have correct resource limits', () => {
      expect(RESOURCE_LIMITS.MAX_IMAGE_SIZE).toBe(50 * 1024 * 1024);
      expect(RESOURCE_LIMITS.MAX_IMAGES_PER_EPUB).toBe(10000);
      expect(RESOURCE_LIMITS.MAX_CONCURRENT_EPUBS).toBe(10);
      expect(RESOURCE_LIMITS.MAX_MEMORY_USAGE).toBe(1024 * 1024 * 1024);
      expect(RESOURCE_LIMITS.PROCESSING_TIMEOUT).toBe(30 * 60 * 1000);
    });
  });

  describe('checkResourceLimits', () => {
    test('should allow resources within limits', () => {
      const result = checkResourceLimits(
        100, // current images
        1024 * 1024, // 1MB image
        100 * 1024 * 1024 // 100MB memory
      );
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('should reject when image count exceeds limit', () => {
      const result = checkResourceLimits(
        10001, // exceeds limit
        1024 * 1024,
        100 * 1024 * 1024
      );
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('画像数が上限');
      expect(result.reason).toContain('10000');
    });

    test('should reject when image size exceeds limit', () => {
      const result = checkResourceLimits(
        100,
        60 * 1024 * 1024, // 60MB, exceeds 50MB limit
        100 * 1024 * 1024
      );
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('画像サイズが上限');
      expect(result.reason).toContain('50MB');
    });

    test('should reject when memory usage exceeds limit', () => {
      const result = checkResourceLimits(
        100,
        1024 * 1024,
        2 * 1024 * 1024 * 1024 // 2GB, exceeds 1GB limit
      );
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('メモリ使用量が上限');
    });

    test('should check limits in order', () => {
      // All limits exceeded, should return first violation
      const result = checkResourceLimits(
        20000, // exceeds image count
        100 * 1024 * 1024, // exceeds size
        2 * 1024 * 1024 * 1024 // exceeds memory
      );
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('画像数が上限'); // First check
    });
  });
});