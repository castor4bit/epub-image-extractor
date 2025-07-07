const { processEpubFiles } = require('./dist-electron/main/index.js');
const path = require('path');
const fs = require('fs');

async function testChapterProcessing() {
  const testEpub = '/tmp/chapter_test.epub';
  const outputDir = path.join(__dirname, 'chapter-test-output');
  
  // 出力ディレクトリを作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('EPUBファイル処理開始:', testEpub);
  console.log('出力先:', outputDir);
  
  try {
    const results = await processEpubFiles(
      [testEpub],
      outputDir,
      (progress) => {
        console.log('進捗:', progress);
      },
      1
    );
    
    console.log('\n処理結果:');
    console.log(JSON.stringify(results, null, 2));
    
    // 出力されたディレクトリ構造を確認
    console.log('\n出力ディレクトリ構造:');
    const bookDir = results[0].outputPath;
    const chapters = fs.readdirSync(bookDir);
    
    for (const chapter of chapters.sort()) {
      const chapterPath = path.join(bookDir, chapter);
      if (fs.statSync(chapterPath).isDirectory()) {
        const files = fs.readdirSync(chapterPath);
        console.log(`${chapter}: ${files.length}ファイル`);
        if (files.length > 0) {
          console.log('  最初のファイル:', files[0]);
          console.log('  最後のファイル:', files[files.length - 1]);
        }
      }
    }
  } catch (error) {
    console.error('エラー:', error);
  }
}

testChapterProcessing();