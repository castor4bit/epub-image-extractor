const { parseEpub } = require('./dist-electron/main/index.js');
const { extractImages } = require('./dist-electron/main/index.js');
const AdmZip = require('adm-zip');

async function testChapterMapping() {
  const testEpub = '/tmp/chapter_test.epub';
  
  try {
    console.log('=== EPUB解析開始 ===');
    const epubData = await parseEpub(testEpub);
    
    console.log('\n=== ナビゲーション情報 ===');
    epubData.navigation.slice(0, 10).forEach(nav => {
      console.log(`章${nav.order}: ${nav.title} -> ${nav.href}`);
    });
    
    console.log('\n=== Spine情報（最初の20件）===');
    epubData.spine.slice(0, 20).forEach((spine, index) => {
      const manifestItem = epubData.manifest[spine.idref];
      console.log(`Spine[${index}]: ${spine.idref} -> ${manifestItem ? manifestItem.href : 'なし'}`);
    });
    
    console.log('\n=== 画像抽出（最初の100ページのみ）===');
    // spineを最初の100ページに制限
    const limitedEpubData = {
      ...epubData,
      spine: epubData.spine.slice(0, 100)
    };
    
    const images = await extractImages(limitedEpubData);
    
    // チャプターごとの画像数を集計
    const imagesByChapter = {};
    images.forEach(img => {
      if (!imagesByChapter[img.chapterOrder]) {
        imagesByChapter[img.chapterOrder] = 0;
      }
      imagesByChapter[img.chapterOrder]++;
    });
    
    console.log('\n=== チャプターごとの画像数 ===');
    Object.entries(imagesByChapter).forEach(([chapter, count]) => {
      const nav = epubData.navigation.find(n => n.order === parseInt(chapter));
      console.log(`章${chapter} (${nav ? nav.title : '不明'}): ${count}枚`);
    });
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

testChapterMapping();