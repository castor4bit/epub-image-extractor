import * as path from 'path';
import * as fs from 'fs';
import { validateZipContents } from '../zipHandler';
import { createLargeTestEpub, saveLargeTestEpub } from '../../../../tests/helpers/create-large-epub';
import { createZipReader } from '../zip-reader';

describe('zipHandler with large files', () => {
  const largeEpubPath = path.join(__dirname, 'large-test.epub');
  const veryLargeEpubPath = path.join(__dirname, 'very-large-test.epub');
  
  beforeAll(() => {
    // 50MB程度のEPUBファイルを作成（50章、各章20画像、各画像50KB）
    saveLargeTestEpub(largeEpubPath, 50, 20, 50 * 1024);
    
    // 100MB以上のEPUBファイルを作成（100章、各章20画像、各画像50KB）
    saveLargeTestEpub(veryLargeEpubPath, 100, 20, 50 * 1024);
  });
  
  afterAll(() => {
    // テストファイルをクリーンアップ
    try {
      fs.unlinkSync(largeEpubPath);
      fs.unlinkSync(veryLargeEpubPath);
    } catch (error) {
      // エラーは無視
    }
  });
  
  it('should handle 50MB EPUB file efficiently', async () => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    // 大きなEPUBファイルを直接読み込み
    const reader = createZipReader();
    await reader.open(largeEpubPath);
    
    const entries = reader.getEntries();
    const imageEntries = entries.filter(entry => 
      !entry.isDirectory && entry.name.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    
    reader.close();
    
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    
    const processingTime = endTime - startTime;
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024;
    
    console.log(`50MB EPUB processing time: ${processingTime}ms`);
    console.log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`);
    console.log(`Total entries: ${entries.length}`);
    console.log(`Image entries: ${imageEntries.length}`);
    
    expect(entries.length).toBeGreaterThan(0);
    expect(imageEntries.length).toBe(1000); // 50章 × 20画像
    expect(processingTime).toBeLessThan(5000); // 5秒以内
    expect(memoryIncrease).toBeLessThan(200); // メモリ増加が200MB以内
  });
  
  it('should handle 100MB+ EPUB file', async () => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    // 大きなEPUBファイルを直接読み込み
    const reader = createZipReader();
    await reader.open(veryLargeEpubPath);
    
    const entries = reader.getEntries();
    const imageEntries = entries.filter(entry => 
      !entry.isDirectory && entry.name.match(/\.(jpg|jpeg|png|webp)$/i)
    );
    
    reader.close();
    
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    
    const processingTime = endTime - startTime;
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024;
    
    console.log(`100MB+ EPUB processing time: ${processingTime}ms`);
    console.log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`);
    console.log(`Total entries: ${entries.length}`);
    console.log(`Image entries: ${imageEntries.length}`);
    
    expect(entries.length).toBeGreaterThan(0);
    expect(imageEntries.length).toBe(2000); // 100章 × 20画像
    expect(processingTime).toBeLessThan(10000); // 10秒以内
    expect(memoryIncrease).toBeLessThan(400); // メモリ増加が400MB以内
  });
  
  it('should open and close large files without memory leaks', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // 同じファイルを10回開いて閉じる
    for (let i = 0; i < 10; i++) {
      const reader = createZipReader();
      await reader.open(largeEpubPath);
      
      // いくつかのエントリを読む
      const entries = reader.getEntries();
      expect(entries.length).toBeGreaterThan(0);
      
      const containerEntry = reader.getEntry('META-INF/container.xml');
      if (containerEntry) {
        const content = reader.readAsText(containerEntry);
        expect(content).toBeTruthy();
      }
      
      reader.close();
    }
    
    // ガベージコレクションを促す
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryLeak = (finalMemory - initialMemory) / 1024 / 1024;
    
    console.log(`Memory leak after 10 iterations: ${memoryLeak.toFixed(2)} MB`);
    
    // メモリリークが50MB以内であることを確認
    expect(memoryLeak).toBeLessThan(50);
  });
  
  it('should handle concurrent access to large files', async () => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    // 5つの並列処理を実行
    const promises = Array.from({ length: 5 }, async (_, index) => {
      const reader = createZipReader();
      await reader.open(largeEpubPath);
      
      const entries = reader.getEntries();
      const imageEntries = entries.filter(entry => 
        !entry.isDirectory && entry.name.match(/\.(jpg|jpeg|png|webp)$/i)
      );
      
      // ランダムに10個の画像を読む
      const randomImages = imageEntries
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
      
      for (const entry of randomImages) {
        const buffer = reader.readAsBuffer(entry);
        expect(buffer.length).toBeGreaterThan(0);
      }
      
      reader.close();
      return index;
    });
    
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    
    const processingTime = endTime - startTime;
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024;
    
    console.log(`Concurrent processing time: ${processingTime}ms`);
    console.log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`);
    
    expect(results).toHaveLength(5);
    expect(processingTime).toBeLessThan(10000); // 10秒以内
    expect(memoryIncrease).toBeLessThan(500); // メモリ増加が500MB以内
  });
});