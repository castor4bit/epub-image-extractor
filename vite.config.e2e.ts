import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

// E2Eテスト専用のビルド設定
// CommonJS形式でビルドしてPlaywrightとの互換性を確保
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'src/main/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron-e2e/main',
            rollupOptions: {
              external: [
                'electron',
                'jsdom',
                'canvas',
                'ws',
                'fast-xml-parser',
                'winston',
                'p-limit'
              ],
              output: {
                // CommonJS形式で出力（E2Eテスト用）
                format: 'cjs',
                // .cjs拡張子を使用
                entryFileNames: '[name].cjs',
                // コード分割を無効化
                inlineDynamicImports: true,
                // 厳密なCommonJS形式
                exports: 'auto',
                interop: 'auto',
              },
            },
          },
          resolve: {
            // Node.js環境での実行を確保
            browserField: false,
            mainFields: ['module', 'jsnext:main', 'jsnext'],
          },
        },
      },
      {
        entry: 'src/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron-e2e/preload',
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs',
                // .cjs拡張子を使用
                entryFileNames: '[name].cjs',
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@main': resolve(__dirname, 'src/main'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true,
  },
});