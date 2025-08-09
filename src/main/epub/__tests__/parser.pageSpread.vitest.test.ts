import { parseEpub } from '../parser';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { zipSync, strToU8 } from 'fflate';

describe('parseEpub - page-spread プロパティの抽出', () => {
  let tempDir: string;
  let testEpubPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'parser-pagespread-test-'));
    testEpubPath = path.join(tempDir, 'test.epub');
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('itemrefのpropertiesからpage-spread-leftとpage-spread-rightを抽出できる', async () => {
    // page-spreadプロパティを含むEPUBを作成
    const files: Record<string, Uint8Array> = {};

    // container.xml
    files['META-INF/container.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // content.opf with page-spread properties
    files['OEBPS/content.opf'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Book</dc:title>
    <dc:identifier id="uid">test-book-123</dc:identifier>
  </metadata>
  <manifest>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="page2" href="page2.xhtml" media-type="application/xhtml+xml"/>
    <item id="page3" href="page3.xhtml" media-type="application/xhtml+xml"/>
    <item id="page4" href="page4.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="page1" properties="page-spread-left"/>
    <itemref idref="page2" properties="page-spread-right"/>
    <itemref idref="page3"/>
    <itemref idref="page4" properties="page-spread-left rendition:layout-pre-paginated"/>
  </spine>
</package>`);

    // ページファイルを追加
    for (let i = 1; i <= 4; i++) {
      files[`OEBPS/page${i}.xhtml`] = strToU8(`<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Page ${i}</title></head>
<body><p>Page ${i} content</p></body>
</html>`);
    }

    const zipped = zipSync(files);
    await fs.writeFile(testEpubPath, Buffer.from(zipped));

    // EPUBを解析
    const epubData = await parseEpub(testEpubPath);

    // spine情報を確認
    expect(epubData.spine).toHaveLength(4);
    expect(epubData.spine[0].pageSpread).toBe('left');
    expect(epubData.spine[1].pageSpread).toBe('right');
    expect(epubData.spine[2].pageSpread).toBeUndefined();
    expect(epubData.spine[3].pageSpread).toBe('left'); // 複数のpropertiesがあっても正しく抽出
  });

  test('propertiesが存在しない場合はpageSpreadが設定されない', async () => {
    // propertiesなしのEPUBを作成
    const files: Record<string, Uint8Array> = {};

    files['META-INF/container.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    files['OEBPS/content.opf'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Test Book</dc:title>
    <dc:identifier id="uid">test-book-123</dc:identifier>
  </metadata>
  <manifest>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="page2" href="page2.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="page1"/>
    <itemref idref="page2"/>
  </spine>
</package>`);

    // ページファイルを追加
    for (let i = 1; i <= 2; i++) {
      files[`OEBPS/page${i}.xhtml`] = strToU8(`<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>Page ${i}</title></head>
<body><p>Page ${i} content</p></body>
</html>`);
    }

    const zipped = zipSync(files);
    await fs.writeFile(testEpubPath, Buffer.from(zipped));

    // EPUBを解析
    const epubData = await parseEpub(testEpubPath);

    // spine情報を確認
    expect(epubData.spine).toHaveLength(2);
    expect(epubData.spine[0].pageSpread).toBeUndefined();
    expect(epubData.spine[1].pageSpread).toBeUndefined();
  });
});
