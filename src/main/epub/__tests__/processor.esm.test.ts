import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { ProcessingProgress } from '@shared/types';

describe('Processor ESM Compatibility', () => {
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

  describe('p-limit usage', () => {
    test('should handle p-limit v6 with dynamic import', async () => {
      // Mock p-limit
      jest.unstable_mockModule('p-limit', () => {
        return {
          default: jest.fn((concurrency: number) => {
            // Return a function that wraps async functions
            return <T>(fn: () => Promise<T>) => fn();
          })
        };
      });

      // Import after mocks are set up
      const { processEpubFiles } = await import('../processor');
      
      expect(processEpubFiles).toBeDefined();
    });

    test('should process EPUB files with p-limit concurrency control', async () => {
      // Mock dependencies
      jest.unstable_mockModule('p-limit', () => {
        return {
          default: jest.fn((concurrency: number) => {
            let activeCount = 0;
            const maxActive = concurrency;
            
            return async <T>(fn: () => Promise<T>): Promise<T> => {
              if (activeCount >= maxActive) {
                await new Promise(resolve => setTimeout(resolve, 10));
              }
              activeCount++;
              try {
                return await fn();
              } finally {
                activeCount--;
              }
            };
          })
        };
      });

      // Mock other dependencies
      jest.unstable_mockModule('../parser', () => ({
        parseEpub: jest.fn().mockResolvedValue({
          images: [{ href: 'image1.jpg', mediaType: 'image/jpeg' }],
          navigation: [],
          metadata: { title: 'Test Book' },
          basePath: '/',
        })
      }));

      jest.unstable_mockModule('../imageExtractor', () => ({
        extractImages: jest.fn().mockResolvedValue([
          { path: '/output/image1.jpg', originalPath: 'image1.jpg', pageSpread: null }
        ])
      }));

      jest.unstable_mockModule('../chapterOrganizer', () => ({
        organizeByChapters: jest.fn().mockResolvedValue(1)
      }));

      jest.unstable_mockModule('../utils/outputPath', () => ({
        generateOutputPath: jest.fn().mockReturnValue({
          path: '/output/test',
          created: true
        })
      }));

      jest.unstable_mockModule('../store/settings', () => ({
        settingsStore: {
          get: jest.fn().mockReturnValue({
            includeOriginalFilename: false,
            includePageSpread: false
          })
        }
      }));

      jest.unstable_mockModule('../utils/testMode', () => ({
        addE2EDelayByType: jest.fn().mockResolvedValue(undefined)
      }));

      jest.unstable_mockModule('fs/promises', () => ({
        mkdir: jest.fn().mockResolvedValue(undefined),
        rm: jest.fn().mockResolvedValue(undefined)
      }));

      const { processEpubFiles } = await import('../processor');
      
      const progressCallback = jest.fn<(progress: ProcessingProgress) => void>();
      const results = await processEpubFiles(
        ['/test.epub'],
        '/output',
        progressCallback,
        2 // parallelLimit
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(progressCallback).toHaveBeenCalled();
    });
  });
});