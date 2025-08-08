import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserWindow, ipcMain } from 'electron';
import { registerIpcHandlers } from '../handlers';
import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Electronのappモジュールをモック
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mock/desktop'),
    getVersion: vi.fn().mockReturnValue('1.0.0'),
    getName: vi.fn().mockReturnValue('EPUB Image Extractor'),
  },
  ipcMain: {
    handle: vi.fn(),
    handlers: new Map(),
  },
  BrowserWindow: vi.fn(),
  dialog: {
    showOpenDialog: vi.fn(),
  },
  shell: {
    openPath: vi.fn(),
  },
}));

// electron-storeをモック
vi.mock('electron-store', () => {
  return vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue({
      outputDirectory: '/mock/output',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
    }),
    set: vi.fn(),
    reset: vi.fn(),
  }));
});

// モックの設定
vi.mock('../../store/settings', () => ({
  settingsStore: {
    getOutputDirectory: vi.fn().mockReturnValue('/mock/output'),
    get: vi.fn().mockReturnValue({
      outputDirectory: '/mock/output',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
    }),
    set: vi.fn(),
    resetToDefaults: vi.fn(),
  },
}));
vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));
vi.mock('../../epub/processor');
vi.mock('../../utils/zipHandler');
vi.mock('../../utils/folderScanner');

// fs/promisesをインポート
const actualFs = jest.requireActual('fs/promises');

// fs/promisesの一部をモック
vi.mock('fs/promises', () => {
  const actualFs = jest.requireActual('fs/promises');
  return {
    ...actualFs,
    mkdir: vi.fn().mockImplementation((path, options) => {
      // 実際のファイルシステムで/mockのパスは実際のパスに置き換える
      if (path === '/mock/output') {
        return Promise.resolve();
      }
      return actualFs.mkdir(path, options);
    }),
    stat: vi.fn().mockImplementation(async (filePath) => {
      // handlers.tsのためのモック
      if (filePath.startsWith('/test/') || filePath.startsWith('/mock/')) {
        return Promise.resolve({
          isDirectory: () => filePath.includes('folder') || filePath.includes('dir'),
        });
      }
      // 実際のstatを使用
      try {
        const stats = await actualFs.stat(filePath);
        return stats;
      } catch (error) {
        throw error;
      }
    }),
  };
});

// モックされた関数をインポート
import { processEpubFiles } from '../../epub/processor';
import { isZipFile } from '../../utils/zipHandler';
import { scanMultipleFoldersForEpubs } from '../../utils/folderScanner';

describe('Folder drag & drop handler', () => {
  let mainWindow: BrowserWindow;
  let mockWebContents: any;
  let tempDir: string;

  beforeEach(async () => {
    // 一時ディレクトリを作成
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'epub-handler-test-'));

    // モックの設定
    mockWebContents = {
      send: vi.fn(),
    };

    mainWindow = {
      webContents: mockWebContents,
    } as any;

    // IPCハンドラーをクリア
    (ipcMain as any).handlers = new Map();
    (ipcMain.handle as jest.Mock) = vi.fn((channel, handler) => {
      (ipcMain as any).handlers.set(channel, handler);
    });

    registerIpcHandlers(mainWindow);
  });

  afterEach(async () => {
    // 一時ディレクトリを削除
    await fs.rm(tempDir, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  const getHandler = (channel: string) => {
    return (ipcMain as any).handlers.get(channel);
  };

  describe('epub:process with folders', () => {
    it('フォルダ内のEPUBファイルを処理できる', async () => {
      // テスト用のフォルダ構造を作成
      const subDir = path.join(tempDir, 'books');
      await fs.mkdir(subDir);

      const epubPath1 = path.join(tempDir, 'book1.epub');
      const epubPath2 = path.join(subDir, 'book2.epub');
      await fs.writeFile(epubPath1, 'dummy epub content 1');
      await fs.writeFile(epubPath2, 'dummy epub content 2');

      // モックの設定
      (scanMultipleFoldersForEpubs as jest.Mock).mockResolvedValue([epubPath1, epubPath2]);
      (isZipFile as jest.Mock).mockReturnValue(false);
      (processEpubFiles as jest.Mock).mockImplementation(async (_files, _output, onProgress) => {
        // 進捗をシミュレート
        onProgress({
          fileId: 'file-1',
          fileName: 'book1.epub',
          totalImages: 5,
          processedImages: 5,
          status: 'completed',
        });
        onProgress({
          fileId: 'file-2',
          fileName: 'book2.epub',
          totalImages: 3,
          processedImages: 3,
          status: 'completed',
        });
        return [
          { fileName: 'book1.epub', status: 'completed', imageCount: 5 },
          { fileName: 'book2.epub', status: 'completed', imageCount: 3 },
        ];
      });

      const handler = getHandler('epub:process');
      const result = await handler({}, [tempDir]);

      // 進捗が送信されたことを確認
      expect(mockWebContents.send).toHaveBeenCalledWith(
        'epub:progress',
        expect.objectContaining({
          status: expect.stringMatching(/processing|completed|error/),
        }),
      );
    });

    it('フォルダとファイルの混在を処理できる', async () => {
      const subDir = path.join(tempDir, 'subfolder');
      await fs.mkdir(subDir);

      const epubPath1 = path.join(tempDir, 'direct.epub');
      const epubPath2 = path.join(subDir, 'nested.epub');
      await fs.writeFile(epubPath1, 'dummy epub content 1');
      await fs.writeFile(epubPath2, 'dummy epub content 2');

      // モックの設定
      (scanMultipleFoldersForEpubs as jest.Mock).mockResolvedValue([epubPath2]);
      (isZipFile as jest.Mock).mockReturnValue(false);
      (processEpubFiles as jest.Mock).mockImplementation(async (_files, _output, onProgress) => {
        // 進捗をシミュレート
        onProgress({
          fileId: 'file-1',
          fileName: 'direct.epub',
          totalImages: 3,
          processedImages: 3,
          status: 'completed',
        });
        onProgress({
          fileId: 'file-2',
          fileName: 'nested.epub',
          totalImages: 2,
          processedImages: 2,
          status: 'completed',
        });
        return [
          { fileName: 'direct.epub', status: 'completed', imageCount: 3 },
          { fileName: 'nested.epub', status: 'completed', imageCount: 2 },
        ];
      });

      const handler = getHandler('epub:process');
      const result = await handler({}, [epubPath1, subDir]);

      // 複数の進捗通知が送信されたことを確認
      expect(mockWebContents.send).toHaveBeenCalled();
      expect(mockWebContents.send).toHaveBeenCalledTimes(2);
    });

    it('深いフォルダ構造でも制限内で動作する', async () => {
      // 4階層のフォルダ構造を作成（制限は3階層）
      const level1 = path.join(tempDir, 'level1');
      const level2 = path.join(level1, 'level2');
      const level3 = path.join(level2, 'level3');
      const level4 = path.join(level3, 'level4');

      await fs.mkdir(level4, { recursive: true });

      const book1 = path.join(level1, 'book1.epub');
      const book2 = path.join(level2, 'book2.epub');
      const book3 = path.join(level3, 'book3.epub');
      const book4 = path.join(level4, 'book4.epub');

      await fs.writeFile(book1, 'dummy');
      await fs.writeFile(book2, 'dummy');
      await fs.writeFile(book3, 'dummy');
      await fs.writeFile(book4, 'dummy'); // これは検索されない

      // モックの設定 - 3階層までのファイルを返す
      (scanMultipleFoldersForEpubs as jest.Mock).mockResolvedValue([book1, book2, book3]);
      (isZipFile as jest.Mock).mockReturnValue(false);
      (processEpubFiles as jest.Mock).mockImplementation(async (_files, _output, onProgress) => {
        // 進捗をシミュレート
        onProgress({
          fileId: 'file-1',
          fileName: 'book1.epub',
          totalImages: 2,
          processedImages: 2,
          status: 'completed',
        });
        onProgress({
          fileId: 'file-2',
          fileName: 'book2.epub',
          totalImages: 2,
          processedImages: 2,
          status: 'completed',
        });
        onProgress({
          fileId: 'file-3',
          fileName: 'book3.epub',
          totalImages: 2,
          processedImages: 2,
          status: 'completed',
        });
        return [
          { fileName: 'book1.epub', status: 'completed', imageCount: 2 },
          { fileName: 'book2.epub', status: 'completed', imageCount: 2 },
          { fileName: 'book3.epub', status: 'completed', imageCount: 2 },
        ];
      });

      const handler = getHandler('epub:process');
      const result = await handler({}, [tempDir]);

      // 進捗通知が送信されたことを確認
      expect(mockWebContents.send).toHaveBeenCalled();
      expect(mockWebContents.send).toHaveBeenCalledTimes(3);
      // scanMultipleFoldersForEpubsが3階層制限で呼ばれたことを確認
      expect(scanMultipleFoldersForEpubs).toHaveBeenCalledWith([tempDir], 3);
    });

    it('空のフォルダでもエラーにならない', async () => {
      const emptyDir = path.join(tempDir, 'empty');
      await fs.mkdir(emptyDir);

      // モックの設定 - 空配列を返す
      (scanMultipleFoldersForEpubs as jest.Mock).mockResolvedValue([]);
      (isZipFile as jest.Mock).mockReturnValue(false);
      (processEpubFiles as jest.Mock).mockResolvedValue([]);

      const handler = getHandler('epub:process');
      const result = await handler({}, [emptyDir]);

      // エラーではなく成功結果を返すことを確認
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          results: [],
        }),
      );
    });
  });
});
