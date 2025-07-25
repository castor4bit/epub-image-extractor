import { _electron as electron, ElectronApplication } from '@playwright/test';
import path from 'path';
import { execSync } from 'child_process';

export async function launchElectron(
  additionalEnv?: Record<string, string>,
): Promise<ElectronApplication> {
  const args = [path.join(__dirname, '../../dist-electron/main/index.js')];

  // CI環境（Linux）では追加のフラグを設定
  // これらのフラグがないと "The SUID sandbox helper binary was found" エラーが発生
  if (process.env.CI && process.platform === 'linux') {
    args.push(
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    );
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

    return app;
  } catch (error) {
    console.error('[E2E] Failed to launch Electron:', error);
    throw error;
  }
}

export async function closeElectron(app: ElectronApplication, force = false): Promise<void> {
  if (!app) {
    return;
  }

  try {
    await app.close();
  } catch (error) {
    if (force) {
      try {
        const pid = await app.evaluate(() => process.pid);
        if (pid) {
          if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          }
        }
      } catch (killError) {}
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
}

export async function cleanupElectronProcesses(): Promise<void> {
  try {
    if (process.platform === 'linux') {
      try {
        const processes = execSync('pgrep -f "electron.*dist-electron" || true', { encoding: 'utf-8' });
        if (processes.trim()) {
          execSync('pkill -f "electron.*dist-electron" || true', { stdio: 'ignore' });
        }
      } catch (error) {}
    }
  } catch (error) {}
}
