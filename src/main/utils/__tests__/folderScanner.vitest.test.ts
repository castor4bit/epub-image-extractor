import { scanFolderForEpubs, scanMultipleFoldersForEpubs } from '../folderScanner';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('folderScanner', () => {
  let tempDir: string;

  beforeEach(async () => {
    // 一時ディレクトリを作成
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'epub-scanner-test-'));
  });

  afterEach(async () => {
    // 一時ディレクトリを削除
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('scanFolderForEpubs', () => {
    it('EPUBファイルを検索できる', async () => {
      // テスト用のファイル構造を作成
      await fs.writeFile(path.join(tempDir, 'book1.epub'), 'dummy');
      await fs.writeFile(path.join(tempDir, 'book2.epub'), 'dummy');
      await fs.writeFile(path.join(tempDir, 'document.pdf'), 'dummy');

      const epubFiles = await scanFolderForEpubs(tempDir);

      expect(epubFiles).toHaveLength(2);
      expect(epubFiles).toContain(path.join(tempDir, 'book1.epub'));
      expect(epubFiles).toContain(path.join(tempDir, 'book2.epub'));
    });

    it('ZIPファイルも検索できる', async () => {
      await fs.writeFile(path.join(tempDir, 'book.epub'), 'dummy');
      await fs.writeFile(path.join(tempDir, 'archive.zip'), 'dummy');

      const epubFiles = await scanFolderForEpubs(tempDir);

      expect(epubFiles).toHaveLength(2);
      expect(epubFiles).toContain(path.join(tempDir, 'book.epub'));
      expect(epubFiles).toContain(path.join(tempDir, 'archive.zip'));
    });

    it('サブフォルダを再帰的に検索できる', async () => {
      // サブフォルダ構造を作成
      const subDir = path.join(tempDir, 'subfolder');
      const subSubDir = path.join(subDir, 'nested');
      await fs.mkdir(subDir, { recursive: true });
      await fs.mkdir(subSubDir, { recursive: true });

      await fs.writeFile(path.join(tempDir, 'root.epub'), 'dummy');
      await fs.writeFile(path.join(subDir, 'sub.epub'), 'dummy');
      await fs.writeFile(path.join(subSubDir, 'nested.epub'), 'dummy');

      const epubFiles = await scanFolderForEpubs(tempDir);

      expect(epubFiles).toHaveLength(3);
      expect(epubFiles).toContain(path.join(tempDir, 'root.epub'));
      expect(epubFiles).toContain(path.join(subDir, 'sub.epub'));
      expect(epubFiles).toContain(path.join(subSubDir, 'nested.epub'));
    });

    it('最大深度を制限できる', async () => {
      // 深いフォルダ構造を作成
      const level1 = path.join(tempDir, 'level1');
      const level2 = path.join(level1, 'level2');
      const level3 = path.join(level2, 'level3');
      const level4 = path.join(level3, 'level4');

      await fs.mkdir(level4, { recursive: true });

      await fs.writeFile(path.join(tempDir, 'level0.epub'), 'dummy');
      await fs.writeFile(path.join(level1, 'level1.epub'), 'dummy');
      await fs.writeFile(path.join(level2, 'level2.epub'), 'dummy');
      await fs.writeFile(path.join(level3, 'level3.epub'), 'dummy');
      await fs.writeFile(path.join(level4, 'level4.epub'), 'dummy');

      // 深度2まで検索
      const epubFiles = await scanFolderForEpubs(tempDir, 2);

      expect(epubFiles).toHaveLength(3);
      expect(epubFiles).toContain(path.join(tempDir, 'level0.epub'));
      expect(epubFiles).toContain(path.join(level1, 'level1.epub'));
      expect(epubFiles).toContain(path.join(level2, 'level2.epub'));
      expect(epubFiles).not.toContain(path.join(level3, 'level3.epub'));
      expect(epubFiles).not.toContain(path.join(level4, 'level4.epub'));
    });

    it('隠しフォルダをスキップする', async () => {
      const hiddenDir = path.join(tempDir, '.hidden');
      await fs.mkdir(hiddenDir);

      await fs.writeFile(path.join(tempDir, 'visible.epub'), 'dummy');
      await fs.writeFile(path.join(hiddenDir, 'hidden.epub'), 'dummy');

      const epubFiles = await scanFolderForEpubs(tempDir);

      expect(epubFiles).toHaveLength(1);
      expect(epubFiles).toContain(path.join(tempDir, 'visible.epub'));
      expect(epubFiles).not.toContain(path.join(hiddenDir, 'hidden.epub'));
    });

    it('node_modulesフォルダをスキップする', async () => {
      const nodeModulesDir = path.join(tempDir, 'node_modules');
      await fs.mkdir(nodeModulesDir);

      await fs.writeFile(path.join(tempDir, 'app.epub'), 'dummy');
      await fs.writeFile(path.join(nodeModulesDir, 'package.epub'), 'dummy');

      const epubFiles = await scanFolderForEpubs(tempDir);

      expect(epubFiles).toHaveLength(1);
      expect(epubFiles).toContain(path.join(tempDir, 'app.epub'));
      expect(epubFiles).not.toContain(path.join(nodeModulesDir, 'package.epub'));
    });

    it('存在しないフォルダでエラーにならない', async () => {
      const nonExistentPath = path.join(tempDir, 'non-existent');

      const epubFiles = await scanFolderForEpubs(nonExistentPath);

      expect(epubFiles).toHaveLength(0);
    });
  });

  describe('scanMultipleFoldersForEpubs', () => {
    it('複数のフォルダをスキャンできる', async () => {
      // 2つのフォルダを作成
      const folder1 = path.join(tempDir, 'folder1');
      const folder2 = path.join(tempDir, 'folder2');
      await fs.mkdir(folder1);
      await fs.mkdir(folder2);

      await fs.writeFile(path.join(folder1, 'book1.epub'), 'dummy');
      await fs.writeFile(path.join(folder2, 'book2.epub'), 'dummy');

      const epubFiles = await scanMultipleFoldersForEpubs([folder1, folder2]);

      expect(epubFiles).toHaveLength(2);
      expect(epubFiles).toContain(path.join(folder1, 'book1.epub'));
      expect(epubFiles).toContain(path.join(folder2, 'book2.epub'));
    });

    it('重複するファイルパスを除去する', async () => {
      await fs.writeFile(path.join(tempDir, 'book.epub'), 'dummy');

      // 同じフォルダを2回指定
      const epubFiles = await scanMultipleFoldersForEpubs([tempDir, tempDir]);

      expect(epubFiles).toHaveLength(1);
      expect(epubFiles).toContain(path.join(tempDir, 'book.epub'));
    });
  });
});
