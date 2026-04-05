import { app, net, shell } from 'electron';

const GITHUB_API_URL =
  'https://api.github.com/repos/castor4bit/epub-image-extractor/releases/latest';
const GITHUB_RELEASES_URL = 'https://github.com/castor4bit/epub-image-extractor/releases/latest';
const REQUEST_TIMEOUT_MS = 10000;

interface GitHubRelease {
  tag_name: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  version?: string;
  error?: string;
}

export class UpdateChecker {
  private onUpdateAvailable?: (version: string) => void;

  constructor(onUpdateAvailable?: (version: string) => void) {
    this.onUpdateAvailable = onUpdateAvailable;

    // Only check for updates in packaged app
    if (!app.isPackaged) {
      return;
    }

    this.fetchLatestVersion()
      .then((latestVersion) => {
        if (latestVersion && this.onUpdateAvailable) {
          const currentVersion = app.getVersion();
          if (this.compareVersions(latestVersion, currentVersion) > 0) {
            this.onUpdateAvailable(latestVersion);
          }
        }
      })
      .catch(() => {
        // Silent failure on startup
      });
  }

  public async checkForUpdates(): Promise<UpdateCheckResult> {
    if (!app.isPackaged) {
      return { updateAvailable: false };
    }

    try {
      const latestVersion = await this.fetchLatestVersion();

      if (latestVersion) {
        const currentVersion = app.getVersion();
        if (this.compareVersions(latestVersion, currentVersion) > 0) {
          return { updateAvailable: true, version: latestVersion };
        }
      }

      return { updateAvailable: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { updateAvailable: false, error: message };
    }
  }

  public openReleasesPage(): void {
    shell.openExternal(GITHUB_RELEASES_URL);
  }

  public getCurrentVersion(): string {
    return app.getVersion();
  }

  private async fetchLatestVersion(): Promise<string | null> {
    const response = await net.fetch(GITHUB_API_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = (await response.json()) as GitHubRelease;
    if (!data.tag_name) {
      return null;
    }

    // Strip leading "v" if present (e.g., "v0.7.0" -> "0.7.0")
    return data.tag_name.replace(/^v/, '');
  }

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
