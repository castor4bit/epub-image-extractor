// electronモックを最初に設定
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
  },
  app: {
    getPath: vi.fn((type: string) => {
      if (type === 'temp') {
        return require('os').tmpdir();
      }
      return '/mock/desktop';
    }),
  },
  shell: {
    openPath: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// electron-storeモック
vi.mock('electron-store');

import { ipcMain, dialog, app, shell } from 'electron';
import { registerIpcHandlers } from '../handlers';
import { processEpubFiles } from '../../epub/processor';
import { settingsStore } from '../../store/settings';
import { extractEpubsFromZip, cleanupTempFiles, isZipFile } from '../../utils/zipHandler';
import fs from 'fs/promises';

vi.mock('../../epub/processor');
vi.mock('../../store/settings');
vi.mock('../../utils/zipHandler');
vi.mock('fs/promises');

describe('IPC Handlers', () => {
  let mockMainWindow: {
    webContents: {
      send: jest.Mock;
    };
    setAlwaysOnTop: jest.Mock;
  };
  let handlers: Map<string, (...args: unknown[]) => unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // ipcMain.handleのモック実装
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      },
    );

    // BrowserWindowのモック
    mockMainWindow = {
      webContents: {
        send: vi.fn(),
      },
      setAlwaysOnTop: vi.fn(),
    };

    // デフォルトのモック実装
    (app.getPath as ReturnType<typeof vi.fn>).mockReturnValue('/mock/desktop');
    (fs.mkdir as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (settingsStore.getOutputDirectory as ReturnType<typeof vi.fn>).mockReturnValue('/mock/output');
    (settingsStore.get as ReturnType<typeof vi.fn>).mockReturnValue({
      outputDirectory: '/mock/output',
      language: 'ja',
      alwaysOnTop: true,
    });
    (settingsStore.update as ReturnType<typeof vi.fn>).mockImplementation(() => {});

    // ハンドラーを登録
    registerIpcHandlers(mockMainWindow);
  });

  describe('dialog:selectDirectory', () => {
    test('ディレクトリが選択された場合、パスを返すこと', async () => {
      (dialog.showOpenDialog as ReturnType<typeof vi.fn>).mockResolvedValue({
        canceled: false,
        filePaths: ['/selected/directory'],
      });

      const handler = handlers.get('dialog:selectDirectory');
      const result = await handler();

      expect(result).toBe('/selected/directory');
      expect(dialog.showOpenDialog).toHaveBeenCalledWith(mockMainWindow, {
        properties: ['openDirectory', 'createDirectory'],
        defaultPath: '/mock/desktop',
        title: '出力先フォルダを選択',
      });
    });

    test('キャンセルされた場合、nullを返すこと', async () => {
      (dialog.showOpenDialog as ReturnType<typeof vi.fn>).mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const handler = handlers.get('dialog:selectDirectory');
      const result = await handler();

      expect(result).toBeNull();
    });
  });

  describe('epub:process', () => {
    test('EPUBファイルを正常に処理できること', async () => {
      const filePaths = ['/test/book1.epub', '/test/book2.epub'];
      const mockResults = [
        { fileName: 'book1.epub', status: 'completed', imageCount: 5 },
        { fileName: 'book2.epub', status: 'completed', imageCount: 3 },
      ];

      (isZipFile as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (processEpubFiles as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);
      (cleanupTempFiles as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // fs.statをモック - EPUBファイルとして認識させる
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        isDirectory: () => false,
      });

      const handler = handlers.get('epub:process');
      const result = await handler(null, filePaths);

      expect(result).toEqual({
        success: true,
        results: mockResults,
      });

      expect(fs.mkdir).toHaveBeenCalledWith('/mock/output', { recursive: true });
      expect(processEpubFiles).toHaveBeenCalledWith(
        filePaths,
        '/mock/output',
        expect.any(Function),
        3,
      );
    });

    test('ZIPファイルからEPUBを抽出して処理できること', async () => {
      const filePaths = ['/test/archive.zip'];
      const extractedEpubs = ['/tmp/book1.epub', '/tmp/book2.epub'];
      const mockResults = [
        { fileName: 'book1.epub', status: 'completed', imageCount: 5 },
        { fileName: 'book2.epub', status: 'completed', imageCount: 3 },
      ];

      (isZipFile as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (extractEpubsFromZip as ReturnType<typeof vi.fn>).mockResolvedValue(extractedEpubs);
      (processEpubFiles as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);
      (cleanupTempFiles as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // fs.statをモック - ZIPファイルとして認識させる
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        isDirectory: () => false,
      });

      const handler = handlers.get('epub:process');
      const result = await handler(null, filePaths);

      expect(result).toEqual({
        success: true,
        results: mockResults,
      });

      expect(extractEpubsFromZip).toHaveBeenCalledWith('/test/archive.zip');
      expect(processEpubFiles).toHaveBeenCalledWith(
        extractedEpubs,
        '/mock/output',
        expect.any(Function),
        3,
      );
      expect(cleanupTempFiles).toHaveBeenCalledWith(extractedEpubs);
    });

    test('ZIP展開エラーを適切に処理すること', async () => {
      const filePaths = ['/test/invalid.zip', '/test/valid.epub'];

      (isZipFile as ReturnType<typeof vi.fn>).mockImplementation((path) => path.endsWith('.zip'));
      (extractEpubsFromZip as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('ZIPファイルの展開に失敗しました'),
      );
      (processEpubFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
        { fileName: 'valid.epub', status: 'completed', imageCount: 5 },
      ]);
      (cleanupTempFiles as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // fs.statをモック
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        isDirectory: () => false,
      });

      const handler = handlers.get('epub:process');
      const result = await handler(null, filePaths);

      expect(result).toEqual({
        success: true,
        results: [{ fileName: 'valid.epub', status: 'completed', imageCount: 5 }],
      });

      // ZIPエラーが進捗として送信されたことを確認
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        'epub:progress',
        expect.objectContaining({
          fileName: 'invalid.zip',
          status: 'error',
          error: 'ZIPファイルの展開に失敗しました',
        }),
      );

      // 有効なEPUBは処理されたことを確認
      expect(processEpubFiles).toHaveBeenCalledWith(
        ['/test/valid.epub'],
        '/mock/output',
        expect.any(Function),
        3,
      );
    });

    test('進捗更新が正しく送信されること', async () => {
      const filePaths = ['/test/book.epub'];

      (isZipFile as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (processEpubFiles as ReturnType<typeof vi.fn>).mockImplementation(
        async (_files, _output, onProgress) => {
          // 進捗を送信
          onProgress({
            fileId: 'file-1',
            fileName: 'book.epub',
            totalImages: 10,
            processedImages: 5,
            status: 'processing',
          });
          return [{ fileName: 'book.epub', status: 'completed', imageCount: 10 }];
        },
      );

      // fs.statをモック
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        isDirectory: () => false,
      });

      const handler = handlers.get('epub:process');
      await handler(null, filePaths);

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        'epub:progress',
        expect.objectContaining({
          fileName: 'book.epub',
          status: 'processing',
          processedImages: 5,
        }),
      );
    });

    test('処理エラーを適切に処理すること', async () => {
      const filePaths = ['/test/book.epub'];
      const error = new Error('Processing failed');

      (isZipFile as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (processEpubFiles as ReturnType<typeof vi.fn>).mockRejectedValue(error);
      (cleanupTempFiles as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      // fs.statをモック
      (fs.stat as ReturnType<typeof vi.fn>).mockResolvedValue({
        isDirectory: () => false,
      });

      const handler = handlers.get('epub:process');
      const result = await handler(null, filePaths as unknown);

      expect(result).toEqual({
        success: false,
        error: 'Processing failed',
      });
    });
  });

  describe('settings handlers', () => {
    describe('settings:get', () => {
      test('現在の設定を返すこと', async () => {
        const mockSettings = {
          outputDirectory: '/custom/output',
          language: 'en',
          alwaysOnTop: false,
        };
        (settingsStore.get as ReturnType<typeof vi.fn>).mockReturnValue(mockSettings);

        const handler = handlers.get('settings:get');
        const result = await handler();

        expect(result).toEqual(mockSettings);
      });
    });

    describe('settings:save', () => {
      test('設定を保存できること', async () => {
        const newSettings = {
          outputDirectory: '/new/output',
          alwaysOnTop: false,
        };

        const handler = handlers.get('settings:save');
        const result = await handler(null, newSettings);

        expect(result).toEqual({ success: true });
        expect(settingsStore.update).toHaveBeenCalledWith(newSettings);
      });

      test('alwaysOnTop設定が変更された場合、ウィンドウに反映されること', async () => {
        const newSettings = {
          alwaysOnTop: false,
        };

        const handler = handlers.get('settings:save');
        await handler(null, newSettings);

        expect(mockMainWindow.setAlwaysOnTop).toHaveBeenCalledWith(false);
      });

      test('alwaysOnTop設定が未定義の場合、ウィンドウ設定は変更されないこと', async () => {
        const newSettings = {
          outputDirectory: '/new/output',
        };

        const handler = handlers.get('settings:save');
        await handler(null, newSettings);

        expect(mockMainWindow.setAlwaysOnTop).not.toHaveBeenCalled();
      });
    });

    describe('settings:reset', () => {
      test('設定をリセットしてデフォルト値を返すこと', async () => {
        const defaultSettings = {
          outputDirectory: '/default/output',
          language: 'ja',
          alwaysOnTop: true,
        };
        (settingsStore.get as ReturnType<typeof vi.fn>).mockReturnValue(defaultSettings);

        const handler = handlers.get('settings:reset');
        const result = await handler();

        expect(settingsStore.resetToDefaults).toHaveBeenCalled();
        expect(result).toEqual(defaultSettings);
      });
    });
  });

  describe('file:openFolder', () => {
    test('フォルダを開けること', async () => {
      (shell.openPath as ReturnType<typeof vi.fn>).mockResolvedValue('');

      const handler = handlers.get('file:openFolder');
      const result = await handler(null, '/test/folder');

      expect(result).toEqual({ success: true });
      expect(shell.openPath).toHaveBeenCalledWith('/test/folder');
    });

    test('フォルダを開けない場合エラーを返すこと', async () => {
      const error = new Error('Cannot open folder');
      (shell.openPath as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const handler = handlers.get('file:openFolder');
      const result = await handler(null, '/test/folder');

      expect(result).toEqual({
        success: false,
        error: 'Cannot open folder',
      });
    });
  });
});
