import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { zipSync, strToU8 } from 'fflate';
import os from 'os';

// Electronのモック
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((type: string) => {
      if (type === 'temp') return os.tmpdir();
      if (type === 'desktop') return path.join(os.homedir(), 'Desktop');
      return '/mock/path';
    }),
    getName: vi.fn(() => 'epub-image-extractor'),
  }
}));

import { parseEpub } from '../../src/main/epub/parser';
import { extractImages } from '../../src/main/epub/imageExtractor';
import { organizeByChapters } from '../../src/main/epub/chapterOrganizer';
import { processEpubFiles } from '../../src/main/epub/processor';
import { extractEpubsFromZip } from '../../src/main/utils/zipHandler';
import type { ProcessingProgress } from '../../src/shared/types';

// テスト用の一時ディレクトリ
const TEST_OUTPUT_DIR = path.join(__dirname, '../temp/output');
const TEST_FILES_DIR = path.join(__dirname, '../fixtures');

describe('EPUB処理統合テスト', () => {
  beforeAll(async () => {
    // テスト用ディレクトリを作成
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
    await fs.mkdir(TEST_FILES_DIR, { recursive: true });
    
    // テストEPUBがなければ作成
    const testEpubPath = path.join(TEST_FILES_DIR, 'test.epub');
    if (!await fileExists(testEpubPath)) {
      await createTestEpub(testEpubPath);
    }
    
    // テストZIPファイル作成
    const testZipPath = path.join(TEST_FILES_DIR, 'test-epubs.zip');
    if (!await fileExists(testZipPath)) {
      await createTestZipWithEpub(testZipPath);
    }
  });

  afterAll(async () => {
    // テスト用ディレクトリをクリーンアップ
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch (error) {
      console.warn('クリーンアップエラー:', error);
    }
  });

  describe('EPUB解析', () => {
    test('EPUBファイルを正しく解析できる', async () => {
      const epubPath = path.join(TEST_FILES_DIR, 'test.epub');
      const epubData = await parseEpub(epubPath);
      
      expect(epubData).toBeDefined();
      expect(epubData.manifest).toBeDefined();
      expect(epubData.spine).toBeInstanceOf(Array);
      expect(epubData.navigation).toBeInstanceOf(Array);
      expect(epubData.spine.length).toBeGreaterThan(0);
    });

    test('ナビゲーション情報を抽出できる', async () => {
      const epubPath = path.join(TEST_FILES_DIR, 'test.epub');
      const epubData = await parseEpub(epubPath);
      
      expect(epubData.navigation.length).toBeGreaterThan(0);
      expect(epubData.navigation[0]).toHaveProperty('order');
      expect(epubData.navigation[0]).toHaveProperty('title');
      expect(epubData.navigation[0]).toHaveProperty('href');
    });
  });

  describe('画像抽出', () => {
    test('EPUBから画像を抽出できる', async () => {
      const epubPath = path.join(TEST_FILES_DIR, 'test.epub');
      const epubData = await parseEpub(epubPath);
      const images = await extractImages(epubData);
      
      expect(images).toBeInstanceOf(Array);
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveProperty('src');
      expect(images[0]).toHaveProperty('chapterOrder');
      expect(images[0]).toHaveProperty('pageOrder');
    });

    test('進捗コールバックが呼ばれる', async () => {
      const epubPath = path.join(TEST_FILES_DIR, 'test.epub');
      const epubData = await parseEpub(epubPath);
      
      let progressCalled = false;
      const onProgress = (processed: number, total: number) => {
        progressCalled = true;
        expect(processed).toBeGreaterThanOrEqual(0);
        expect(total).toBeGreaterThan(0);
        expect(processed).toBeLessThanOrEqual(total);
      };
      
      await extractImages(epubData, onProgress);
      expect(progressCalled).toBe(true);
    });
  });

  describe('章別整理', () => {
    test('画像を章別に整理できる', async () => {
      const epubPath = path.join(TEST_FILES_DIR, 'test.epub');
      const epubData = await parseEpub(epubPath);
      const images = await extractImages(epubData);
      
      const outputDir = path.join(TEST_OUTPUT_DIR, 'chapter-test');
      await fs.mkdir(outputDir, { recursive: true });
      
      const chapterCount = await organizeByChapters(
        images,
        epubData.navigation,
        outputDir,
        epubData.basePath
      );
      
      expect(chapterCount).toBeGreaterThan(0);
      
      // ディレクトリが作成されているか確認
      const dirs = await fs.readdir(outputDir);
      expect(dirs.length).toBeGreaterThan(0);
      expect(dirs[0]).toMatch(/^\d{3}_/); // 3桁の番号で始まる
    });

    test('ナビゲーションがない場合は未分類フォルダに整理', async () => {
      const epubPath = path.join(TEST_FILES_DIR, 'test.epub');
      const epubData = await parseEpub(epubPath);
      const images = await extractImages(epubData);
      
      const outputDir = path.join(TEST_OUTPUT_DIR, 'no-nav-test');
      await fs.mkdir(outputDir, { recursive: true });
      
      // ナビゲーションを空にして実行
      await organizeByChapters(images, [], outputDir, epubData.basePath);
      
      const dirs = await fs.readdir(outputDir);
      expect(dirs).toContain('001_未分類');
    });
  });

  describe('ZIP処理', () => {
    test('ZIPファイルからEPUBを抽出できる', async () => {
      const zipPath = path.join(TEST_FILES_DIR, 'test-epubs.zip');
      const extractedPaths = await extractEpubsFromZip(zipPath);
      
      expect(extractedPaths).toBeInstanceOf(Array);
      expect(extractedPaths.length).toBeGreaterThan(0);
      expect(extractedPaths[0]).toMatch(/\.epub$/i);
      
      // 抽出されたファイルが存在するか確認
      for (const path of extractedPaths) {
        expect(await fileExists(path)).toBe(true);
      }
    });
  });

  describe('完全な処理フロー', () => {
    test('複数のEPUBファイルを並列処理できる', async () => {
      const epubPath = path.join(TEST_FILES_DIR, 'test.epub');
      const outputDir = path.join(TEST_OUTPUT_DIR, 'parallel-test');
      
      const progressUpdates: ProcessingProgress[] = [];
      const onProgress = (progress: ProcessingProgress) => {
        progressUpdates.push(progress);
      };
      
      const results = await processEpubFiles(
        [epubPath, epubPath], // 同じファイルを2回処理
        outputDir,
        onProgress,
        2 // 並列数2
      );
      
      expect(results).toHaveLength(2);
      expect(results[0].totalImages).toBeGreaterThan(0);
      expect(results[0].errors).toHaveLength(0);
      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    test('エラーが発生しても他のファイル処理を継続', async () => {
      const validPath = path.join(TEST_FILES_DIR, 'test.epub');
      const invalidPath = path.join(TEST_FILES_DIR, 'invalid.epub');
      const outputDir = path.join(TEST_OUTPUT_DIR, 'error-test');
      
      const results = await processEpubFiles(
        [validPath, invalidPath],
        outputDir,
        () => {}
      );
      
      expect(results).toHaveLength(2);
      // 少なくとも1つは成功するはず
      const successCount = results.filter(r => r.errors.length === 0).length;
      expect(successCount).toBeGreaterThanOrEqual(1);
    });
  });
});

// ヘルパー関数
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createTestEpub(outputPath: string): Promise<void> {
  const files: Record<string, Uint8Array | [Uint8Array, any]> = {};
  
  // mimetype
  files['mimetype'] = [strToU8('application/epub+zip'), { level: 0 }];
  
  // META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  files['META-INF/container.xml'] = strToU8(containerXml);
  
  // OEBPS/content.opf
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>テストEPUB</dc:title>
    <dc:language>ja</dc:language>
    <dc:identifier id="BookId">test-001</dc:identifier>
    <meta property="dcterms:modified">2024-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="images/test.png" media-type="image/png"/>
  </manifest>
  <spine>
    <itemref idref="ch1"/>
  </spine>
</package>`;
  files['OEBPS/content.opf'] = strToU8(contentOpf);
  
  // ナビゲーション
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>目次</title></head>
<body>
  <nav epub:type="toc">
    <ol>
      <li><a href="ch1.xhtml">第1章</a></li>
    </ol>
  </nav>
</body>
</html>`;
  files['OEBPS/nav.xhtml'] = strToU8(navXhtml);
  
  // コンテンツ
  const ch1Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>第1章</title></head>
<body>
  <h1>第1章</h1>
  <img src="images/test.png" alt="テスト画像"/>
</body>
</html>`;
  files['OEBPS/ch1.xhtml'] = strToU8(ch1Xhtml);
  
  // テスト画像（1x1 PNG）
  const pngData = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
    0x00, 0x16, 0x00, 0x01, 0x73, 0x75, 0x25, 0xE8,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  files['OEBPS/images/test.png'] = pngData;
  
  // ZIPファイルを作成
  const zipped = zipSync(files, { mtime: new Date('2024-01-01') });
  await fs.writeFile(outputPath, zipped);
}

async function createTestZipWithEpub(outputPath: string): Promise<void> {
  // まずEPUBを作成
  const tempEpubPath = path.join(path.dirname(outputPath), 'temp-test.epub');
  await createTestEpub(tempEpubPath);
  
  // EPUBファイルを読み込んでZIPに追加
  const epubData = await fs.readFile(tempEpubPath);
  const files: Record<string, Uint8Array> = {
    'test-in-zip.epub': new Uint8Array(epubData)
  };
  
  const zipped = zipSync(files, { mtime: new Date('2024-01-01') });
  await fs.writeFile(outputPath, zipped);
  
  // 一時ファイルを削除
  await fs.unlink(tempEpubPath);
}