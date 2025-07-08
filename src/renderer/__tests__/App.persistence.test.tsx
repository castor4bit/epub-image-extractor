import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// モックの設定
const mockElectronAPI = {
  getVersion: jest.fn().mockResolvedValue('1.0.0'),
  processEpubFiles: jest.fn(),
  onProgress: jest.fn(),
  selectOutputDirectory: jest.fn(),
  getSettings: jest.fn().mockResolvedValue({ outputDirectory: '/test', language: 'ja' }),
  saveSettings: jest.fn().mockResolvedValue({ success: true }),
  resetSettings: jest.fn().mockResolvedValue({ outputDirectory: '/test', language: 'ja' }),
  openFolder: jest.fn().mockResolvedValue({ success: true }),
};

// window.electronAPIをモック
(global as any).window = {
  electronAPI: mockElectronAPI,
};

// localStorageのモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('App - 結果の永続化', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('起動時にlocalStorageから前回の結果を復元する', () => {
    const savedResults = [
      {
        fileId: 'file-1-1000',
        fileName: 'saved1.epub',
        outputPath: '/output/saved1',
        totalImages: 100,
        chapters: 10,
        errors: [],
      },
      {
        fileId: 'file-2-2000',
        fileName: 'saved2.epub',
        outputPath: '/output/saved2',
        totalImages: 50,
        chapters: 5,
        errors: [],
      },
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedResults));

    render(<App />);

    // localStorageから読み込まれたことを確認
    expect(localStorageMock.getItem).toHaveBeenCalledWith('epubExtractionResults');

    // 保存された結果が表示されていることを確認
    expect(screen.getByText('saved1.epub')).toBeInTheDocument();
    expect(screen.getByText('saved2.epub')).toBeInTheDocument();
    expect(screen.getByText('100画像, 10章')).toBeInTheDocument();
    expect(screen.getByText('50画像, 5章')).toBeInTheDocument();
  });

  test('処理完了時に結果をlocalStorageに保存する', async () => {
    const user = userEvent.setup();

    // 処理成功をシミュレート
    mockElectronAPI.processEpubFiles.mockResolvedValue({
      success: true,
      results: [
        {
          fileId: 'file-1-3000',
          fileName: 'new.epub',
          outputPath: '/output/new',
          totalImages: 75,
          chapters: 8,
          errors: [],
        },
      ],
    });

    // onProgressコールバックを保存
    let progressCallback: any;
    mockElectronAPI.onProgress.mockImplementation((callback) => {
      progressCallback = callback;
    });

    render(<App />);

    // ファイル入力をシミュレート
    const input = screen.getByLabelText('ファイルを選択');
    const file = new File(['test'], 'new.epub', { type: 'application/epub+zip' });
    Object.defineProperty(file, 'path', { value: '/test/new.epub' });

    await user.upload(input, file);

    // 処理完了を待つ
    await waitFor(() => {
      expect(mockElectronAPI.processEpubFiles).toHaveBeenCalled();
    });

    // localStorageに保存されたことを確認
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'epubExtractionResults',
        expect.stringContaining('new.epub'),
      );
    });
  });

  test('クリアボタンでlocalStorageからも削除される', async () => {
    const user = userEvent.setup();

    // 保存された結果がある状態
    const savedResults = [
      {
        fileId: 'file-1-1000',
        fileName: 'test.epub',
        outputPath: '/output/test',
        totalImages: 100,
        chapters: 10,
        errors: [],
      },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedResults));

    render(<App />);

    // クリアボタンをクリック
    const clearButton = screen.getByText('クリア');
    await user.click(clearButton);

    // localStorageから削除されたことを確認
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('epubExtractionResults');
  });

  test('pendingステータスのアイテムは処理完了後に削除される', async () => {
    const user = userEvent.setup();

    mockElectronAPI.processEpubFiles.mockResolvedValue({
      success: true,
      results: [
        {
          fileId: 'file-1-1000',
          fileName: 'processed.epub',
          outputPath: '/output/processed',
          totalImages: 50,
          chapters: 5,
          errors: [],
        },
      ],
    });

    let progressCallback: any;
    mockElectronAPI.onProgress.mockImplementation((callback) => {
      progressCallback = callback;
    });

    render(<App />);

    // ファイル処理開始
    const input = screen.getByLabelText('ファイルを選択');
    const file = new File(['test'], 'test.epub', { type: 'application/epub+zip' });
    Object.defineProperty(file, 'path', { value: '/test/test.epub' });

    await user.upload(input, file);

    // pendingステータスを送信
    await waitFor(() => {
      if (progressCallback) {
        progressCallback({
          fileId: 'file-1-1000',
          fileName: 'test.epub',
          status: 'pending',
          totalImages: 0,
          processedImages: 0,
        });
      }
    });

    // pendingが表示されることを確認
    expect(screen.getByText('待機中')).toBeInTheDocument();

    // 処理完了を待つ
    await waitFor(() => {
      expect(mockElectronAPI.processEpubFiles).toHaveBeenCalled();
    });

    // pendingステータスが消えていることを確認
    await waitFor(() => {
      expect(screen.queryByText('待機中')).not.toBeInTheDocument();
    });
  });
});
