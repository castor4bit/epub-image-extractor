import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// ElectronAPIのモック
const mockElectronAPI = {
  getVersion: jest.fn().mockResolvedValue('1.0.0'),
  processEpubFiles: jest.fn().mockResolvedValue({ success: true, results: [] }),
  onProgress: jest.fn(),
  selectOutputDirectory: jest.fn().mockResolvedValue('/test/path'),
};

// window.electronAPIを設定
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('アプリケーションタイトルを表示する', () => {
    render(<App />);
    expect(screen.getByText('EPUB画像抽出ツール')).toBeInTheDocument();
  });

  it('ドロップゾーンを表示する', () => {
    render(<App />);
    expect(screen.getByText('EPUBファイルをここにドラッグ&ドロップ')).toBeInTheDocument();
    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
  });

  it('ドラッグオーバー時にアクティブクラスを追加する', () => {
    render(<App />);
    const dropZone = screen
      .getByText('EPUBファイルをここにドラッグ&ドロップ')
      .closest('.drop-zone');

    if (dropZone) {
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('active');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('active');
    }
  });

  it('EPUBファイルをドロップすると処理を開始する', async () => {
    render(<App />);
    const dropZone = screen
      .getByText('EPUBファイルをここにドラッグ&ドロップ')
      .closest('.drop-zone');

    if (dropZone) {
      // モックファイルを作成
      const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
      Object.defineProperty(mockFile, 'path', { value: '/test/path/test.epub' });

      // ドロップイベントを発火
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile],
        },
      });

      await waitFor(() => {
        expect(mockElectronAPI.processEpubFiles).toHaveBeenCalledWith(['/test/path/test.epub']);
      });
    }
  });

  it('EPUB以外のファイルをドロップするとアラートを表示する', () => {
    window.alert = jest.fn();
    render(<App />);
    const dropZone = screen
      .getByText('EPUBファイルをここにドラッグ&ドロップ')
      .closest('.drop-zone');

    if (dropZone) {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile],
        },
      });

      expect(window.alert).toHaveBeenCalledWith('EPUBファイルを選択してください');
    }
  });

  it('処理中は進捗を表示する', async () => {
    render(<App />);

    // 進捗コールバックを設定
    mockElectronAPI.onProgress.mockImplementation((callback) => {
      callback({
        fileId: 'test-1',
        fileName: 'test.epub',
        totalImages: 10,
        processedImages: 5,
        status: 'processing',
      });
    });

    const dropZone = screen
      .getByText('EPUBファイルをここにドラッグ&ドロップ')
      .closest('.drop-zone');

    if (dropZone) {
      const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
      Object.defineProperty(mockFile, 'path', { value: '/test/path/test.epub' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('処理中...')).toBeInTheDocument();
        expect(screen.getByText('test.epub')).toBeInTheDocument();
        expect(screen.getByText('5 / 10 画像')).toBeInTheDocument();
      });
    }
  });
});
