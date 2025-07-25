import { _electron as electron, ElectronApplication } from '@playwright/test';
import path from 'path';

/**
 * CI環境を考慮してElectronアプリケーションを起動する
 * @param additionalEnv 追加の環境変数
 * @returns ElectronApplicationインスタンス
 */
export async function launchElectron(
  additionalEnv?: Record<string, string>,
): Promise<ElectronApplication> {
  const args = [path.join(__dirname, '../../dist-electron/main/index.js')];

  // CI環境（Linux）では追加のフラグを設定
  if (process.env.CI && process.platform === 'linux') {
    args.push(
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    );
  }

  return await electron.launch({
    args,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      E2E_TEST_MODE: 'true',
      DISPLAY: process.env.DISPLAY || ':99',
      ...additionalEnv,
    },
  });
}
