import path from 'path';
import { AppError, ErrorCode } from '../../shared/error-types';

/**
 * パストラバーサル攻撃を防ぐための安全なパス解決
 */
export function resolveSecurePath(basePath: string, relativePath: string): string | null {
  // ベースパスを正規化
  const normalizedBase = path.normalize(basePath);

  // 相対パスをベースパスと結合して正規化
  const resolvedPath = path.normalize(path.join(normalizedBase, relativePath));

  // 解決されたパスがベースパスから始まることを確認
  if (!resolvedPath.startsWith(normalizedBase)) {
    throw new AppError(
      ErrorCode.PATH_TRAVERSAL_DETECTED,
      `Path traversal detected: ${relativePath}`,
      'セキュリティエラー: 不正なパスが検出されました',
      { basePath, relativePath, resolvedPath }
    );
  }

  return resolvedPath;
}

/**
 * ファイルパスが安全かどうかを検証
 */
export function isPathSafe(filePath: string): boolean {
  // 危険なパターンをチェック
  const dangerousPatterns = [
    /\.\.[\/\\]/, // 親ディレクトリへの参照
    /^[\/\\]/, // 絶対パス
    /^[a-zA-Z]:/, // Windowsドライブレター
    /[<>:"|?*]/, // 無効な文字（Windows）
    /\0/, // Null文字
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(filePath));
}

/**
 * ファイル名をサニタイズ
 */
export function sanitizeFileName(fileName: string): string {
  // 無効な文字を置換
  let sanitized = fileName
    .replace(/[<>:"/\\|?*]/g, '_') // Windows/Unix無効文字
    .replace(/\s+/g, '_') // 空白をアンダースコアに
    .replace(/\.+/g, '.') // 連続するドットを単一に
    .replace(/^\./, '') // 先頭のドットを削除
    .replace(/\.$/, ''); // 末尾のドットを削除

  // 予約語のチェック（Windows）
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];

  const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    sanitized = `_${sanitized}`;
  }

  // 長さ制限（255文字）
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const nameWithoutExt = sanitized.slice(0, sanitized.length - ext.length);
    sanitized = nameWithoutExt.slice(0, 255 - ext.length) + ext;
  }

  // 空の場合はデフォルト名
  if (!sanitized) {
    sanitized = 'unnamed';
  }

  return sanitized;
}

/**
 * リソース制限の設定
 */
export const RESOURCE_LIMITS = {
  // 最大画像ファイルサイズ（50MB）
  MAX_IMAGE_SIZE: 50 * 1024 * 1024,

  // 最大処理画像数（1EPUBあたり）
  MAX_IMAGES_PER_EPUB: 10000,

  // 最大同時処理EPUB数
  MAX_CONCURRENT_EPUBS: 10,

  // 最大メモリ使用量（1GB）
  MAX_MEMORY_USAGE: 1024 * 1024 * 1024,

  // 処理タイムアウト（30分）
  PROCESSING_TIMEOUT: 30 * 60 * 1000,
};

/**
 * リソース使用量をチェック
 */
export function checkResourceLimits(
  currentImages: number,
  imageSize: number,
  currentMemory: number,
): { allowed: boolean; reason?: string } {
  if (currentImages >= RESOURCE_LIMITS.MAX_IMAGES_PER_EPUB) {
    return {
      allowed: false,
      reason: `画像数が上限（${RESOURCE_LIMITS.MAX_IMAGES_PER_EPUB}）を超えています`,
    };
  }

  if (imageSize > RESOURCE_LIMITS.MAX_IMAGE_SIZE) {
    return {
      allowed: false,
      reason: `画像サイズが上限（${RESOURCE_LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB）を超えています`,
    };
  }

  if (currentMemory > RESOURCE_LIMITS.MAX_MEMORY_USAGE) {
    return {
      allowed: false,
      reason: 'メモリ使用量が上限を超えています',
    };
  }

  return { allowed: true };
}
