import { app } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export type UpdateStatus = 'checking' | 'available' | 'not-available' | 'downloaded' | 'error';

export interface UpdateStatusInfo {
  status: UpdateStatus;
  version?: string;
  releaseNotes?: string;
  error?: string;
}

export interface UpdateProgressInfo {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export type UpdateEventCallback = (
  event: string,
  data: UpdateStatusInfo | UpdateProgressInfo,
) => void;

export class AutoUpdateManager {
  private eventCallback: UpdateEventCallback;
  private isPackaged: boolean;

  constructor(eventCallback: UpdateEventCallback) {
    this.eventCallback = eventCallback;
    this.isPackaged = app.isPackaged;

    if (!this.isPackaged) {
      log.info('Auto-update disabled in development mode');
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

    // Auto download and install configuration
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    // Set up event handlers
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.eventCallback('update:status', { status: 'checking' });
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info.version);
      this.eventCallback('update:status', {
        status: 'available',
        version: info.version,
        releaseNotes: info.releaseNotes as string,
      });
    });

    autoUpdater.on('update-not-available', (_info) => {
      log.info('Update not available. Current version is up to date.');
      this.eventCallback('update:status', { status: 'not-available' });
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater:', err);
      this.eventCallback('update:status', {
        status: 'error',
        error: err.message || String(err),
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      log.info(
        `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`,
      );
      this.eventCallback('update:progress', {
        percent: progressObj.percent,
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total,
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info.version);
      this.eventCallback('update:status', {
        status: 'downloaded',
        version: info.version,
      });
    });

    // Check for updates on startup
    this.checkForUpdatesAndNotify();
  }

  /**
   * Automatically check for updates and notify user
   */
  private checkForUpdatesAndNotify(): void {
    if (!this.isPackaged) return;

    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
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
   * Install update and restart application
   */
  public quitAndInstall(): void {
    if (!this.isPackaged) return;

    autoUpdater.quitAndInstall();
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
