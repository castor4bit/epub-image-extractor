// 統一的なエラー型定義

export enum ErrorCode {
  // EPUB処理エラー
  EPUB_PARSE_ERROR = 'EPUB_PARSE_ERROR',
  EPUB_INVALID_FORMAT = 'EPUB_INVALID_FORMAT',
  EPUB_NO_IMAGES = 'EPUB_NO_IMAGES',

  // ファイルシステムエラー
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_ACCESS_DENIED = 'FILE_ACCESS_DENIED',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  DIRECTORY_CREATE_ERROR = 'DIRECTORY_CREATE_ERROR',

  // リソース制限エラー
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  IMAGE_SIZE_EXCEEDED = 'IMAGE_SIZE_EXCEEDED',

  // セキュリティエラー
  PATH_TRAVERSAL_DETECTED = 'PATH_TRAVERSAL_DETECTED',
  INVALID_PATH = 'INVALID_PATH',

  // その他のエラー
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
}

export interface ProcessingError {
  code: ErrorCode;
  message: string;
  userMessage: string; // ユーザー向けメッセージ（日本語）
  context?: {
    filePath?: string;
    fileName?: string;
    operation?: string;
    [key: string]: any;
  };
  originalError?: Error;
}

export class AppError extends Error implements ProcessingError {
  code: ErrorCode;
  userMessage: string;
  context?: ProcessingError['context'];
  originalError?: Error;

  constructor(
    code: ErrorCode,
    message: string,
    userMessage: string,
    context?: ProcessingError['context'],
    originalError?: Error,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.context = context;
    this.originalError = originalError;
  }
}

// エラーコードからユーザーメッセージを生成
export function getDefaultUserMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.EPUB_PARSE_ERROR]: 'EPUBファイルの解析に失敗しました',
    [ErrorCode.EPUB_INVALID_FORMAT]: 'EPUBファイルの形式が無効です',
    [ErrorCode.EPUB_NO_IMAGES]: 'EPUBファイルに画像が含まれていません',
    [ErrorCode.FILE_NOT_FOUND]: 'ファイルが見つかりません',
    [ErrorCode.FILE_ACCESS_DENIED]: 'ファイルへのアクセス権限がありません',
    [ErrorCode.FILE_WRITE_ERROR]: 'ファイルの書き込みに失敗しました',
    [ErrorCode.DIRECTORY_CREATE_ERROR]: 'ディレクトリの作成に失敗しました',
    [ErrorCode.RESOURCE_LIMIT_EXCEEDED]: 'リソース制限を超えました',
    [ErrorCode.MEMORY_LIMIT_EXCEEDED]: 'メモリ使用量が上限を超えました',
    [ErrorCode.IMAGE_SIZE_EXCEEDED]: '画像サイズが上限を超えています',
    [ErrorCode.PATH_TRAVERSAL_DETECTED]: '不正なパスが検出されました',
    [ErrorCode.INVALID_PATH]: '無効なパスです',
    [ErrorCode.UNKNOWN_ERROR]: '不明なエラーが発生しました',
    [ErrorCode.PROCESSING_TIMEOUT]: '処理がタイムアウトしました',
  };

  return messages[code] || messages[ErrorCode.UNKNOWN_ERROR];
}

// 標準エラーをAppErrorに変換
export function wrapError(
  error: unknown,
  code: ErrorCode,
  context?: ProcessingError['context'],
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const originalError = error instanceof Error ? error : new Error(String(error));
  const message = originalError.message;

  // 特定のエラーパターンを認識
  if (message.includes('ENOENT')) {
    return new AppError(
      ErrorCode.FILE_NOT_FOUND,
      message,
      'ファイルが見つかりません',
      context,
      originalError,
    );
  } else if (message.includes('EACCES')) {
    return new AppError(
      ErrorCode.FILE_ACCESS_DENIED,
      message,
      'ファイルへのアクセス権限がありません',
      context,
      originalError,
    );
  }

  return new AppError(code, message, getDefaultUserMessage(code), context, originalError);
}
