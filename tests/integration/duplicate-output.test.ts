import { processEpubFiles } from '../../src/main/epub/processor';
import path from 'path';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';

describe('重複出力先の処理', () => {
  const outputDir = path.join(__dirname, 'test-duplicate-output');
  const epubDir = path.join(__dirname, 'test-epubs');
  const testEpub1 = path.join(epubDir, 'test-book.epub');
  const testEpub2 = path.join(epubDir, 'another-folder/test-book.epub'); // 同じファイル名、異なるパス
  
  beforeAll(async () => {
    // テスト用ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.dirname(testEpub1), { recursive: true });
    await fs.mkdir(path.dirname(testEpub2), { recursive: true });
    
    // テスト用EPUB 1を作成
    const mockZip1 = new AdmZip();
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    mockZip1.addFile('META-INF/container.xml', Buffer.from(containerXml));
    
    const opfXml1 = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Test Book 1</dc:title>
  </metadata>
  <manifest>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="image1.jpg" media-type="image/jpeg"/>
  </manifest>
  <spine>
    <itemref idref="page1"/>
  </spine>
</package>`;
    mockZip1.addFile('OEBPS/content.opf', Buffer.from(opfXml1));
    mockZip1.addFile('OEBPS/page1.xhtml', Buffer.from('<html><body><img src="image1.jpg"/></body></html>'));
    mockZip1.addFile('OEBPS/image1.jpg', Buffer.from('image from book 1'));
    mockZip1.writeZip(testEpub1);
    
    // テスト用EPUB 2を作成（同じファイル名、異なる内容）
    const mockZip2 = new AdmZip();
    mockZip2.addFile('META-INF/container.xml', Buffer.from(containerXml));
    
    const opfXml2 = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Test Book 2</dc:title>
  </metadata>
  <manifest>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="image2.png" media-type="image/png"/>
  </manifest>
  <spine>
    <itemref idref="page1"/>
  </spine>
</package>`;
    mockZip2.addFile('OEBPS/content.opf', Buffer.from(opfXml2));
    mockZip2.addFile('OEBPS/page1.xhtml', Buffer.from('<html><body><img src="image2.png"/></body></html>'));
    mockZip2.addFile('OEBPS/image2.png', Buffer.from('image from book 2'));
    mockZip2.writeZip(testEpub2);
  });
  
  afterAll(async () => {
    // クリーンアップ
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {});
    await fs.rm(epubDir, { recursive: true, force: true }).catch(() => {});
  });
  
  test('同じファイル名のEPUBを処理した場合、重複を避けて出力される', async () => {
    const onProgress = jest.fn();
    
    // 1つ目のEPUBを処理
    const results1 = await processEpubFiles([testEpub1], outputDir, onProgress, 1);
    expect(results1[0].errors).toHaveLength(0);
    
    const firstOutputPath = results1[0].outputPath;
    expect(firstOutputPath).toContain('test-book');
    
    // 1つ目の出力ディレクトリにマーカーファイルを作成
    const markerFile1 = path.join(firstOutputPath, 'from-book-1.txt');
    await fs.writeFile(markerFile1, 'This is from the first book');
    
    // 2つ目のEPUBを処理（同じファイル名）
    const results2 = await processEpubFiles([testEpub2], outputDir, onProgress, 1);
    expect(results2[0].errors).toHaveLength(0);
    
    const secondOutputPath = results2[0].outputPath;
    expect(secondOutputPath).toContain('test-book');
    
    // 出力パスが異なることを確認
    expect(firstOutputPath).not.toBe(secondOutputPath);
    expect(secondOutputPath).toMatch(/test-book_\d+$/);
    
    // 1つ目のマーカーファイルが残っていることを確認
    const marker1Exists = await fs.access(markerFile1).then(() => true).catch(() => false);
    expect(marker1Exists).toBe(true);
    
    // それぞれの出力ディレクトリに正しい画像があることを確認
    const files1 = await fs.readdir(firstOutputPath, { recursive: true });
    const files2 = await fs.readdir(secondOutputPath, { recursive: true });
    
    const hasJpg = files1.some(f => f.toString().endsWith('.jpg'));
    const hasPng = files2.some(f => f.toString().endsWith('.png'));
    
    expect(hasJpg).toBe(true);
    expect(hasPng).toBe(true);
  });
  
  test('複数の同名EPUBを同時に処理しても正しく分離される', async () => {
    const onProgress = jest.fn();
    
    // 3つ目のEPUBも作成（同じ名前）
    const testEpub3 = path.join(epubDir, 'subfolder/test-book.epub');
    await fs.mkdir(path.dirname(testEpub3), { recursive: true });
    
    const mockZip3 = new AdmZip();
    mockZip3.addFile('META-INF/container.xml', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`));
    mockZip3.addFile('OEBPS/content.opf', Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Test Book 3</dc:title>
  </metadata>
  <manifest>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="page1"/>
  </spine>
</package>`));
    mockZip3.addFile('OEBPS/page1.xhtml', Buffer.from('<html><body>Book 3</body></html>'));
    mockZip3.writeZip(testEpub3);
    
    // 3つのEPUBを並列処理
    const results = await processEpubFiles(
      [testEpub1, testEpub2, testEpub3],
      outputDir,
      onProgress,
      3 // 並列数3
    );
    
    expect(results).toHaveLength(3);
    
    // 全ての出力パスが異なることを確認
    const outputPaths = results.map(r => r.outputPath);
    const uniquePaths = new Set(outputPaths);
    expect(uniquePaths.size).toBe(3);
    
    // 各ディレクトリが存在することを確認
    for (const result of results) {
      const exists = await fs.access(result.outputPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }
  });
});