import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app, shell } from 'electron';
import { setupNavigationRestrictions } from '../navigation';

// Mock electron
vi.mock('electron', () => ({
  app: {
    on: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
  },
}));

describe('Navigation Restrictions', () => {
  let webContentsHandlers: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
    webContentsHandlers = {};
  });

  it('should register web-contents-created listener', () => {
    setupNavigationRestrictions();
    expect(app.on).toHaveBeenCalledWith('web-contents-created', expect.any(Function));
  });

  it('should block navigation to external URLs', () => {
    const mockEvent = { preventDefault: vi.fn() };
    const mockContents = {
      on: vi.fn((event, handler) => {
        webContentsHandlers[event] = handler;
      }),
      setWindowOpenHandler: vi.fn(),
    };

    setupNavigationRestrictions();

    // Get the web-contents-created handler
    const webContentsCreatedHandler = (app.on as any).mock.calls.find(
      (call: any) => call[0] === 'web-contents-created',
    )?.[1];

    // Call it with mock contents
    webContentsCreatedHandler({}, mockContents);

    // Test will-navigate handler
    const willNavigateHandler = webContentsHandlers['will-navigate'];

    // In test environment (not development), localhost should be blocked
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    
    // Should block localhost in non-development
    willNavigateHandler(mockEvent, 'http://localhost:5173/index.html');
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    // Should allow file protocol
    vi.clearAllMocks();
    willNavigateHandler(mockEvent, 'file:///Users/test/app.html');
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();

    // Should block external URLs
    vi.clearAllMocks();
    willNavigateHandler(mockEvent, 'https://malicious-site.com');
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('should open external URLs in default browser', () => {
    const mockContents = {
      on: vi.fn(),
      setWindowOpenHandler: vi.fn(),
    };

    setupNavigationRestrictions();

    const webContentsCreatedHandler = (app.on as any).mock.calls.find(
      (call: any) => call[0] === 'web-contents-created',
    )?.[1];

    webContentsCreatedHandler({}, mockContents);

    // Get the window open handler
    const setWindowOpenHandlerCall = mockContents.setWindowOpenHandler.mock.calls[0];
    const windowOpenHandler = setWindowOpenHandlerCall[0];

    // Test opening external URL
    const result = windowOpenHandler({ url: 'https://github.com' });
    expect(shell.openExternal).toHaveBeenCalledWith('https://github.com');
    expect(result).toEqual({ action: 'deny' });
  });

  it('should prevent webview creation', () => {
    const mockEvent = { preventDefault: vi.fn() };
    const mockContents = {
      on: vi.fn((event, handler) => {
        if (event === 'will-attach-webview') {
          // Immediately call the handler to test it
          handler(mockEvent);
        }
      }),
      setWindowOpenHandler: vi.fn(),
    };

    setupNavigationRestrictions();

    const webContentsCreatedHandler = (app.on as any).mock.calls.find(
      (call: any) => call[0] === 'web-contents-created',
    )?.[1];

    webContentsCreatedHandler({}, mockContents);

    // Check that webview creation was prevented
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });
});
