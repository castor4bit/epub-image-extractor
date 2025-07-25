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
    
    // CI環境でプロセス情報を出力
    if (process.env.CI) {
      try {
        const pid = await app.evaluate(() => process.pid);
        console.log(`[E2E] Electron PID: ${pid}`);
        
        // メモリ使用量を確認
        const memoryInfo = await app.evaluate(() => process.memoryUsage());
        console.log('[E2E] Memory usage:', {
          heapUsed: `${Math.round(memoryInfo.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memoryInfo.external / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryInfo.rss / 1024 / 1024)}MB`,
        });
      } catch (error) {
        console.warn('[E2E] Failed to get process info:', error);
      }
    }
    
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

  console.log('[E2E] Closing Electron application...');
  
  try {
    // まず通常のクローズを試行
    await app.close();
    console.log('[E2E] Electron closed gracefully');
  } catch (error) {
    console.warn('[E2E] Failed to close Electron gracefully:', error);
    
    if (force || process.env.CI) {
      console.log('[E2E] Attempting force kill...');
      
      // CI環境では強制終了を試行
      try {
        // プロセスIDを取得して強制終了
        const pid = await app.evaluate(() => process.pid);
        if (pid) {
          if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          }
          console.log(`[E2E] Force killed process ${pid}`);
        }
      } catch (killError) {
        console.error('[E2E] Failed to force kill:', killError);
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
  
  console.log('[E2E] Cleaning up Electron processes...');
  
  try {
    if (process.platform === 'linux') {
      // Linux環境でElectronプロセスを検索して終了
      try {
        const processes = execSync('pgrep -f "electron.*dist-electron" || true', { encoding: 'utf-8' });
        if (processes.trim()) {
          execSync('pkill -f "electron.*dist-electron" || true', { stdio: 'ignore' });
          console.log('[E2E] Killed lingering Electron processes');
        }
      } catch (error) {
        // エラーは無視（プロセスが存在しない場合など）
      }
    }
  } catch (error) {
    console.warn('[E2E] Failed to cleanup processes:', error);
  }
}
