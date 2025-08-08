import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SettingsStore } from '../settings';

describe('Settings Store ESM Compatibility', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear module cache
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('settingsStore', () => {
    test('should handle electron-store v10 with dynamic import', async () => {
      // Mock electron module
      vi.doMock('electron', () => ({
        app: {
          getPath: vi.fn((path: string) => {
            if (path === 'desktop') return '/mocked/desktop';
            if (path === 'userData') return '/mocked/userData';
            return '/mocked/path';
          }),
          getName: vi.fn(() => 'epub-image-extractor'),
        },
      }));

      // Mock electron-store to simulate ESM module
      vi.doMock('electron-store', () => {
        return {
          default: class MockStore {
            private data: Record<string, any> = {};
            
            constructor(options?: any) {
              // Initialize with defaults if provided
              if (options?.defaults) {
                this.data = { ...options.defaults };
              }
            }
            
            get(key?: string) {
              if (!key) return this.data;
              return this.data[key];
            }
            
            set(key: string, value: any) {
              this.data[key] = value;
            }
            
            clear() {
              this.data = {};
            }
          }
        };
      });

      // Import after mocks are set up
      const { settingsStore } = await import('../settings');
      
      expect(settingsStore).toBeDefined();
      expect(settingsStore.get).toBeDefined();
      expect(settingsStore.set).toBeDefined();
      expect(settingsStore.setOutputDirectory).toBeDefined();
    });

    test('should get and set settings correctly', async () => {
      // Mock modules
      vi.doMock('electron', () => ({
        app: {
          getPath: vi.fn(() => '/mocked/desktop'),
          getName: vi.fn(() => 'epub-image-extractor'),
        },
      }));

      vi.doMock('electron-store', () => {
        return {
          default: class MockStore {
            private data: Record<string, any> = {
              outputDirectory: '/mocked/desktop/EPUB_Images',
              language: 'ja',
              alwaysOnTop: true,
              includeOriginalFilename: true,
              includePageSpread: true,
              inactiveOpacity: 0.85,
              enableMouseHoverOpacity: true,
            };
            
            get(key?: string) {
              if (!key) return this.data;
              return this.data[key];
            }
            
            set(key: string, value: any) {
              this.data[key] = value;
            }
          }
        };
      });

      const { settingsStore } = await import('../settings');
      
      // Test get
      const settings = settingsStore.get();
      expect(settings.language).toBe('ja');
      expect(settings.alwaysOnTop).toBe(true);
      
      // Test set
      settingsStore.set('language', 'en');
      const updatedSettings = settingsStore.get();
      expect(updatedSettings.language).toBe('en');
    });
  });
});