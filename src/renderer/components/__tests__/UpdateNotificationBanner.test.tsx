import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../../__tests__/setup';
import userEvent from '@testing-library/user-event';
import { UpdateNotificationBanner } from '../UpdateNotificationBanner';

// Mock Electron API
const mockOpenReleasesPage = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Setup window.electronAPI mock
  (window as any).electronAPI = {
    openReleasesPage: mockOpenReleasesPage,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('UpdateNotificationBanner', () => {
  it('should not render when version is null', () => {
    const { container } = render(<UpdateNotificationBanner version={null} onDismiss={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render banner when version is provided', () => {
    render(<UpdateNotificationBanner version="0.7.0" onDismiss={vi.fn()} />);

    expect(screen.getByText(/v0\.7\.0.*が利用可能です/)).toBeInTheDocument();
  });

  it('should show "View on GitHub" button', () => {
    render(<UpdateNotificationBanner version="0.7.0" onDismiss={vi.fn()} />);

    expect(screen.getByRole('button', { name: /GitHubで確認/ })).toBeInTheDocument();
  });

  it('should show dismiss button', () => {
    render(<UpdateNotificationBanner version="0.7.0" onDismiss={vi.fn()} />);

    expect(screen.getByRole('button', { name: /×/ })).toBeInTheDocument();
  });

  it('should open releases page when "View on GitHub" is clicked', async () => {
    render(<UpdateNotificationBanner version="0.7.0" onDismiss={vi.fn()} />);

    const viewButton = screen.getByRole('button', { name: /GitHubで確認/ });
    await userEvent.click(viewButton);

    expect(mockOpenReleasesPage).toHaveBeenCalledTimes(1);
  });

  it('should call onDismiss when dismiss button is clicked', async () => {
    const mockOnDismiss = vi.fn();
    render(<UpdateNotificationBanner version="0.7.0" onDismiss={mockOnDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /×/ });
    await userEvent.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should handle error when opening releases page fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOpenReleasesPage.mockRejectedValue(new Error('Failed to open'));

    render(<UpdateNotificationBanner version="0.7.0" onDismiss={vi.fn()} />);

    const viewButton = screen.getByRole('button', { name: /GitHubで確認/ });
    await userEvent.click(viewButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should render with correct CSS class', () => {
    const { container } = render(<UpdateNotificationBanner version="0.7.0" onDismiss={vi.fn()} />);

    expect(container.querySelector('.update-notification-banner')).toBeInTheDocument();
  });
});
