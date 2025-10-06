import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Electron modules
vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getVersion: vi.fn(() => '0.6.2'),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

// Mock electron-updater
vi.mock('electron-updater', () => ({
  autoUpdater: {
    checkForUpdates: vi.fn(),
  },
}));

// Mock electron-log
vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { UpdateChecker } from '../UpdateChecker';
import { app, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

describe('UpdateChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should not check for updates in development mode', () => {
      (app as any).isPackaged = false;

      new UpdateChecker();

      expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    });

    it('should check for updates on startup in packaged app', () => {
      (app as any).isPackaged = true;
      vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
        updateInfo: {
          version: '0.6.3',
          files: [],
          path: '',
          sha512: '',
          releaseDate: '',
        },
        downloadPromise: null as any,
        cancellationToken: null as any,
        versionInfo: {
          version: '0.6.3',
        } as any,
      });

      new UpdateChecker();

      expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1);
    });

    it('should log error if startup check fails', async () => {
      (app as any).isPackaged = true;
      const error = new Error('Network error');
      vi.mocked(autoUpdater.checkForUpdates).mockRejectedValue(error);

      new UpdateChecker();

      // Wait for async error handling
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(log.error).toHaveBeenCalledWith('Failed to check for updates on startup:', error);
    });
  });

  describe('checkForUpdates', () => {
    it('should return false in development mode', async () => {
      (app as any).isPackaged = false;
      const checker = new UpdateChecker();

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: false });
    });

    it('should return true when update is available', async () => {
      (app as any).isPackaged = true;
      vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue({
        updateInfo: {
          version: '0.6.3',
          files: [],
          path: '',
          sha512: '',
          releaseDate: '',
        },
        downloadPromise: null as any,
        cancellationToken: null as any,
        versionInfo: {
          version: '0.6.3',
        } as any,
      });

      const checker = new UpdateChecker();
      // Clear the constructor call
      vi.clearAllMocks();

      const result = await checker.checkForUpdates();

      expect(result).toEqual({
        updateAvailable: true,
        version: '0.6.3',
      });
      expect(autoUpdater.checkForUpdates).toHaveBeenCalledTimes(1);
    });

    it('should return false when no update is available', async () => {
      (app as any).isPackaged = true;
      vi.mocked(autoUpdater.checkForUpdates).mockResolvedValue(null as any);

      const checker = new UpdateChecker();
      vi.clearAllMocks();

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: false });
    });

    it('should return false and log error on check failure', async () => {
      (app as any).isPackaged = true;
      const error = new Error('Network error');
      vi.mocked(autoUpdater.checkForUpdates).mockRejectedValue(error);

      const checker = new UpdateChecker();
      vi.clearAllMocks();

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: false });
      expect(log.error).toHaveBeenCalledWith('Error checking for updates:', error);
    });
  });

  describe('openReleasesPage', () => {
    it('should open GitHub releases page', () => {
      (app as any).isPackaged = false; // Skip startup check
      const checker = new UpdateChecker();

      checker.openReleasesPage();

      expect(shell.openExternal).toHaveBeenCalledWith(
        'https://github.com/castor4bit/epub-image-extractor/releases/latest',
      );
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current app version', () => {
      (app as any).isPackaged = false; // Skip startup check
      vi.mocked(app.getVersion).mockReturnValue('0.6.2');
      const checker = new UpdateChecker();

      const version = checker.getCurrentVersion();

      expect(version).toBe('0.6.2');
      expect(app.getVersion).toHaveBeenCalled();
    });
  });
});
