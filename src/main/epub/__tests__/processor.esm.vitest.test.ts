import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { ProcessingProgress } from '@shared/types';

// 静的モックの定義
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((type: string) => {
      if (type === 'temp') return require('os').tmpdir();
      return '/mock/desktop';
    }),
    getName: vi.fn(() => 'epub-image-extractor'),
  }
}));

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual<typeof import('fs/promises')>('fs/promises');
  return {
    ...actual,
    default: actual,
    mkdir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(Buffer.from('')),
    writeFile: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('p-limit', () => ({
  default: vi.fn((concurrency: number) => {
    // シンプルな並列制御シミュレーション
    return <T>(fn: () => Promise<T>) => fn();
  })
}));

vi.mock('../parser', () => ({
  parseEpub: vi.fn()
}));

vi.mock('../imageExtractor', () => ({
  extractImages: vi.fn()
}));

vi.mock('../chapterOrganizer', () => ({
  organizeByChapters: vi.fn()
}));

vi.mock('../../utils/outputPath', () => ({
  generateOutputPath: vi.fn()
}));

vi.mock('../../store/settings', () => ({
  settingsStore: {
    get: vi.fn(),
    waitForInit: vi.fn().mockResolvedValue(undefined)
  }
}));

// 通常のインポート（モック済み）
import { processEpubFiles } from '../processor';
import { parseEpub } from '../parser';
import { extractImages } from '../imageExtractor';
import { organizeByChapters } from '../chapterOrganizer';
import { generateOutputPath } from '../../utils/outputPath';
import { settingsStore } from '../../store/settings';
import pLimit from 'p-limit';

describe('Processor with p-limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // デフォルトのモック動作を設定
    vi.mocked(parseEpub).mockResolvedValue({
      images: [
        { href: 'image1.jpg', mediaType: 'image/jpeg' },
        { href: 'image2.jpg', mediaType: 'image/jpeg' }
      ],
      navigation: [{ title: 'Chapter 1', href: 'ch1.xhtml', order: 0 }],
      metadata: { title: 'Test Book' },
      basePath: '/',
    });
    
    vi.mocked(extractImages).mockResolvedValue([
      { 
        src: 'image1.jpg',
        path: '/output/image1.jpg',
        originalPath: 'image1.jpg',
        pageSpread: null,
        chapterOrder: 0,
        pageOrder: 0
      },
      {
        src: 'image2.jpg',
        path: '/output/image2.jpg',
        originalPath: 'image2.jpg',
        pageSpread: null,
        chapterOrder: 0,
        pageOrder: 1
      }
    ]);
    
    vi.mocked(organizeByChapters).mockResolvedValue(1);
    
    vi.mocked(generateOutputPath).mockReturnValue({
      path: '/output/test',
      created: true
    });
    
    vi.mocked(settingsStore.get).mockReturnValue({
      outputDirectory: '/output',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
      inactiveOpacity: 0.85,
      enableMouseHoverOpacity: true
    });
  });

  describe('並列処理制御', () => {
    test('processEpubFilesが定義されている', () => {
      expect(processEpubFiles).toBeDefined();
    });

    test('should process EPUB files with p-limit concurrency control', async () => {
      const progressCallback = vi.fn<(progress: ProcessingProgress) => void>();
      
      const results = await processEpubFiles(
        ['/test.epub'],
        '/output',
        progressCallback,
        2 // parallelLimit
      );
      
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        fileName: 'test.epub',
        totalImages: 2,
        errors: []
      });
      
      // モック関数が正しく呼ばれたことを確認
      expect(parseEpub).toHaveBeenCalledWith('/test.epub');
      expect(extractImages).toHaveBeenCalled();
      expect(organizeByChapters).toHaveBeenCalled();
      expect(generateOutputPath).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalled();
    });

    test('並列制限が機能することを確認', async () => {
      const files = ['/test1.epub', '/test2.epub', '/test3.epub'];
      const progressCallback = vi.fn<(progress: ProcessingProgress) => void>();
      
      const results = await processEpubFiles(
        files,
        '/output',
        progressCallback,
        2 // 並列数を2に制限
      );
      
      expect(results).toHaveLength(3);
      expect(pLimit).toHaveBeenCalledWith(2);
      
      // 各ファイルが処理されたことを確認
      results.forEach((result, index) => {
        expect(result.fileName).toBe(files[index].replace(/^.*\//, ''));
        expect(result.errors).toEqual([]);
      });
    });
  });
});