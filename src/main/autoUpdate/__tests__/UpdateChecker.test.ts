import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Electron modules
const mockFetch = vi.fn();

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getVersion: vi.fn(() => '0.6.2'),
  },
  net: {
    fetch: (...args: unknown[]) => mockFetch(...args),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

import { UpdateChecker } from '../UpdateChecker';
import { app, shell } from 'electron';

function createFetchResponse(body: object, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  };
}

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

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should check for updates on startup in packaged app', () => {
      (app as any).isPackaged = true;
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.3' }));

      new UpdateChecker();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should call onUpdateAvailable callback when update is found on startup', async () => {
      (app as any).isPackaged = true;
      const onUpdateAvailable = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.3' }));

      new UpdateChecker(onUpdateAvailable);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(onUpdateAvailable).toHaveBeenCalledWith('0.6.3');
    });

    it('should not call callback when current version is up to date', async () => {
      (app as any).isPackaged = true;
      const onUpdateAvailable = vi.fn();
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.2' }));

      new UpdateChecker(onUpdateAvailable);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(onUpdateAvailable).not.toHaveBeenCalled();
    });

    it('should handle startup check failure silently', async () => {
      (app as any).isPackaged = true;
      const onUpdateAvailable = vi.fn();
      mockFetch.mockRejectedValue(new Error('Network error'));

      new UpdateChecker(onUpdateAvailable);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(onUpdateAvailable).not.toHaveBeenCalled();
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
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.7.0' }));

      const checker = new UpdateChecker();
      vi.clearAllMocks();
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.7.0' }));

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: true, version: '0.7.0' });
    });

    it('should return false when current version is latest', async () => {
      (app as any).isPackaged = true;
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.2' }));

      const checker = new UpdateChecker();
      vi.clearAllMocks();
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.2' }));

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: false });
    });

    it('should return error on network failure', async () => {
      (app as any).isPackaged = true;
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.2' }));

      const checker = new UpdateChecker();
      vi.clearAllMocks();
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: false, error: 'Network error' });
    });

    it('should return error on non-ok response', async () => {
      (app as any).isPackaged = true;
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.2' }));

      const checker = new UpdateChecker();
      vi.clearAllMocks();
      mockFetch.mockResolvedValue(createFetchResponse({}, false, 404));

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: false, error: 'GitHub API returned 404' });
    });

    it('should handle tag_name without v prefix', async () => {
      (app as any).isPackaged = true;
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: '0.7.0' }));

      const checker = new UpdateChecker();
      vi.clearAllMocks();
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: '0.7.0' }));

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: true, version: '0.7.0' });
    });

    it('should return false when tag_name is missing', async () => {
      (app as any).isPackaged = true;
      mockFetch.mockResolvedValue(createFetchResponse({ tag_name: 'v0.6.2' }));

      const checker = new UpdateChecker();
      vi.clearAllMocks();
      mockFetch.mockResolvedValue(createFetchResponse({}));

      const result = await checker.checkForUpdates();

      expect(result).toEqual({ updateAvailable: false });
    });
  });

  describe('openReleasesPage', () => {
    it('should open GitHub releases page', () => {
      (app as any).isPackaged = false;
      const checker = new UpdateChecker();

      checker.openReleasesPage();

      expect(shell.openExternal).toHaveBeenCalledWith(
        'https://github.com/castor4bit/epub-image-extractor/releases/latest',
      );
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current app version', () => {
      (app as any).isPackaged = false;
      vi.mocked(app.getVersion).mockReturnValue('0.6.2');
      const checker = new UpdateChecker();

      const version = checker.getCurrentVersion();

      expect(version).toBe('0.6.2');
      expect(app.getVersion).toHaveBeenCalled();
    });
  });
});
