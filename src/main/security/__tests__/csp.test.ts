import { describe, it, expect, vi, beforeEach } from 'vitest';
import { session } from 'electron';
import { setupContentSecurityPolicy } from '../csp';

// Mock electron session
vi.mock('electron', () => ({
  session: {
    defaultSession: {
      webRequest: {
        onHeadersReceived: vi.fn(),
      },
    },
  },
}));

describe('Content Security Policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should setup CSP headers on response', () => {
    const mockCallback = vi.fn();
    const mockDetails = {
      responseHeaders: {
        'Content-Type': ['text/html'],
      },
    };

    // Setup CSP
    setupContentSecurityPolicy();

    // Get the callback function that was registered
    const onHeadersReceived = session.defaultSession.webRequest.onHeadersReceived as any;
    expect(onHeadersReceived).toHaveBeenCalledTimes(1);

    const registeredCallback = onHeadersReceived.mock.calls[0][0];

    // Call the registered callback
    registeredCallback(mockDetails, mockCallback);

    // Check that callback was called with CSP headers
    expect(mockCallback).toHaveBeenCalledWith({
      responseHeaders: expect.objectContaining({
        'Content-Security-Policy': expect.arrayContaining([
          expect.stringContaining("default-src 'self'"),
        ]),
      }),
    });
  });

  it('should include development origins when in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const mockCallback = vi.fn();
    const mockDetails = {
      responseHeaders: {},
    };

    setupContentSecurityPolicy();

    const onHeadersReceived = session.defaultSession.webRequest.onHeadersReceived as any;
    const registeredCallback = onHeadersReceived.mock.calls[0][0];

    registeredCallback(mockDetails, mockCallback);

    const cspHeader = mockCallback.mock.calls[0][0].responseHeaders['Content-Security-Policy'][0];
    expect(cspHeader).toContain('http://localhost:5173');
    expect(cspHeader).toContain('ws://localhost:5173');

    process.env.NODE_ENV = originalEnv;
  });

  it('should have strict CSP in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const mockCallback = vi.fn();
    const mockDetails = {
      responseHeaders: {},
    };

    setupContentSecurityPolicy();

    const onHeadersReceived = session.defaultSession.webRequest.onHeadersReceived as any;
    const registeredCallback = onHeadersReceived.mock.calls[0][0];

    registeredCallback(mockDetails, mockCallback);

    const cspHeader = mockCallback.mock.calls[0][0].responseHeaders['Content-Security-Policy'][0];
    expect(cspHeader).not.toContain('http://localhost');
    expect(cspHeader).not.toContain('unsafe-eval');

    process.env.NODE_ENV = originalEnv;
  });
});
