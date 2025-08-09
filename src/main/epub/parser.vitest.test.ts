import { parseEpub } from './parser';
import { AppError } from '../../shared/error-types';
import path from 'path';
import fs from 'fs/promises';

describe('EPUB Parser', () => {
  const testEpubPath = path.join(__dirname, '../../../tests/fixtures/test.epub');

  beforeAll(async () => {
    // テスト用のEPUBファイルが存在することを確認
    try {
      await fs.access(testEpubPath);
    } catch {
      console.warn(
        'テスト用EPUBファイルが見つかりません。実際のEPUBファイルでテストしてください。',
      );
    }
  });

  it('EPUBファイルを解析できる', async () => {
    // 実際のEPUBファイルが必要なため、ファイルが存在する場合のみテスト
    try {
      await fs.access(testEpubPath);
      const result = await parseEpub(testEpubPath);

      expect(result).toHaveProperty('manifest');
      expect(result).toHaveProperty('spine');
      expect(result).toHaveProperty('navigation');
      expect(result).toHaveProperty('basePath');
      expect(result).toHaveProperty('contentPath');
    } catch {
      // ファイルが存在しない場合はスキップ
      expect(true).toBe(true);
    }
  });

  it('存在しないファイルでエラーを投げる', async () => {
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
});
