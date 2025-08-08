import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Logger } from 'pino';

describe('Logger ESM Compatibility', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear any cached logger instance
    vi.resetModules();
  });

  afterEach(async () => {
    // Restore original environment
    process.env = originalEnv;
    // Clear the module cache to ensure fresh imports
    vi.resetModules();
  });

  describe('createLogger', () => {
    test('should create logger without using require', async () => {
      // This test ensures the logger can be created without require()
      const { createLogger } = await import('./logger');
      const logger = createLogger();
      
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    test('should handle test environment correctly', async () => {
      process.env.NODE_ENV = 'test';
      // Re-import to get fresh module with new env
      const { createLogger } = await import('./logger');
      
      const logger = createLogger();
      
      expect(logger).toBeDefined();
      // In test environment, log level should be 'error'
      expect(logger.level).toBe('error');
    });

    test('should handle development environment correctly', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.LOG_LEVEL; // Ensure no LOG_LEVEL override
      // Re-import to get fresh module with new env
      const { createLogger } = await import('./logger');
      
      const logger = createLogger();
      
      expect(logger).toBeDefined();
      // In development environment, log level should be 'info' by default
      expect(logger.level).toBe('info');
    });

    test('should handle production environment correctly', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.LOG_LEVEL; // Ensure no LOG_LEVEL override
      // Re-import to get fresh module with new env
      const { createLogger } = await import('./logger');
      
      const logger = createLogger();
      
      expect(logger).toBeDefined();
      expect(logger.level).toBe('info');
    });

    test('should respect LOG_LEVEL environment variable', async () => {
      process.env.LOG_LEVEL = 'debug';
      // Re-import to get fresh module with new env
      const { createLogger } = await import('./logger');
      
      const logger = createLogger();
      
      expect(logger.level).toBe('debug');
    });
  });

  describe('getLogger', () => {
    test('should return the same logger instance', async () => {
      const { getLogger } = await import('./logger');
      const logger1 = getLogger();
      const logger2 = getLogger();
      
      expect(logger1).toBe(logger2);
    });
  });

  describe('AppError serialization', () => {
    test('should serialize AppError correctly', async () => {
      const { createLogger } = await import('./logger');
      const logger = createLogger();
      
      // Test that logger can handle AppError objects
      const testError = {
        constructor: { name: 'AppError' },
        code: 'TEST_ERROR',
        message: 'Test error message',
        userMessage: 'ユーザー向けメッセージ',
        context: { test: true },
        stack: 'Error stack trace',
      };
      
      // This should not throw
      expect(() => {
        logger.info({ appError: testError }, 'Test error logging');
      }).not.toThrow();
    });
  });

  describe('Logger functionality', () => {
    test('should log messages at different levels', async () => {
      const { createLogger } = await import('./logger');
      const logger = createLogger();
      
      // These should not throw
      expect(() => {
        logger.trace('Trace message');
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warn message');
        logger.error('Error message');
        logger.fatal('Fatal message');
      }).not.toThrow();
    });

    test('should log with context objects', async () => {
      const { createLogger } = await import('./logger');
      const logger = createLogger();
      
      expect(() => {
        logger.info({ user: 'test', action: 'login' }, 'User logged in');
        logger.error({ err: new Error('Test error') }, 'An error occurred');
      }).not.toThrow();
    });
  });
});