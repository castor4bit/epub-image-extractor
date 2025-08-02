import '@testing-library/jest-dom';

// テスト環境の設定
process.env.NODE_ENV = 'test';

// Note: In ESM mode, we'll need to mock electron differently
// For now, we'll skip the electron mock for pure utility tests