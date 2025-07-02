/**
 * 統合テストスクリプト
 * 実際のEPUBファイルで動作確認を行う
 */

const { parseEpub } = require('./dist-electron/main/epub/parser');
const { extractImages } = require('./dist-electron/main/epub/imageExtractor');
const { organizeByChapters } = require('./dist-electron/main/epub/chapterOrganizer');
const path = require('path');
const fs = require('fs').promises;

async function testEpubProcessing(epubPath) {
  console.log(`\nテスト開始: ${path.basename(epubPath)}`);
  console.log('='.repeat(50));

  try {
    // 1. EPUB解析
    console.log('\n1. EPUB解析中...');
    const epubData = await parseEpub(epubPath);
    console.log(`✓ 解析完了`);
    console.log(`  - Manifest items: ${Object.keys(epubData.manifest).length}`);
    console.log(`  - Spine items: ${epubData.spine.length}`);
    console.log(`  - Navigation items: ${epubData.navigation.length}`);

    // 2. 画像抽出
    console.log('\n2. 画像抽出中...');
    const images = await extractImages(epubData, (processed, total) => {
      process.stdout.write(`\r  処理中: ${processed}/${total} ページ`);
    });
    console.log(`\n✓ 抽出完了: ${images.length} 画像`);

    // 3. 章別整理
    const outputDir = path.join(__dirname, 'test-output', path.basename(epubPath, '.epub'));
    await fs.mkdir(path.dirname(outputDir), { recursive: true });
    
    console.log('\n3. 章別整理中...');
    const chapterCount = await organizeByChapters(
      images,
      epubData.navigation,
      outputDir,
      epubPath
    );
    console.log(`✓ 整理完了: ${chapterCount} 章`);
    console.log(`  出力先: ${outputDir}`);

    // 結果サマリー
    console.log('\n--- 結果サマリー ---');
    console.log(`総画像数: ${images.length}`);
    console.log(`章数: ${chapterCount}`);
    
    if (epubData.navigation.length > 0) {
      console.log('\n章一覧:');
      epubData.navigation.slice(0, 10).forEach(nav => {
        console.log(`  ${String(nav.order).padStart(3, '0')}: ${nav.title}`);
      });
      if (epubData.navigation.length > 10) {
        console.log(`  ... 他 ${epubData.navigation.length - 10} 章`);
      }
    }

    return { success: true, images: images.length, chapters: chapterCount };
  } catch (error) {
    console.error('\n✗ エラー:', error.message);
    return { success: false, error: error.message };
  }
}

// コマンドライン引数からEPUBパスを取得
const epubPath = process.argv[2];

if (!epubPath) {
  console.log('使用方法: node test-integration.js <EPUBファイルのパス>');
  console.log('例: node test-integration.js ~/Desktop/sample.epub');
  process.exit(1);
}

// ビルドが必要な場合の注意
console.log('注意: このスクリプトを実行する前に、以下のコマンドでビルドしてください:');
console.log('  npm run build');
console.log('');

// テスト実行
testEpubProcessing(epubPath)
  .then(result => {
    console.log('\n='.repeat(50));
    if (result.success) {
      console.log('✓ テスト成功');
    } else {
      console.log('✗ テスト失敗');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('予期しないエラー:', error);
    process.exit(1);
  });