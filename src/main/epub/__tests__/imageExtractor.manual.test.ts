import { extractImages } from '../imageExtractor';
import { EpubData } from '../parser';
import { IZipReader, ZipEntry } from '../../utils/zip-reader/types';

describe('extractImages - 手動解析実装', () => {
  // モックZIPリーダーの作成
  class MockZipReader implements IZipReader {
    private files: Map<string, Buffer> = new Map();

    addFile(path: string, content: Buffer): void {
      this.files.set(path, content);
    }

    async open(filePath: string): Promise<void> {
      // Mock implementation
    }

    getEntry(path: string): ZipEntry | null {
      if (this.files.has(path)) {
        return {
          name: path,
          isDirectory: false,
          size: this.files.get(path)!.length,
          compressedSize: this.files.get(path)!.length,
        };
      }
      return null;
    }

    getEntries(): ZipEntry[] {
      return Array.from(this.files.keys()).map((path) => ({
        name: path,
        isDirectory: false,
        size: this.files.get(path)!.length,
        compressedSize: this.files.get(path)!.length,
      }));
    }

    readAsText(entry: ZipEntry): string {
      const buffer = this.files.get(entry.name);
      return buffer ? buffer.toString('utf-8') : '';
    }

    readAsBuffer(entry: ZipEntry): Buffer {
      return this.files.get(entry.name) || Buffer.alloc(0);
    }

    async extractTo(entry: ZipEntry, outputPath: string): Promise<void> {
      // Mock implementation
    }

    close(): void {
      // Mock implementation
    }
  }

  // モックデータの作成
  const createMockEpubData = (reader: IZipReader): EpubData => ({
    manifest: {
      page1: {
        id: 'page1',
        href: 'page1.xhtml',
        'media-type': 'application/xhtml+xml',
      },
      img1: {
        id: 'img1',
        href: 'images/image1.jpg',
        'media-type': 'image/jpeg',
      },
    },
    spine: [{ idref: 'page1', linear: 'yes' }],
    navigation: [],
    basePath: '/test/path/test.epub',
    contentPath: 'OEBPS',
    parser: reader,
  });

  describe('画像パス解決', () => {
    test('相対パス（../形式）を正しく解決できること', () => {
      // resolveImagePath関数は内部関数なので、extractImagesの結果で確認
      const mockZip = new MockZipReader();

      // HTMLコンテンツにSVG内の画像を含める
      const htmlContent = `
        <html>
          <body>
            <svg>
              <image xlink:href="../images/cover.jpg"/>
            </svg>
          </body>
        </html>
      `;

      // OEBPS/content/page1.xhtml から ../images/cover.jpg を参照
      mockZip.addFile('OEBPS/content/page1.xhtml', Buffer.from(htmlContent));
      mockZip.addFile('OEBPS/images/cover.jpg', Buffer.from('fake image data'));

      const epubData = createMockEpubData(mockZip);
      epubData.manifest.page1.href = 'content/page1.xhtml'; // hrefを修正

      // extractImagesをテスト
      return extractImages(epubData).then((images) => {
        expect(images.length).toBe(1);
        expect(images[0].src).toBe('OEBPS/images/cover.jpg');
      });
    });

    test('絶対パス（/開始）を正しく解決できること', () => {
      const mockZip = new MockZipReader();

      const htmlContent = `
        <html>
          <body>
            <img src="/images/absolute.jpg"/>
          </body>
        </html>
      `;

      mockZip.addFile('OEBPS/page1.xhtml', Buffer.from(htmlContent));
      mockZip.addFile('images/absolute.jpg', Buffer.from('fake image data'));

      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData).then((images) => {
        expect(images.length).toBe(1);
        expect(images[0].src).toBe('images/absolute.jpg');
      });
    });

    test('同一ディレクトリの相対パスを正しく解決できること', () => {
      const mockZip = new MockZipReader();

      const htmlContent = `
        <html>
          <body>
            <img src="image.png"/>
          </body>
        </html>
      `;

      mockZip.addFile('OEBPS/page1.xhtml', Buffer.from(htmlContent));
      mockZip.addFile('OEBPS/image.png', Buffer.from('fake image data'));

      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData).then((images) => {
        expect(images.length).toBe(1);
        expect(images[0].src).toBe('OEBPS/image.png');
      });
    });
  });

  describe('画像抽出', () => {
    test('img要素から画像を抽出できること', () => {
      const mockZip = new MockZipReader();

      const htmlContent = `
        <html>
          <body>
            <img src="image1.jpg"/>
            <img src="image2.png"/>
          </body>
        </html>
      `;

      mockZip.addFile('OEBPS/page1.xhtml', Buffer.from(htmlContent));

      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData).then((images) => {
        expect(images.length).toBe(2);
        expect(images[0].src).toContain('image1.jpg');
        expect(images[1].src).toContain('image2.png');
      });
    });

    test('SVG内のimage要素から画像を抽出できること', () => {
      const mockZip = new MockZipReader();

      const htmlContent = `
        <html>
          <body>
            <svg>
              <image href="svg-image.jpg"/>
              <image xlink:href="svg-image2.jpg"/>
            </svg>
          </body>
        </html>
      `;

      mockZip.addFile('OEBPS/page1.xhtml', Buffer.from(htmlContent));

      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData).then((images) => {
        expect(images.length).toBe(2);
        expect(images[0].src).toContain('svg-image.jpg');
        expect(images[1].src).toContain('svg-image2.jpg');
      });
    });

    test('CSS背景画像を抽出できること', () => {
      const mockZip = new MockZipReader();

      const htmlContent = `
        <html>
          <body>
            <div style="background-image: url('bg.jpg')"></div>
            <div style="background-image: url(bg2.png)"></div>
          </body>
        </html>
      `;

      mockZip.addFile('OEBPS/page1.xhtml', Buffer.from(htmlContent));

      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData).then((images) => {
        expect(images.length).toBe(2);
        expect(images[0].src).toContain('bg.jpg');
        expect(images[1].src).toContain('bg2.png');
      });
    });

    test('data URLはスキップされること', () => {
      const mockZip = new MockZipReader();

      const htmlContent = `
        <html>
          <body>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANS..."/>
            <img src="normal.jpg"/>
          </body>
        </html>
      `;

      mockZip.addFile('OEBPS/page1.xhtml', Buffer.from(htmlContent));

      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData).then((images) => {
        expect(images.length).toBe(1);
        expect(images[0].src).not.toContain('data:');
        expect(images[0].src).toContain('normal.jpg');
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('エントリーが見つからない場合も処理を継続すること', () => {
      const mockZip = new MockZipReader();

      // page1.xhtmlが存在しない状態でテスト
      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData).then((images) => {
        expect(images).toEqual([]);
      });
    });

    test('進捗コールバックが正しく呼ばれること', () => {
      const mockZip = new MockZipReader();
      const progressCallback = vi.fn();

      mockZip.addFile('OEBPS/page1.xhtml', Buffer.from('<html><body></body></html>'));

      const epubData = createMockEpubData(mockZip);

      return extractImages(epubData, progressCallback).then(() => {
        expect(progressCallback).toHaveBeenCalledWith(1, 1);
      });
    });
  });
});
