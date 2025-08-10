import React from 'react';
import { describe, test, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// モックの設定
const mockProcessEpubFiles = vi.fn();
const mockGetDroppedFilePaths = vi.fn();
const mockOnProgress = vi.fn();

(global as any).window.electronAPI = {
  processEpubFiles: mockProcessEpubFiles,
  getDroppedFilePaths: mockGetDroppedFilePaths,
  onProgress: mockOnProgress,
  getSettings: vi.fn().mockResolvedValue({
    outputDirectory: '/test/output',
    language: 'ja',
    alwaysOnTop: false,
    includeOriginalFilename: true,
    includePageSpread: true,
  }),
  saveSettings: vi.fn(),
  getVersion: vi.fn().mockResolvedValue({
    version: '1.0.0',
    name: 'Test App',
  }),
  updateProcessingState: vi.fn(),
};

describe('App - ドラッグ&ドロップ機能', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockOnProgress.mockReturnValue(() => {});
    // console.errorをモックしてテスト中のエラー出力を抑制
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('ファイルドロップ', () => {
    it('単一のEPUBファイルをドロップできる', async () => {
      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book.epub', name: 'book.epub', size: 1000, type: 'application/epub+zip' },
      ]);
      mockProcessEpubFiles.mockResolvedValue({
        success: true,
        results: [
          {
            fileId: 'test-1',
            fileName: 'book.epub',
            outputPath: '/output/book',
            totalImages: 10,
            chapters: 3,
            errors: [],
          },
        ],
      });

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      expect(dropZone).toBeInTheDocument();

      // ドラッグイベントをシミュレート
      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
      const dataTransfer = {
        files: [file],
        items: [],
        types: ['Files'],
      };

      fireEvent.dragEnter(dropZone!, { dataTransfer });
      expect(dropZone).toHaveClass('active');

      fireEvent.drop(dropZone!, { dataTransfer });

      // processFilesが呼ばれることを確認
      await waitFor(() => {
        expect(mockGetDroppedFilePaths).toHaveBeenCalledWith([file]);
        expect(mockProcessEpubFiles).toHaveBeenCalledWith(['/test/book.epub']);
      });
    });

    it('複数のEPUBファイルをドロップできる', async () => {
      const files = [
        new File(['content1'], 'book1.epub', { type: 'application/epub+zip' }),
        new File(['content2'], 'book2.epub', { type: 'application/epub+zip' }),
      ];

      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book1.epub', name: 'book1.epub', size: 1000, type: 'application/epub+zip' },
        { path: '/test/book2.epub', name: 'book2.epub', size: 2000, type: 'application/epub+zip' },
      ]);
      mockProcessEpubFiles.mockResolvedValue({ success: true, results: [] });

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const dataTransfer = {
        files: files,
        items: [],
        types: ['Files'],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(mockGetDroppedFilePaths).toHaveBeenCalledWith(files);
        expect(mockProcessEpubFiles).toHaveBeenCalledWith(['/test/book1.epub', '/test/book2.epub']);
      });
    });

    it('無効なファイルをドロップした場合エラーを表示', async () => {
      mockGetDroppedFilePaths.mockReturnValue([]);
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const file = new File(['content'], 'document.txt', { type: 'text/plain' });
      const dataTransfer = {
        files: [file],
        items: [],
        types: ['Files'],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('ファイル処理中にエラーが発生しました'),
        );
      });

      alertSpy.mockRestore();
    });

    it('処理中に追加のファイルをドロップした場合はブロックされる', async () => {
      // 最初のファイル処理を開始（未解決のPromise）
      let resolveProcess: any;
      const processPromise = new Promise((resolve) => {
        resolveProcess = resolve;
      });
      mockProcessEpubFiles.mockReturnValue(processPromise);
      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book.epub', name: 'book.epub', size: 1000, type: 'application/epub+zip' },
      ]);

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
      const dataTransfer = {
        files: [file],
        items: [],
        types: ['Files'],
      };

      // 最初のドロップ
      fireEvent.drop(dropZone!, { dataTransfer });

      // 処理が開始されるまで待つ
      await waitFor(() => {
        expect(mockProcessEpubFiles).toHaveBeenCalled();
      });

      // 統合ビューに切り替わっているので、compact-drop-zoneを使用
      const compactDropZone = screen
        .getByText('追加のEPUBファイルをドロップ')
        .closest('.compact-drop-zone');

      // compact-drop-zoneがdisabledクラスを持っていることを確認
      expect(compactDropZone).toHaveClass('disabled');

      // processEpubFilesが最初の1回しか呼ばれていないことを確認
      expect(mockProcessEpubFiles).toHaveBeenCalledTimes(1);

      // 2回目のドロップ（処理中）- ブロックされる
      fireEvent.drop(compactDropZone!, { dataTransfer });

      // 追加の処理が開始されないことを確認
      await waitFor(() => {
        expect(mockProcessEpubFiles).toHaveBeenCalledTimes(1);
      });

      // 処理を完了させる
      resolveProcess({ success: true, results: [] });

      // 処理完了後はdisabledクラスが削除されることを確認
      await waitFor(() => {
        expect(compactDropZone).not.toHaveClass('disabled');
      });
    });
  });

  describe('ドラッグ操作のUI変更', () => {
    it('ドラッグ開始時にドロップゾーンがアクティブになる', () => {
      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      expect(dropZone).not.toHaveClass('active');

      fireEvent.dragEnter(dropZone!, {
        dataTransfer: { files: [], items: [], types: ['Files'] },
      });

      expect(dropZone).toHaveClass('active');
    });

    it('ドラッグ終了時にドロップゾーンが非アクティブになる', () => {
      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');

      fireEvent.dragEnter(dropZone!, {
        dataTransfer: { files: [], items: [], types: ['Files'] },
      });
      expect(dropZone).toHaveClass('active');

      fireEvent.dragLeave(dropZone!, {
        dataTransfer: { files: [], items: [], types: ['Files'] },
      });
      expect(dropZone).not.toHaveClass('active');
    });
  });

  describe('エラーハンドリング', () => {
    it('処理エラー時に詳細なエラーメッセージを表示', async () => {
      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book.epub', name: 'book.epub', size: 1000, type: 'application/epub+zip' },
      ]);
      mockProcessEpubFiles.mockRejectedValue(new Error('ファイルが破損しています'));

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
      const dataTransfer = {
        files: [file],
        items: [],
        types: ['Files'],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('ファイル処理中にエラーが発生しました'),
        );
      });

      alertSpy.mockRestore();
    });

    it('空のファイルリストでドロップした場合エラーを表示', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const dataTransfer = {
        files: [],
        items: [],
        types: ['Files'],
      };

      fireEvent.drop(dropZone!, { dataTransfer });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('無効なファイル形式です');
      });

      alertSpy.mockRestore();
    });
  });
});
