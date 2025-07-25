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
    console.log('[E2E] Running in CI Linux environment');
    console.log('[E2E] DISPLAY:', process.env.DISPLAY || '(not set)');
    
    // xvfb-runを使用している場合、これらのフラグは必要最小限にする
    args.push(
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    );
    
    console.log('[E2E] Added CI-specific Electron flags');
  }

  // 起動前のデバッグ情報
  console.log('[E2E] Launching Electron with args:', args);
  console.log('[E2E] Environment:', {
    NODE_ENV: 'test',
    E2E_TEST_MODE: 'true',
    DISPLAY: process.env.DISPLAY || ':99',
    CI: process.env.CI,
    platform: process.platform,
    USER: process.env.USER,
    HOME: process.env.HOME,
    PWD: process.cwd(),
  });
  
  // CI環境でのXvfb確認
  if (process.env.CI && process.platform === 'linux') {
    const { execSync } = require('child_process');
    try {
      const xvfbProcesses = execSync('ps aux | grep -i xvfb || true', { encoding: 'utf-8' });
      console.log('[E2E] Xvfb processes:', xvfbProcesses.trim());
    } catch (error) {
      console.log('[E2E] Could not check Xvfb processes');
    }
  }

  try {
    const app = await electron.launch({
      args,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        E2E_TEST_MODE: 'true',
        DISPLAY: process.env.DISPLAY || ':99',
        ...additionalEnv,
      },
      timeout: 30000, // 30秒のタイムアウト
    });

    console.log('[E2E] Electron launched successfully');
    return app;
  } catch (error) {
    console.error('[E2E] Failed to launch Electron:', error);
    throw error;
  }
}
