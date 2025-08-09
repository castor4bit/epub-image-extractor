// electronモックを最初に設定
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/desktop'),
  },
}));

// electron-storeモック
vi.mock('electron-store');

import { processEpubFiles } from '../processor';
import { parseEpub } from '../parser';
import { extractImages } from '../imageExtractor';
import { organizeByChapters } from '../chapterOrganizer';
import { generateOutputPath } from '../../utils/outputPath';
import { settingsStore } from '../../store/settings';
import { AppError, ErrorCode } from '../../../shared/error-types';
import { handleError } from '../../utils/errorHandler';
import path from 'path';
import fs from 'fs/promises';
import { createZipReader } from '../../utils/zip-reader';

// モックの設定
vi.mock('../parser');
vi.mock('../imageExtractor');
vi.mock('../chapterOrganizer');
vi.mock('../../utils/outputPath');
vi.mock('../../store/settings');
vi.mock('fs/promises');
vi.mock('../../utils/errorHandler');

describe('processEpubFiles', () => {
  const mockOnProgress = vi.fn();
  const mockOutputDir = '/test/output';

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック実装
    (settingsStore.get as jest.Mock).mockReturnValue({
      includeOriginalFilename: true,
      includePageSpread: true,
    });

    (generateOutputPath as jest.Mock).mockImplementation((outputDir, filename) => ({
      path: path.join(outputDir, filename),
      isNew: true,
      warning: null,
    }));

    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

    // handleErrorのモック
    (handleError as jest.Mock).mockImplementation((error, _context) => {
      if (error instanceof AppError) {
        return error.userMessage;
      }
      return error?.message || '不明なエラー';
    });
  });

  describe('正常系', () => {
    test('単一のEPUBファイルを処理できること', async () => {
      const filePaths = ['/test/book1.epub'];

      (parseEpub as jest.Mock).mockResolvedValue({
        manifest: {},
        spine: [],
        navigation: [],
        basePath: filePaths[0],
        contentPath: 'OEBPS',
        parser: createZipReader(),
      });

      (extractImages as jest.Mock).mockResolvedValue([
        { src: 'image1.jpg', chapterOrder: 1, pageOrder: 0 },
      ]);

      (organizeByChapters as jest.Mock).mockResolvedValue(1);

      const results = await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        fileName: 'book1.epub',
        totalImages: 1,
        chapters: 1,
        errors: [],
      });

      // 進捗コールバックの確認
      expect(mockOnProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'book1.epub',
          status: 'pending',
        }),
      );
      expect(mockOnProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'book1.epub',
          status: 'processing',
        }),
      );
      expect(mockOnProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: 'book1.epub',
          status: 'completed',
        }),
      );
    });

    test('複数のEPUBファイルを並列処理できること', async () => {
      const filePaths = ['/test/book1.epub', '/test/book2.epub', '/test/book3.epub'];

      (parseEpub as jest.Mock).mockResolvedValue({
        manifest: {},
        spine: [],
        navigation: [],
        basePath: '',
        contentPath: 'OEBPS',
        parser: createZipReader(),
      });

      (extractImages as jest.Mock).mockResolvedValue([
        { src: 'image1.jpg', chapterOrder: 1, pageOrder: 0 },
      ]);

      (organizeByChapters as jest.Mock).mockResolvedValue(1);

      const results = await processEpubFiles(filePaths, mockOutputDir, mockOnProgress, 2);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.errors.length === 0)).toBe(true);

      // 各ファイルの処理が呼ばれたことを確認
      expect(parseEpub).toHaveBeenCalledTimes(3);
      expect(extractImages).toHaveBeenCalledTimes(3);
      expect(organizeByChapters).toHaveBeenCalledTimes(3);
    });

    test('画像がないEPUBを処理できること', async () => {
      const filePaths = ['/test/no-images.epub'];

      (parseEpub as jest.Mock).mockResolvedValue({
        manifest: {},
        spine: [],
        navigation: [],
        basePath: filePaths[0],
        contentPath: 'OEBPS',
        parser: createZipReader(),
      });

      (extractImages as jest.Mock).mockResolvedValue([]);
      (organizeByChapters as jest.Mock).mockResolvedValue(0);

      const results = await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      expect(results[0]).toMatchObject({
        totalImages: 0,
        chapters: 0,
        errors: [],
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('EPUBパースエラーを適切に処理すること', async () => {
      const filePaths = ['/test/invalid.epub'];

      (parseEpub as jest.Mock).mockRejectedValue(
        new AppError(
          ErrorCode.EPUB_PARSE_ERROR,
          'Invalid EPUB format',
          'EPUBファイルの解析に失敗しました',
        ),
      );

      const results = await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      expect(results[0]).toMatchObject({
        fileName: 'invalid.epub',
        errors: expect.arrayContaining([
          expect.stringContaining('EPUBファイルの解析に失敗しました'),
        ]),
      });

      expect(mockOnProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          error: expect.stringContaining('EPUBファイルの解析に失敗しました'),
        }),
      );
    });

    test('画像抽出エラーを適切に処理すること', async () => {
      const filePaths = ['/test/book.epub'];

      (parseEpub as jest.Mock).mockResolvedValue({
        manifest: {},
        spine: [],
        navigation: [],
        basePath: filePaths[0],
        contentPath: 'OEBPS',
        parser: createZipReader(),
      });

      (extractImages as jest.Mock).mockRejectedValue(
        new AppError(
          ErrorCode.IMAGE_EXTRACTION_ERROR,
          'Failed to extract images',
          '画像の抽出に失敗しました',
        ),
      );

      const results = await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      expect(results[0]).toMatchObject({
        errors: expect.arrayContaining([expect.stringContaining('画像の抽出に失敗しました')]),
      });
    });

    test('一部のファイルが失敗しても他は処理を継続すること', async () => {
      const filePaths = ['/test/valid.epub', '/test/invalid.epub', '/test/valid2.epub'];

      (parseEpub as jest.Mock)
        .mockResolvedValueOnce({
          manifest: {},
          spine: [],
          navigation: [],
          basePath: filePaths[0],
          contentPath: 'OEBPS',
          parser: createZipReader(),
        })
        .mockRejectedValueOnce(
          new AppError(ErrorCode.EPUB_PARSE_ERROR, 'Invalid format', 'フォーマットエラー'),
        )
        .mockResolvedValueOnce({
          manifest: {},
          spine: [],
          navigation: [],
          basePath: filePaths[2],
          contentPath: 'OEBPS',
          parser: createZipReader(),
        });

      (extractImages as jest.Mock).mockResolvedValue([]);
      (organizeByChapters as jest.Mock).mockResolvedValue(0);

      const results = await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      expect(results).toHaveLength(3);
      expect(results[0].errors).toEqual([]);
      expect(results[1].errors.length).toBeGreaterThan(0);
      expect(results[2].errors).toEqual([]);
    });
  });

  describe('進捗管理', () => {
    test('画像処理の進捗を正しく報告すること', async () => {
      const filePaths = ['/test/book.epub'];
      const images = [
        { src: 'image1.jpg', chapterOrder: 1, pageOrder: 0 },
        { src: 'image2.jpg', chapterOrder: 1, pageOrder: 1 },
        { src: 'image3.jpg', chapterOrder: 2, pageOrder: 0 },
      ];

      (parseEpub as jest.Mock).mockResolvedValue({
        manifest: {},
        spine: [],
        navigation: [],
        basePath: filePaths[0],
        contentPath: 'OEBPS',
        parser: createZipReader(),
      });

      (extractImages as jest.Mock).mockImplementation(async (_epubData, onProgress) => {
        // 進捗を報告
        if (onProgress) {
          onProgress(1, 3);
          onProgress(2, 3);
          onProgress(3, 3);
        }
        return images;
      });

      (organizeByChapters as jest.Mock).mockResolvedValue(2);

      await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      // 進捗が報告されたことを確認
      expect(mockOnProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          totalImages: 3,
          processedImages: 1,
        }),
      );
      expect(mockOnProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          totalImages: 3,
          processedImages: 2,
        }),
      );
      expect(mockOnProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          totalImages: 3,
          processedImages: 3,
        }),
      );
    });

    test('fileIdが一意であることを確認', async () => {
      const filePaths = ['/test/book1.epub', '/test/book2.epub'];

      (parseEpub as jest.Mock).mockResolvedValue({
        manifest: {},
        spine: [],
        navigation: [],
        basePath: '',
        contentPath: 'OEBPS',
        parser: createZipReader(),
      });

      (extractImages as jest.Mock).mockResolvedValue([]);
      (organizeByChapters as jest.Mock).mockResolvedValue(0);

      const fileIds = new Set<string>();
      mockOnProgress.mockImplementation((progress) => {
        if (progress.fileId) {
          fileIds.add(progress.fileId);
        }
      });

      await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      // 2つの異なるfileIdが生成されたことを確認
      expect(fileIds.size).toBe(2);
    });
  });

  describe('設定の適用', () => {
    test('ファイル名オプションが正しく渡されること', async () => {
      const filePaths = ['/test/book.epub'];

      (settingsStore.get as jest.Mock).mockReturnValue({
        includeOriginalFilename: false,
        includePageSpread: true,
      });

      (parseEpub as jest.Mock).mockResolvedValue({
        manifest: {},
        spine: [],
        navigation: [],
        basePath: filePaths[0],
        contentPath: 'OEBPS',
        parser: createZipReader(),
      });

      (extractImages as jest.Mock).mockResolvedValue([
        { src: 'image1.jpg', chapterOrder: 1, pageOrder: 0 },
      ]);

      (organizeByChapters as jest.Mock).mockResolvedValue(1);

      await processEpubFiles(filePaths, mockOutputDir, mockOnProgress);

      expect(organizeByChapters).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          includeOriginalFilename: false,
          includePageSpread: true,
        }),
      );
    });
  });
});
