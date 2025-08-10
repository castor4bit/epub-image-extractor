// settingsStoreモック
vi.mock('../../src/main/store/settings', () => ({
  settingsStore: {
    get: vi.fn(() => ({
      outputDirectory: '/mock/output',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: false,  // テスト用にfalseに設定
      includePageSpread: false,  // テスト用にfalseに設定
    })),
    set: vi.fn(),
    getOutputDirectory: vi.fn(() => '/mock/output'),
    setOutputDirectory: vi.fn(),
    resetToDefaults: vi.fn(),
  },
}));

import { processEpubFiles } from '../../src/main/epub/processor';
import { createTestEpubWithChapters, createLargeTestEpub } from '../helpers/epub-generator';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

describe('EPUBファイルのチャプター分割テスト', () => {
  let tempDir: string;
  let outputDir: string;
  
  beforeEach(async () => {
    // テスト用の一時ディレクトリを作成
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'epub-test-'));
    outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });
  });
  
  afterEach(async () => {
    // クリーンアップ
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  });
  
  test('チャプターごとに画像が正しく分類される', async () => {
    // テスト用EPUBを生成
    const epubBuffer = createTestEpubWithChapters();
    const testEpubPath = path.join(tempDir, 'test-chapters.epub');
    await fs.writeFile(testEpubPath, epubBuffer);
    
    const onProgress = vi.fn();
    
    // EPUBを処理
    const results = await processEpubFiles([testEpubPath], outputDir, onProgress, 1);
    
    expect(results).toHaveLength(1);
    const result = results[0];
    
    // エラーがある場合は詳細を表示
    if (result.errors.length > 0) {
      console.error('処理エラー:', result.errors);
    }
    
    expect(result.errors).toHaveLength(0);
    expect(result.chapters).toBeGreaterThan(0);
    
    // 出力ディレクトリの構造を確認
    const bookDir = result.outputPath;
    const chapters = await fs.readdir(bookDir);
    
    // チャプターが正しく作成されていることを確認
    expect(chapters).toContain('001_表紙');
    expect(chapters).toContain('002_目次');
    expect(chapters).toContain('003_第1章_はじめに');
    expect(chapters).toContain('004_第2章_基本機能');
    expect(chapters).toContain('005_第3章_応用編');
    
    // 各チャプターの画像数を確認
    for (const chapter of chapters) {
      const chapterPath = path.join(bookDir, chapter);
      const stat = await fs.stat(chapterPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(chapterPath);
        
        // チャプターごとの期待される画像数を確認
        if (chapter === '001_表紙') {
          expect(files.length).toBe(2);
        } else if (chapter === '002_目次') {
          expect(files.length).toBe(1);
        } else if (chapter === '003_第1章_はじめに') {
          expect(files.length).toBe(5);
        } else if (chapter === '004_第2章_基本機能') {
          expect(files.length).toBe(8);
        } else if (chapter === '005_第3章_応用編') {
          expect(files.length).toBe(12);
        }
        
        // すべてのファイルが画像ファイルであることを確認
        files.forEach(file => {
          expect(file).toMatch(/^\d{4}\.(png|jpg|jpeg)$/);
        });
      }
    }
  });
  
  test('多数のチャプターを持つEPUBを処理できる', async () => {
    // 30章以上のテスト用EPUBを生成
    const epubBuffer = createLargeTestEpub();
    const testEpubPath = path.join(tempDir, 'test-large.epub');
    await fs.writeFile(testEpubPath, epubBuffer);
    
    const onProgress = vi.fn();
    
    // EPUBを処理
    const results = await processEpubFiles([testEpubPath], outputDir, onProgress, 1);
    
    expect(results).toHaveLength(1);
    const result = results[0];
    
    expect(result.errors).toHaveLength(0);
    expect(result.chapters).toBeGreaterThanOrEqual(30);
    
    // 出力ディレクトリの構造を確認
    const bookDir = result.outputPath;
    const chapters = await fs.readdir(bookDir);
    
    // チャプター数が30以上あることを確認
    expect(chapters.length).toBeGreaterThanOrEqual(32); // 30章 + 表紙、目次、あとがき、奥付
    
    // 各チャプターにファイルが含まれていることを確認
    let totalImages = 0;
    for (const chapter of chapters) {
      const chapterPath = path.join(bookDir, chapter);
      const stat = await fs.stat(chapterPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(chapterPath);
        expect(files.length).toBeGreaterThan(0);
        totalImages += files.length;
      }
    }
    
    // 総画像数が適切であることを確認
    expect(totalImages).toBeGreaterThan(100); // 最低でも100枚以上の画像
    expect(result.totalImages).toBe(totalImages);
  }, 30000); // タイムアウトを30秒に設定
  
  test('チャプター名に特殊文字が含まれる場合も正しく処理される', async () => {
    // 特殊文字を含むチャプター名のEPUBを生成
    const { EpubGenerator } = await import('../helpers/epub-generator');
    const generator = new EpubGenerator();
    
    generator.addChapter('special1', 'チャプター/スラッシュ', 2);
    generator.addChapter('special2', 'チャプター:コロン', 2);
    generator.addChapter('special3', 'チャプター?疑問符', 2);
    generator.addChapter('special4', 'チャプター<大なり>小なり', 2);
    
    const epubBuffer = generator.generate();
    const testEpubPath = path.join(tempDir, 'test-special.epub');
    await fs.writeFile(testEpubPath, epubBuffer);
    
    const onProgress = vi.fn();
    
    // EPUBを処理
    const results = await processEpubFiles([testEpubPath], outputDir, onProgress, 1);
    
    expect(results).toHaveLength(1);
    const result = results[0];
    
    expect(result.errors).toHaveLength(0);
    
    // 出力ディレクトリの構造を確認
    const bookDir = result.outputPath;
    const chapters = await fs.readdir(bookDir);
    
    // 特殊文字が適切にサニタイズされていることを確認
    chapters.forEach(chapter => {
      expect(chapter).not.toMatch(/[<>:"/\\|?*]/); // Windowsで使用できない文字が含まれていない
    });
  });
});