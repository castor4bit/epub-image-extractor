import { parseEpub } from '../parser';
import { AppError } from '../../../shared/error-types';
import path from 'path';
import fs from 'fs';

describe('parseEpub - 手動解析実装', () => {
  const testEpubPath = path.join(__dirname, '../../../../tests/fixtures/test.epub');

  beforeAll(() => {
    // テスト用EPUBファイルが存在することを確認
    if (!fs.existsSync(testEpubPath)) {
      throw new Error(`テスト用EPUBファイルが見つかりません: ${testEpubPath}`);
    }
  });

  describe('EPUB解析', () => {
    test('EPUBファイルを正しく解析できること', async () => {
      const result = await parseEpub(testEpubPath);

      expect(result).toBeDefined();
      expect(result.manifest).toBeDefined();
      expect(result.spine).toBeDefined();
      expect(result.navigation).toBeDefined();
      expect(result.basePath).toBe(testEpubPath);
      expect(result.contentPath).toBeDefined();
      expect(result.parser).toBeDefined();
      // ZIPリーダーインスタンスが正しく返されるか確認
      expect(typeof result.parser.getEntries).toBe('function');
    });

    test('manifestが正しく抽出されること', async () => {
      const result = await parseEpub(testEpubPath);

      expect(Object.keys(result.manifest).length).toBeGreaterThan(0);

      // manifest項目の構造を確認
      const firstItem = Object.values(result.manifest)[0] as {
        id: string;
        href: string;
        'media-type': string;
      };
      expect(firstItem).toHaveProperty('id');
      expect(firstItem).toHaveProperty('href');
      expect(firstItem).toHaveProperty('media-type');
    });

    test('spineが正しく抽出されること', async () => {
      const result = await parseEpub(testEpubPath);

      expect(result.spine.length).toBeGreaterThan(0);

      // spine項目の構造を確認
      const firstSpineItem = result.spine[0];
      expect(firstSpineItem).toHaveProperty('idref');
      expect(firstSpineItem).toHaveProperty('linear');
    });

    test('画像アイテムが正しく識別されること', async () => {
      const result = await parseEpub(testEpubPath);

      const imageItems = Object.values(result.manifest).filter((item) =>
        item['media-type']?.startsWith('image/'),
      );

      expect(imageItems.length).toBeGreaterThan(0);
    });
  });

  describe('エラーハンドリング', () => {
    test('存在しないファイルの場合エラーをスローすること', async () => {
      const invalidPath = '/path/to/nonexistent.epub';

      await expect(parseEpub(invalidPath)).rejects.toThrow(AppError);
      try {
        await parseEpub(invalidPath);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.userMessage).toBe('EPUBファイルの解析に失敗しました');
        }
      }
    });

    test('不正なEPUBファイルの場合エラーをスローすること', async () => {
      // テスト用の不正なEPUBファイルを作成
      const invalidEpubPath = path.join(__dirname, 'invalid.epub');
      fs.writeFileSync(invalidEpubPath, 'This is not a valid EPUB file');

      try {
        await expect(parseEpub(invalidEpubPath)).rejects.toThrow(AppError);
      } finally {
        // クリーンアップ
        if (fs.existsSync(invalidEpubPath)) {
          fs.unlinkSync(invalidEpubPath);
        }
      }
    });
  });

  describe('ナビゲーション抽出', () => {
    test('NCXファイルから目次情報を抽出できること', async () => {
      const result = await parseEpub(testEpubPath);

      // テスト用EPUBに目次があれば確認
      if (result.navigation.length > 0) {
        const firstChapter = result.navigation[0];
        expect(firstChapter).toHaveProperty('order');
        expect(firstChapter).toHaveProperty('title');
        expect(firstChapter).toHaveProperty('href');
        expect(firstChapter.order).toBe(1);
      }
    });
  });
});
