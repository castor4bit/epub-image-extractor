import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsWindow } from '../components/SettingsWindow';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'ja',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('SettingsWindow - Reset and Save behavior', () => {
  const mockOnClose = vi.fn();
  const mockOnShowAbout = vi.fn();
  const mockGetSettings = vi.fn();
  const mockSaveSettings = vi.fn();
  const mockResetSettings = vi.fn();
  const mockClearWindowBounds = vi.fn();
  const mockSelectOutputDirectory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.electronAPI
    (global as any).window.electronAPI = {
      getSettings: mockGetSettings,
      saveSettings: mockSaveSettings,
      resetSettings: mockResetSettings,
      clearWindowBounds: mockClearWindowBounds,
      selectOutputDirectory: mockSelectOutputDirectory,
    };

    mockGetSettings.mockResolvedValue({
      outputDirectory: '/test/output',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
      inactiveOpacity: 0.8,
      enableMouseHoverOpacity: true,
    });

    mockSaveSettings.mockResolvedValue({ success: true });
    mockResetSettings.mockResolvedValue({
      outputDirectory: '/default/output',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
      inactiveOpacity: 0.8,
      enableMouseHoverOpacity: true,
    });
    mockClearWindowBounds.mockResolvedValue({ success: true });
  });

  test('通常の保存ではウィンドウが閉じる', async () => {
    render(<SettingsWindow isOpen={true} onClose={mockOnClose} onShowAbout={mockOnShowAbout} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(mockGetSettings).toHaveBeenCalled();
    });

    // Click save button
    const saveButton = screen.getByText('settings.actions.save');
    fireEvent.click(saveButton);

    // Wait for save to complete
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
    });

    // clearWindowBounds should not be called
    expect(mockClearWindowBounds).not.toHaveBeenCalled();

    // Window should close
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('リセット後の保存でもウィンドウが閉じる', async () => {
    render(<SettingsWindow isOpen={true} onClose={mockOnClose} onShowAbout={mockOnShowAbout} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(mockGetSettings).toHaveBeenCalled();
    });

    // Click reset button
    const resetButton = screen.getByText('settings.actions.reset');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetSettings).toHaveBeenCalled();
    });

    // Click save button
    const saveButton = screen.getByText('settings.actions.save');
    fireEvent.click(saveButton);

    // Wait for save to complete
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
    });

    // clearWindowBounds should be called
    expect(mockClearWindowBounds).toHaveBeenCalled();

    // Window should close
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clearWindowBoundsでエラーが発生しても、設定は保存されウィンドウは閉じる', async () => {
    // Make clearWindowBounds throw an error
    mockClearWindowBounds.mockRejectedValue(new Error('Failed to clear window bounds'));

    // Mock console.warn
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<SettingsWindow isOpen={true} onClose={mockOnClose} onShowAbout={mockOnShowAbout} />);

    // Wait for settings to load
    await waitFor(() => {
      expect(mockGetSettings).toHaveBeenCalled();
    });

    // Click reset button
    const resetButton = screen.getByText('settings.actions.reset');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetSettings).toHaveBeenCalled();
    });

    // Click save button
    const saveButton = screen.getByText('settings.actions.save');
    fireEvent.click(saveButton);

    // Wait for save attempt
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
    });

    // clearWindowBounds should be called
    await waitFor(() => {
      expect(mockClearWindowBounds).toHaveBeenCalled();
    });

    // Warning is logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to reset window bounds, but settings were saved:',
      expect.any(Error),
    );

    // Window should close (even with error)
    expect(mockOnClose).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
