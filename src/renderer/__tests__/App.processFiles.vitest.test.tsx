import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
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

describe('App - processFiles関数', () => {
  let consoleErrorSpy: jest.SpyInstance;

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

  describe('ファイルパス取得', () => {
    it('getDroppedFilePathsで正しくパスを取得する', async () => {
      const files = [
        new File(['content1'], 'book1.epub', { type: 'application/epub+zip' }),
        new File(['content2'], 'book2.epub', { type: 'application/epub+zip' }),
      ];

      mockGetDroppedFilePaths.mockReturnValue([
        {
          path: '/path/to/book1.epub',
          name: 'book1.epub',
          size: 1000,
          type: 'application/epub+zip',
        },
        {
          path: '/path/to/book2.epub',
          name: 'book2.epub',
          size: 2000,
          type: 'application/epub+zip',
        },
      ]);
      mockProcessEpubFiles.mockResolvedValue({ success: true, results: [] });

      render(<App />);

      // ドロップイベントをシミュレート
      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const dataTransfer = { files, items: [], types: ['Files'] };

      await act(async () => {
        dropZone && fireEvent.drop(dropZone, { dataTransfer });
      });

      await waitFor(() => {
        expect(mockGetDroppedFilePaths).toHaveBeenCalledWith(files);
        expect(mockProcessEpubFiles).toHaveBeenCalledWith([
          '/path/to/book1.epub',
          '/path/to/book2.epub',
        ]);
      });
    });

    it('パスが取得できないファイルはフィルタリングされる', async () => {
      const files = [
        new File(['content1'], 'book1.epub', { type: 'application/epub+zip' }),
        new File(['content2'], 'book2.epub', { type: 'application/epub+zip' }),
      ];

      mockGetDroppedFilePaths.mockReturnValue([
        {
          path: '/path/to/book1.epub',
          name: 'book1.epub',
          size: 1000,
          type: 'application/epub+zip',
        },
        { path: '', name: 'book2.epub', size: 2000, type: 'application/epub+zip' }, // パスが空
      ]);
      mockProcessEpubFiles.mockResolvedValue({ success: true, results: [] });

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const dataTransfer = { files, items: [], types: ['Files'] };

      await act(async () => {
        dropZone && fireEvent.drop(dropZone, { dataTransfer });
      });

      await waitFor(() => {
        expect(mockProcessEpubFiles).toHaveBeenCalledWith(['/path/to/book1.epub']);
      });
    });
  });

  describe('進捗管理', () => {
    it('処理中は進捗が表示される', async () => {
      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book.epub', name: 'book.epub', size: 1000, type: 'application/epub+zip' },
      ]);

      // 処理を遅延させる
      let resolveProcess: any;
      const processPromise = new Promise((resolve) => {
        resolveProcess = resolve;
      });
      mockProcessEpubFiles.mockReturnValue(processPromise);

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const dataTransfer = { files: [file], items: [], types: ['Files'] };

      await act(async () => {
        dropZone && fireEvent.drop(dropZone, { dataTransfer });
      });

      // 進捗リスナーを呼び出す
      const progressCallback = mockOnProgress.mock.calls[0][0];
      act(() => {
        progressCallback({
          fileId: 'test-1',
          fileName: 'book.epub',
          totalImages: 10,
          processedImages: 5,
          status: 'processing',
          phase: 'extracting',
        });
      });

      // 進捗が表示されることを確認
      expect(screen.getByText(/画像を抽出中/)).toBeInTheDocument();

      // 処理を完了させる
      await act(async () => {
        resolveProcess({ success: true, results: [] });
      });
    });
  });

  describe('エラー処理', () => {
    it('processEpubFilesがエラーを返した場合', async () => {
      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book.epub', name: 'book.epub', size: 1000, type: 'application/epub+zip' },
      ]);
      mockProcessEpubFiles.mockResolvedValue({
        success: false,
        error: 'EPUBファイルが破損しています',
      });

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const dataTransfer = { files: [file], items: [], types: ['Files'] };

      await act(async () => {
        dropZone && fireEvent.drop(dropZone, { dataTransfer });
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'ファイル処理中にエラーが発生しました: EPUBファイルが破損しています',
        );
      });

      alertSpy.mockRestore();
    });

    it('例外がスローされた場合の詳細エラー表示', async () => {
      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book.epub', name: 'book.epub', size: 1000, type: 'application/epub+zip' },
      ]);

      const testError = new Error('ネットワークエラー');
      mockProcessEpubFiles.mockRejectedValue(testError);

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<App />);

      const dropZone = screen.getByText('EPUBファイルをドロップ').closest('.drop-zone');
      const dataTransfer = { files: [file], items: [], types: ['Files'] };

      await act(async () => {
        dropZone && fireEvent.drop(dropZone, { dataTransfer });
      });

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringContaining('ファイル処理中にエラーが発生しました'),
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith('処理エラー:', testError);
      });

      alertSpy.mockRestore();
    });
  });

  describe('結果の保存', () => {
    it('処理結果がlocalStorageに保存される', async () => {
      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
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
      const dataTransfer = { files: [file], items: [], types: ['Files'] };

      await act(async () => {
        dropZone && fireEvent.drop(dropZone, { dataTransfer });
      });

      await waitFor(() => {
        const savedResults = JSON.parse(localStorage.getItem('epubExtractionResults') || '[]');
        expect(savedResults).toHaveLength(1);
        expect(savedResults[0].fileId).toBe('test-1');
      });
    });

    it('重複する結果は保存されない', async () => {
      // 既存の結果をlocalStorageに保存
      const existingResult = {
        fileId: 'test-1',
        fileName: 'book.epub',
        outputPath: '/output/book',
        totalImages: 10,
        chapters: 3,
        errors: [],
      };
      localStorage.setItem('epubExtractionResults', JSON.stringify([existingResult]));

      const file = new File(['content'], 'book.epub', { type: 'application/epub+zip' });
      mockGetDroppedFilePaths.mockReturnValue([
        { path: '/test/book.epub', name: 'book.epub', size: 1000, type: 'application/epub+zip' },
      ]);
      mockProcessEpubFiles.mockResolvedValue({
        success: true,
        results: [existingResult], // 同じfileIdの結果
      });

      render(<App />);

      // 既存の結果があるので統合ビューが表示される
      const dropZone = screen
        .getByText('追加のEPUBファイルをドロップ')
        .closest('.compact-drop-zone');
      const dataTransfer = { files: [file], items: [], types: ['Files'] };

      await act(async () => {
        dropZone && fireEvent.drop(dropZone, { dataTransfer });
      });

      await waitFor(() => {
        const savedResults = JSON.parse(localStorage.getItem('epubExtractionResults') || '[]');
        expect(savedResults).toHaveLength(1); // 重複していないことを確認
      });
    });
  });
});
