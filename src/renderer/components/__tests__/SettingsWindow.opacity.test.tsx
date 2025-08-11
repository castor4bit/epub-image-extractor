import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../__tests__/setup';
import { SettingsWindow } from '../SettingsWindow';

// Electronのモック
const mockElectronAPI = {
  getVersion: vi.fn().mockResolvedValue({
    version: '1.0.0',
    name: 'EPUB Image Extractor',
    electronVersion: '37.2.1',
    nodeVersion: '24.1.0',
    chromiumVersion: '132.0.6834.110',
    platform: 'darwin',
    arch: 'x64',
  }),
  getSettings: vi.fn().mockResolvedValue({
    outputDirectory: '/test/path',
    language: 'ja',
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
    inactiveOpacity: 0.85,
    enableMouseHoverOpacity: true,
  }),
  saveSettings: vi.fn().mockResolvedValue({ success: true }),
  selectOutputDirectory: vi.fn(),
  resetSettings: vi.fn().mockResolvedValue({
    outputDirectory: '/default/path',
    language: 'ja',
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
    inactiveOpacity: 0.85,
    enableMouseHoverOpacity: true,
  }),
};

// window.electronAPIをモック
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('SettingsWindow - 透明度設定', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('透明度スライダーが5%刻みで設定できる', async () => {
    const { container } = render(<SettingsWindow isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    const slider = container.querySelector('#inactive-opacity') as HTMLInputElement;

    // スライダーの属性を確認
    expect(slider.min).toBe('0.1');
    expect(slider.max).toBe('1');
    expect(slider.step).toBe('0.05'); // 5%刻み
    expect(slider.value).toBe('0.85'); // 初期値85%
  });

  test('透明度の値が正しくパーセント表示される', async () => {
    render(<SettingsWindow isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });

  test('透明度を変更すると値が更新される', async () => {
    const { container } = render(<SettingsWindow isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    const slider = container.querySelector('#inactive-opacity') as HTMLInputElement;

    // 50%に変更
    fireEvent.change(slider, { target: { value: '0.5' } });
    expect(screen.getByText('50%')).toBeInTheDocument();

    // 100%に変更
    fireEvent.change(slider, { target: { value: '1' } });
    expect(screen.getByText('100%')).toBeInTheDocument();

    // 10%に変更
    fireEvent.change(slider, { target: { value: '0.1' } });
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  test('5%刻みの値のみ設定可能', async () => {
    const { container } = render(<SettingsWindow isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    const slider = container.querySelector('#inactive-opacity') as HTMLInputElement;

    // 有効な値のテスト (5%刻み)
    const validValues = [
      0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9,
      0.95, 1.0,
    ];

    validValues.forEach((value) => {
      fireEvent.change(slider, { target: { value: String(value) } });
      expect(slider.value).toBe(String(value));
    });
  });

  test('リセット時に透明度が85%に戻る', async () => {
    const { container } = render(<SettingsWindow isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    const slider = container.querySelector('#inactive-opacity') as HTMLInputElement;

    // 値を変更
    fireEvent.change(slider, { target: { value: '0.5' } });
    expect(screen.getByText('50%')).toBeInTheDocument();

    // リセットボタンをクリック
    const resetButton = screen.getByText('デフォルトに戻す');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(slider.value).toBe('0.85');
      expect(screen.getByText('85%')).toBeInTheDocument();
    });
  });
});
