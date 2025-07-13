import winston from 'winston';
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

let logPath: string | undefined;
let logger: winston.Logger | undefined;

// ロガーの遅延初期化
function getLogger(): winston.Logger {
  if (!logger) {
    if (!logPath) {
      logPath = getLogPath();
    }

    // デバッグレベルの設定（環境変数またはテスト環境で制御）
    const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info');

    logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        // エラーログをファイルに記録
        new winston.transports.File({
          filename: path.join(logPath, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // すべてのログをファイルに記録（デバッグ含む）
        new winston.transports.File({
          filename: path.join(logPath, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // デバッグログを専用ファイルに記録
        new winston.transports.File({
          filename: path.join(logPath, 'debug.log'),
          level: 'debug',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // 開発環境かつテスト環境でない場合はコンソールにも出力
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
      logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      );
    }
  }

  return logger;
}

import { AppError, ErrorCode, wrapError } from '../../shared/error-types';

// エラーハンドリング関数
export function handleError(error: Error | unknown, context: string): string {
  // AppErrorでない場合はラップする
  const appError =
    error instanceof AppError
      ? error
      : wrapError(error, ErrorCode.UNKNOWN_ERROR, { operation: context });

  // ログに記録
  getLogger().error({
    code: appError.code,
    context: appError.context,
    message: appError.message,
    userMessage: appError.userMessage,
    stack: appError.stack,
    originalError: appError.originalError?.stack,
    timestamp: new Date().toISOString(),
  });

  // ユーザー向けのエラーメッセージを返す
  return appError.userMessage;
}

// エクスポート（互換性のため）
export { getLogger };
