import AdmZip from 'adm-zip';
import path from 'path';

/**
 * テスト用のEPUBファイルを動的に生成するヘルパー
 */
export class EpubGenerator {
  private zip: AdmZip;
  private chapters: Array<{ id: string; title: string; content: string }> = [];
  private images: Array<{ id: string; href: string; data: Buffer }> = [];

  constructor() {
    this.zip = new AdmZip();
  }

  /**
   * 基本的なEPUB構造を作成
   */
  private createBasicStructure() {
    // mimetype
    this.zip.addFile('mimetype', Buffer.from('application/epub+zip'));

    // META-INF/container.xml
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    this.zip.addFile('META-INF/container.xml', Buffer.from(containerXml));
  }

  /**
   * チャプターを追加
   */
  addChapter(id: string, title: string, imageCount: number = 0) {
    const images: string[] = [];
    
    // 指定された数の画像を生成
    for (let i = 1; i <= imageCount; i++) {
      const imageId = `${id}_image${i}`;
      const imagePath = `images/${imageId}.png`;
      
      // シンプルなPNG画像を生成（1x1の透明画像）
      const pngData = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
        0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
        0x54, 0x08, 0x5b, 0x63, 0xf8, 0x0f, 0x00, 0x01, // IDAT chunk
        0x01, 0x01, 0x00, 0x1b, 0xb6, 0xee, 0x56, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, // IEND chunk
        0x42, 0x60, 0x82
      ]);
      
      this.images.push({ id: imageId, href: imagePath, data: pngData });
      images.push(`<img src="${imagePath}" alt="${imageId}"/>`);
    }

    // HTMLコンテンツを生成
    const content = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  ${images.join('\n  ')}
</body>
</html>`;

    this.chapters.push({ id, title, content });
  }

  /**
   * EPUBファイルを生成
   */
  generate(): Buffer {
    this.createBasicStructure();

    // OPFファイルを生成
    const manifestItems = [
      ...this.chapters.map(ch => 
        `<item id="${ch.id}" href="${ch.id}.xhtml" media-type="application/xhtml+xml"/>`
      ),
      ...this.images.map(img => 
        `<item id="${img.id}" href="${img.href}" media-type="image/png"/>`
      ),
      '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>'
    ];

    const spineItems = this.chapters.map(ch => 
      `<itemref idref="${ch.id}"/>`
    );

    const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test EPUB</dc:title>
    <dc:language>ja</dc:language>
    <dc:identifier id="uid">test-epub-123</dc:identifier>
    <meta property="dcterms:modified">2024-01-01T00:00:00Z</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;

    this.zip.addFile('OEBPS/content.opf', Buffer.from(opf));

    // ナビゲーションファイルを生成
    const navItems = this.chapters.map(ch => 
      `<li><a href="${ch.id}.xhtml">${ch.title}</a></li>`
    );

    const nav = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navigation</title>
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

    this.zip.addFile('OEBPS/nav.xhtml', Buffer.from(nav));

    // チャプターファイルを追加
    this.chapters.forEach(ch => {
      this.zip.addFile(`OEBPS/${ch.id}.xhtml`, Buffer.from(ch.content));
    });

    // 画像ファイルを追加
    this.images.forEach(img => {
      this.zip.addFile(`OEBPS/${img.href}`, img.data);
    });

    return this.zip.toBuffer();
  }
}

/**
 * 複数チャプターを持つテスト用EPUBを生成
 */
export function createTestEpubWithChapters(): Buffer {
  const generator = new EpubGenerator();
  
  // テスト用のチャプターを追加（実際のファイルの構造を模倣しないよう注意）
  generator.addChapter('cover', '表紙', 2);
  generator.addChapter('contents', '目次', 1);
  generator.addChapter('chapter1', '第1章 はじめに', 5);
  generator.addChapter('chapter2', '第2章 基本機能', 8);
  generator.addChapter('chapter3', '第3章 応用編', 12);
  generator.addChapter('chapter4', '第4章 実践例', 15);
  generator.addChapter('chapter5', '第5章 トラブルシューティング', 3);
  generator.addChapter('appendix', '付録', 4);
  
  return generator.generate();
}

/**
 * 多数のチャプターを持つテスト用EPUBを生成
 */
export function createLargeTestEpub(): Buffer {
  const generator = new EpubGenerator();
  
  // 30章以上のテストデータを生成
  generator.addChapter('cover', '表紙', 1);
  generator.addChapter('toc', '目次', 1);
  
  // 30章を生成
  for (let i = 1; i <= 30; i++) {
    const imageCount = Math.floor(Math.random() * 10) + 5; // 5〜14枚のランダムな画像数
    generator.addChapter(`chapter${i}`, `第${i}章`, imageCount);
  }
  
  generator.addChapter('afterword', 'あとがき', 2);
  generator.addChapter('colophon', '奥付', 1);
  
  return generator.generate();
}