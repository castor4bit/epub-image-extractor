import React from 'react';
import { describe, test, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import type { ProcessingProgress } from '@shared/types';

// ElectronAPIのモック
const mockElectronAPI = {
  getVersion: vi.fn().mockResolvedValue('1.0.0'),
  processEpubFiles: vi.fn().mockResolvedValue({ success: true, results: [] }),
  onProgress: vi.fn(),
  selectOutputDirectory: vi.fn().mockResolvedValue('/test/path'),
  getDroppedFilePaths: vi.fn((fileList) => {
    // FileListをモック化したデータに変換
    return Array.from(fileList as any).map((file: any) => ({
      path: file.path || file.name,
      name: file.name,
      size: file.size || 1000,
      type: file.type || 'application/epub+zip',
    }));
  }),
  updateProcessingState: vi.fn(),
};

// window.electronAPIを設定
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('アプリケーションタイトルを表示する', () => {
    render(<App />);
    expect(screen.getByText('EPUB Image Extractor')).toBeInTheDocument();
  });

  it('ドロップゾーンを表示する', () => {
    render(<App />);
    expect(screen.getByText('EPUBファイルをドロップ')).toBeInTheDocument();
    expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
  });

  it('ドラッグオーバー時にアクティブクラスを追加する', () => {
    render(<App />);
    const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');

    if (dropZone) {
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('active');

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('active');
    }
  });

  it('EPUBファイルをドロップすると処理を開始する', async () => {
    render(<App />);
    const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');

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

  it('EPUB以外のファイルをドロップするとアラートを表示する', async () => {
    window.alert = vi.fn();
    // getDroppedFilePathsが空の配列を返すようにモック
    mockElectronAPI.getDroppedFilePaths.mockReturnValue([]);

    render(<App />);
    const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');

    if (dropZone) {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile],
          items: [],
          types: ['Files'],
        },
      });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('無効なファイル形式です');
      });
    }
  });

  it('処理中は進捗を表示する', async () => {
    let progressCallback: ((data: ProcessingProgress) => void) | null = null;

    // onProgressのモックを設定
    mockElectronAPI.onProgress.mockImplementation(
      (callback: (data: ProcessingProgress) => void) => {
        progressCallback = callback;
        // クリーンアップ関数を返す
        return () => {
          progressCallback = null;
        };
      },
    );

    // getDroppedFilePathsのモックを設定
    mockElectronAPI.getDroppedFilePaths.mockReturnValue([
      { path: '/test/path/test.epub', name: 'test.epub', size: 1000, type: 'application/epub+zip' },
    ]);

    render(<App />);

    const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');

    if (dropZone) {
      const mockFile = new File(['test content'], 'test.epub', { type: 'application/epub+zip' });
      Object.defineProperty(mockFile, 'path', { value: '/test/path/test.epub' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockFile],
          items: [],
          types: ['Files'],
        },
      });

      // 進捗データを送信
      await waitFor(() => {
        expect(mockElectronAPI.processEpubFiles).toHaveBeenCalled();
      });

      // progressCallback を一時変数に代入してTypeScriptの型推論を助ける
      act(() => {
        progressCallback?.({
          fileId: 'test-1',
          fileName: 'test.epub',
          totalImages: 10,
          processedImages: 5,
          status: 'processing',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('test.epub')).toBeInTheDocument();
        expect(screen.getByText('画像を抽出中...: 5 / 10')).toBeInTheDocument();
      });
    }
  });
});
