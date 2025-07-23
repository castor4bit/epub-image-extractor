import { processEpubFiles } from '../../src/main/epub/processor';
import path from 'path';
import fs from 'fs/promises';
import { zipSync, strToU8 } from 'fflate';

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
    const files1: Record<string, Uint8Array | [Uint8Array, any]> = {};
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    files1['mimetype'] = [strToU8('application/epub+zip'), { level: 0 }];
    files1['META-INF/container.xml'] = strToU8(containerXml);
    
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
    files1['OEBPS/content.opf'] = strToU8(opfXml1);
    files1['OEBPS/page1.xhtml'] = strToU8('<html><body><img src="image1.jpg"/></body></html>');
    files1['OEBPS/image1.jpg'] = strToU8('image from book 1');
    
    const zipped1 = zipSync(files1, { mtime: new Date('2024-01-01') });
    await fs.writeFile(testEpub1, Buffer.from(zipped1));
    
    // テスト用EPUB 2を作成（同じファイル名、異なる内容）
    const files2: Record<string, Uint8Array | [Uint8Array, any]> = {};
    files2['mimetype'] = [strToU8('application/epub+zip'), { level: 0 }];
    files2['META-INF/container.xml'] = strToU8(containerXml);
    
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
    files2['OEBPS/content.opf'] = strToU8(opfXml2);
    files2['OEBPS/page1.xhtml'] = strToU8('<html><body><img src="image2.png"/></body></html>');
    files2['OEBPS/image2.png'] = strToU8('image from book 2');
    
    const zipped2 = zipSync(files2, { mtime: new Date('2024-01-01') });
    await fs.writeFile(testEpub2, Buffer.from(zipped2));
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
    
    const files3: Record<string, Uint8Array | [Uint8Array, any]> = {};
    files3['mimetype'] = [strToU8('application/epub+zip'), { level: 0 }];
    files3['META-INF/container.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);
    files3['OEBPS/content.opf'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
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
</package>`);
    files3['OEBPS/page1.xhtml'] = strToU8('<html><body>Book 3</body></html>');
    
    const zipped3 = zipSync(files3, { mtime: new Date('2024-01-01') });
    await fs.writeFile(testEpub3, Buffer.from(zipped3));
    
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