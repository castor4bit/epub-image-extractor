export * from './types';
export { AdmZipReader } from './AdmZipReader';
export { FflateReader } from './FflateReader';

import { IZipReader } from './types';
import { AdmZipReader } from './AdmZipReader';
import { FflateReader } from './FflateReader';

/**
 * 使用するZIPリーダーの実装
 * デフォルトはFflateReader（より高速でメモリ効率的）
 * 互換性のためにUSE_ADM_ZIP環境変数で切り替え可能
 */
export function createZipReader(): IZipReader {
  // 互換性のための環境変数
  const useAdmZip = process.env.USE_ADM_ZIP === 'true';
  
  if (useAdmZip) {
    return new AdmZipReader();
  }
  
  return new FflateReader();
}