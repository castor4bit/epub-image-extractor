import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.vitest.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'dist-electron/**',
        'dist-electron-e2e/**',
        'release/**',
        '**/*.config.*',
        '**/*.d.ts',
        'e2e/**',
        'scripts/**',
        'tests/setup.vitest.ts'
      ]
    },
    // テストファイルパターン
    include: [
      '**/__tests__/**/*.test.ts',
      '**/__tests__/**/*.test.tsx',
      '**/tests/**/*.test.ts',
      '**/tests/**/*.test.tsx',
      '**/*.test.ts',
      '**/*.test.tsx'
    ],
    // タイムアウト設定
    testTimeout: 10000,
    hookTimeout: 10000,
    // 並列実行設定
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@main': resolve(__dirname, './src/main'),
      '@renderer': resolve(__dirname, './src/renderer'),
      '@shared': resolve(__dirname, './src/shared')
    }
  },
  // ESM対応
  esbuild: {
    target: 'node18'
  }
});