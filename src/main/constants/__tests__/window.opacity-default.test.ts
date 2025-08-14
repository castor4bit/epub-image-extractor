import { describe, it, expect } from 'vitest';
import { WINDOW_OPACITY } from '../window';

describe('Window Opacity Default Value', () => {
  it('should have default inactive opacity of 0.95 (95%)', () => {
    expect(WINDOW_OPACITY.inactive.default).toBe(0.95);
  });

  it('should have correct opacity range including 0.95', () => {
    const { min, max, default: defaultValue } = WINDOW_OPACITY.inactive;

    expect(defaultValue).toBeGreaterThanOrEqual(min);
    expect(defaultValue).toBeLessThanOrEqual(max);
    expect(defaultValue).toBe(0.95);
  });

  it('should have opacity step that allows 0.95', () => {
    const { min, step, default: defaultValue } = WINDOW_OPACITY.inactive;

    // Check that 0.95 is reachable from min with the given step
    const stepsFromMin = (defaultValue - min) / step;
    expect(stepsFromMin).toBeCloseTo(Math.round(stepsFromMin), 5);
  });
});
