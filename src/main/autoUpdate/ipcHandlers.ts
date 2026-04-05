import { ipcMain, BrowserWindow } from 'electron';
import { UpdateChecker } from './UpdateChecker';

export function registerUpdateCheckHandlers(
  mainWindow: BrowserWindow,
  updateChecker: UpdateChecker,
): void {
  ipcMain.handle('update:check-for-updates', async () => {
    return await updateChecker.checkForUpdates();
  });

  ipcMain.handle('update:open-releases-page', async () => {
    updateChecker.openReleasesPage();
  });

  ipcMain.handle('update:get-version', async () => {
    return updateChecker.getCurrentVersion();
  });
}
