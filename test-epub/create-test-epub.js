const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// テスト用EPUBファイルを作成
function createTestEpub() {
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

  // OEBPS/content.opf
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>テストEPUBブック</dc:title>
    <dc:creator>テスト著者</dc:creator>
    <dc:language>ja</dc:language>
    <dc:identifier id="BookId">test-epub-001</dc:identifier>
    <meta property="dcterms:modified">2024-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    <item id="nav" href="navigation.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="images/image1.png" media-type="image/png"/>
    <item id="img2" href="images/image2.jpg" media-type="image/jpeg"/>
    <item id="img3" href="images/image3.png" media-type="image/png"/>
  </manifest>
  <spine>
    <itemref idref="cover"/>
    <itemref idref="chapter1"/>
    <itemref idref="chapter2"/>
  </spine>
</package>`;
  zip.addFile('OEBPS/content.opf', Buffer.from(contentOpf));

  // OEBPS/navigation.xhtml
  const navigationXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>目次</title>
</head>
<body>
  <nav epub:type="toc">
    <h1>目次</h1>
    <ol>
      <li><a href="cover.xhtml">表紙</a></li>
      <li><a href="chapter1.xhtml">第1章：はじめに</a></li>
      <li><a href="chapter2.xhtml">第2章：本編</a></li>
    </ol>
  </nav>
</body>
</html>`;
  zip.addFile('OEBPS/navigation.xhtml', Buffer.from(navigationXhtml));

  // OEBPS/cover.xhtml
  const coverXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>表紙</title>
</head>
<body>
  <h1>テストEPUBブック</h1>
  <img src="images/image1.png" alt="表紙画像"/>
</body>
</html>`;
  zip.addFile('OEBPS/cover.xhtml', Buffer.from(coverXhtml));

  // OEBPS/chapter1.xhtml
  const chapter1Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>第1章</title>
</head>
<body>
  <h1>第1章：はじめに</h1>
  <p>これはテスト用のEPUBファイルです。</p>
  <img src="images/image2.jpg" alt="第1章の画像"/>
  <p>画像が正しく抽出されることを確認します。</p>
</body>
</html>`;
  zip.addFile('OEBPS/chapter1.xhtml', Buffer.from(chapter1Xhtml));

  // OEBPS/chapter2.xhtml
  const chapter2Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>第2章</title>
</head>
<body>
  <h1>第2章：本編</h1>
  <p>第2章の内容です。</p>
  <img src="images/image3.png" alt="第2章の画像"/>
  <p>複数の章に分かれていることを確認します。</p>
</body>
</html>`;
  zip.addFile('OEBPS/chapter2.xhtml', Buffer.from(chapter2Xhtml));

  // テスト画像を作成（シンプルなPNG画像）
  // 1x1ピクセルの赤、緑、青の画像
  const createSimplePng = (r, g, b) => {
    const png = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xD7, 0x63, r, g, b, 0x00, 0x00,
      0x00, 0x16, 0x00, 0x01, 0x73, 0x75, 0x25, 0xE8,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    return png;
  };

  // 画像を追加
  zip.addFile('OEBPS/images/image1.png', createSimplePng(0xF8, 0x00, 0x00)); // 赤
  zip.addFile('OEBPS/images/image2.jpg', createSimplePng(0x00, 0xF8, 0x00)); // 緑（実際はPNGだが拡張子はJPG）
  zip.addFile('OEBPS/images/image3.png', createSimplePng(0x00, 0x00, 0xF8)); // 青

  // EPUBファイルを保存
  const outputDir = path.join(__dirname, '..');
  const outputPath = path.join(outputDir, 'test.epub');
  zip.writeZip(outputPath);
  
  console.log(`テストEPUBファイルを作成しました: ${outputPath}`);
}

createTestEpub();