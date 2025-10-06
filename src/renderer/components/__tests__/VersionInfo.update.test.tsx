import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../__tests__/setup';
import userEvent from '@testing-library/user-event';
import { VersionInfo } from '../VersionInfo';

// Mock Electron API
const mockGetVersion = vi.fn();
const mockCheckForUpdates = vi.fn();
const mockOpenReleasesPage = vi.fn();

vi.mock('../../../preload/types', () => ({
  default: {},
}));

beforeEach(() => {
  vi.clearAllMocks();

  // Setup window.electronAPI mock
  (window as any).electronAPI = {
    getVersion: mockGetVersion,
    checkForUpdates: mockCheckForUpdates,
    openReleasesPage: mockOpenReleasesPage,
  };

  // Default mock implementation
  mockGetVersion.mockResolvedValue({
    version: '0.6.2',
    name: 'EPUB Image Extractor',
    electronVersion: '37.5.1',
    nodeVersion: '24.0.0',
    chromiumVersion: '132.0.6834.83',
    platform: 'darwin',
    arch: 'arm64',
  });
});

describe('VersionInfo - Update Check UI', () => {
  it('should render check for updates button', async () => {
    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /更新を確認/ })).toBeInTheDocument();
  });

  it('should show checking state when update check is in progress', async () => {
    mockCheckForUpdates.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ updateAvailable: false }), 100)),
    );

    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    const checkButton = screen.getByRole('button', { name: /更新を確認/ });
    await userEvent.click(checkButton);

    expect(screen.getByRole('button', { name: /確認中/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /確認中/ })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /更新を確認/ })).toBeInTheDocument();
    });
  });

  it('should show "up to date" message when no update is available', async () => {
    mockCheckForUpdates.mockResolvedValue({ updateAvailable: false });

    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    const checkButton = screen.getByRole('button', { name: /更新を確認/ });
    await userEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/最新バージョンです/)).toBeInTheDocument();
    });

    expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
  });

  it('should show new version available message with version number', async () => {
    mockCheckForUpdates.mockResolvedValue({
      updateAvailable: true,
      version: '0.7.0',
    });

    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    const checkButton = screen.getByRole('button', { name: /更新を確認/ });
    await userEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/v0\.7\.0.*が利用可能です/)).toBeInTheDocument();
    });

    expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
  });

  it('should show "View on GitHub" button when update is available', async () => {
    mockCheckForUpdates.mockResolvedValue({
      updateAvailable: true,
      version: '0.7.0',
    });

    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    const checkButton = screen.getByRole('button', { name: /更新を確認/ });
    await userEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /GitHubで確認/ })).toBeInTheDocument();
    });
  });

  it('should open releases page when "View on GitHub" is clicked', async () => {
    mockCheckForUpdates.mockResolvedValue({
      updateAvailable: true,
      version: '0.7.0',
    });

    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    const checkButton = screen.getByRole('button', { name: /更新を確認/ });
    await userEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /GitHubで確認/ })).toBeInTheDocument();
    });

    const viewButton = screen.getByRole('button', { name: /GitHubで確認/ });
    await userEvent.click(viewButton);

    expect(mockOpenReleasesPage).toHaveBeenCalledTimes(1);
  });

  it('should handle update check error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCheckForUpdates.mockRejectedValue(new Error('Network error'));

    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    const checkButton = screen.getByRole('button', { name: /更新を確認/ });
    await userEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /更新を確認/ })).toBeInTheDocument();
    });

    // Should not show any update status
    expect(screen.queryByText(/最新バージョンです/)).not.toBeInTheDocument();
    expect(screen.queryByText(/が利用可能です/)).not.toBeInTheDocument();

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should clear previous update status when checking again', async () => {
    mockCheckForUpdates
      .mockResolvedValueOnce({ updateAvailable: false })
      .mockResolvedValueOnce({
        updateAvailable: true,
        version: '0.7.0',
      });

    render(<VersionInfo />);

    await waitFor(() => {
      expect(screen.getByText('0.6.2')).toBeInTheDocument();
    });

    const checkButton = screen.getByRole('button', { name: /更新を確認/ });

    // First check - no update
    await userEvent.click(checkButton);
    await waitFor(() => {
      expect(screen.getByText(/最新バージョンです/)).toBeInTheDocument();
    });

    // Second check - update available
    await userEvent.click(checkButton);
    await waitFor(() => {
      expect(screen.getByText(/v0\.7\.0.*が利用可能です/)).toBeInTheDocument();
    });

    // Should not show "up to date" anymore
    expect(screen.queryByText(/最新バージョンです/)).not.toBeInTheDocument();
  });
});
