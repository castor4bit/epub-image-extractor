import pino from 'pino';
import path from 'path';
import os from 'os';
import fs from 'fs';
import type { App } from 'electron';
import { AppError } from '../../shared/error-types';

// Electronのappオブジェクトをグローバルに保持
let electronApp: App | null = null;

// ElectronのappオブジェクトをセットするためのAPI
// ロガーはモジュール読み込み時に一度作られるため、appの注入後に作り直す。
// export let + ESMのライブバインディングにより、利用側の import も新しい
// インスタンスを参照する。
export function setElectronApp(app: App | null): void {
  electronApp = app;
  clearLoggerCache();
  logger = createLogger();
}

// 本番かどうかの判定
// パッケージ版のElectronは NODE_ENV を設定しないため、appがあれば
// isPackaged を信頼する。appが無い場合のみ NODE_ENV にフォールバックする。
export function isProductionRuntime(
  app: Pick<App, 'isPackaged'> | null,
  nodeEnv: string | undefined,
): boolean {
  if (nodeEnv === 'test') {
    return false;
  }
  if (app) {
    return app.isPackaged;
  }
  return nodeEnv === 'production';
}

// ログファイルのパスを取得（Electronが利用できない場合は一時ディレクトリを使用）
export function resolveLogPath(app: Pick<App, 'getPath'> | null): string {
  // セットされたElectronアプリケーションを使用
  if (app && app.getPath) {
    try {
      return app.getPath('userData');
    } catch {
      // エラーが発生した場合はフォールバック
    }
  }

  const tmpPath = path.join(os.tmpdir(), 'epub-image-extractor-logs');
  // ディレクトリが存在しない場合は作成
  try {
    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath, { recursive: true });
    }
  } catch {
    // ディレクトリ作成エラーは無視
  }
  return tmpPath;
}

// ロガーインスタンスのキャッシュ
let loggerInstance: pino.Logger | undefined;

// テスト用にキャッシュをクリアする関数
export function clearLoggerCache(): void {
  loggerInstance = undefined;
}

// ロガーの作成
export function createLogger(): pino.Logger {
  // テスト環境ではキャッシュを無効化
  if (loggerInstance && process.env.NODE_ENV !== 'test') {
    return loggerInstance;
  }

  const logPath = resolveLogPath(electronApp);
  const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info');
  const isProduction = isProductionRuntime(electronApp, process.env.NODE_ENV);
  const isDevelopment = !isProduction && process.env.NODE_ENV !== 'test';
  const isTest = process.env.NODE_ENV === 'test';

  // テスト環境：出力先なし、開発環境：コンソール出力、本番環境：ファイル出力
  // pino.transport() はワーカースレッド内で __dirname を使うため ESM バンドルでは
  // 動作しない。ワーカーを使わない pino.destination() でファイルに書き出す。
  // sync: true にしないとバッファされ、クラッシュ時に直前のログが失われる。
  // 出力は warn/error のみで量が少ないため同期書き込みで問題ない。
  const destination =
    isTest || isDevelopment
      ? undefined
      : pino.destination({ dest: path.join(logPath, 'app.log'), mkdir: true, sync: true });

  const pinoOptions: pino.LoggerOptions = {
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    // 開発環境では人間が読みやすい形式に
    ...(isDevelopment && {
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
      },
    }),
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      // AppError用のカスタムシリアライザー
      appError: (error: unknown) => {
        // 型ガード
        const e = error as AppError;
        return {
          type: e.constructor?.name || 'Unknown',
          code: e.code,
          message: e.message,
          userMessage: e.userMessage,
          context: e.context,
          stack: e.stack,
          originalError: e.originalError
            ? {
                type: e.originalError.constructor?.name || 'Unknown',
                message: e.originalError.message,
                stack: e.originalError.stack,
              }
            : undefined,
        };
      },
    },
  };

  try {
    loggerInstance = destination ? pino(pinoOptions, destination) : pino(pinoOptions);
  } catch (error) {
    console.error('[Logger] Failed to create pino instance:', error);
    // フォールバック: 最小限のロガーを作成
    loggerInstance = pino({
      level: logLevel,
    });
  }

  return loggerInstance;
}

// デフォルトロガーのエクスポート
// setElectronApp() で差し替わるため const ではなく let
export let logger = createLogger();

// getLogger関数（後方互換性のため）
export function getLogger(): pino.Logger {
  return logger;
}
