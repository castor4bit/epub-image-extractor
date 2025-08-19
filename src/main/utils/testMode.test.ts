import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { isTestMode, E2E_DELAYS, addE2EDelay, addE2EDelayByType } from './testMode';

describe('Test Mode Utils', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    // Restore real timers
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('isTestMode', () => {
    test('should return true when NODE_ENV is "test"', () => {
      process.env.NODE_ENV = 'test';
      expect(isTestMode()).toBe(true);
    });

    test('should return false when NODE_ENV is not "test"', () => {
      process.env.NODE_ENV = 'production';
      expect(isTestMode()).toBe(false);
    });

    test('should return false when NODE_ENV is undefined', () => {
      delete process.env.NODE_ENV;
      expect(isTestMode()).toBe(false);
    });

    test('should return false when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';
      expect(isTestMode()).toBe(false);
    });
  });

  describe('E2E_DELAYS', () => {
    test('should have all expected delay constants', () => {
      expect(E2E_DELAYS.FILE_PROCESSING_START).toBe(300);
      expect(E2E_DELAYS.IMAGE_PROCESSING).toBe(10);
      expect(E2E_DELAYS.CHAPTER_PROCESSING).toBe(30);
      expect(E2E_DELAYS.FILE_PROCESSING_END).toBe(30);
    });

    test('should be readonly object', () => {
      // TypeScript's const assertion ensures compile-time immutability
      // Runtime check for object structure
      expect(typeof E2E_DELAYS).toBe('object');
      expect(Object.keys(E2E_DELAYS)).toHaveLength(4);
    });
  });

  describe('addE2EDelay', () => {
    test('should add delay when test mode is enabled', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const delayPromise = addE2EDelay(100);

      // Verify setTimeout was called
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Wait for promise to resolve
      await delayPromise;
    });

    test('should not add delay when test mode is disabled', async () => {
      process.env.NODE_ENV = 'production';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      await addE2EDelay(100);

      // Verify setTimeout was not called
      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    test('should handle zero delay', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const delayPromise = addE2EDelay(0);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);

      vi.advanceTimersByTime(0);
      await delayPromise;
    });
  });

  describe('addE2EDelayByType', () => {
    test('should add delay for FILE_PROCESSING_START', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const delayPromise = addE2EDelayByType('FILE_PROCESSING_START');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300);

      vi.advanceTimersByTime(300);
      await delayPromise;
    });

    test('should add delay for IMAGE_PROCESSING', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const delayPromise = addE2EDelayByType('IMAGE_PROCESSING');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10);

      vi.advanceTimersByTime(10);
      await delayPromise;
    });

    test('should add delay for CHAPTER_PROCESSING', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const delayPromise = addE2EDelayByType('CHAPTER_PROCESSING');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 30);

      vi.advanceTimersByTime(30);
      await delayPromise;
    });

    test('should add delay for FILE_PROCESSING_END', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const delayPromise = addE2EDelayByType('FILE_PROCESSING_END');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 30);

      vi.advanceTimersByTime(30);
      await delayPromise;
    });

    test('should not add delay when test mode is disabled', async () => {
      process.env.NODE_ENV = 'production';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      await addE2EDelayByType('FILE_PROCESSING_START');

      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    test('should work correctly with multiple delays', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const promises = [
        addE2EDelayByType('FILE_PROCESSING_START'),
        addE2EDelayByType('IMAGE_PROCESSING'),
        addE2EDelayByType('CHAPTER_PROCESSING'),
      ];

      expect(setTimeoutSpy).toHaveBeenCalledTimes(3);

      // Advance time for all delays
      vi.advanceTimersByTime(300); // Max delay time

      await Promise.all(promises);
    });

    test('should handle environment changes correctly', async () => {
      process.env.NODE_ENV = 'test';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      // First delay should work
      const promise1 = addE2EDelay(50);
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(50);
      await promise1;

      // Change environment
      process.env.NODE_ENV = 'production';

      // Second delay should not work
      await addE2EDelay(50);
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1); // Still only 1 call
    });
  });
});
