// electronモックを最初に設定
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/desktop')
  }
}));

// electron-storeモック
jest.mock('electron-store');

// handleErrorモック
jest.mock('../../utils/errorHandler', () => ({
  handleError: jest.fn(),
}));

import { processEpubFiles } from '../processor';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

describe('processEpubFiles - fileIdの一貫性', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'epub-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('同じファイルに対して一貫したfileIdが使用される', async () => {
    const progressUpdates: any[] = [];
    const onProgress = (progress: any) => {
      progressUpdates.push({ ...progress });
    };

    const testFile = path.join(__dirname, 'test-single.epub');
    const exists = await fs
      .access(testFile)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      // ダミーファイルを作成
      await fs.writeFile(testFile, 'dummy content');
    }

    await processEpubFiles([testFile], tempDir, onProgress);

    // fileIdごとにグループ化
    const updatesByFileId = progressUpdates.reduce(
      (acc, update) => {
        if (!acc[update.fileId]) {
          acc[update.fileId] = [];
        }
        acc[update.fileId].push(update);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    // 各ファイルに対して1つのfileIdのみが使用されていることを確認
    const fileIds = Object.keys(updatesByFileId);
    expect(fileIds.length).toBe(1);

    // そのfileIdに対して、pending -> processing -> completed/errorの状態遷移があることを確認
    const updates = updatesByFileId[fileIds[0]];
    const statuses = updates.map((u) => u.status);

    expect(statuses[0]).toBe('pending');
    expect(statuses).toContain('processing');

    // 最後はcompletedまたはerror
    const lastStatus = statuses[statuses.length - 1];
    expect(['completed', 'error']).toContain(lastStatus);
  });

  test('複数ファイルでもfileIdの重複がない', async () => {
    const progressUpdates: any[] = [];
    const onProgress = (progress: any) => {
      progressUpdates.push({ ...progress });
    };

    const testFiles = [
      path.join(__dirname, 'test-single.epub'),
      path.join(__dirname, 'test-duplicate.epub'),
    ];

    // ダミーファイルを作成
    for (const file of testFiles) {
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        await fs.writeFile(file, 'dummy content');
      }
    }

    await processEpubFiles(testFiles, tempDir, onProgress);

    // 使用されたfileIdを収集
    const fileIds = new Set(progressUpdates.map((u) => u.fileId));

    // ファイル数と同じ数のユニークなfileIdがあることを確認
    expect(fileIds.size).toBe(testFiles.length);

    // 各fileIdが適切に使用されていることを確認
    fileIds.forEach((fileId) => {
      const updates = progressUpdates.filter((u) => u.fileId === fileId);
      const statuses = updates.map((u) => u.status);

      // pending状態から始まることを確認
      expect(statuses[0]).toBe('pending');
    });
  });
});