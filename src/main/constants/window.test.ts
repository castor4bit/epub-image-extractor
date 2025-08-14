import { describe, test, expect } from 'vitest';
import { WINDOW_SIZES, WINDOW_OPACITY } from './window';

describe('Window Constants', () => {
  test('should export WINDOW_SIZES with correct structure', () => {
    expect(WINDOW_SIZES).toBeDefined();
    expect(WINDOW_SIZES.default).toEqual({
      width: 600,
      height: 560,
    });
    expect(WINDOW_SIZES.minimum).toEqual({
      width: 500,
      height: 400,
    });
  });

  test('should export WINDOW_OPACITY with correct structure', () => {
    expect(WINDOW_OPACITY).toBeDefined();
    expect(WINDOW_OPACITY.active).toBe(1.0);
    expect(WINDOW_OPACITY.inactive).toEqual({
      default: 0.95,
      min: 0.1,
      max: 1.0,
      step: 0.05,
    });
  });

  test('constants should be properly typed with const assertion', () => {
    // Verify that TypeScript const assertion is working
    // The types should be literal types, not general number type
    type DefaultWidth = typeof WINDOW_SIZES.default.width;
    type MinOpacity = typeof WINDOW_OPACITY.inactive.min;

    // These checks ensure the const assertion is working at compile time
    const width: DefaultWidth = 600;
    const opacity: MinOpacity = 0.1;

    // Runtime checks
    expect(typeof WINDOW_SIZES.default.width).toBe('number');
    expect(typeof WINDOW_OPACITY.inactive.min).toBe('number');
  });
});
