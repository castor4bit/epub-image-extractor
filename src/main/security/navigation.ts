import { app, shell } from 'electron';

/**
 * Setup navigation restrictions to prevent navigation to unauthorized URLs
 */
export function setupNavigationRestrictions(): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Define allowed URL origins
  const allowedOrigins = isDevelopment ? ['http://localhost:5173', 'file://'] : ['file://'];

  app.on('web-contents-created', (_event, contents) => {
    // Restrict navigation
    contents.on('will-navigate', (event, navigationUrl) => {
      const isAllowed = allowedOrigins.some((origin) => navigationUrl.startsWith(origin));

      if (!isAllowed) {
        event.preventDefault();
        console.warn(`Blocked navigation to: ${navigationUrl}`);
      }
    });

    // Handle new window requests
    contents.setWindowOpenHandler(({ url }) => {
      // Open external URLs in default browser
      if (url.startsWith('http://') || url.startsWith('https://')) {
        shell.openExternal(url);
      }
      // Deny opening new windows
      return { action: 'deny' };
    });

    // Prevent webview creation
    contents.on('will-attach-webview', (event) => {
      event.preventDefault();
      console.warn('Blocked webview creation');
    });
  });
}
