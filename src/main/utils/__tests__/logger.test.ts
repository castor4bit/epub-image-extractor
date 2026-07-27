import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { isProductionRuntime, resolveLogPath, setElectronApp, clearLoggerCache } from '../logger';

describe('logger', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    clearLoggerCache();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    setElectronApp(null);
    clearLoggerCache();
  });

  describe('isProductionRuntime', () => {
    test('packaged app is production even when NODE_ENV is undefined', () => {
      // Packaged Electron builds do not set NODE_ENV. This is the case that
      // silently disabled file logging in released builds.
      expect(isProductionRuntime({ isPackaged: true }, undefined)).toBe(true);
    });

    test('unpackaged app is not production when NODE_ENV is undefined', () => {
      expect(isProductionRuntime({ isPackaged: false }, undefined)).toBe(false);
    });

    test('test environment is never production even when packaged', () => {
      expect(isProductionRuntime({ isPackaged: true }, 'test')).toBe(false);
    });

    test('falls back to NODE_ENV when the Electron app is unavailable', () => {
      expect(isProductionRuntime(null, 'production')).toBe(true);
      expect(isProductionRuntime(null, 'development')).toBe(false);
      expect(isProductionRuntime(null, undefined)).toBe(false);
    });
  });

  describe('resolveLogPath', () => {
    test('uses the Electron userData directory when the app is available', () => {
      const getPath = vi.fn().mockReturnValue('/tmp/test-userdata');
      expect(resolveLogPath({ getPath } as never)).toBe('/tmp/test-userdata');
      expect(getPath).toHaveBeenCalledWith('userData');
    });

    test('falls back to the temp directory when the app is unavailable', () => {
      expect(resolveLogPath(null)).toBe(path.join(os.tmpdir(), 'epub-image-extractor-logs'));
    });

    test('falls back to the temp directory when getPath throws', () => {
      const getPath = vi.fn().mockImplementation(() => {
        throw new Error('not ready');
      });
      expect(resolveLogPath({ getPath } as never)).toBe(
        path.join(os.tmpdir(), 'epub-image-extractor-logs'),
      );
    });
  });

  describe('production file output', () => {
    test('writes log records to app.log in the userData directory', async () => {
      // Reproduces the packaged-app case: no NODE_ENV, isPackaged true.
      // pino.transport() would throw "__dirname is not defined" in the ESM
      // bundle and silently fall back to a transport-less logger, so this
      // asserts the file is actually written.
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-test-'));
      delete process.env.NODE_ENV;

      setElectronApp({ isPackaged: true, getPath: () => dir } as never);
      const mod = await import('../logger');
      mod.logger.error('verification-marker');
      mod.logger.flush?.();

      await vi.waitFor(() => {
        const file = path.join(dir, 'app.log');
        expect(fs.existsSync(file)).toBe(true);
        expect(fs.readFileSync(file, 'utf8')).toContain('verification-marker');
      });

      fs.rmSync(dir, { recursive: true, force: true });
    });
  });

  describe('setElectronApp', () => {
    test('rebuilds the exported logger so it picks up the injected app', async () => {
      const mod = await import('../logger');
      const before = mod.logger;

      setElectronApp({
        isPackaged: false,
        getPath: () => os.tmpdir(),
      } as never);

      // The module-level logger is created at import time, before the Electron
      // app is injected. Injecting must replace it, otherwise every consumer
      // keeps a logger built from the wrong environment.
      expect(mod.logger).not.toBe(before);
    });
  });
});
