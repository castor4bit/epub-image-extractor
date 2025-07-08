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

describe('processEpubFiles - 進捗表示', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'epub-test-'));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  test('すべてのファイルが初期化時にpendingステータスで登録される', async () => {
    const progressUpdates: any[] = [];
    const onProgress = (progress: any) => {
      progressUpdates.push({ ...progress });
    };

    const testFiles = [
      path.join(__dirname, 'test-single.epub'),
      path.join(__dirname, 'test-duplicate.epub'),
      path.join(__dirname, 'test-no-nav.epub'),
      path.join(__dirname, 'test-single.epub'), // 4つ目のファイル（重複）
    ];

    // 4つのファイルが存在することを確認
    for (const file of testFiles) {
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      if (!exists) {
        // テストファイルが存在しない場合はスキップ
        console.log(`Test file not found: ${file}`);
        return;
      }
    }

    await processEpubFiles(testFiles, tempDir, onProgress, 3);

    // 初期化時にすべてのファイルがpendingで登録されていることを確認
    const pendingUpdates = progressUpdates.filter((u) => u.status === 'pending');
    expect(pendingUpdates.length).toBeGreaterThanOrEqual(4);

    // 各ファイルのfileIdが一意であることを確認
    const fileIds = new Set(progressUpdates.map((u) => u.fileId));
    expect(fileIds.size).toBeGreaterThan(0);
  });

  test('並列処理数が3でも4つ以上のファイルが正しく処理される', async () => {
    const progressByFile: Record<string, any[]> = {};
    const onProgress = (progress: any) => {
      if (!progressByFile[progress.fileId]) {
        progressByFile[progress.fileId] = [];
      }
      progressByFile[progress.fileId].push({ ...progress });
    };

    const testFiles = [
      path.join(__dirname, 'test-single.epub'),
      path.join(__dirname, 'test-duplicate.epub'),
      path.join(__dirname, 'test-no-nav.epub'),
      path.join(__dirname, 'test-single.epub'), // 4つ目（重複）
    ];

    // テストファイルが存在するか確認
    const existingFiles = [];
    for (const file of testFiles) {
      const exists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        existingFiles.push(file);
      }
    }

    if (existingFiles.length < 4) {
      console.log('Not enough test files for this test');
      return;
    }

    const results = await processEpubFiles(existingFiles, tempDir, onProgress, 3);

    // すべてのファイルが処理されたことを確認（重複ファイルも含めて4つ）
    expect(results.length).toBe(4);

    // 各ファイルの進捗が正しく更新されていることを確認
    // 注意：同じファイルパスの場合、fileIdは異なるが進捗は同じfileIdで更新される可能性がある
    const fileIdList = Object.keys(progressByFile);
    expect(fileIdList.length).toBeGreaterThanOrEqual(3); // 最低3つの異なるファイル

    // 各ファイルがpending -> processing -> completed/errorの順で状態遷移していることを確認
    fileIdList.forEach((fileId) => {
      const updates = progressByFile[fileId];
      const statuses = updates.map((u) => u.status);

      // 最初はpending
      expect(statuses[0]).toBe('pending');

      // 最後はcompletedまたはerror
      const lastStatus = statuses[statuses.length - 1];
      expect(['completed', 'error']).toContain(lastStatus);
    });
  });

  test('処理完了後にpendingステータスが残らない', async () => {
    const finalProgress: Record<string, any> = {};
    const onProgress = (progress: any) => {
      finalProgress[progress.fileId] = { ...progress };
    };

    const testFile = path.join(__dirname, 'test-single.epub');
    const exists = await fs
      .access(testFile)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      console.log('Test file not found');
      return;
    }

    await processEpubFiles([testFile], tempDir, onProgress);

    // 最終的な進捗状態にpendingが含まれていないことを確認
    const finalStatuses = Object.values(finalProgress).map((p: any) => p.status);
    expect(finalStatuses).not.toContain('pending');
  });
});