import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ipcMain, BrowserWindow } from 'electron';
import { registerUpdateCheckHandlers } from '../ipcHandlers';
import { UpdateChecker } from '../UpdateChecker';

// Mock Electron
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// Mock UpdateChecker
vi.mock('../UpdateChecker', () => ({
  UpdateChecker: vi.fn(),
}));

describe('registerUpdateCheckHandlers', () => {
  let mockWindow: BrowserWindow;
  let mockUpdateChecker: UpdateChecker;
  let handlers: Map<string, Function>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // Setup mock window
    mockWindow = {} as BrowserWindow;

    // Setup mock UpdateChecker
    mockUpdateChecker = {
      checkForUpdates: vi.fn(),
      openReleasesPage: vi.fn(),
      getCurrentVersion: vi.fn(),
    } as any;

    // Capture IPC handlers
    vi.mocked(ipcMain.handle).mockImplementation((channel: string, handler: Function) => {
      handlers.set(channel, handler);
    });
  });

  it('should register all IPC handlers', () => {
    registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);

    expect(ipcMain.handle).toHaveBeenCalledTimes(3);
    expect(handlers.has('update:check-for-updates')).toBe(true);
    expect(handlers.has('update:open-releases-page')).toBe(true);
    expect(handlers.has('update:get-version')).toBe(true);
  });

  describe('update:check-for-updates', () => {
    it('should return update check result on success', async () => {
      const mockResult = { updateAvailable: true, version: '0.6.3' };
      vi.mocked(mockUpdateChecker.checkForUpdates).mockResolvedValue(mockResult);

      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:check-for-updates')!;
      const result = await handler();

      expect(mockUpdateChecker.checkForUpdates).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should return false on error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(mockUpdateChecker.checkForUpdates).mockRejectedValue(
        new Error('Network error'),
      );

      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:check-for-updates')!;
      const result = await handler();

      expect(result).toEqual({ updateAvailable: false });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to check for updates:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('update:open-releases-page', () => {
    it('should call openReleasesPage on success', async () => {
      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:open-releases-page')!;

      await handler();

      expect(mockUpdateChecker.openReleasesPage).toHaveBeenCalled();
    });

    it('should throw error on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Failed to open');
      vi.mocked(mockUpdateChecker.openReleasesPage).mockImplementation(() => {
        throw error;
      });

      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:open-releases-page')!;

      await expect(handler()).rejects.toThrow('Failed to open');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to open releases page:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('update:get-version', () => {
    it('should return current version', async () => {
      vi.mocked(mockUpdateChecker.getCurrentVersion).mockReturnValue('0.6.2');

      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:get-version')!;
      const result = await handler();

      expect(mockUpdateChecker.getCurrentVersion).toHaveBeenCalled();
      expect(result).toBe('0.6.2');
    });
  });
});
