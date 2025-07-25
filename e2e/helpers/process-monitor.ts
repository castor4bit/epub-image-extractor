import { execSync } from 'child_process';

/**
 * プロセスリークの検証用ヘルパー
 * CI環境でのみ動作し、Electronプロセスの残存を監視
 */
export function getElectronProcessCount(): number {
  if (!process.env.CI || process.platform !== 'linux') {
    return -1; // CI以外では監視しない
  }

  try {
    const result = execSync(
      'ps aux | grep -E "electron.*dist-electron" | grep -v grep | wc -l',
      { encoding: 'utf-8' }
    );
    return parseInt(result.trim(), 10);
  } catch {
    return 0;
  }
}

export function logProcessStatus(phase: string): void {
  if (!process.env.CI) return;

  const count = getElectronProcessCount();
  if (count >= 0) {
    console.log(`[Process Monitor] ${phase}: ${count} Electron process(es) found`);
  }
}

export function checkForLeakedProcesses(): boolean {
  if (!process.env.CI || process.platform !== 'linux') {
    return false; // CI以外では検証しない
  }

  try {
    const processes = execSync(
      'ps aux | grep -E "electron.*dist-electron" | grep -v grep',
      { encoding: 'utf-8' }
    );
    
    if (processes.trim()) {
      console.error('[Process Monitor] ⚠️  Leaked Electron processes detected:');
      console.error(processes);
      return true;
    }
  } catch {
    // grepが何も見つからない場合はエラーになるが、これは正常
  }

  console.log('[Process Monitor] ✅ No leaked Electron processes');
  return false;
}