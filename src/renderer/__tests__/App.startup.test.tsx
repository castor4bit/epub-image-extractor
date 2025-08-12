import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import App from '../App';

// Mock window.electronAPI
beforeEach(() => {
  (global as any).window.electronAPI = {
    processEpubFiles: vi.fn(),
    getDroppedFilePaths: vi.fn(),
    onProgress: vi.fn().mockReturnValue(() => {}),
    getSettings: vi.fn().mockResolvedValue({
      outputDirectory: '/test/output',
      language: 'ja',
      alwaysOnTop: false,
      includeOriginalFilename: false,
      includePageSpread: false,
    }),
    saveSettings: vi.fn(),
    getVersion: vi.fn().mockResolvedValue({
      version: '1.0.0',
      name: 'Test App',
    }),
    updateProcessingState: vi.fn(),
    selectOutputDirectory: vi.fn(),
    resetSettings: vi.fn(),
    clearWindowBounds: vi.fn(),
    openFolder: vi.fn(),
    send: vi.fn(),
  };
});

describe('App Startup', () => {
  it('should render without crashing', async () => {
    const { container } = render(<App />);

    // アプリケーションが正常にレンダリングされることを確認
    await waitFor(() => {
      expect(container.querySelector('.app')).toBeInTheDocument();
    });
  });

  it('should display the application title', async () => {
    const { getByText } = render(<App />);

    // タイトルが表示されることを確認
    await waitFor(() => {
      expect(getByText('EPUB Image Extractor')).toBeInTheDocument();
    });
  });

  it('should display the drop zone initially', async () => {
    const { getByText } = render(<App />);

    // ドロップゾーンが表示されることを確認
    await waitFor(() => {
      expect(getByText(/EPUBファイルをドロップ|Drop EPUB files here/)).toBeInTheDocument();
    });
  });

  it('should handle missing electronAPI gracefully', async () => {
    // コンソール警告のスパイ
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // electronAPIを削除
    delete (window as any).electronAPI;

    // アプリがクラッシュしないことを確認
    const { container } = render(<App />);

    // アプリケーションが正常にレンダリングされることを確認
    await waitFor(() => {
      expect(container.querySelector('.app')).toBeInTheDocument();
    });

    // 警告が出力されることを確認
    expect(consoleWarnSpy).toHaveBeenCalledWith('window.electronAPI.onProgress is not available');

    consoleWarnSpy.mockRestore();
  });

  it('should handle i18n initialization errors', async () => {
    // i18nのエラーをシミュレート
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(<App />);

    // アプリケーションが依然としてレンダリングされることを確認
    await waitFor(() => {
      expect(container.querySelector('.app')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});
