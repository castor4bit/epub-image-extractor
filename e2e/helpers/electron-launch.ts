import { _electron as electron, ElectronApplication } from '@playwright/test';
import path from 'path';
import { execSync } from 'child_process';

/**
 * CI環境を考慮してElectronアプリケーションを起動する
 * @param additionalEnv 追加の環境変数
 * @returns ElectronApplicationインスタンス
 */
export async function launchElectron(
  additionalEnv?: Record<string, string>,
): Promise<ElectronApplication> {
  const args = [path.join(__dirname, '../../dist-electron/main/index.js')];
  
  // CI環境用のフラグはメインプロセス（src/main/index.ts）で設定されるため、
  // ここでの重複設定は不要

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

    return app;
  } catch (error) {
    console.error('[E2E] Failed to launch Electron:', error);
    throw error;
  }
}

/**
 * Electronアプリケーションを確実に終了する
 * @param app ElectronApplicationインスタンス
 * @param force 強制終了フラグ
 */
export async function closeElectron(app: ElectronApplication, force = false): Promise<void> {
  if (!app) {
    return;
  }

  try {
    // まず通常のクローズを試行
    await app.close();
  } catch (error) {
    if (force || process.env.CI) {
      // CI環境では強制終了を試行
      try {
        const pid = await app.evaluate(() => process.pid);
        if (pid) {
          if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          }
        }
      } catch (killError) {
        // エラーは無視
      }
    }
  }
  
  // 少し待機してプロセスが完全に終了するのを待つ
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * CI環境でのElectronプロセスをクリーンアップ
 */
export async function cleanupElectronProcesses(): Promise<void> {
  if (!process.env.CI) {
    return;
  }
  
  try {
    if (process.platform === 'linux') {
      // Linux環境でElectronプロセスを検索して終了
      try {
        const processes = execSync('pgrep -f "electron.*dist-electron" || true', { encoding: 'utf-8' });
        if (processes.trim()) {
          execSync('pkill -f "electron.*dist-electron" || true', { stdio: 'ignore' });
        }
      } catch (error) {
        // エラーは無視
      }
    }
  } catch (error) {
    // エラーは無視
  }
}
