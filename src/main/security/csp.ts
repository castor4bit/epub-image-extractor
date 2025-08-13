import { session } from 'electron';

/**
 * Setup Content Security Policy to restrict resource loading
 */
export function setupContentSecurityPolicy(): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const cspDirectives = isDevelopment
      ? [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // React development needs inline scripts
          "style-src 'self' 'unsafe-inline'", // Inline styles for development
          "img-src 'self' data: file:", // Local images
          "connect-src 'self' http://localhost:5173 ws://localhost:5173", // Dev server
          "font-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          'upgrade-insecure-requests',
        ].join('; ')
      : [
          "default-src 'self'",
          "script-src 'self'", // No inline scripts in production
          "style-src 'self' 'unsafe-inline'", // Still need inline styles for React
          "img-src 'self' data: file:", // Local images
          "connect-src 'self'", // No external connections
          "font-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          'upgrade-insecure-requests',
        ].join('; ');

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [cspDirectives],
      },
    });
  });
}
