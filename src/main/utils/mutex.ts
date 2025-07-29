/**
 * Simple mutex implementation for synchronizing async operations
 * 
 * This is a lightweight alternative to async-mutex library,
 * designed specifically for our use case of preventing race conditions
 * in directory creation during parallel EPUB processing.
 */
export class SimpleMutex {
  private promise: Promise<void> = Promise.resolve();

  /**
   * Acquire the mutex lock
   * @returns A release function that must be called to release the lock
   */
  async acquire(): Promise<() => void> {
    let release: () => void;
    let released = false;
    
    // Store the current promise
    const oldPromise = this.promise;
    
    // Create a new promise for the next waiter
    this.promise = new Promise((resolve) => {
      release = () => {
        // Prevent multiple releases
        if (!released) {
          released = true;
          resolve();
        }
      };
    });

    // Wait for the previous lock to be released
    await oldPromise;
    
    // Return the release function
    return release!;
  }
}