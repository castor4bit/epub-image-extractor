import { ipcMain, BrowserWindow } from 'electron';
import { UpdateChecker } from './UpdateChecker';

export function registerUpdateCheckHandlers(
  mainWindow: BrowserWindow,
  updateChecker: UpdateChecker,
): void {
  // Manually check for updates
  ipcMain.handle('update:check-for-updates', async () => {
    try {
      const result = await updateChecker.checkForUpdates();
      return result;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return { updateAvailable: false };
    }
  });

  // Open GitHub Releases page for manual download
  ipcMain.handle('update:open-releases-page', async () => {
    try {
      updateChecker.openReleasesPage();
    } catch (error) {
      console.error('Failed to open releases page:', error);
      throw error;
    }
  });

  // Get current version
  ipcMain.handle('update:get-version', async () => {
    return updateChecker.getCurrentVersion();
  });
}
