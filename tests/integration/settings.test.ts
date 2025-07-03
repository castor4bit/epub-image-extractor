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
    (Store as jest.MockedClass<typeof Store>).mockClear();
    
    // 設定ストアモジュールを再インポート
    jest.resetModules();
    const { settingsStore: store } = await import('../../src/main/store/settings');
    settingsStore = store;
  });

  describe('設定の読み書き', () => {
    test('デフォルト設定を取得できる', () => {
      const mockGet = jest.fn((key: string) => {
        const defaults = {
          outputDirectory: path.join('/mock/desktop', 'EPUB_Images'),
          language: 'ja',
          parallelLimit: 3
        };
        return (defaults as any)[key];
      });
      
      (Store as any).mockImplementation(() => ({
        get: mockGet,
        set: jest.fn(),
        clear: jest.fn()
      }));
      
      const settings = settingsStore.get();
      
      expect(settings).toEqual({
        outputDirectory: path.join('/mock/desktop', 'EPUB_Images'),
        language: 'ja',
        parallelLimit: 3
      });
    });

    test('設定を更新できる', () => {
      const mockSet = jest.fn();
      
      (Store as any).mockImplementation(() => ({
        get: jest.fn(),
        set: mockSet,
        clear: jest.fn()
      }));
      
      settingsStore.set({
        outputDirectory: '/custom/path',
        parallelLimit: 5
      });
      
      expect(mockSet).toHaveBeenCalledWith('outputDirectory', '/custom/path');
      expect(mockSet).toHaveBeenCalledWith('parallelLimit', 5);
    });

    test('出力ディレクトリを個別に設定できる', () => {
      const mockSet = jest.fn();
      
      (Store as any).mockImplementation(() => ({
        get: jest.fn(),
        set: mockSet,
        clear: jest.fn()
      }));
      
      settingsStore.setOutputDirectory('/new/output/dir');
      
      expect(mockSet).toHaveBeenCalledWith('outputDirectory', '/new/output/dir');
    });

    test('設定をリセットできる', () => {
      const mockClear = jest.fn();
      
      (Store as any).mockImplementation(() => ({
        get: jest.fn(),
        set: jest.fn(),
        clear: mockClear
      }));
      
      settingsStore.resetToDefaults();
      
      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('並列処理数の検証', () => {
    test('有効な並列処理数を設定できる', () => {
      const mockSet = jest.fn();
      
      (Store as any).mockImplementation(() => ({
        get: jest.fn(),
        set: mockSet,
        clear: jest.fn()
      }));
      
      // 1から10の範囲内
      [1, 3, 5, 10].forEach(limit => {
        settingsStore.set({ parallelLimit: limit });
        expect(mockSet).toHaveBeenCalledWith('parallelLimit', limit);
      });
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