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
          const currentVersion = app.getVersion();
          const newVersion = result.updateInfo.version;

          // Version comparison to avoid false positives
          if (this.compareVersions(newVersion, currentVersion) > 0) {
            this.onUpdateAvailable(newVersion);
            log.info(`New version available on startup: ${newVersion}`);
          } else {
            log.info(`Current version ${currentVersion} is up to date`);
          }
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
        const currentVersion = app.getVersion();
        const newVersion = result.updateInfo.version;

        // semver version comparison (e.g., "0.7.0" > "0.6.2")
        if (this.compareVersions(newVersion, currentVersion) > 0) {
          return {
            updateAvailable: true,
            version: newVersion,
          };
        }

        log.info(`Current version (${currentVersion}) is up to date`);
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

  /**
   * Compare two semantic version strings
   * @param v1 First version (e.g., "0.7.0")
   * @param v2 Second version (e.g., "0.6.2")
   * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if v1 === v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }
}
