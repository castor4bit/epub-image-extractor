import { app, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export class UpdateChecker {
  private isPackaged: boolean;

  constructor() {
    this.isPackaged = app.isPackaged;

    if (!this.isPackaged) {
      log.info('Update check disabled in development mode');
      return;
    }

    this.setupUpdater();
  }

  private setupUpdater(): void {
    // Disable auto download and install
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    // Check for updates on startup
    this.checkForUpdatesOnStartup();
  }

  /**
   * Check for updates on startup (silent)
   */
  private checkForUpdatesOnStartup(): void {
    if (!this.isPackaged) return;

    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Failed to check for updates on startup:', err);
    });
  }

  /**
   * Manually check for updates
   */
  public async checkForUpdates(): Promise<{ updateAvailable: boolean; version?: string }> {
    if (!this.isPackaged) {
      return { updateAvailable: false };
    }

    try {
      const result = await autoUpdater.checkForUpdates();

      if (result && result.updateInfo) {
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
   * Open GitHub Releases page for manual download
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

  /**
   * Cleanup is not needed as we don't register event listeners
   */
  public cleanup(): void {
    // No-op: we don't register event listeners
  }
}
