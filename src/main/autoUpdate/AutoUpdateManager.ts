import { app, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export class AutoUpdateManager {
  private isPackaged: boolean;

  constructor() {
    this.isPackaged = app.isPackaged;

    if (!this.isPackaged) {
      log.info('Update check disabled in development mode');
      return;
    }

    this.setupAutoUpdater();
  }

  private setupAutoUpdater(): void {
    // Configure logger
    autoUpdater.logger = log;
    if (autoUpdater.logger) {
      (autoUpdater.logger as typeof log).transports.file.level = 'info';
    }

    // Disable auto download
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    // Set up minimal event handlers for logging only
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info.version);
    });

    autoUpdater.on('update-not-available', () => {
      log.info('Update not available. Current version is up to date.');
    });

    autoUpdater.on('error', (err) => {
      log.error('Error checking for updates:', err);
    });

    // Check for updates on startup
    this.checkForUpdatesOnStartup();
  }

  /**
   * Automatically check for updates on startup
   */
  private checkForUpdatesOnStartup(): void {
    if (!this.isPackaged) return;

    autoUpdater.checkForUpdates().catch((err) => {
      log.error('Failed to check for updates:', err);
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
   * Cleanup resources
   */
  public cleanup(): void {
    autoUpdater.removeAllListeners();
  }
}
