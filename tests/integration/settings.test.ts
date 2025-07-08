import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import Store from 'electron-store';

// electron-storeのモック
jest.mock('electron-store');
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn((name: string) => {
      if (name === 'desktop') return '/mock/desktop';
      if (name === 'userData') return '/mock/userData';
      if (name === 'temp') return '/mock/temp';
      return '/mock/path';
    })
  }
}));

describe('設定ストア統合テスト', () => {
  let settingsStore: any;
  
  beforeEach(async () => {
    // electron-storeのモックをリセット
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('設定の読み書き', () => {
    test('デフォルト設定を取得できる', async () => {
      const mockStore = {
        get: jest.fn((key: string) => {
          const defaults = {
            outputDirectory: path.join('/mock/desktop', 'EPUB_Images'),
            language: 'ja',
            alwaysOnTop: true,
            includeOriginalFilename: true,
            includePageSpread: true
          };
          return (defaults as any)[key];
        }),
        set: jest.fn(),
        clear: jest.fn()
      };
      
      (Store as any).mockImplementation(() => mockStore);
      
      const { settingsStore } = await import('../../src/main/store/settings');
      const settings = settingsStore.get();
      
      expect(settings).toEqual({
        outputDirectory: path.join('/mock/desktop', 'EPUB_Images'),
        language: 'ja',
        alwaysOnTop: true,
        includeOriginalFilename: true,
        includePageSpread: true
      });
    });

    test('設定を更新できる', async () => {
      const mockSet = jest.fn();
      const mockStore = {
        get: jest.fn(),
        set: mockSet,
        clear: jest.fn()
      };
      
      (Store as any).mockImplementation(() => mockStore);
      
      const { settingsStore } = await import('../../src/main/store/settings');
      settingsStore.set({
        outputDirectory: '/custom/path',
        language: 'en'
      });
      
      expect(mockSet).toHaveBeenCalledWith('outputDirectory', '/custom/path');
      expect(mockSet).toHaveBeenCalledWith('language', 'en');
    });

    test('出力ディレクトリを個別に設定できる', async () => {
      const mockSet = jest.fn();
      const mockStore = {
        get: jest.fn(),
        set: mockSet,
        clear: jest.fn()
      };
      
      (Store as any).mockImplementation(() => mockStore);
      
      const { settingsStore } = await import('../../src/main/store/settings');
      settingsStore.setOutputDirectory('/new/output/dir');
      
      expect(mockSet).toHaveBeenCalledWith('outputDirectory', '/new/output/dir');
    });

    test('設定をリセットできる', async () => {
      const mockClear = jest.fn();
      const mockStore = {
        get: jest.fn(),
        set: jest.fn(),
        clear: mockClear
      };
      
      (Store as any).mockImplementation(() => mockStore);
      
      const { settingsStore } = await import('../../src/main/store/settings');
      settingsStore.resetToDefaults();
      
      expect(mockClear).toHaveBeenCalled();
    });
  });

});

describe('ZIPハンドラー統合テスト', () => {
  const TEST_DIR = path.join(__dirname, '../temp/zip-test');
  
  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
  });
  
  afterEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (error) {
      // クリーンアップエラーは無視
    }
  });
  
  test('ZIPファイル判定が正しく動作する', async () => {
    const { isZipFile } = await import('../../src/main/utils/zipHandler');
    
    expect(isZipFile('test.zip')).toBe(true);
    expect(isZipFile('test.ZIP')).toBe(true);
    expect(isZipFile('test.epub')).toBe(false);
    expect(isZipFile('test.txt')).toBe(false);
  });
  
  test('一時ファイルのクリーンアップが動作する', async () => {
    const { cleanupTempFiles } = await import('../../src/main/utils/zipHandler');
    
    // テスト用の一時ファイルを作成
    const tempFile = path.join(TEST_DIR, 'temp.epub');
    await fs.writeFile(tempFile, Buffer.from('test'));
    
    // ファイルが存在することを確認
    expect(await fileExists(tempFile)).toBe(true);
    
    // クリーンアップ実行（実際のtempディレクトリでないため削除されない）
    await cleanupTempFiles([tempFile]);
    
    // モックされたtempパスでないため、ファイルは残る
    expect(await fileExists(tempFile)).toBe(true);
  });
});

// ヘルパー関数
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}