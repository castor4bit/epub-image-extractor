import { organizeByChapters } from '../chapterOrganizer';
import { ImageInfo, ChapterInfo } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import AdmZip from 'adm-zip';

describe('chapterOrganizer - page-spread サポート', () => {
  let tempDir: string;
  let testEpubPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-spread-test-'));
    testEpubPath = path.join(tempDir, 'test.epub');

    // テスト用のEPUBファイルを作成
    const zip = new AdmZip();

    // 見開きページの画像を追加
    zip.addFile('images/page1.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/page2.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/page3.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/page4.jpg', Buffer.from('fake jpg data'));

    await fs.writeFile(testEpubPath, zip.toBuffer());
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('pageSpreadがleftの場合、ファイル名に-leftが付加される', async () => {
    const images: ImageInfo[] = [
      { src: 'images/page1.jpg', chapterOrder: 1, pageOrder: 1, pageSpread: 'left' },
      { src: 'images/page2.jpg', chapterOrder: 1, pageOrder: 2, pageSpread: 'right' },
    ];

    const navigation: ChapterInfo[] = [{ order: 1, title: '第1章', href: 'chapter1.xhtml' }];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await organizeByChapters(images, navigation, outputDir, testEpubPath, {
      includeOriginalFilename: true,
      includePageSpread: true,
    });

    // 出力されたファイルを確認
    const chapterDir = path.join(outputDir, '001_第1章');
    const files = await fs.readdir(chapterDir);
    files.sort();

    expect(files).toHaveLength(2);
    expect(files[0]).toBe('0001_page1-left.jpg');
    expect(files[1]).toBe('0002_page2-right.jpg');
  });

  test('pageSpreadが指定されていない場合、サフィックスは付加されない', async () => {
    const images: ImageInfo[] = [
      { src: 'images/page1.jpg', chapterOrder: 1, pageOrder: 1 },
      { src: 'images/page2.jpg', chapterOrder: 1, pageOrder: 2, pageSpread: 'left' },
      { src: 'images/page3.jpg', chapterOrder: 1, pageOrder: 3 },
    ];

    const navigation: ChapterInfo[] = [{ order: 1, title: '第1章', href: 'chapter1.xhtml' }];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await organizeByChapters(images, navigation, outputDir, testEpubPath, {
      includeOriginalFilename: true,
      includePageSpread: true,
    });

    // 出力されたファイルを確認
    const chapterDir = path.join(outputDir, '001_第1章');
    const files = await fs.readdir(chapterDir);
    files.sort();

    expect(files).toHaveLength(3);
    expect(files[0]).toBe('0001_page1.jpg');
    expect(files[1]).toBe('0002_page2-left.jpg');
    expect(files[2]).toBe('0003_page3.jpg');
  });

  test('複数章にまたがる場合も正しくpageSpreadが処理される', async () => {
    const images: ImageInfo[] = [
      { src: 'images/page1.jpg', chapterOrder: 1, pageOrder: 1, pageSpread: 'right' },
      { src: 'images/page2.jpg', chapterOrder: 1, pageOrder: 2, pageSpread: 'left' },
      { src: 'images/page3.jpg', chapterOrder: 2, pageOrder: 1, pageSpread: 'right' },
      { src: 'images/page4.jpg', chapterOrder: 2, pageOrder: 2 },
    ];

    const navigation: ChapterInfo[] = [
      { order: 1, title: '第1章', href: 'chapter1.xhtml' },
      { order: 2, title: '第2章', href: 'chapter2.xhtml' },
    ];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await organizeByChapters(images, navigation, outputDir, testEpubPath, {
      includeOriginalFilename: true,
      includePageSpread: true,
    });

    // 第1章のファイル
    const chapter1Dir = path.join(outputDir, '001_第1章');
    const chapter1Files = await fs.readdir(chapter1Dir);
    chapter1Files.sort();

    expect(chapter1Files).toHaveLength(2);
    expect(chapter1Files[0]).toBe('0001_page1-right.jpg');
    expect(chapter1Files[1]).toBe('0002_page2-left.jpg');

    // 第2章のファイル
    const chapter2Dir = path.join(outputDir, '002_第2章');
    const chapter2Files = await fs.readdir(chapter2Dir);
    chapter2Files.sort();

    expect(chapter2Files).toHaveLength(2);
    expect(chapter2Files[0]).toBe('0001_page3-right.jpg');
    expect(chapter2Files[1]).toBe('0002_page4.jpg');
  });
});
