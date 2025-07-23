import { extractImages } from '../imageExtractor';
import { EpubData } from '../parser';
import { zipSync, strToU8 } from 'fflate';
import { createZipReader } from '../../utils/zip-reader';
import path from 'path';
import fs from 'fs/promises';

describe('画像抽出のチャプター判定', () => {
  let testEpubPath: string;

  beforeAll(async () => {
    // テスト用EPUBファイルを作成
    testEpubPath = path.join(__dirname, 'test-chapter-mapping.epub');
    const files: Record<string, Uint8Array> = {};

    // コンテナファイル
    files['META-INF/container.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    // OPFファイル
    files['OEBPS/content.opf'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">チャプターマッピングテスト</dc:title>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" properties="nav" media-type="application/xhtml+xml"/>
    <item id="p001" href="p-001.xhtml" media-type="application/xhtml+xml"/>
    <item id="p002" href="p-002.xhtml" media-type="application/xhtml+xml"/>
    <item id="p003" href="p-003.xhtml" media-type="application/xhtml+xml"/>
    <item id="p004" href="p-004.xhtml" media-type="application/xhtml+xml"/>
    <item id="p019" href="p-019.xhtml" media-type="application/xhtml+xml"/>
    <item id="p020" href="p-020.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="images/img001.jpg" media-type="image/jpeg"/>
    <item id="img2" href="images/img002.jpg" media-type="image/jpeg"/>
    <item id="img3" href="images/img003.jpg" media-type="image/jpeg"/>
    <item id="img4" href="images/img004.jpg" media-type="image/jpeg"/>
    <item id="img19" href="images/img019.jpg" media-type="image/jpeg"/>
    <item id="img20" href="images/img020.jpg" media-type="image/jpeg"/>
  </manifest>
  <spine>
    <itemref idref="p001"/>
    <itemref idref="p002"/>
    <itemref idref="p003"/>
    <itemref idref="p004"/>
    <itemref idref="p019"/>
    <itemref idref="p020"/>
  </spine>
</package>`);

    // ナビゲーションドキュメント
    files['OEBPS/nav.xhtml'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>目次</title></head>
<body>
  <nav epub:type="toc">
    <ol>
      <li><a href="p-001.xhtml">表紙</a></li>
      <li><a href="p-003.xhtml">巻頭特集</a></li>
      <li><a href="p-019.xhtml">とりまご</a></li>
    </ol>
  </nav>
</body>
</html>`);

    // 各ページのコンテンツ（画像付き）
    files['OEBPS/p-001.xhtml'] = strToU8(
      `<html><body><img src="images/img001.jpg"/></body></html>`,
    );
    files['OEBPS/p-002.xhtml'] = strToU8(
      `<html><body><img src="images/img002.jpg"/></body></html>`,
    );
    files['OEBPS/p-003.xhtml'] = strToU8(
      `<html><body><img src="images/img003.jpg"/></body></html>`,
    );
    files['OEBPS/p-004.xhtml'] = strToU8(
      `<html><body><img src="images/img004.jpg"/></body></html>`,
    );
    files['OEBPS/p-019.xhtml'] = strToU8(
      `<html><body><img src="images/img019.jpg"/></body></html>`,
    );
    files['OEBPS/p-020.xhtml'] = strToU8(
      `<html><body><img src="images/img020.jpg"/></body></html>`,
    );

    // ダミー画像データ
    const dummyImage = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]); // JPEG header
    files['OEBPS/images/img001.jpg'] = dummyImage;
    files['OEBPS/images/img002.jpg'] = dummyImage;
    files['OEBPS/images/img003.jpg'] = dummyImage;
    files['OEBPS/images/img004.jpg'] = dummyImage;
    files['OEBPS/images/img019.jpg'] = dummyImage;
    files['OEBPS/images/img020.jpg'] = dummyImage;

    const zipped = zipSync(files);
    await fs.writeFile(testEpubPath, Buffer.from(zipped));
  });

  afterAll(async () => {
    await fs.rm(testEpubPath, { force: true }).catch(() => {});
  });

  test('チャプターに基づいて画像が正しく分類される', async () => {
    // ZIPリーダーを作成して開く
    const reader = createZipReader();
    await reader.open(testEpubPath);

    // テスト用のEpubData
    const epubData: EpubData = {
      basePath: testEpubPath,
      contentPath: 'OEBPS',
      title: 'チャプターマッピングテスト',
      manifest: {
        p001: { id: 'p001', href: 'p-001.xhtml', mediaType: 'application/xhtml+xml' },
        p002: { id: 'p002', href: 'p-002.xhtml', mediaType: 'application/xhtml+xml' },
        p003: { id: 'p003', href: 'p-003.xhtml', mediaType: 'application/xhtml+xml' },
        p004: { id: 'p004', href: 'p-004.xhtml', mediaType: 'application/xhtml+xml' },
        p019: { id: 'p019', href: 'p-019.xhtml', mediaType: 'application/xhtml+xml' },
        p020: { id: 'p020', href: 'p-020.xhtml', mediaType: 'application/xhtml+xml' },
      },
      spine: [
        { idref: 'p001', linear: 'yes' },
        { idref: 'p002', linear: 'yes' },
        { idref: 'p003', linear: 'yes' },
        { idref: 'p004', linear: 'yes' },
        { idref: 'p019', linear: 'yes' },
        { idref: 'p020', linear: 'yes' },
      ],
      navigation: [
        { order: 1, title: '表紙', href: 'p-001.xhtml' },
        { order: 2, title: '巻頭特集', href: 'p-003.xhtml' },
        { order: 3, title: 'とりまご', href: 'p-019.xhtml' },
      ],
      parser: reader,
    };

    const images = await extractImages(epubData);

    // 各画像のチャプター番号を確認
    expect(images).toHaveLength(6);

    // p-001, p-002の画像はチャプター1（表紙）
    expect(images[0].src).toContain('img001.jpg');
    expect(images[0].chapterOrder).toBe(1);

    expect(images[1].src).toContain('img002.jpg');
    expect(images[1].chapterOrder).toBe(1);

    // p-003, p-004の画像はチャプター2（巻頭特集）
    expect(images[2].src).toContain('img003.jpg');
    expect(images[2].chapterOrder).toBe(2);

    expect(images[3].src).toContain('img004.jpg');
    expect(images[3].chapterOrder).toBe(2);

    // p-019, p-020の画像はチャプター3（とりまご）
    expect(images[4].src).toContain('img019.jpg');
    expect(images[4].chapterOrder).toBe(3);

    expect(images[5].src).toContain('img020.jpg');
    expect(images[5].chapterOrder).toBe(3);

    // クリーンアップ
    reader.close();
  });

  test('ナビゲーションがない場合はすべてチャプター1に分類', async () => {
    // ZIPリーダーを作成して開く
    const reader = createZipReader();
    await reader.open(testEpubPath);

    const epubDataNoNav: EpubData = {
      basePath: testEpubPath,
      contentPath: 'OEBPS',
      title: 'ナビゲーションなし',
      manifest: {
        p001: { id: 'p001', href: 'p-001.xhtml', mediaType: 'application/xhtml+xml' },
        p002: { id: 'p002', href: 'p-002.xhtml', mediaType: 'application/xhtml+xml' },
      },
      spine: [
        { idref: 'p001', linear: 'yes' },
        { idref: 'p002', linear: 'yes' },
      ],
      navigation: [], // ナビゲーションなし
      parser: reader,
    };

    const images = await extractImages(epubDataNoNav);

    // すべての画像がチャプター1
    expect(images[0].chapterOrder).toBe(1);
    expect(images[1].chapterOrder).toBe(1);

    // クリーンアップ
    reader.close();
  });
});
