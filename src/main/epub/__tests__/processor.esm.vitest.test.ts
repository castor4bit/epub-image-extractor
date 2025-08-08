import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ProcessingProgress } from '@shared/types';

describe('Processor ESM Compatibility', () => {
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

  describe('p-limit usage', () => {
    test('should handle p-limit v6 with dynamic import', async () => {
      // Mock p-limit
      vi.doMock('p-limit', () => {
        return {
          default: vi.fn((concurrency: number) => {
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
      vi.doMock('p-limit', () => {
        return {
          default: vi.fn((concurrency: number) => {
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
      vi.doMock('../parser', () => ({
        parseEpub: vi.fn().mockResolvedValue({
          images: [{ href: 'image1.jpg', mediaType: 'image/jpeg' }],
          navigation: [],
          metadata: { title: 'Test Book' },
          basePath: '/',
        })
      }));

      vi.doMock('../imageExtractor', () => ({
        extractImages: vi.fn().mockResolvedValue([
          { path: '/output/image1.jpg', originalPath: 'image1.jpg', pageSpread: null }
        ])
      }));

      vi.doMock('../chapterOrganizer', () => ({
        organizeByChapters: vi.fn().mockResolvedValue(1)
      }));

      vi.doMock('../utils/outputPath', () => ({
        generateOutputPath: vi.fn().mockReturnValue({
          path: '/output/test',
          created: true
        })
      }));

      vi.doMock('../store/settings', () => ({
        settingsStore: {
          get: vi.fn().mockReturnValue({
            includeOriginalFilename: false,
            includePageSpread: false
          })
        }
      }));

      vi.doMock('../utils/testMode', () => ({
        addE2EDelayByType: vi.fn().mockResolvedValue(undefined)
      }));

      vi.doMock('fs/promises', () => ({
        mkdir: vi.fn().mockResolvedValue(undefined),
        rm: vi.fn().mockResolvedValue(undefined)
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