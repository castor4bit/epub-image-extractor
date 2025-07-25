import { _electron as electron } from '@playwright/test';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

async function globalTeardown() {
  // Playwrightが自動的にプロセスをクリーンアップするため、手動クリーンアップは不要
  
  // E2Eテスト用の一時ディレクトリをクリーンアップ
  const testDir = path.join(os.tmpdir(), 'epub-extractor-e2e');

  try {
    await fs.rm(testDir, { recursive: true, force: true });
    console.log('E2E test temporary directory cleaned up:', testDir);
  } catch (error) {
    console.warn('Failed to cleanup test directory:', error);
  }
}

export default globalTeardown;
