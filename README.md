# EPUB Image Extractor

![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A cross-platform desktop application for extracting images from EPUB files, organized by chapters.

## Features

- **Drag & Drop Interface**: Simply drag and drop EPUB files to process
- **ZIP File Support**: Automatically extracts and processes EPUB files from ZIP archives
- **Chapter-based Organization**: Images are organized into folders based on the EPUB's table of contents
- **Batch Processing**: Process multiple EPUB files simultaneously with parallel execution
- **Real-time Progress Tracking**: Monitor extraction progress for each file
- **Settings Management**: Customize output directory and processing options
- **Cross-platform**: Works on Windows and macOS

## Installation

### Prerequisites

- Node.js 24.0.0 or higher
- npm

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd epub-image-extractor

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

### Building for Production

```bash
# Build for current platform
npm run dist

# Build for Windows (installer and portable)
npm run dist:win

# Build for macOS
npm run dist:mac

# Build for specific architectures
npm run dist:mac-x64    # Intel Macs
npm run dist:mac-arm64  # Apple Silicon Macs
```

### Distribution Formats

- **Windows**: NSIS installer (.exe) and portable version
- **macOS**: DMG installer for both Intel and Apple Silicon

## Development Builds

### Getting Latest Development Builds

You can download the latest development builds without waiting for releases:

1. **Manual Build** (recommended for testing specific commits):
   - Go to [Actions > Build Latest](../../actions/workflows/build-latest.yml)
   - Click "Run workflow" 
   - Select platforms to build (all/mac-only/windows-only)
   - Download artifacts from the completed run

2. **Automatic Builds** (triggered on every main branch update):
   - Go to [Actions > Build Development](../../actions/workflows/build-dev.yml)
   - Select the latest successful run
   - Download artifacts for your platform

### Development Build Notes

- ⚠️ **Unsigned builds**: Development builds are not code-signed
- 🔄 **Always latest**: Reflects the current state of the main branch
- 📅 **Retention**: Artifacts are kept for 30 days (development) or 7 days (manual)
- 🏷️ **Naming**: `dev-{platform}-{arch}-{commit-hash}` or `latest-{platform}-{arch}`

## CI/CD Workflows

### Code Quality
- **Trigger**: Push to main, PRs
- **Purpose**: Lint, type check, tests, build verification
- **Platforms**: Multi-platform (Windows, macOS)
- **Node version**: 24.x

### Build Development
- **Trigger**: Push to main, PRs, manual
- **Purpose**: Full binary builds for testing
- **Output**: Downloadable installers/packages

### Release (Unsigned)
- **Trigger**: Git tags (`v*`)
- **Purpose**: Official releases
- **Output**: GitHub releases with assets

## Usage

1. Launch the application
2. Drag and drop EPUB files or ZIP files containing EPUBs onto the drop zone, or click "ファイルを選択" to browse
3. The application will extract all images and organize them by chapters
4. Images are saved to `Desktop/EPUB_Images/[book-name]/[chapter]/` (default location, can be changed in settings)
5. Click the settings icon (⚙️) in the header to customize:
   - Output directory
   - Number of parallel files to process (1-10)
   - Filename options (include original names, page spread info)

### Output Structure

```
EPUB_Images/
└── BookTitle/
    ├── 001_表紙/
    │   ├── 001.jpg          # Default: sequential numbering
    │   └── 002.jpg          # Or with original name: 001_cover.jpg
    ├── 002_第1章/
    │   ├── 001.png          # Can include spread info: 001_left.png
    │   ├── 002.png          # Can include spread info: 002_right.png
    │   └── 003.jpg
    └── 003_第2章/
        └── 001.jpg
```

### Filename Options

- **Sequential numbering**: `001.jpg`, `002.png` (default)
- **Include original names**: `001_originalname.jpg`
- **Include page spread**: `001_left.jpg`, `002_right.jpg`

## Technical Details

### Technology Stack

- **Framework**: Electron 37
- **Language**: TypeScript 5
- **UI**: React 19
- **Build Tool**: Vite 7
- **EPUB Parser**: Custom implementation using xml2js
- **Internationalization**: i18next (Japanese UI)

### Architecture

The application consists of:
- **Main Process**: Handles file operations and EPUB processing
- **Renderer Process**: Manages the user interface
- **IPC Communication**: Secure communication between processes

## Development

### Project Structure

```
src/
├── main/           # Electron main process
│   ├── epub/       # EPUB processing logic
│   └── ipc/        # IPC handlers
├── renderer/       # React application
│   └── components/ # UI components
├── preload/        # Preload scripts
└── shared/         # Shared types and utilities
```

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck
```

## Security Features

- **Path Traversal Protection**: Prevents malicious EPUB files from accessing files outside the extraction directory
- **Resource Limits**: Protects against resource exhaustion attacks
  - Maximum image size: 50MB per image
  - Maximum images per EPUB: 10,000
  - Memory usage monitoring
- **File Name Sanitization**: Ensures safe file names across different operating systems

## Application Icon

The application uses a custom icon featuring an open book with floating images. To set up icons:

1. Place a 1024x1024 PNG icon at `build/icon.png`
2. The build process will automatically generate platform-specific formats:
   - Windows: `icon.ico`
   - macOS: `icon.icns`

## Troubleshooting

### Common Issues

1. **"Cannot find module" error**: Run `npm install` to ensure all dependencies are installed
2. **Build failures on macOS**: You may need to install Xcode Command Line Tools
3. **Large EPUB files**: Files with many images may take longer to process. The app will warn if resource limits are reached
4. **Missing navigation/TOC**: EPUBs without proper navigation will have all images extracted to "001_未分類" folder

## Recent Updates (v0.4.0)

### New Features
- Add automated dependency management system

### Bug Fixes
- Fixed issue where file paths could not be obtained via drag and drop

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR