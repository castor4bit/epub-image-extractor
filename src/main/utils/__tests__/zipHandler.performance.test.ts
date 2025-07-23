import path from 'path';
import fs from 'fs';
import { createZipReader } from '../zip-reader';

// パフォーマンステスト用のベンチマーク
describe('ZIP Performance Baseline (fflate)', () => {
  const testEpubPath = path.join(__dirname, '../../../../tests/fixtures/test.epub');
  let fileSize: number;
  
  beforeAll(() => {
    fileSize = fs.statSync(testEpubPath).size;
    console.log(`Test EPUB size: ${(fileSize / 1024).toFixed(2)} KB`);
  });

  it('should measure ZIP open and entry list performance', async () => {
    const iterations = 100;
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const reader = createZipReader();
      await reader.open(testEpubPath);
      const entries = reader.getEntries();
      expect(entries.length).toBeGreaterThan(0);
      reader.close();
    }
    
    const end = Date.now();
    const avgTime = (end - start) / iterations;
    
    console.log(`Average time to open ZIP and get entries: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(10); // 10ms以下を期待
  });

  it('should measure container.xml reading performance', async () => {
    const iterations = 100;
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const reader = createZipReader();
      await reader.open(testEpubPath);
      const containerEntry = reader.getEntry('META-INF/container.xml');
      if (containerEntry) {
        const content = reader.readAsText(containerEntry);
        expect(content).toBeTruthy();
      }
      reader.close();
    }
    
    const end = Date.now();
    const avgTime = (end - start) / iterations;
    
    console.log(`Average time to read container.xml: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(10);
  });

  it('should measure full EPUB processing performance', async () => {
    const iterations = 10;
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const reader = createZipReader();
      await reader.open(testEpubPath);
      const entries = reader.getEntries();
      
      // コンテナを読む
      const containerEntry = reader.getEntry('META-INF/container.xml');
      if (containerEntry) {
        reader.readAsText(containerEntry);
      }
      
      // すべての画像を検索
      const imageEntries = entries.filter(entry => 
        !entry.isDirectory && entry.name.match(/\.(jpg|jpeg|png|webp)$/i)
      );
      
      // 画像データにアクセス（実際には読まない）
      imageEntries.forEach(entry => {
        expect(entry.size).toBeGreaterThan(0);
      });
      
      reader.close();
    }
    
    const end = Date.now();
    const avgTime = (end - start) / iterations;
    
    console.log(`Average time for full EPUB processing: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(50); // 50ms以下を期待
  });

  it('should measure memory usage patterns', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const readers: Array<ReturnType<typeof createZipReader>> = [];
    
    // 10個のZIPを同時に開く
    for (let i = 0; i < 10; i++) {
      const reader = createZipReader();
      await reader.open(testEpubPath);
      const entries = reader.getEntries();
      readers.push(reader);
    }
    
    const afterLoadMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (afterLoadMemory - initialMemory) / 1024 / 1024;
    
    console.log(`Memory increase for 10 ZIPs: ${memoryIncrease.toFixed(2)} MB`);
    console.log(`Average memory per ZIP: ${(memoryIncrease / 10).toFixed(2)} MB`);
    
    // クリーンアップ
    readers.forEach(reader => reader.close());
    
    // メモリが異常に増加していないことを確認
    expect(memoryIncrease).toBeLessThan(50); // 50MB以下を期待
  });
});