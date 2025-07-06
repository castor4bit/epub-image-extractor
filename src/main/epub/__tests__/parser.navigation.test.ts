import { parseEpub } from '../parser';
import AdmZip from 'adm-zip';
import path from 'path';

describe('parseEpub - ナビゲーション抽出', () => {
  describe('EPUB3 Navigation Document', () => {
    test('navigation-documents.xhtmlから章情報を抽出できること', async () => {
      // テスト用のEPUBをモック
      const mockZip = new AdmZip();
      
      // container.xml
      const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="item/standard.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
      mockZip.addFile('META-INF/container.xml', Buffer.from(containerXml));
      
      // OPFファイル
      const opfXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Test Book</dc:title>
  </metadata>
  <manifest>
    <item id="toc" href="navigation-documents.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="p1" href="xhtml/p-001.xhtml" media-type="application/xhtml+xml"/>
    <item id="p2" href="xhtml/p-002.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="p1"/>
    <itemref idref="p2"/>
  </spine>
</package>`;
      mockZip.addFile('item/standard.opf', Buffer.from(opfXml));
      
      // Navigation Document
      const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navigation</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>目次</h1>
    <ol>
      <li><a href="xhtml/p-001.xhtml">第1章 はじめに</a></li>
      <li><a href="xhtml/p-002.xhtml">第2章 本編</a></li>
    </ol>
  </nav>
</body>
</html>`;
      mockZip.addFile('item/navigation-documents.xhtml', Buffer.from(navXhtml));
      
      // EPUBをファイルに書き出し
      const tempPath = path.join(__dirname, 'test-nav.epub');
      mockZip.writeZip(tempPath);
      
      try {
        const result = await parseEpub(tempPath);
        
        expect(result.navigation).toHaveLength(2);
        expect(result.navigation[0]).toEqual({
          order: 1,
          title: '第1章 はじめに',
          href: 'xhtml/p-001.xhtml'
        });
        expect(result.navigation[1]).toEqual({
          order: 2,
          title: '第2章 本編',
          href: 'xhtml/p-002.xhtml'
        });
      } finally {
        // クリーンアップ
        const fs = require('fs');
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });

    test('propertiesがnavのアイテムを識別できること', async () => {
      const mockZip = new AdmZip();
      
      const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
      mockZip.addFile('META-INF/container.xml', Buffer.from(containerXml));
      
      const opfXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Test Book</dc:title>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="nav"/>
  </spine>
</package>`;
      mockZip.addFile('OEBPS/content.opf', Buffer.from(opfXml));
      
      const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<body>
  <nav epub:type="toc">
    <ol>
      <li><a href="chapter1.xhtml">Chapter 1</a></li>
    </ol>
  </nav>
</body>
</html>`;
      mockZip.addFile('OEBPS/nav.xhtml', Buffer.from(navXhtml));
      
      const tempPath = path.join(__dirname, 'test-nav-properties.epub');
      mockZip.writeZip(tempPath);
      
      try {
        const result = await parseEpub(tempPath);
        expect(result.navigation).toHaveLength(1);
        expect(result.navigation[0].title).toBe('Chapter 1');
      } finally {
        const fs = require('fs');
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });
  });

  describe('EPUB2 NCX', () => {
    test('NCXファイルから章情報を抽出できること', async () => {
      const mockZip = new AdmZip();
      
      const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
      mockZip.addFile('META-INF/container.xml', Buffer.from(containerXml));
      
      const opfXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Test Book</dc:title>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="page1"/>
  </spine>
</package>`;
      mockZip.addFile('OEBPS/content.opf', Buffer.from(opfXml));
      
      const ncxXml = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <navMap>
    <navPoint id="nav1" playOrder="1">
      <navLabel>
        <text>Chapter 1</text>
      </navLabel>
      <content src="page1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;
      mockZip.addFile('OEBPS/toc.ncx', Buffer.from(ncxXml));
      
      const tempPath = path.join(__dirname, 'test-ncx.epub');
      mockZip.writeZip(tempPath);
      
      try {
        const result = await parseEpub(tempPath);
        expect(result.navigation).toHaveLength(1);
        expect(result.navigation[0].title).toBe('Chapter 1');
      } finally {
        const fs = require('fs');
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    });
  });
});