import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsWindow } from '../SettingsWindow';

// Electronのモック
const mockElectronAPI = {
  getVersion: jest.fn().mockResolvedValue({
    version: '1.0.0',
    name: 'EPUB Image Extractor',
    electronVersion: '28.3.3',
    nodeVersion: '18.18.2',
    chromiumVersion: '120.0.6099.291',
    platform: 'darwin',
    arch: 'x64',
  }),
  getSettings: jest.fn().mockResolvedValue({
    outputDirectory: '/test/path',
    language: 'ja',
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
  }),
  saveSettings: jest.fn().mockResolvedValue({ success: true }),
  selectOutputDirectory: jest.fn(),
  resetSettings: jest.fn().mockResolvedValue({
    outputDirectory: '/default/path',
    language: 'ja',
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
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
