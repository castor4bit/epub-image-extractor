import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { SettingsStore } from '../settings';

describe('Settings Store ESM Compatibility', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear module cache
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.resetModules();
  });

  describe('settingsStore', () => {
    test('should handle electron-store v10 with dynamic import', async () => {
      // Mock electron module
      jest.unstable_mockModule('electron', () => ({
        app: {
          getPath: jest.fn((path: string) => {
            if (path === 'desktop') return '/mocked/desktop';
            if (path === 'userData') return '/mocked/userData';
            return '/mocked/path';
          }),
          getName: jest.fn(() => 'epub-image-extractor'),
        },
      }));

      // Mock electron-store to simulate ESM module
      jest.unstable_mockModule('electron-store', () => {
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
      jest.unstable_mockModule('electron', () => ({
        app: {
          getPath: jest.fn(() => '/mocked/desktop'),
          getName: jest.fn(() => 'epub-image-extractor'),
        },
      }));

      jest.unstable_mockModule('electron-store', () => {
        return {
          default: class MockStore {
            private data: Record<string, any> = {
              outputDirectory: '/mocked/desktop/EPUB_Images',
              language: 'ja',
              alwaysOnTop: false,
              includeOriginalFilename: false,
              includePageSpread: false,
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
      expect(settings.alwaysOnTop).toBe(false);
      
      // Test set
      settingsStore.set('language', 'en');
      const updatedSettings = settingsStore.get();
      expect(updatedSettings.language).toBe('en');
    });
  });
});