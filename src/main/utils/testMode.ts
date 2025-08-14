/**
 * Test mode utilities
 * Provides test environment detection and optional delays for testing
 */

/**
 * Check if running in test mode (any test environment)
 */
export function isTestMode(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * E2E test delays in milliseconds
 */
export const E2E_DELAYS = {
  /** Delay at file processing start */
  FILE_PROCESSING_START: 300,
  /** Delay for each image processing */
  IMAGE_PROCESSING: 10,
  /** Delay for chapter processing */
  CHAPTER_PROCESSING: 30,
  /** Delay at file processing end */
  FILE_PROCESSING_END: 30,
} as const;

/**
 * Add delay only in test mode (primarily for E2E tests)
 * @param delayMs Delay time in milliseconds
 */
export async function addE2EDelay(delayMs: number): Promise<void> {
  if (isTestMode()) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

/**
 * Add delay based on delay type in test mode (primarily for E2E tests)
 * @param delayType Type of delay
 */
export async function addE2EDelayByType(delayType: keyof typeof E2E_DELAYS): Promise<void> {
  await addE2EDelay(E2E_DELAYS[delayType]);
}
