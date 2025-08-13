# Security Configuration

## Overview

This application uses `sandbox: false` for ESM preload script compatibility. To mitigate the security risks, we have implemented multiple layers of security controls.

## Implemented Security Measures

### 1. Content Security Policy (CSP)
- Restricts resource loading to trusted sources only
- Prevents inline script execution in production
- Blocks external connections except for development server

### 2. Navigation Restrictions
- Blocks navigation to external URLs
- Opens external links in default browser instead of Electron
- Prevents webview creation

### 3. IPC Validation
- Input validation for all IPC handlers
- Path traversal prevention
- File type validation

### 4. Additional Security Controls
- `webviewTag: false` - Webview tags are disabled
- `nodeIntegration: false` - Node.js integration is disabled in renderer
- `contextIsolation: true` - Context isolation is enabled

## Environment-Specific Settings

### Development
- Allows localhost connections for hot-reload
- Permits inline scripts for React development
- CSP allows WebSocket connections to development server

### Production
- Strict CSP without unsafe-inline for scripts
- No external connections allowed
- Only file:// protocol navigation permitted

## Security Best Practices for Contributors

1. **Never disable security features** without proper justification
2. **Validate all user input** before processing
3. **Use IPC handlers** for privileged operations
4. **Keep dependencies updated** to patch known vulnerabilities
5. **Regular security audits** using `npm audit`

## Known Limitations

- Sandbox is disabled due to ESM preload script requirements
- This increases the attack surface if malicious content is executed
- Mitigation: Strict CSP and navigation restrictions

## Security Contact

For security concerns or vulnerability reports, please contact the maintainers directly.

## Audit Commands

```bash
# Check for known vulnerabilities
npm audit

# Check for outdated dependencies
npm outdated

# Run security tests
npm test -- src/main/security/
```