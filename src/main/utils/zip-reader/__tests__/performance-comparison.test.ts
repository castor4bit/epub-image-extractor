import { AdmZipReader } from '../AdmZipReader';
import { FflateReader } from '../FflateReader';
import { IZipReader } from '../types';
import path from 'path';
import fs from 'fs';

describe('ZIP Reader Performance Comparison', () => {
  const testEpubPath = path.join(__dirname, '../../../../../tests/fixtures/test.epub');
  const fileSize = fs.statSync(testEpubPath).size;
  
  console.log(`\n=== Performance Comparison ===`);
  console.log(`Test file size: ${(fileSize / 1024).toFixed(2)} KB`);
  
  interface PerformanceResult {
    name: string;
    openAndList: number;
    readContainer: number;
    fullProcessing: number;
    memoryPerInstance: number;
  }
  
  const results: PerformanceResult[] = [];
  
  async function measurePerformance(
    name: string, 
    createReader: () => IZipReader
  ): Promise<PerformanceResult> {
    const iterations = 100;
    const memIterations = 10;
    
    // 1. Open and list entries
    let start = Date.now();
    for (let i = 0; i < iterations; i++) {
      const reader = createReader();
      await reader.open(testEpubPath);
      reader.getEntries();
      reader.close();
    }
    const openAndList = (Date.now() - start) / iterations;
    
    // 2. Read container.xml
    start = Date.now();
    for (let i = 0; i < iterations; i++) {
      const reader = createReader();
      await reader.open(testEpubPath);
      const entry = reader.getEntry('META-INF/container.xml');
      if (entry) {
        reader.readAsText(entry);
      }
      reader.close();
    }
    const readContainer = (Date.now() - start) / iterations;
    
    // 3. Full processing (読み込み、エントリ取得、画像検索)
    start = Date.now();
    for (let i = 0; i < memIterations; i++) {
      const reader = createReader();
      await reader.open(testEpubPath);
      const entries = reader.getEntries();
      
      // container.xmlを読む
      const containerEntry = reader.getEntry('META-INF/container.xml');
      if (containerEntry) {
        reader.readAsText(containerEntry);
      }
      
      // 画像ファイルを検索
      const imageEntries = entries.filter(entry => 
        !entry.isDirectory && entry.name.match(/\.(jpg|jpeg|png|webp)$/i)
      );
      
      // 各画像のサイズを確認
      imageEntries.forEach(entry => {
        expect(entry.size).toBeGreaterThan(0);
      });
      
      reader.close();
    }
    const fullProcessing = (Date.now() - start) / memIterations;
    
    // 4. メモリ使用量測定
    const initialMemory = process.memoryUsage().heapUsed;
    const readers: IZipReader[] = [];
    
    for (let i = 0; i < memIterations; i++) {
      const reader = createReader();
      await reader.open(testEpubPath);
      reader.getEntries();
      readers.push(reader);
    }
    
    const afterMemory = process.memoryUsage().heapUsed;
    const memoryPerInstance = (afterMemory - initialMemory) / memIterations / 1024 / 1024;
    
    // クリーンアップ
    readers.forEach(r => r.close());
    
    return {
      name,
      openAndList,
      readContainer,
      fullProcessing,
      memoryPerInstance
    };
  }
  
  it('should compare performance between implementations', async () => {
    // AdmZipReaderのパフォーマンス測定
    const admResult = await measurePerformance('AdmZipReader', () => new AdmZipReader());
    results.push(admResult);
    
    // FflateReaderのパフォーマンス測定
    const fflateResult = await measurePerformance('FflateReader', () => new FflateReader());
    results.push(fflateResult);
    
    // 結果を表示
    console.log('\n--- Performance Results ---');
    console.log('Implementation | Open & List | Read Container | Full Process | Memory/Instance');
    console.log('---------------|-------------|----------------|--------------|----------------');
    
    results.forEach(result => {
      console.log(
        `${result.name.padEnd(14)} | ` +
        `${result.openAndList.toFixed(2).padStart(9)}ms | ` +
        `${result.readContainer.toFixed(2).padStart(12)}ms | ` +
        `${result.fullProcessing.toFixed(2).padStart(10)}ms | ` +
        `${result.memoryPerInstance.toFixed(2).padStart(11)} MB`
      );
    });
    
    // 改善率を計算
    const improvement = {
      openAndList: ((admResult.openAndList - fflateResult.openAndList) / admResult.openAndList * 100),
      readContainer: ((admResult.readContainer - fflateResult.readContainer) / admResult.readContainer * 100),
      fullProcessing: ((admResult.fullProcessing - fflateResult.fullProcessing) / admResult.fullProcessing * 100),
      memory: ((admResult.memoryPerInstance - fflateResult.memoryPerInstance) / admResult.memoryPerInstance * 100)
    };
    
    console.log('\n--- Performance Improvement (fflate vs adm-zip) ---');
    console.log(`Open & List:    ${improvement.openAndList.toFixed(1)}%`);
    console.log(`Read Container: ${improvement.readContainer.toFixed(1)}%`);
    console.log(`Full Process:   ${improvement.fullProcessing.toFixed(1)}%`);
    console.log(`Memory Usage:   ${improvement.memory.toFixed(1)}%`);
    
    // 重要な指標でパフォーマンスが向上していることを確認
    // fflateは初期化が遅いが、全体的な処理とメモリ効率が良い
    expect(fflateResult.fullProcessing).toBeLessThanOrEqual(admResult.fullProcessing * 1.1); // フル処理で劣化していない
    expect(fflateResult.memoryPerInstance).toBeLessThan(admResult.memoryPerInstance); // メモリ使用量が少ない
  });
  
  it('should handle concurrent operations efficiently', async () => {
    const concurrentCount = 5;
    
    async function measureConcurrent(name: string, createReader: () => IZipReader): Promise<number> {
      const start = Date.now();
      
      const promises = Array.from({ length: concurrentCount }, async () => {
        const reader = createReader();
        await reader.open(testEpubPath);
        const entries = reader.getEntries();
        
        // すべてのテキストファイルを読む
        for (const entry of entries) {
          if (!entry.isDirectory && entry.name.endsWith('.xml')) {
            reader.readAsText(entry);
          }
        }
        
        reader.close();
      });
      
      await Promise.all(promises);
      return Date.now() - start;
    }
    
    const admTime = await measureConcurrent('AdmZipReader', () => new AdmZipReader());
    const fflateTime = await measureConcurrent('FflateReader', () => new FflateReader());
    
    console.log('\n--- Concurrent Operations ---');
    console.log(`AdmZipReader (${concurrentCount} concurrent): ${admTime}ms`);
    console.log(`FflateReader (${concurrentCount} concurrent): ${fflateTime}ms`);
    console.log(`Improvement: ${((admTime - fflateTime) / admTime * 100).toFixed(1)}%`);
  });
});