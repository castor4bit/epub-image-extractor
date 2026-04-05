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

    mockWindow = {} as BrowserWindow;

    mockUpdateChecker = {
      checkForUpdates: vi.fn(),
      openReleasesPage: vi.fn(),
      getCurrentVersion: vi.fn(),
    } as any;

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
    it('should return update check result', async () => {
      const mockResult = { updateAvailable: true, version: '0.6.3' };
      vi.mocked(mockUpdateChecker.checkForUpdates).mockResolvedValue(mockResult);

      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:check-for-updates')!;
      const result = await handler();

      expect(mockUpdateChecker.checkForUpdates).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should return error result on failure', async () => {
      const mockResult = { updateAvailable: false, error: 'Network error' };
      vi.mocked(mockUpdateChecker.checkForUpdates).mockResolvedValue(mockResult);

      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:check-for-updates')!;
      const result = await handler();

      expect(result).toEqual(mockResult);
    });
  });

  describe('update:open-releases-page', () => {
    it('should call openReleasesPage', async () => {
      registerUpdateCheckHandlers(mockWindow, mockUpdateChecker);
      const handler = handlers.get('update:open-releases-page')!;

      await handler();

      expect(mockUpdateChecker.openReleasesPage).toHaveBeenCalled();
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
