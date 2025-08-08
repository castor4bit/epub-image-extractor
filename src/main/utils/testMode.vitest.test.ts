import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  isE2ETestMode, 
  E2E_DELAYS, 
  addE2EDelay, 
  addE2EDelayByType 
} from './testMode';

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

  describe('isE2ETestMode', () => {
    test('should return true when E2E_TEST_MODE is "true"', () => {
      process.env.E2E_TEST_MODE = 'true';
      expect(isE2ETestMode()).toBe(true);
    });

    test('should return true when E2E_TEST_MODE is "1"', () => {
      process.env.E2E_TEST_MODE = '1';
      expect(isE2ETestMode()).toBe(true);
    });

    test('should return false when E2E_TEST_MODE is not set', () => {
      delete process.env.E2E_TEST_MODE;
      expect(isE2ETestMode()).toBe(false);
    });

    test('should return false when E2E_TEST_MODE is "false"', () => {
      process.env.E2E_TEST_MODE = 'false';
      expect(isE2ETestMode()).toBe(false);
    });

    test('should return false when E2E_TEST_MODE is "0"', () => {
      process.env.E2E_TEST_MODE = '0';
      expect(isE2ETestMode()).toBe(false);
    });

    test('should return false when E2E_TEST_MODE is any other value', () => {
      process.env.E2E_TEST_MODE = 'yes';
      expect(isE2ETestMode()).toBe(false);
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
    test('should add delay when E2E test mode is enabled', async () => {
      process.env.E2E_TEST_MODE = 'true';
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

    test('should not add delay when E2E test mode is disabled', async () => {
      delete process.env.E2E_TEST_MODE;
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      await addE2EDelay(100);
      
      // Verify setTimeout was not called
      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    test('should handle zero delay', async () => {
      process.env.E2E_TEST_MODE = 'true';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      const delayPromise = addE2EDelay(0);
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);
      
      vi.advanceTimersByTime(0);
      await delayPromise;
    });
  });

  describe('addE2EDelayByType', () => {
    test('should add delay for FILE_PROCESSING_START', async () => {
      process.env.E2E_TEST_MODE = 'true';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      const delayPromise = addE2EDelayByType('FILE_PROCESSING_START');
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300);
      
      vi.advanceTimersByTime(300);
      await delayPromise;
    });

    test('should add delay for IMAGE_PROCESSING', async () => {
      process.env.E2E_TEST_MODE = 'true';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      const delayPromise = addE2EDelayByType('IMAGE_PROCESSING');
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10);
      
      vi.advanceTimersByTime(10);
      await delayPromise;
    });

    test('should add delay for CHAPTER_PROCESSING', async () => {
      process.env.E2E_TEST_MODE = 'true';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      const delayPromise = addE2EDelayByType('CHAPTER_PROCESSING');
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 30);
      
      vi.advanceTimersByTime(30);
      await delayPromise;
    });

    test('should add delay for FILE_PROCESSING_END', async () => {
      process.env.E2E_TEST_MODE = 'true';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      const delayPromise = addE2EDelayByType('FILE_PROCESSING_END');
      
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 30);
      
      vi.advanceTimersByTime(30);
      await delayPromise;
    });

    test('should not add delay when E2E test mode is disabled', async () => {
      delete process.env.E2E_TEST_MODE;
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      await addE2EDelayByType('FILE_PROCESSING_START');
      
      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    test('should work correctly with multiple delays', async () => {
      process.env.E2E_TEST_MODE = 'true';
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      const promises = [
        addE2EDelayByType('FILE_PROCESSING_START'),
        addE2EDelay(50),
        addE2EDelayByType('IMAGE_PROCESSING'),
      ];
      
      expect(setTimeoutSpy).toHaveBeenCalledTimes(3);
      
      // Advance all timers
      vi.advanceTimersByTime(300);
      
      await Promise.all(promises);
    });

    test('should handle environment changes correctly', async () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      // Start with E2E mode disabled
      delete process.env.E2E_TEST_MODE;
      
      await addE2EDelay(100);
      expect(setTimeoutSpy).not.toHaveBeenCalled();
      
      // Enable E2E mode
      process.env.E2E_TEST_MODE = 'true';
      
      const delayPromise = addE2EDelay(100);
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
      
      vi.advanceTimersByTime(100);
      await delayPromise;
    });
  });
});