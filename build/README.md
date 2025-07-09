# Icon Files

This directory contains the application icons for EPUB Image Extractor.

## Required Files

### 1. For automatic generation (recommended):
Place a single high-resolution PNG file:
- **Filename**: `icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparent background
- **Color depth**: 32-bit (RGBA)

Electron Builder will automatically generate platform-specific icons from this file.

### 2. For manual setup (optional):
If you want to provide platform-specific icons:

#### macOS:
- **Filename**: `icon.icns`
- **Required sizes**: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

#### Windows:
- **Filename**: `icon.ico`
- **Required sizes**: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

#### Linux:
- **Filename**: `icon.png`
- **Recommended size**: 512x512 or 1024x1024

## Icon Design Guidelines

- Use a clear, recognizable design that represents image extraction from EPUB files
- Ensure good visibility at small sizes (16x16)
- Avoid text unless very simple
- Use appropriate padding (don't fill entire canvas)
- Consider both light and dark backgrounds

## Generating Icons

You can use tools like:
- **iconutil** (macOS) for creating .icns files
- **ImageMagick** for converting between formats
- **Online converters** for creating .ico files
- **Electron Builder** will auto-generate if you only provide icon.png