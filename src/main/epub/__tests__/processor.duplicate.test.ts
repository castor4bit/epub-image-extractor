// electronモックを最初に設定
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/mock/desktop'),
  },
}));

// electron-storeモック
vi.mock('electron-store');

// handleErrorモック
vi.mock('../../utils/errorHandler', () => ({
  handleError: vi.fn(),
}));

// settingsStoreモック
vi.mock('../../store/settings', () => ({
  settingsStore: {
    get: vi.fn(() => ({
      outputDirectory: '/mock/desktop/EPUB_Images',
      language: 'ja',
      alwaysOnTop: true,
      includeOriginalFilename: true,
      includePageSpread: true,
    })),
  },
}));

// parserモック
vi.mock('../parser', () => ({
  parseEpub: vi.fn().mockResolvedValue({
    navigation: [],
    spine: [],
    contentPath: '',
    resources: new Map(),
  }),
}));

// imageExtractorモック
vi.mock('../imageExtractor', () => ({
  extractImages: vi.fn().mockResolvedValue({
    imagePaths: [],
    totalImages: 0,
  }),
}));

// chapterOrganizerモック
vi.mock('../chapterOrganizer', () => ({
  organizeByChapters: vi.fn().mockResolvedValue({
    totalImages: 10,
    chapters: 3,
  }),
}));

import { processEpubFiles } from '../processor';

describe('processEpubFiles - 重複ファイル処理', () => {
  const mockOutputDir = '/mock/output';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fileIdが各ファイルに対して一意に生成される', async () => {
    const onProgress = vi.fn();
    // 異なるファイルパスで異なるfileIdが生成されることを確認
    const files = ['/path/to/file1.epub', '/path/to/file2.epub', '/path/to/file3.epub'];

    // processEpubFilesを実行
    await processEpubFiles(files, mockOutputDir, onProgress, 3);

    // pendingステータスの呼び出しからfileIdを収集（初期化時のfileIdのみ）
    const fileIds = new Set<string>();
    const pendingCalls = onProgress.mock.calls.filter((call) => call[0].status === 'pending');

    pendingCalls.forEach((call) => {
      const progress = call[0];
      if (progress.fileId) {
        fileIds.add(progress.fileId);
      }
    });

    // 3つの異なるfileIdが生成されたことを確認
    expect(fileIds.size).toBe(3);

    // 各fileIdがfile-{index}-{timestamp}の形式であることを確認
    const fileIdArray = Array.from(fileIds);
    fileIdArray.forEach((fileId, index) => {
      expect(fileId).toMatch(/^file-\d+-\d+$/);
      // indexが正しく振られていることを確認
      expect(fileId).toContain(`file-${index}-`);
    });
  });

  test('初期化時にすべてのファイルがpendingステータスで登録される', async () => {
    const onProgress = vi.fn();
    const files = ['/path/to/file1.epub', '/path/to/file2.epub'];

    await processEpubFiles(files, mockOutputDir, onProgress, 2);

    // pendingステータスの呼び出しを確認
    const pendingCalls = onProgress.mock.calls.filter((call) => call[0].status === 'pending');

    // 2つのファイルに対してpendingが呼ばれたことを確認
    expect(pendingCalls.length).toBe(2);

    // それぞれ異なるfileIdを持つことを確認
    const pendingFileIds = new Set(pendingCalls.map((call) => call[0].fileId));
    expect(pendingFileIds.size).toBe(2);
  });

  test('並列処理制限が機能する', async () => {
    const onProgress = vi.fn();
    const files = Array(5)
      .fill('/path/to/file.epub')
      .map((f, i) => `${f}.${i}`);

    await processEpubFiles(files, mockOutputDir, onProgress, 2);

    // すべてのファイルが処理されたことを確認（pending -> processing -> completed）
    const fileIds = new Set<string>();
    onProgress.mock.calls.forEach((call) => {
      const progress = call[0];
      if (progress.fileId) {
        fileIds.add(progress.fileId);
      }
    });

    // 5つの異なるfileIdが存在することを確認
    expect(fileIds.size).toBe(5);

    // 各ファイルがcompletedになったことを確認
    const completedCalls = onProgress.mock.calls.filter((call) => call[0].status === 'completed');
    expect(completedCalls.length).toBe(5);
  });

  test('同じファイルパスを複数回処理する場合、複数のpending呼び出しがあるが同じfileIdが使用される', async () => {
    const onProgress = vi.fn();
    // 同じファイルパスを複数回使用
    const samePath = '/path/to/same.epub';
    const files = [samePath, samePath, samePath];

    await processEpubFiles(files, mockOutputDir, onProgress, 3);

    // pendingステータスの呼び出しを確認
    const pendingCalls = onProgress.mock.calls.filter((call) => call[0].status === 'pending');

    // 同じファイルパスでも各要素に対してpendingが呼ばれる
    expect(pendingCalls.length).toBe(3);

    // すべてのpending呼び出しで同じfileIdが使用されることを確認
    const fileIds = new Set<string>();
    pendingCalls.forEach((call) => {
      if (call[0].fileId) {
        fileIds.add(call[0].fileId);
      }
    });

    // fileIdは1つのみ（最後のindexのfileId）
    expect(fileIds.size).toBe(1);

    // fileIdはfile-2-{timestamp}の形式（index 2が最後）
    const fileId = Array.from(fileIds)[0];
    expect(fileId).toMatch(/^file-2-\d+$/);
  });
});
