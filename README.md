# EPUB Image Extractor

A cross-platform desktop application for extracting images from EPUB files, organized by chapters.

## Features

- **Drag & Drop Interface**: Simply drag and drop EPUB files to process
- **Chapter-based Organization**: Images are organized into folders based on the EPUB's table of contents
- **Batch Processing**: Process multiple EPUB files simultaneously with parallel execution
- **Real-time Progress Tracking**: Monitor extraction progress for each file
- **Cross-platform**: Works on Windows and macOS

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

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

# Build for Windows
npm run dist:win

# Build for macOS
npm run dist:mac
```

## Usage

1. Launch the application
2. Drag and drop EPUB files onto the drop zone, or click "ファイルを選択" to browse
3. The application will extract all images and organize them by chapters
4. Images are saved to `Desktop/EPUB_Images/[book-name]/[chapter]/`

### Output Structure

```
EPUB_Images/
└── BookTitle/
    ├── 001_表紙/
    │   ├── 001.jpg
    │   └── 002.jpg
    ├── 002_第1章/
    │   ├── 001.png
    │   ├── 002.png
    │   └── 003.jpg
    └── 003_第2章/
        └── 001.jpg
```

## Technical Details

### Technology Stack

- **Framework**: Electron
- **Language**: TypeScript
- **UI**: React
- **Build Tool**: Vite
- **EPUB Parser**: @gxl/epub-parser

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
npm test
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

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.