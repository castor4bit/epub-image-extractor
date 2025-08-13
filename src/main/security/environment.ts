/**
 * Get security configuration based on environment
 */
export function getSecurityConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    sandbox: false, // ESM support requires sandbox: false
    csp: {
      development: [
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
      ].join('; '),
      production: [
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
      ].join('; '),
    },
    allowedOrigins: {
      development: ['http://localhost:5173', 'file://'],
      production: ['file://'],
    },
    isDevelopment,
  };
}
