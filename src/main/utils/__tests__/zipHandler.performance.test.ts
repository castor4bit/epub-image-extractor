import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

// パフォーマンステスト用のベンチマーク
describe('ZIP Performance Baseline (adm-zip)', () => {
  const testEpubPath = path.join(__dirname, '../../../../tests/fixtures/test.epub');
  let fileSize: number;
  
  beforeAll(() => {
    fileSize = fs.statSync(testEpubPath).size;
    console.log(`Test EPUB size: ${(fileSize / 1024).toFixed(2)} KB`);
  });

  it('should measure ZIP open and entry list performance', () => {
    const iterations = 100;
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const zip = new AdmZip(testEpubPath);
      const entries = zip.getEntries();
      expect(entries.length).toBeGreaterThan(0);
    }
    
    const end = Date.now();
    const avgTime = (end - start) / iterations;
    
    console.log(`Average time to open ZIP and get entries: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(10); // 10ms以下を期待
  });

  it('should measure container.xml reading performance', () => {
    const iterations = 100;
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const zip = new AdmZip(testEpubPath);
      const containerEntry = zip.getEntry('META-INF/container.xml');
      if (containerEntry) {
        const content = zip.readAsText(containerEntry);
        expect(content).toBeTruthy();
      }
    }
    
    const end = Date.now();
    const avgTime = (end - start) / iterations;
    
    console.log(`Average time to read container.xml: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(10);
  });

  it('should measure full EPUB processing performance', () => {
    const iterations = 10;
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      const zip = new AdmZip(testEpubPath);
      const entries = zip.getEntries();
      
      // コンテナを読む
      const containerEntry = zip.getEntry('META-INF/container.xml');
      if (containerEntry) {
        zip.readAsText(containerEntry);
      }
      
      // すべての画像を検索
      const imageEntries = entries.filter(entry => 
        !entry.isDirectory && entry.entryName.match(/\.(jpg|jpeg|png|webp)$/i)
      );
      
      // 画像データにアクセス（実際には読まない）
      imageEntries.forEach(entry => {
        expect(entry.header.size).toBeGreaterThan(0);
      });
    }
    
    const end = Date.now();
    const avgTime = (end - start) / iterations;
    
    console.log(`Average time for full EPUB processing: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(50); // 50ms以下を期待
  });

  it('should measure memory usage patterns', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    const zips: AdmZip[] = [];
    
    // 10個のZIPを同時に開く
    for (let i = 0; i < 10; i++) {
      const zip = new AdmZip(testEpubPath);
      const entries = zip.getEntries();
      zips.push(zip);
    }
    
    const afterLoadMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (afterLoadMemory - initialMemory) / 1024 / 1024;
    
    console.log(`Memory increase for 10 ZIPs: ${memoryIncrease.toFixed(2)} MB`);
    console.log(`Average memory per ZIP: ${(memoryIncrease / 10).toFixed(2)} MB`);
    
    // メモリが異常に増加していないことを確認
    expect(memoryIncrease).toBeLessThan(50); // 50MB以下を期待
  });
});