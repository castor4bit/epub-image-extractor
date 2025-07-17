import pino from 'pino';
import path from 'path';
import os from 'os';
import fs from 'fs';

// ログファイルのパスを取得（Electronが利用できない場合は一時ディレクトリを使用）
function getLogPath(): string {
  try {
    // Electronモジュールの動的インポートを試みる
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const electron = require('electron');
    if (electron && electron.app && electron.app.getPath) {
      return electron.app.getPath('userData');
    }
  } catch {
    // Electronが利用できない場合（テスト環境など）
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

// ロガーの作成
export function createLogger(): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  const logPath = getLogPath();
  
  // デバッグ用
  console.log('[Logger] Creating logger instance', {
    logPath,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });
  const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info');
  const isDevelopment = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';
  const isTest = process.env.NODE_ENV === 'test';

  // テスト環境：トランスポートなし、開発環境：コンソール出力、本番環境：ファイル出力
  const transport = isTest || isDevelopment
    ? undefined
    : {
        target: 'pino/file',
        options: {
          destination: path.join(logPath, 'app.log'),
          mkdir: true,
        },
      };

  const pinoOptions: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
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
        const e = error as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        return {
          type: e.constructor?.name || 'Unknown',
          code: e.code,
          message: e.message,
          userMessage: e.userMessage,
          context: e.context,
          stack: e.stack,
          originalError: e.originalError ? {
            type: e.originalError.constructor?.name || 'Unknown',
            message: e.originalError.message,
            stack: e.originalError.stack,
          } : undefined,
        };
      },
    },
  };

  // トランスポートがある場合のみ追加
  if (transport) {
    pinoOptions.transport = transport;
  }

  try {
    loggerInstance = pino(pinoOptions);
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
export const logger = createLogger();

// getLogger関数（後方互換性のため）
export function getLogger(): pino.Logger {
  return logger;
}