import { organizeByChapters } from '../chapterOrganizer';
import { ImageInfo, ChapterInfo } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import AdmZip from 'adm-zip';

describe('chapterOrganizer - ファイル名命名規則', () => {
  let tempDir: string;
  let testEpubPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'chapter-naming-test-'));
    testEpubPath = path.join(tempDir, 'test.epub');

    // テスト用のEPUBファイルを作成
    const zip = new AdmZip();

    // 様々な名前の画像を追加
    zip.addFile('images/cover.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/page_001.png', Buffer.from('fake png data'));
    zip.addFile('images/illustration-02.webp', Buffer.from('fake webp data'));
    zip.addFile('images/特殊文字を含む画像.jpg', Buffer.from('fake jpg data'));

    await fs.writeFile(testEpubPath, zip.toBuffer());
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('画像ファイル名が4桁連番_元のファイル名.拡張子の形式で保存される', async () => {
    const images: ImageInfo[] = [
      { src: 'images/cover.jpg', chapterOrder: 1, pageOrder: 1 },
      { src: 'images/page_001.png', chapterOrder: 1, pageOrder: 2 },
      { src: 'images/illustration-02.webp', chapterOrder: 1, pageOrder: 3 },
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
    expect(files[0]).toBe('0001_cover.jpg');
    expect(files[1]).toBe('0002_page_001.png');
    expect(files[2]).toBe('0003_illustration-02.webp');
  });

  test('特殊文字を含むファイル名が適切にサニタイズされる', async () => {
    // テスト用のEPUBファイルを再作成
    const zip = new AdmZip();
    zip.addFile('images/特殊文字を含む画像.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/file_with_colons.png', Buffer.from('fake png data'));
    zip.addFile('images/file_with_backslashes.jpg', Buffer.from('fake jpg data'));
    await fs.writeFile(testEpubPath, zip.toBuffer());

    const images: ImageInfo[] = [
      { src: 'images/特殊文字を含む画像.jpg', chapterOrder: 1, pageOrder: 1 },
      { src: 'images/file_with_colons.png', chapterOrder: 1, pageOrder: 2 },
      { src: 'images/file_with_backslashes.jpg', chapterOrder: 1, pageOrder: 3 },
    ];

    const navigation: ChapterInfo[] = [{ order: 1, title: 'テスト章', href: 'test.xhtml' }];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await organizeByChapters(images, navigation, outputDir, testEpubPath, {
      includeOriginalFilename: true,
      includePageSpread: true,
    });

    const chapterDir = path.join(outputDir, '001_テスト章');
    const files = await fs.readdir(chapterDir);
    files.sort();

    // ファイル名が適切にサニタイズされていることを確認
    expect(files).toHaveLength(3);
    expect(files[0]).toBe('0001_特殊文字を含む画像.jpg');
    expect(files[1]).toBe('0002_file_with_colons.png');
    expect(files[2]).toBe('0003_file_with_backslashes.jpg');
  });

  test('複数章にまたがる場合も各章で連番がリセットされる', async () => {
    // テスト用のEPUBファイルを再作成
    const zip = new AdmZip();
    zip.addFile('images/chapter1-img1.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/chapter1-img2.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/chapter2-img1.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/chapter2-img2.jpg', Buffer.from('fake jpg data'));
    await fs.writeFile(testEpubPath, zip.toBuffer());

    const images: ImageInfo[] = [
      { src: 'images/chapter1-img1.jpg', chapterOrder: 1, pageOrder: 1 },
      { src: 'images/chapter1-img2.jpg', chapterOrder: 1, pageOrder: 2 },
      { src: 'images/chapter2-img1.jpg', chapterOrder: 2, pageOrder: 1 },
      { src: 'images/chapter2-img2.jpg', chapterOrder: 2, pageOrder: 2 },
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
    expect(chapter1Files[0]).toBe('0001_chapter1-img1.jpg');
    expect(chapter1Files[1]).toBe('0002_chapter1-img2.jpg');

    // 第2章のファイル
    const chapter2Dir = path.join(outputDir, '002_第2章');
    const chapter2Files = await fs.readdir(chapter2Dir);
    chapter2Files.sort();

    expect(chapter2Files).toHaveLength(2);
    expect(chapter2Files[0]).toBe('0001_chapter2-img1.jpg');
    expect(chapter2Files[1]).toBe('0002_chapter2-img2.jpg');
  });
});
