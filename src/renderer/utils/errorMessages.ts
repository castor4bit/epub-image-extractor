import i18n from '../i18n';
import { ErrorCode } from '../../shared/error-types';
import { isJapaneseLanguage } from '../../shared/utils/language';

/**
 * Convert error code to localized message
 */
export function getErrorMessage(code: ErrorCode | string, params?: Record<string, string>): string {
  // Try to get message from i18n resources
  const messageKey = `errors.${code}`;

  // Check if the translation exists
  if (i18n.exists(messageKey)) {
    return i18n.t(messageKey, params);
  }

  // Fallback to a generic error message
  return i18n.t('errors.UNKNOWN_ERROR');
}

/**
 * Format error for display based on current language
 */
export function formatError(error: unknown): string {
  if (!error) {
    return i18n.t('errors.UNKNOWN_ERROR');
  }

  // If it's an AppError with a code
  if (typeof error === 'object' && 'code' in error) {
    const errorObj = error as { code: string; userMessage?: string; message?: string };

    // Always try to get localized message by code first
    if (errorObj.code) {
      return getErrorMessage(errorObj.code);
    }

    // Fallback to userMessage or message if no code
    return errorObj.userMessage || errorObj.message || i18n.t('errors.UNKNOWN_ERROR');
  }

  // If it's a standard Error
  if (error instanceof Error) {
    // Return the error message as is (it might already be localized)
    return error.message;
  }

  // If it's a string
  if (typeof error === 'string') {
    // Check if it's an error code
    const errorCodePattern = /^[A-Z_]+$/;
    if (errorCodePattern.test(error)) {
      return getErrorMessage(error);
    }
    // Otherwise return as is
    return error;
  }

  // Unknown error type
  return i18n.t('errors.UNKNOWN_ERROR');
}
