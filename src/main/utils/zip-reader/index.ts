export * from './types';
export { FflateReader } from './FflateReader';

import { IZipReader } from './types';
import { FflateReader } from './FflateReader';

/**
 * ZIPリーダーの作成
 * FflateReaderを使用（高速でメモリ効率的）
 */
export function createZipReader(): IZipReader {
  return new FflateReader();
}
