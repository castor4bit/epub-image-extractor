import { ipcMain, BrowserWindow } from 'electron';
import { AutoUpdateManager, UpdateStatusInfo, UpdateProgressInfo } from './AutoUpdateManager';

export function registerAutoUpdateHandlers(
  mainWindow: BrowserWindow,
  autoUpdateManager: AutoUpdateManager,
): void {
  // Manually check for updates
  ipcMain.handle('update:check-for-updates', async () => {
    try {
      const result = await autoUpdateManager.checkForUpdates();
      return result;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return { updateAvailable: false };
    }
  });

  // Install downloaded update and restart
  ipcMain.handle('update:install-and-restart', async () => {
    try {
      autoUpdateManager.quitAndInstall();
    } catch (error) {
      console.error('Failed to install update:', error);
      throw error;
    }
  });

  // Get current version
  ipcMain.handle('update:get-version', async () => {
    return autoUpdateManager.getCurrentVersion();
  });
}

export function sendUpdateStatus(mainWindow: BrowserWindow, data: UpdateStatusInfo): void {
  mainWindow.webContents.send('update:status', data);
}

export function sendUpdateProgress(mainWindow: BrowserWindow, data: UpdateProgressInfo): void {
  mainWindow.webContents.send('update:progress', data);
}
