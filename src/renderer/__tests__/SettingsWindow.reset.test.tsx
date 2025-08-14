import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsWindow } from '../components/SettingsWindow';

// i18nextのモック
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

    // window.electronAPIのモック
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
    render(
      <SettingsWindow
        isOpen={true}
        onClose={mockOnClose}
        onShowAbout={mockOnShowAbout}
      />
    );

    // 設定が読み込まれるのを待つ
    await waitFor(() => {
      expect(mockGetSettings).toHaveBeenCalled();
    });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('settings.actions.save');
    fireEvent.click(saveButton);

    // 保存処理が完了するのを待つ
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
    });

    // clearWindowBoundsは呼ばれない
    expect(mockClearWindowBounds).not.toHaveBeenCalled();

    // ウィンドウが閉じられる
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('リセット後の保存でもウィンドウが閉じる', async () => {
    render(
      <SettingsWindow
        isOpen={true}
        onClose={mockOnClose}
        onShowAbout={mockOnShowAbout}
      />
    );

    // 設定が読み込まれるのを待つ
    await waitFor(() => {
      expect(mockGetSettings).toHaveBeenCalled();
    });

    // リセットボタンをクリック
    const resetButton = screen.getByText('settings.actions.reset');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetSettings).toHaveBeenCalled();
    });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('settings.actions.save');
    fireEvent.click(saveButton);

    // 保存処理が完了するのを待つ
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
    });

    // clearWindowBoundsが呼ばれる
    expect(mockClearWindowBounds).toHaveBeenCalled();

    // ウィンドウが閉じられる
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('clearWindowBoundsでエラーが発生しても、設定は保存されウィンドウは閉じる', async () => {
    // clearWindowBoundsがエラーを投げるように設定
    mockClearWindowBounds.mockRejectedValue(new Error('Failed to clear window bounds'));

    // console.warnをモック
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <SettingsWindow
        isOpen={true}
        onClose={mockOnClose}
        onShowAbout={mockOnShowAbout}
      />
    );

    // 設定が読み込まれるのを待つ
    await waitFor(() => {
      expect(mockGetSettings).toHaveBeenCalled();
    });

    // リセットボタンをクリック
    const resetButton = screen.getByText('settings.actions.reset');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockResetSettings).toHaveBeenCalled();
    });

    // 保存ボタンをクリック
    const saveButton = screen.getByText('settings.actions.save');
    fireEvent.click(saveButton);

    // 保存処理が試行されるのを待つ
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
    });

    // clearWindowBoundsが呼ばれる
    await waitFor(() => {
      expect(mockClearWindowBounds).toHaveBeenCalled();
    });

    // 警告がログに出力される
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'ウィンドウサイズのリセットに失敗しましたが、設定は保存されました:',
      expect.any(Error)
    );

    // ウィンドウは閉じられる（エラーがあっても）
    expect(mockOnClose).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});