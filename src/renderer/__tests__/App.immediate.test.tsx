import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { ProcessingProgress, ExtractionResult } from '@shared/types';

// Electronのモック
const mockElectronAPI = {
  getVersion: jest.fn().mockResolvedValue('1.0.0'),
  processEpubFiles: jest.fn(),
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
    });
  });

  test('個別のファイルが完了したら即座に「出力先を開く」ボタンが表示される', async () => {
    render(<App />);

    // onProgressのコールバックが設定されたことを確認
    expect(mockElectronAPI.onProgress).toHaveBeenCalled();

    // ファイル1の処理開始
    progressCallback({
      fileId: 'file-1',
      fileName: 'test1.epub',
      totalImages: 10,
      processedImages: 0,
      status: 'processing',
    });

    // ファイル2の処理開始
    progressCallback({
      fileId: 'file-2',
      fileName: 'test2.epub',
      totalImages: 20,
      processedImages: 0,
      status: 'processing',
    });

    // ファイル1が完了（outputPathとchaptersを含む）
    progressCallback({
      fileId: 'file-1',
      fileName: 'test1.epub',
      totalImages: 10,
      processedImages: 10,
      status: 'completed',
      outputPath: '/output/test1',
      chapters: 3,
    });

    // ファイル1の「出力先を開く」ボタンが即座に表示されることを確認
    await waitFor(() => {
      const buttons = screen.getAllByText('📁 出力先を開く');
      expect(buttons.length).toBe(1);
      expect(buttons[0]).toHaveAttribute('title', '/output/test1');
    });

    // localStorageに保存されたことを確認
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'epubExtractionResults',
      expect.stringContaining('test1.epub'),
    );

    // ファイル2はまだ処理中
    expect(screen.getByText('test2.epub')).toBeInTheDocument();
    expect(screen.getByText('処理中: 0 / 20 画像')).toBeInTheDocument();
  });

  test('エラーになったファイルも即座に結果として表示される', async () => {
    render(<App />);

    // ファイルの処理開始
    progressCallback({
      fileId: 'file-1',
      fileName: 'test1.epub',
      totalImages: 0,
      processedImages: 0,
      status: 'processing',
    });

    // エラーで完了
    progressCallback({
      fileId: 'file-1',
      fileName: 'test1.epub',
      totalImages: 0,
      processedImages: 0,
      status: 'error',
      error: 'ファイルが壊れています',
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

  test('outputPathがない場合でも完了として扱われる', async () => {
    render(<App />);

    // outputPathなしで完了
    progressCallback({
      fileId: 'file-1',
      fileName: 'test1.epub',
      totalImages: 10,
      processedImages: 10,
      status: 'completed',
      // outputPath省略
    });

    // 完了として表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('10画像')).toBeInTheDocument();
    });

    // 「出力先を開く」ボタンは表示されない
    expect(screen.queryByText('📁 出力先を開く')).not.toBeInTheDocument();
  });
});
