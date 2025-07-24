/**
 * E2Eテストモード用のユーティリティ
 * 環境変数 E2E_TEST_MODE が設定されている場合、処理に遅延を追加する
 */

/**
 * E2Eテストモードが有効かどうかを判定
 */
export function isE2ETestMode(): boolean {
  return process.env.E2E_TEST_MODE === 'true' || process.env.E2E_TEST_MODE === '1';
}

/**
 * E2Eテストモード用の遅延時間（ミリ秒）
 */
export const E2E_DELAYS = {
  /** ファイル処理開始時の遅延 */
  FILE_PROCESSING_START: 300,
  /** 各画像処理時の遅延 */
  IMAGE_PROCESSING: 10,
  /** チャプター処理時の遅延 */
  CHAPTER_PROCESSING: 30,
  /** ファイル処理完了時の遅延 */
  FILE_PROCESSING_END: 30,
} as const;

/**
 * E2Eテストモードの場合のみ遅延を追加
 * @param delayMs 遅延時間（ミリ秒）
 */
export async function addE2EDelay(delayMs: number): Promise<void> {
  if (isE2ETestMode()) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

/**
 * E2Eテストモードの場合のみ、指定された遅延タイプに応じて遅延を追加
 * @param delayType 遅延タイプ
 */
export async function addE2EDelayByType(delayType: keyof typeof E2E_DELAYS): Promise<void> {
  await addE2EDelay(E2E_DELAYS[delayType]);
}
