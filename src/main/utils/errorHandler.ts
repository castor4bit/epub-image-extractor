import { logger, getLogger } from './logger';

import { AppError, ErrorCode, wrapError } from '../../shared/error-types';

// エラーハンドリング関数
export function handleError(error: Error | unknown, context: string): string {
  // AppErrorでない場合はラップする
  const appError =
    error instanceof AppError
      ? error
      : wrapError(error, ErrorCode.UNKNOWN_ERROR, { operation: context });

  // ログに記録
  logger.error({
    appError,
    operation: context,
  }, appError.message);

  // ユーザー向けのエラーメッセージを返す
  return appError.userMessage;
}

// エクスポート（互換性のため）
export { getLogger };
