import { generateUniqueOutputPath, generateOutputPath } from '../outputPath';
import path from 'path';
import fs from 'fs/promises';
describe('outputPath', () => {
  const testDir = path.join(__dirname, 'test-output');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true }).catch(() => {});
  });

  describe('generateUniqueOutputPath', () => {
    test('ディレクトリが存在しない場合はそのまま返す', async () => {
      const result = await generateUniqueOutputPath(testDir, 'new-book');
      expect(result).toBe(path.join(testDir, 'new-book'));
    });

    test('ディレクトリが存在する場合は連番を付ける', async () => {
      // 既存のディレクトリを作成
      await fs.mkdir(path.join(testDir, 'existing-book'), { recursive: true });

      const result = await generateUniqueOutputPath(testDir, 'existing-book');
      expect(result).toBe(path.join(testDir, 'existing-book_1'));
    });

    test('複数の重複がある場合は適切な番号を付ける', async () => {
      // 複数の既存ディレクトリを作成
      await fs.mkdir(path.join(testDir, 'book'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'book_1'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'book_2'), { recursive: true });

      const result = await generateUniqueOutputPath(testDir, 'book');
      expect(result).toBe(path.join(testDir, 'book_3'));
    });

    test('ファイル名に使用できない文字を置換する', async () => {
      const result = await generateUniqueOutputPath(testDir, 'book<>:"/\\|?*name');
      expect(result).toBe(path.join(testDir, 'book_________name'));
    });
  });

  describe('generateOutputPath', () => {
    test('新規ディレクトリの場合', async () => {
      const result = await generateOutputPath(testDir, 'new-book');
      expect(result.path).toBe(path.join(testDir, 'new-book'));
      expect(result.isNew).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    test('既存ディレクトリがある場合（デフォルト動作）', async () => {
      await fs.mkdir(path.join(testDir, 'existing-book'), { recursive: true });

      const result = await generateOutputPath(testDir, 'existing-book');
      expect(result.path).toBe(path.join(testDir, 'existing-book_1'));
      expect(result.isNew).toBe(true);
      expect(result.warning).toContain('新しいディレクトリ');
    });

    test('上書きモードの場合', async () => {
      await fs.mkdir(path.join(testDir, 'existing-book'), { recursive: true });

      const result = await generateOutputPath(testDir, 'existing-book', {
        overwrite: true,
      });
      expect(result.path).toBe(path.join(testDir, 'existing-book'));
      expect(result.isNew).toBe(false);
      expect(result.warning).toContain('上書き');
    });

    test('タイムスタンプを追加する場合', async () => {
      const result = await generateOutputPath(testDir, 'book', {
        appendTimestamp: true,
      });

      expect(result.path).toMatch(/book_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
      expect(result.isNew).toBe(true);
    });

    test('確認コールバックで上書きを選択した場合', async () => {
      await fs.mkdir(path.join(testDir, 'existing-book'), { recursive: true });

      const askConfirmation = vi.fn().mockResolvedValue(true);
      const result = await generateOutputPath(testDir, 'existing-book', {
        askConfirmation,
      });

      expect(askConfirmation).toHaveBeenCalled();
      expect(result.path).toBe(path.join(testDir, 'existing-book'));
      expect(result.isNew).toBe(false);
      expect(result.warning).toContain('上書き');
    });

    test('確認コールバックで上書きを拒否した場合', async () => {
      await fs.mkdir(path.join(testDir, 'existing-book'), { recursive: true });

      const askConfirmation = vi.fn().mockResolvedValue(false);
      const result = await generateOutputPath(testDir, 'existing-book', {
        askConfirmation,
      });

      expect(askConfirmation).toHaveBeenCalled();
      expect(result.path).toBe(path.join(testDir, 'existing-book_1'));
      expect(result.isNew).toBe(true);
    });
  });
});
