import { describe, test, expect } from 'vitest';
import { SimpleMutex } from './mutex';

describe('SimpleMutex', () => {
  test('should allow sequential access', async () => {
    const mutex = new SimpleMutex();
    const results: number[] = [];

    const task = async (id: number) => {
      const release = await mutex.acquire();
      try {
        results.push(id);
        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 10));
        results.push(id * 10);
      } finally {
        release();
      }
    };

    // Start multiple tasks concurrently
    await Promise.all([task(1), task(2), task(3)]);

    // Results should show sequential execution
    expect(results).toEqual([1, 10, 2, 20, 3, 30]);
  });

  test('should handle multiple releases safely', async () => {
    const mutex = new SimpleMutex();
    const release = await mutex.acquire();

    // Multiple releases should not throw
    expect(() => {
      release();
      release();
      release();
    }).not.toThrow();
  });

  test('should maintain order of acquisition', async () => {
    const mutex = new SimpleMutex();
    const order: string[] = [];

    // First lock
    const release1 = await mutex.acquire();
    order.push('acquired-1');

    // Start second acquisition (will wait)
    const acquire2Promise = mutex.acquire().then((release) => {
      order.push('acquired-2');
      return release;
    });

    // Start third acquisition (will wait)
    const acquire3Promise = mutex.acquire().then((release) => {
      order.push('acquired-3');
      return release;
    });

    // Release first lock
    order.push('releasing-1');
    release1();

    // Wait for second acquisition
    const release2 = await acquire2Promise;
    order.push('releasing-2');
    release2();

    // Wait for third acquisition
    const release3 = await acquire3Promise;
    order.push('releasing-3');
    release3();

    expect(order).toEqual([
      'acquired-1',
      'releasing-1',
      'acquired-2',
      'releasing-2',
      'acquired-3',
      'releasing-3',
    ]);
  });

  test('should work correctly with try-finally pattern', async () => {
    const mutex = new SimpleMutex();
    let counter = 0;

    const incrementWithMutex = async () => {
      const release = await mutex.acquire();
      try {
        const current = counter;
        await new Promise((resolve) => setTimeout(resolve, 5));
        counter = current + 1;
      } finally {
        release();
      }
    };

    // Run 10 increments concurrently
    await Promise.all(
      Array(10)
        .fill(0)
        .map(() => incrementWithMutex()),
    );

    // Counter should be exactly 10 (no race conditions)
    expect(counter).toBe(10);
  });

  test('should handle errors in critical section', async () => {
    const mutex = new SimpleMutex();
    const results: string[] = [];

    const taskWithError = async () => {
      const release = await mutex.acquire();
      try {
        results.push('error-task-start');
        throw new Error('Test error');
      } finally {
        results.push('error-task-released');
        release();
      }
    };

    const normalTask = async () => {
      const release = await mutex.acquire();
      try {
        results.push('normal-task');
      } finally {
        release();
      }
    };

    // Start both tasks
    const errorPromise = taskWithError().catch(() => {});
    const normalPromise = normalTask();

    await Promise.all([errorPromise, normalPromise]);

    // Normal task should still execute after error task
    expect(results).toEqual(['error-task-start', 'error-task-released', 'normal-task']);
  });
});
