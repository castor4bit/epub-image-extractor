import React from 'react';
import { render, screen, waitFor, act, fireEvent } from './setup';
import App from '../App';
import { ProcessingProgress } from '@shared/types';

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
  processEpubFiles: jest.fn().mockResolvedValue({ success: true, results: [] }),
  onProgress: jest.fn(),
  selectOutputDirectory: jest.fn(),
  getSettings: jest.fn().mockResolvedValue({
    outputDirectory: '/test/output',
    language: 'ja',
    alwaysOnTop: true,
  }),
  saveSettings: jest.fn().mockResolvedValue({ success: true }),
  resetSettings: jest.fn(),
  openFolder: jest.fn(),
};

// window.electronAPIをモック
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// localStorageのモック
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('App - 個別ファイル完了時の即座の表示', () => {
  let progressCallback: (progress: ProcessingProgress) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);

    // onProgressのコールバックをキャプチャ
    mockElectronAPI.onProgress.mockImplementation((callback) => {
      progressCallback = callback;
      // クリーンアップ関数を返す
      return () => {
        progressCallback = null as unknown as (progress: ProcessingProgress) => void;
      };
    });
  });

  test('個別のファイルが完了したら即座に「出力先を開く」ボタンが表示される', async () => {
    render(<App />);

    // onProgressのコールバックが設定されたことを確認
    expect(mockElectronAPI.onProgress).toHaveBeenCalled();

    // ファイルをドロップして処理を開始
    const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
    const mockFile = new File(['test content'], 'test1.epub', { type: 'application/epub+zip' });
    Object.defineProperty(mockFile, 'path', { value: '/test/path/test1.epub' });

    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile],
      },
    });

    // processEpubFilesが呼ばれるまで待つ
    await waitFor(() => {
      expect(mockElectronAPI.processEpubFiles).toHaveBeenCalled();
    });

    // ファイル1の処理開始をシミュレート
    act(() => {
      progressCallback({
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 10,
        processedImages: 0,
        status: 'processing',
      });
    });

    // ファイル1が完了（outputPathとchaptersを含む）
    act(() => {
      progressCallback({
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 10,
        processedImages: 10,
        status: 'completed',
        outputPath: '/output/test1',
        chapters: 3,
      });
    });

    // ファイル1の「出力先を開く」ボタンが即座に表示されることを確認
    await waitFor(() => {
      const buttons = screen.getAllByText('📁 フォルダを開く');
      expect(buttons.length).toBe(1);
      expect(buttons[0]).toHaveAttribute('title', '/output/test1');
    });

    // localStorageに保存されたことを確認
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'epubExtractionResults',
      expect.stringContaining('test1.epub'),
    );
  });

  test('エラーになったファイルも即座に結果として表示される', async () => {
    render(<App />);

    // ファイルをドロップして処理を開始
    const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
    const mockFile = new File(['test content'], 'test1.epub', { type: 'application/epub+zip' });
    Object.defineProperty(mockFile, 'path', { value: '/test/path/test1.epub' });

    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile],
      },
    });

    // processEpubFilesが呼ばれるまで待つ
    await waitFor(() => {
      expect(mockElectronAPI.processEpubFiles).toHaveBeenCalled();
    });

    // ファイルの処理開始
    act(() => {
      progressCallback({
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'processing',
      });
    });

    // エラーで完了
    act(() => {
      progressCallback({
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 0,
        processedImages: 0,
        status: 'error',
        error: 'ファイルが壊れています',
      });
    });

    // エラーメッセージが即座に表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('エラー: ファイルが壊れています')).toBeInTheDocument();
    });

    // localStorageに保存されたことを確認
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'epubExtractionResults',
      expect.stringContaining('ファイルが壊れています'),
    );
  });

  test('複数ファイルの処理中に個別に完了したファイルが即座に表示される', async () => {
    render(<App />);

    // 2つのファイルをドロップ
    const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
    const mockFile1 = new File(['test1'], 'test1.epub', { type: 'application/epub+zip' });
    const mockFile2 = new File(['test2'], 'test2.epub', { type: 'application/epub+zip' });
    Object.defineProperty(mockFile1, 'path', { value: '/test/path/test1.epub' });
    Object.defineProperty(mockFile2, 'path', { value: '/test/path/test2.epub' });

    fireEvent.drop(dropZone!, {
      dataTransfer: {
        files: [mockFile1, mockFile2],
      },
    });

    await waitFor(() => {
      expect(mockElectronAPI.processEpubFiles).toHaveBeenCalled();
    });

    // 両方のファイルの処理開始
    act(() => {
      progressCallback({
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 10,
        processedImages: 0,
        status: 'processing',
      });
      progressCallback({
        fileId: 'file-2',
        fileName: 'test2.epub',
        totalImages: 20,
        processedImages: 0,
        status: 'processing',
      });
    });

    // ファイル1だけ完了
    act(() => {
      progressCallback({
        fileId: 'file-1',
        fileName: 'test1.epub',
        totalImages: 10,
        processedImages: 10,
        status: 'completed',
        outputPath: '/output/test1',
        chapters: 3,
      });
    });

    // ファイル1の結果が表示され、ファイル2はまだ処理中
    await waitFor(() => {
      expect(screen.getByText('10画像, 3章')).toBeInTheDocument();
      expect(screen.getByText('画像を抽出中...: 0 / 20')).toBeInTheDocument();
    });
  });
});
