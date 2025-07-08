import winston from 'winston';
import path from 'path';
import os from 'os';

// ログファイルのパスを取得（Electronが利用できない場合は一時ディレクトリを使用）
function getLogPath(): string {
  try {
    // Electronモジュールの動的インポートを試みる
    const electron = require('electron');
    if (electron && electron.app && electron.app.getPath) {
      return electron.app.getPath('userData');
    }
  } catch (e) {
    // Electronが利用できない場合（テスト環境など）
  }
  const tmpPath = path.join(os.tmpdir(), 'epub-image-extractor-logs');
  // ディレクトリが存在しない場合は作成
  try {
    const fs = require('fs');
    if (!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath, { recursive: true });
    }
  } catch (e) {
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

    logger = winston.createLogger({
      level: 'info',
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
        // すべてのログをファイルに記録
        new winston.transports.File({
          filename: path.join(logPath, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // 開発環境ではコンソールにも出力
    if (process.env.NODE_ENV !== 'production') {
      logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      );
    }
  }

  return logger;
}

// エラーハンドリング関数
export function handleError(error: Error | unknown, context: string): string {
  const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
  const stack = error instanceof Error ? error.stack : '';

  getLogger().error({
    context,
    message: errorMessage,
    stack,
    timestamp: new Date().toISOString(),
  });

  // ユーザー向けのエラーメッセージを返す
  if (error instanceof Error) {
    // 特定のエラータイプに基づいてユーザーフレンドリーなメッセージを返す
    if (error.message.includes('ENOENT')) {
      return 'ファイルが見つかりません';
    } else if (error.message.includes('EACCES')) {
      return 'ファイルへのアクセス権限がありません';
    } else if (error.message.includes('ENOSPC')) {
      return 'ディスク容量が不足しています';
    } else if (error.message.includes('EPUB')) {
      return `EPUB処理エラー: ${errorMessage}`;
    }
  }

  return errorMessage;
}

// エクスポート（互換性のため）
export { getLogger };
