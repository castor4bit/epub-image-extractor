const path = require('path');
const fs = require('fs');
const { zipSync, strToU8 } = require('fflate');

// テスト用EPUBファイルを作成
function createTestEpub() {
  const files = {};
  
  // mimetype (圧縮なし)
  files['mimetype'] = [strToU8('application/epub+zip'), { level: 0 }];

  // META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  files['META-INF/container.xml'] = strToU8(containerXml);

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
  files['OEBPS/content.opf'] = strToU8(contentOpf);

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
  files['OEBPS/nav.xhtml'] = strToU8(navXhtml);

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
  files['OEBPS/toc.ncx'] = strToU8(tocNcx);

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
  files['OEBPS/page1.xhtml'] = strToU8(page1Xhtml);

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
  files['OEBPS/page2.xhtml'] = strToU8(page2Xhtml);

  // ダミー画像を追加
  const dummyJpg = new Uint8Array([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
  ]);
  const dummyPng = new Uint8Array([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0D, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  files['OEBPS/images/test1.jpg'] = dummyJpg;
  files['OEBPS/images/test2.png'] = dummyPng;

  // ZIPファイルを作成
  const zipped = zipSync(files, { mtime: new Date('2024-01-01') });
  
  // EPUBファイルを保存
  const outputPath = path.join(__dirname, 'test.epub');
  fs.writeFileSync(outputPath, zipped);
  
  // eslint-disable-next-line no-console
  console.log(`テスト用EPUBファイルを作成しました: ${outputPath}`);
}

createTestEpub();