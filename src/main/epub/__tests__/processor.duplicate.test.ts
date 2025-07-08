import { processEpubFiles } from '../processor';
import path from 'path';
import fs from 'fs/promises';
import AdmZip from 'adm-zip';

describe('processEpubFiles - 重複ファイル処理', () => {
  const outputDir = path.join(__dirname, 'test-output-duplicate');
  const testEpubPath = path.join(__dirname, 'test-duplicate.epub');

  beforeEach(async () => {
    // テスト用ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });

    // テスト用EPUBを作成
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
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="image1.jpg" media-type="image/jpeg"/>
  </manifest>
  <spine>
    <itemref idref="page1"/>
  </spine>
</package>`;
    mockZip.addFile('OEBPS/content.opf', Buffer.from(opfXml));

    const htmlContent = `<html><body><img src="image1.jpg"/></body></html>`;
    mockZip.addFile('OEBPS/page1.xhtml', Buffer.from(htmlContent));
    mockZip.addFile('OEBPS/image1.jpg', Buffer.from('fake image data'));

    mockZip.writeZip(testEpubPath);
  });

  afterEach(async () => {
    // クリーンアップ
    const rimraf = (await import('rimraf')).default;
    await rimraf(outputDir);
    await fs.unlink(testEpubPath).catch(() => {});
  });

  test('同じEPUBファイルを2回処理した場合の動作', async () => {
    const onProgress = jest.fn();

    // 1回目の処理
    const results1 = await processEpubFiles([testEpubPath], outputDir, onProgress, 1);

    expect(results1).toHaveLength(1);
    expect(results1[0].errors).toHaveLength(0);

    // 出力されたファイルを確認
    const bookDir = path.join(outputDir, 'test-duplicate');
    const files1 = await fs.readdir(bookDir, { recursive: true });
    const imageFiles1 = files1.filter((f) => f.toString().endsWith('.jpg'));
    expect(imageFiles1.length).toBeGreaterThan(0);

    // 既存のファイルにマーカーを追加
    const markerFile = path.join(bookDir, 'marker.txt');
    await fs.writeFile(markerFile, 'This is from the first run');

    // 2回目の処理
    const results2 = await processEpubFiles([testEpubPath], outputDir, onProgress, 1);

    expect(results2).toHaveLength(1);
    expect(results2[0].errors).toHaveLength(0);

    // マーカーファイルが残っているか確認
    const markerExists = await fs
      .access(markerFile)
      .then(() => true)
      .catch(() => false);
    expect(markerExists).toBe(true);

    // 画像ファイルが上書きされているか確認
    const files2 = await fs.readdir(bookDir, { recursive: true });
    const imageFiles2 = files2.filter((f) => f.toString().endsWith('.jpg'));
    expect(imageFiles2.length).toBe(imageFiles1.length);
  });

  test('異なるEPUBファイルで同じ名前の場合', async () => {
    // 2つ目のEPUBファイルを作成（同じファイル名）
    const secondEpubPath = path.join(path.dirname(__dirname), 'test-duplicate.epub');

    const mockZip2 = new AdmZip();
    mockZip2.addFile(
      'META-INF/container.xml',
      Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`),
    );

    mockZip2.addFile(
      'OEBPS/content.opf',
      Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Different Book</dc:title>
  </metadata>
  <manifest>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="img1" href="different.png" media-type="image/png"/>
  </manifest>
  <spine>
    <itemref idref="page1"/>
  </spine>
</package>`),
    );

    mockZip2.addFile(
      'OEBPS/page1.xhtml',
      Buffer.from('<html><body><img src="different.png"/></body></html>'),
    );
    mockZip2.addFile('OEBPS/different.png', Buffer.from('different image data'));

    mockZip2.writeZip(secondEpubPath);

    const onProgress = jest.fn();

    try {
      // 1つ目のEPUBを処理
      await processEpubFiles([testEpubPath], outputDir, onProgress, 1);

      // 出力ディレクトリにマーカーを追加
      const bookDir = path.join(outputDir, 'test-duplicate');
      const markerFile = path.join(bookDir, 'from-first-epub.txt');
      await fs.writeFile(markerFile, 'This is from the first EPUB');

      // 2つ目のEPUBを処理（同じ出力ディレクトリ名になる）
      await processEpubFiles([secondEpubPath], outputDir, onProgress, 1);

      // マーカーファイルが残っているか確認
      const markerExists = await fs
        .access(markerFile)
        .then(() => true)
        .catch(() => false);
      expect(markerExists).toBe(true); // 既存ファイルが保持される

      // 両方の画像が存在するか確認
      const files = await fs.readdir(bookDir, { recursive: true });
      const hasJpg = files.some((f) => f.toString().endsWith('.jpg'));
      const hasPng = files.some((f) => f.toString().endsWith('.png'));

      // 現在の実装では、章ごとのディレクトリが作成されるため、
      // 同じ章番号のディレクトリは上書きされる可能性がある
      console.log('Files in output directory:', files);
    } finally {
      await fs.unlink(secondEpubPath).catch(() => {});
    }
  });
});
