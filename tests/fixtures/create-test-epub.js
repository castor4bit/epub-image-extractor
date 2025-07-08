const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// テスト用EPUBファイルを作成
function createTestEpub() {
  const zip = new AdmZip();

  // mimetype (圧縮なし)
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
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test EPUB</dc:title>
    <dc:language>ja</dc:language>
    <dc:identifier id="uid">test-epub-001</dc:identifier>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="page2" href="page2.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="images/test1.jpg" media-type="image/jpeg"/>
    <item id="img2" href="images/test2.png" media-type="image/png"/>
    <item id="toc" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="toc">
    <itemref idref="page1" linear="yes"/>
    <itemref idref="page2" linear="yes"/>
  </spine>
</package>`;
  zip.addFile('OEBPS/content.opf', Buffer.from(contentOpf));

  // OEBPS/nav.xhtml
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>目次</title>
</head>
<body>
  <nav epub:type="toc">
    <ol>
      <li><a href="page1.xhtml">第1章</a></li>
      <li><a href="page2.xhtml">第2章</a></li>
    </ol>
  </nav>
</body>
</html>`;
  zip.addFile('OEBPS/nav.xhtml', Buffer.from(navXhtml));

  // OEBPS/toc.ncx
  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="test-epub-001"/>
  </head>
  <docTitle>
    <text>Test EPUB</text>
  </docTitle>
  <navMap>
    <navPoint id="nav1" playOrder="1">
      <navLabel>
        <text>第1章</text>
      </navLabel>
      <content src="page1.xhtml"/>
    </navPoint>
    <navPoint id="nav2" playOrder="2">
      <navLabel>
        <text>第2章</text>
      </navLabel>
      <content src="page2.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;
  zip.addFile('OEBPS/toc.ncx', Buffer.from(tocNcx));

  // OEBPS/page1.xhtml
  const page1Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>第1章</title>
</head>
<body>
  <h1>第1章</h1>
  <p>テストページ1</p>
  <img src="images/test1.jpg" alt="Test Image 1"/>
</body>
</html>`;
  zip.addFile('OEBPS/page1.xhtml', Buffer.from(page1Xhtml));

  // OEBPS/page2.xhtml
  const page2Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>第2章</title>
</head>
<body>
  <h1>第2章</h1>
  <p>テストページ2</p>
  <img src="images/test2.png" alt="Test Image 2"/>
</body>
</html>`;
  zip.addFile('OEBPS/page2.xhtml', Buffer.from(page2Xhtml));

  // ダミー画像を追加
  const dummyJpg = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
  ]);
  const dummyPng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  zip.addFile('OEBPS/images/test1.jpg', dummyJpg);
  zip.addFile('OEBPS/images/test2.png', dummyPng);

  // EPUBファイルを保存
  const outputPath = path.join(__dirname, 'test.epub');
  zip.writeZip(outputPath);
  
  console.log(`テスト用EPUBファイルを作成しました: ${outputPath}`);
}

createTestEpub();