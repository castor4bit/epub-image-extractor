import { organizeByChapters } from '../chapterOrganizer';
import { ImageInfo, ChapterInfo } from '@shared/types';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import AdmZip from 'adm-zip';

describe('chapterOrganizer - ファイル名オプション', () => {
  let tempDir: string;
  let testEpubPath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'filename-options-test-'));
    testEpubPath = path.join(tempDir, 'test.epub');

    // テスト用のEPUBファイルを作成
    const zip = new AdmZip();
    zip.addFile('images/cover.jpg', Buffer.from('fake jpg data'));
    zip.addFile('images/page_001.png', Buffer.from('fake png data'));
    await fs.writeFile(testEpubPath, zip.toBuffer());
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('includeOriginalFilename=falseの場合、元のファイル名を含まない', async () => {
    const images: ImageInfo[] = [
      { src: 'images/cover.jpg', chapterOrder: 1, pageOrder: 1 },
      { src: 'images/page_001.png', chapterOrder: 1, pageOrder: 2 },
    ];

    const navigation: ChapterInfo[] = [{ order: 1, title: '第1章', href: 'chapter1.xhtml' }];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await organizeByChapters(images, navigation, outputDir, testEpubPath, {
      includeOriginalFilename: false,
      includePageSpread: true,
    });

    const chapterDir = path.join(outputDir, '001_第1章');
    const files = await fs.readdir(chapterDir);
    files.sort();

    expect(files).toHaveLength(2);
    expect(files[0]).toBe('0001.jpg');
    expect(files[1]).toBe('0002.png');
  });

  test('includePageSpread=falseの場合、左右情報を含まない', async () => {
    const images: ImageInfo[] = [
      { src: 'images/cover.jpg', chapterOrder: 1, pageOrder: 1, pageSpread: 'left' },
      { src: 'images/page_001.png', chapterOrder: 1, pageOrder: 2, pageSpread: 'right' },
    ];

    const navigation: ChapterInfo[] = [{ order: 1, title: '第1章', href: 'chapter1.xhtml' }];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await organizeByChapters(images, navigation, outputDir, testEpubPath, {
      includeOriginalFilename: true,
      includePageSpread: false,
    });

    const chapterDir = path.join(outputDir, '001_第1章');
    const files = await fs.readdir(chapterDir);
    files.sort();

    expect(files).toHaveLength(2);
    expect(files[0]).toBe('0001_cover.jpg');
    expect(files[1]).toBe('0002_page_001.png');
  });

  test('両方のオプションがfalseの場合、連番のみのファイル名', async () => {
    const images: ImageInfo[] = [
      { src: 'images/cover.jpg', chapterOrder: 1, pageOrder: 1, pageSpread: 'left' },
      { src: 'images/page_001.png', chapterOrder: 1, pageOrder: 2, pageSpread: 'right' },
    ];

    const navigation: ChapterInfo[] = [{ order: 1, title: '第1章', href: 'chapter1.xhtml' }];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    await organizeByChapters(images, navigation, outputDir, testEpubPath, {
      includeOriginalFilename: false,
      includePageSpread: false,
    });

    const chapterDir = path.join(outputDir, '001_第1章');
    const files = await fs.readdir(chapterDir);
    files.sort();

    expect(files).toHaveLength(2);
    expect(files[0]).toBe('0001.jpg');
    expect(files[1]).toBe('0002.png');
  });

  test('デフォルトオプション（両方true）の場合、すべての情報を含む', async () => {
    const images: ImageInfo[] = [
      { src: 'images/cover.jpg', chapterOrder: 1, pageOrder: 1, pageSpread: 'left' },
      { src: 'images/page_001.png', chapterOrder: 1, pageOrder: 2, pageSpread: 'right' },
    ];

    const navigation: ChapterInfo[] = [{ order: 1, title: '第1章', href: 'chapter1.xhtml' }];

    const outputDir = path.join(tempDir, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    // デフォルトオプションを使用
    await organizeByChapters(images, navigation, outputDir, testEpubPath);

    const chapterDir = path.join(outputDir, '001_第1章');
    const files = await fs.readdir(chapterDir);
    files.sort();

    expect(files).toHaveLength(2);
    expect(files[0]).toBe('0001_cover-left.jpg');
    expect(files[1]).toBe('0002_page_001-right.png');
  });
});