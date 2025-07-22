export * from './types';
export { AdmZipReader } from './AdmZipReader';
export { FflateReader } from './FflateReader';

import { IZipReader } from './types';
import { AdmZipReader } from './AdmZipReader';
import { FflateReader } from './FflateReader';

/**
 * 使用するZIPリーダーの実装
 * 環境変数やfeature flagで切り替え可能
 */
export function createZipReader(): IZipReader {
  // 将来的にはfeature flagや環境変数で切り替える
  const useFflate = process.env.USE_FFLATE === 'true';
  
  if (useFflate) {
    return new FflateReader();
  }
  
  return new AdmZipReader();
}