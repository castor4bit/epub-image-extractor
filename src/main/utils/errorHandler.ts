import winston from 'winston';
import path from 'path';
import { app } from 'electron';

// ロガーの設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // エラーログをファイルに記録
    new winston.transports.File({
      filename: path.join(app.getPath('userData'), 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // すべてのログをファイルに記録
    new winston.transports.File({
      filename: path.join(app.getPath('userData'), 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 開発環境ではコンソールにも出力
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// エラーハンドリング関数
export function handleError(error: Error | unknown, context: string): string {
  const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
  const stack = error instanceof Error ? error.stack : '';

  logger.error({
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

// ログ取得関数
export function getLogger() {
  return logger;
}