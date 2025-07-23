// Note: This file is used to create test fixtures and still depends on adm-zip
// because it needs to CREATE zip files, not just read them.
// The abstraction layer is only for reading ZIP files.
const AdmZip = require('adm-zip');
import * as path from 'path';
import * as fs from 'fs';

/**
 * 大きなテスト用EPUBファイルを生成
 * @param chapterCount 章の数
 * @param imagesPerChapter 各章の画像数
 * @param imageSize 各画像のサイズ（バイト）
 */
export function createLargeTestEpub(
  chapterCount: number = 50,
  imagesPerChapter: number = 20,
  imageSize: number = 100 * 1024 // 100KB
): Buffer {
  const zip = new AdmZip();

  // mimetype
  zip.addFile('mimetype', Buffer.from('application/epub+zip'), '', 0);

  // META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.addFile('META-INF/container.xml', Buffer.from(containerXml));

  // 章とマニフェストアイテムを生成
  const manifestItems: string[] = [];
  const spineItems: string[] = [];
  const navItems: string[] = [];

  // ナビゲーションを追加
  manifestItems.push('<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>');

  // 各章を生成
  for (let chapterNum = 1; chapterNum <= chapterCount; chapterNum++) {
    const chapterId = `chapter${chapterNum}`;
    
    // 章のマニフェストとスパインを追加
    manifestItems.push(`<item id="${chapterId}" href="${chapterId}.xhtml" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${chapterId}"/>`);
    navItems.push(`<li><a href="${chapterId}.xhtml">第${chapterNum}章</a></li>`);

    // 章のXHTMLを生成
    const imageRefs: string[] = [];
    for (let imgNum = 1; imgNum <= imagesPerChapter; imgNum++) {
      const imageId = `${chapterId}_img${imgNum}`;
      const imagePath = `images/${imageId}.jpg`;
      
      // 画像をマニフェストに追加
      manifestItems.push(`<item id="${imageId}" href="${imagePath}" media-type="image/jpeg"/>`);
      
      // 画像参照を追加
      imageRefs.push(`<img src="${imagePath}" alt="${imageId}"/>`);
      
      // ダミー画像データを生成（指定サイズのJPEG）
      const imageData = createDummyJpeg(imageSize);
      zip.addFile(`OEBPS/${imagePath}`, imageData);
    }

    // 章のXHTML
    const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>第${chapterNum}章</title>
</head>
<body>
  <h1>第${chapterNum}章</h1>
  <p>これは第${chapterNum}章のコンテンツです。</p>
  ${imageRefs.join('\n  ')}
</body>
</html>`;
    zip.addFile(`OEBPS/${chapterId}.xhtml`, Buffer.from(chapterXhtml));
  }

  // OPFファイルを生成
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Large Test EPUB</dc:title>
    <dc:language>ja</dc:language>
    <dc:identifier id="uid">large-test-epub-001</dc:identifier>
    <meta property="dcterms:modified">2024-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
  zip.addFile('OEBPS/content.opf', Buffer.from(contentOpf));

  // ナビゲーションファイルを生成
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>目次</title>
</head>
<body>
  <nav epub:type="toc">
    <h1>目次</h1>
    <ol>
      ${navItems.join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;
  zip.addFile('OEBPS/nav.xhtml', Buffer.from(navXhtml));

  return zip.toBuffer();
}

/**
 * 指定サイズのダミーJPEGデータを生成
 */
function createDummyJpeg(size: number): Buffer {
  // 最小限のJPEGヘッダー
  const header = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00
  ]);
  
  // 終端マーカー
  const footer = Buffer.from([0xFF, 0xD9]);
  
  // 残りのサイズをランダムデータで埋める
  const dataSize = Math.max(0, size - header.length - footer.length);
  const data = Buffer.alloc(dataSize);
  
  // ランダムなデータで埋める（パフォーマンスのため簡易的に）
  for (let i = 0; i < dataSize - 3; i += 4) {
    data.writeUInt32BE(Math.floor(Math.random() * 0xFFFFFFFF), i);
  }
  
  return Buffer.concat([header, data, footer]);
}

/**
 * 大きなEPUBファイルをファイルシステムに保存
 */
export function saveLargeTestEpub(
  filePath: string,
  chapterCount: number = 50,
  imagesPerChapter: number = 20,
  imageSize: number = 100 * 1024
): void {
  const epubBuffer = createLargeTestEpub(chapterCount, imagesPerChapter, imageSize);
  fs.writeFileSync(filePath, epubBuffer);
  
  const sizeMB = (epubBuffer.length / 1024 / 1024).toFixed(2);
  console.log(`Created large test EPUB: ${filePath} (${sizeMB} MB)`);
  console.log(`- Chapters: ${chapterCount}`);
  console.log(`- Images per chapter: ${imagesPerChapter}`);
  console.log(`- Total images: ${chapterCount * imagesPerChapter}`);
  console.log(`- Image size: ${(imageSize / 1024).toFixed(2)} KB`);
}