import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { zipSync, strToU8 } from 'fflate';
import { extractEpubsFromZip, validateZipContents, isZipFile } from '../zipHandler';

// Electronのappモックを設定
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => {
      if (name === 'temp') {
        return '/tmp';
      }
      return '/mock/path';
    }),
  },
}));

describe('zipHandler', () => {
  const testDir = '/tmp/zip-handler-test';
  let mockZipPath: string;
  let mockZipWithoutEpubPath: string;

  beforeEach(async () => {
    // テスト用ディレクトリを作成
    await fs.mkdir(testDir, { recursive: true });

    // EPUBファイルを含むZIPファイルを作成
    mockZipPath = path.join(testDir, 'test-with-epub.zip');
    const filesWithEpub = {
      'test-book.epub': strToU8('mock epub content'),
      'image.jpg': strToU8('mock image'),
    };
    const zipWithEpub = zipSync(filesWithEpub);
    await fs.writeFile(mockZipPath, Buffer.from(zipWithEpub));

    // EPUBファイルを含まないZIPファイルを作成
    mockZipWithoutEpubPath = path.join(testDir, 'test-without-epub.zip');
    const filesWithoutEpub = {
      'image1.jpg': strToU8('mock image 1'),
      'image2.png': strToU8('mock image 2'),
      'document.pdf': strToU8('mock pdf'),
    };
    const zipWithoutEpub = zipSync(filesWithoutEpub);
    await fs.writeFile(mockZipWithoutEpubPath, Buffer.from(zipWithoutEpub));
  });

  afterEach(async () => {
    // テスト用ディレクトリを削除
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // ディレクトリ削除エラーは無視
    }
  });

  describe('isZipFile', () => {
    it('should return true for .zip files', () => {
      expect(isZipFile('test.zip')).toBe(true);
      expect(isZipFile('TEST.ZIP')).toBe(true);
      expect(isZipFile('/path/to/file.zip')).toBe(true);
    });

    it('should return false for non-zip files', () => {
      expect(isZipFile('test.epub')).toBe(false);
      expect(isZipFile('test.txt')).toBe(false);
      expect(isZipFile('test')).toBe(false);
    });
  });

  describe('validateZipContents', () => {
    it('should return valid=true for ZIP containing EPUB files', async () => {
      const result = await validateZipContents(mockZipPath);
      expect(result.valid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return valid=false for ZIP without EPUB files', async () => {
      const result = await validateZipContents(mockZipWithoutEpubPath);
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toBe(
        'ZIPファイル内にEPUBファイルが見つかりませんでした。EPUBファイルを含むZIPファイルを選択してください',
      );
    });

    it('should return valid=false for invalid ZIP file', async () => {
      const result = await validateZipContents('/nonexistent/file.zip');
      expect(result.valid).toBe(false);
      expect(result.errorMessage).toBe('ZIPファイルの展開に失敗しました');
    });
  });

  describe('extractEpubsFromZip', () => {
    it('should extract EPUB files successfully', async () => {
      const extractedPaths = await extractEpubsFromZip(mockZipPath);

      expect(extractedPaths).toHaveLength(1);
      expect(extractedPaths[0]).toContain('test-book.epub');

      // 実際にファイルが作成されていることを確認
      const stats = await fs.stat(extractedPaths[0]);
      expect(stats.isFile()).toBe(true);
    });

    it('should throw error when ZIP contains no EPUB files', async () => {
      await expect(extractEpubsFromZip(mockZipWithoutEpubPath)).rejects.toThrow(
        'ZIPファイル内にEPUBファイルが見つかりませんでした。EPUBファイルを含むZIPファイルを選択してください',
      );
    });

    it('should throw error for invalid ZIP file', async () => {
      await expect(extractEpubsFromZip('/nonexistent/file.zip')).rejects.toThrow(
        'ZIPファイルの展開に失敗しました',
      );
    });
  });
});
