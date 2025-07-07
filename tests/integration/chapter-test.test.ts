import { processEpubFiles } from '../../src/main/epub/processor';
import path from 'path';
import fs from 'fs/promises';

describe('実際のEPUBファイルでのチャプター分割テスト', () => {
  const outputDir = path.join(__dirname, 'test-chapter-output');
  const testEpub = '/tmp/chapter_test.epub';
  
  beforeAll(async () => {
    // テスト用ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });
  });
  
  afterAll(async () => {
    // クリーンアップ
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});
  });
  
  test('チャプターごとに画像が正しく分類される', async () => {
    const onProgress = jest.fn();
    
    // EPUBを処理
    const results = await processEpubFiles([testEpub], outputDir, onProgress, 1);
    
    expect(results).toHaveLength(1);
    const result = results[0];
    
    expect(result.errors).toHaveLength(0);
    expect(result.chapters).toBeGreaterThan(0);
    
    // 出力ディレクトリの構造を確認
    const bookDir = result.outputPath;
    const chapters = await fs.readdir(bookDir);
    
    console.log('出力されたチャプター:');
    for (const chapter of chapters.sort()) {
      const chapterPath = path.join(bookDir, chapter);
      const stat = await fs.stat(chapterPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(chapterPath);
        console.log(`${chapter}: ${files.length}ファイル`);
        
        // 特定のチャプターの詳細を確認
        if (chapter.includes('巻頭特集')) {
          // 「巻頭特集」は p-003〜p-018 (16ページ) のはず
          console.log('  巻頭特集の画像数:', files.length);
          expect(files.length).toBeGreaterThanOrEqual(15); // 最低でも15ページ以上
        }
        
        if (chapter.includes('勇者は魔王が好きらしい')) {
          // 「勇者は魔王が好きらしい」は p-079〜p-100 (22ページ) のはず
          console.log('  勇者は魔王が好きらしいの画像数:', files.length);
          expect(files.length).toBeGreaterThanOrEqual(20); // 最低でも20ページ以上
        }
      }
    }
    
    // チャプター数が適切であることを確認（目次から40章あるはず）
    console.log('総チャプター数:', chapters.length);
    expect(chapters.length).toBeGreaterThanOrEqual(30); // 最低でも30章以上
  }, 30000); // タイムアウトを30秒に設定
});