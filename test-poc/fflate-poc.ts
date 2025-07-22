import { unzipSync, strFromU8 } from 'fflate';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';

// fflateとadm-zipのAPI比較POC

async function compareFflateWithAdmZip() {
  const epubPath = path.join(__dirname, '../tests/fixtures/test.epub');
  
  console.log('=== adm-zip API ===');
  testAdmZip(epubPath);
  
  console.log('\n=== fflate API ===');
  await testFflate(epubPath);
  
  console.log('\n=== Performance Comparison ===');
  await comparePerformance(epubPath);
}

function testAdmZip(filePath: string) {
  // 1. ZIPファイルを開く
  const zip = new AdmZip(filePath);
  
  // 2. エントリーリストを取得
  const entries = zip.getEntries();
  console.log(`Total entries: ${entries.length}`);
  
  // 3. 特定のファイルを読む（container.xml）
  const containerEntry = zip.getEntry('META-INF/container.xml');
  if (containerEntry) {
    const content = zip.readAsText(containerEntry);
    console.log(`container.xml size: ${content.length} chars`);
  }
  
  // 4. ファイル情報を表示
  const firstImageEntry = entries.find(e => 
    e.entryName.match(/\.(jpg|jpeg|png|webp)$/i) && !e.isDirectory
  );
  if (firstImageEntry) {
    console.log(`First image: ${firstImageEntry.entryName}`);
    console.log(`  Size: ${firstImageEntry.header.size} bytes`);
    console.log(`  Compressed: ${firstImageEntry.header.compressedSize} bytes`);
  }
}

async function testFflate(filePath: string) {
  // 1. ファイルを読み込む
  const fileData = fs.readFileSync(filePath);
  
  // 2. 解凍する
  const unzipped = unzipSync(fileData);
  
  // 3. エントリーリストを取得
  const entries = Object.keys(unzipped);
  console.log(`Total entries: ${entries.length}`);
  
  // 4. 特定のファイルを読む（container.xml）
  const containerPath = 'META-INF/container.xml';
  if (unzipped[containerPath]) {
    const content = strFromU8(unzipped[containerPath]);
    console.log(`container.xml size: ${content.length} chars`);
  }
  
  // 5. ファイル情報を表示
  const firstImagePath = entries.find(path => 
    path.match(/\.(jpg|jpeg|png|webp)$/i)
  );
  if (firstImagePath) {
    console.log(`First image: ${firstImagePath}`);
    console.log(`  Size: ${unzipped[firstImagePath].length} bytes`);
  }
}

async function comparePerformance(filePath: string) {
  const iterations = 10;
  
  // adm-zip performance
  const admZipStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    entries.forEach(entry => {
      if (entry.entryName === 'META-INF/container.xml') {
        zip.readAsText(entry);
      }
    });
  }
  const admZipTime = Date.now() - admZipStart;
  
  // fflate performance
  const fflateStart = Date.now();
  const fileData = fs.readFileSync(filePath);
  for (let i = 0; i < iterations; i++) {
    const unzipped = unzipSync(fileData);
    if (unzipped['META-INF/container.xml']) {
      strFromU8(unzipped['META-INF/container.xml']);
    }
  }
  const fflateTime = Date.now() - fflateStart;
  
  console.log(`adm-zip: ${admZipTime}ms (${iterations} iterations)`);
  console.log(`fflate: ${fflateTime}ms (${iterations} iterations)`);
  console.log(`Performance improvement: ${((admZipTime - fflateTime) / admZipTime * 100).toFixed(1)}%`);
}

// メイン実行
if (require.main === module) {
  compareFflateWithAdmZip().catch(console.error);
}