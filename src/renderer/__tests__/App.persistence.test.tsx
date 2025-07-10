import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { ProcessingProgress } from '@shared/types';

// モックの設定
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
  processEpubFiles: jest.fn(),
  onProgress: jest.fn(),
  selectOutputDirectory: jest.fn(),
  getSettings: jest.fn().mockResolvedValue({ outputDirectory: '/test', language: 'ja' }),
  saveSettings: jest.fn().mockResolvedValue({ success: true }),
  resetSettings: jest.fn().mockResolvedValue({ outputDirectory: '/test', language: 'ja' }),
  openFolder: jest.fn().mockResolvedValue({ success: true }),
};

// window.electronAPIをモック
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

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

  test('起動時にlocalStorageから前回の結果を復元する', async () => {
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
    await waitFor(() => {
      expect(screen.getByText('saved1.epub')).toBeInTheDocument();
      expect(screen.getByText('saved2.epub')).toBeInTheDocument();
      expect(screen.getByText('100画像, 10章')).toBeInTheDocument();
      expect(screen.getByText('50画像, 5章')).toBeInTheDocument();
    });
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
    mockElectronAPI.onProgress.mockImplementation((_callback) => {
      // クリーンアップ関数を返す
      return () => {
        // cleanup
      };
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
    let progressCallback: ((progress: ProcessingProgress) => void) | null = null;

    // 処理を遅延させて、pendingステータスが表示される時間を確保
    mockElectronAPI.processEpubFiles.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
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
        }, 100);
      });
    });

    mockElectronAPI.onProgress.mockImplementation((callback) => {
      progressCallback = callback;
      // クリーンアップ関数を返す
      return () => {
        progressCallback = null;
      };
    });

    render(<App />);

    // ファイル処理開始
    const input = screen.getByLabelText('ファイルを選択');
    const file = new File(['test'], 'test.epub', { type: 'application/epub+zip' });
    Object.defineProperty(file, 'path', { value: '/test/test.epub' });

    await user.upload(input, file);

    // pendingステータスを送信
    act(() => {
      if (progressCallback) {
        progressCallback({
          fileId: 'file-1-1000',
          fileName: 'test.epub',
          status: 'pending',
          totalImages: 0,
          processedImages: 0,
          outputPath: '',
          chapters: 0,
        });
      }
    });

    // pendingが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('test.epub')).toBeInTheDocument();
      expect(screen.getByText('待機中')).toBeInTheDocument();
    });

    // 処理完了を待つ
    await waitFor(() => {
      expect(mockElectronAPI.processEpubFiles).toHaveBeenCalled();
    });

    // 処理完了後、pendingステータスが完了に置き換わり、"待機中"テキストがなくなることを確認
    await waitFor(() => {
      expect(screen.queryByText('待機中')).not.toBeInTheDocument();
      // pendingステータスのtest.epubは削除され、completedステータスのprocessed.epubだけが表示される
      expect(screen.queryByText('test.epub')).not.toBeInTheDocument();
      expect(screen.getByText('processed.epub')).toBeInTheDocument();
      expect(screen.getByText('50画像, 5章')).toBeInTheDocument();
    });
  });
});
