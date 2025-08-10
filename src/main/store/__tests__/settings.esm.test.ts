import { describe, test, expect, vi, beforeEach } from 'vitest';

// 静的モックの定義
const mockStoreData: Record<string, any> = {};

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((path: string) => {
      if (path === 'desktop') return '/mocked/desktop';
      if (path === 'userData') return '/mocked/userData';
      return '/mocked/path';
    }),
    getName: vi.fn(() => 'epub-image-extractor'),
  },
}));

vi.mock('electron-store', () => ({
  default: vi.fn().mockImplementation((options?: any) => {
    // Initialize with defaults if provided
    if (options?.defaults) {
      Object.assign(mockStoreData, options.defaults);
    }
    
    return {
      get: vi.fn((key?: string) => {
        if (!key) return mockStoreData;
        return mockStoreData[key];
      }),
      
      set: vi.fn((key: string, value: any) => {
        mockStoreData[key] = value;
      }),
      
      clear: vi.fn(() => {
        Object.keys(mockStoreData).forEach(key => delete mockStoreData[key]);
      }),
      
      reset: vi.fn(() => {
        Object.keys(mockStoreData).forEach(key => delete mockStoreData[key]);
      })
    };
  })
}));

// 通常のインポート（モック済み）
import { settingsStore } from '../settings';

describe('Settings Store ESM Compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // モックデータをリセット
    Object.keys(mockStoreData).forEach(key => delete mockStoreData[key]);
    // デフォルト値を設定
    Object.assign(mockStoreData, {
      outputDirectory: '/mocked/desktop/EPUB_Images',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
      inactiveOpacity: 0.85,
      enableMouseHoverOpacity: true,
    });
  });

  describe('settingsStore', () => {
    test('should handle electron-store v10 with dynamic import', () => {
      expect(settingsStore).toBeDefined();
      expect(settingsStore.get).toBeDefined();
      expect(settingsStore.set).toBeDefined();
      expect(settingsStore.setOutputDirectory).toBeDefined();
    });

    test('should get and set settings correctly', () => {
      // Test get
      const settings = settingsStore.get();
      expect(settings.language).toBe('ja');
      expect(settings.alwaysOnTop).toBe(true);
      expect(settings.includeOriginalFilename).toBe(true);
      
      // Test set
      settingsStore.set('language', 'en');
      const updatedSettings = settingsStore.get();
      expect(updatedSettings.language).toBe('en');
      expect(updatedSettings.alwaysOnTop).toBe(true);
    });

    test('should handle outputDirectory operations', () => {
      // Test getOutputDirectory
      const outputDir = settingsStore.getOutputDirectory();
      expect(outputDir).toBe('/mocked/desktop/EPUB_Images');
      
      // Test setOutputDirectory
      settingsStore.setOutputDirectory('/new/output/path');
      const newOutputDir = settingsStore.getOutputDirectory();
      expect(newOutputDir).toBe('/new/output/path');
    });
  });
});