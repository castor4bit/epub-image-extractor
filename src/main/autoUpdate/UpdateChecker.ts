import { app, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export class UpdateChecker {
  private onUpdateAvailable?: (version: string) => void;

  constructor(onUpdateAvailable?: (version: string) => void) {
    this.onUpdateAvailable = onUpdateAvailable;

    // Only check for updates in packaged app
    if (!app.isPackaged) {
      return;
    }

    // Silent check on startup
    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (result?.updateInfo && this.onUpdateAvailable) {
          this.onUpdateAvailable(result.updateInfo.version);
        }
      })
      .catch((err) => {
        log.error('Failed to check for updates on startup:', err);
      });
  }

  /**
   * Check for updates
   */
  public async checkForUpdates(): Promise<{ updateAvailable: boolean; version?: string }> {
    if (!app.isPackaged) {
      return { updateAvailable: false };
    }

    try {
      const result = await autoUpdater.checkForUpdates();

      if (result?.updateInfo) {
        return {
          updateAvailable: true,
          version: result.updateInfo.version,
        };
      }

      return { updateAvailable: false };
    } catch (error) {
      log.error('Error checking for updates:', error);
      return { updateAvailable: false };
    }
  }

  /**
   * Open GitHub Releases page
   */
  public openReleasesPage(): void {
    shell.openExternal('https://github.com/castor4bit/epub-image-extractor/releases/latest');
  }

  /**
   * Get current application version
   */
  public getCurrentVersion(): string {
    return app.getVersion();
  }
}
