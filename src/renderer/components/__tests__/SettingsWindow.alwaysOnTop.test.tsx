import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../__tests__/setup';
import { SettingsWindow } from '../SettingsWindow';

// Electronのモック
const mockElectronAPI = {
  getVersion: jest.fn().mockResolvedValue({
    version: '1.0.0',
    name: 'EPUB Image Extractor',
    electronVersion: '37.2.1',
    nodeVersion: '24.1.0',
    chromiumVersion: '132.0.6834.110',
    platform: 'darwin',
    arch: 'x64',
  }),
  getSettings: jest.fn().mockResolvedValue({
    outputDirectory: '/test/path',
    language: 'ja',
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
    inactiveOpacity: 0.8,
    enableMouseHoverOpacity: true,
  }),
  saveSettings: jest.fn().mockResolvedValue({ success: true }),
  selectOutputDirectory: jest.fn(),
  resetSettings: jest.fn().mockResolvedValue({
    outputDirectory: '/default/path',
    language: 'ja',
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
    inactiveOpacity: 0.8,
    enableMouseHoverOpacity: true,
  }),
};

// window.electronAPIをモック
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('SettingsWindow - 最前面表示オプション', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('最前面表示オプションが表示される', async () => {
    render(<SettingsWindow isOpen={true} onClose={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('ウィンドウを最前面に表示')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', { name: /ウィンドウを最前面に表示/ });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  test('最前面表示オプションを無効にできる', async () => {
    mockElectronAPI.getSettings.mockResolvedValueOnce({
      outputDirectory: '/test/path',
      language: 'ja',
      alwaysOnTop: false,
      includeOriginalFilename: true,
      includePageSpread: true,
      inactiveOpacity: 0.8,
      enableMouseHoverOpacity: true,
    });

    render(<SettingsWindow isOpen={true} onClose={jest.fn()} />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /ウィンドウを最前面に表示/ });
      expect(checkbox).not.toBeChecked();
    });
  });

  test('最前面表示オプションの変更が保存される', async () => {
    const onClose = jest.fn();
    render(<SettingsWindow isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('ウィンドウを最前面に表示')).toBeInTheDocument();
    });

    // チェックボックスをクリック（デフォルトでtrueなのでfalseにする）
    const checkbox = screen.getByRole('checkbox', { name: /ウィンドウを最前面に表示/ });
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockElectronAPI.saveSettings).toHaveBeenCalledWith({
        outputDirectory: '/test/path',
        language: 'ja',
        alwaysOnTop: false,
        includeOriginalFilename: true,
        includePageSpread: true,
        inactiveOpacity: 0.8, // デフォルト値
        enableMouseHoverOpacity: true,
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('デフォルトに戻すと最前面表示もリセットされる', async () => {
    mockElectronAPI.getSettings.mockResolvedValueOnce({
      outputDirectory: '/test/path',
      language: 'ja',
      alwaysOnTop: false,
      includeOriginalFilename: true,
      includePageSpread: true,
      inactiveOpacity: 0.8,
      enableMouseHoverOpacity: true,
    });

    render(<SettingsWindow isOpen={true} onClose={jest.fn()} />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /ウィンドウを最前面に表示/ });
      expect(checkbox).not.toBeChecked();
    });

    // デフォルトに戻すボタンをクリック
    const resetButton = screen.getByText('デフォルトに戻す');
    fireEvent.click(resetButton);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /ウィンドウを最前面に表示/ });
      expect(checkbox).toBeChecked(); // デフォルトはtrue
    });
  });
});
