// ウィンドウサイズの定数定義
export const WINDOW_SIZES = {
  default: {
    width: 600,
    height: 560,
  },
  minimum: {
    width: 500,
    height: 400,
  },
} as const;

// ウィンドウ透明度の定数定義
export const WINDOW_OPACITY = {
  active: 1.0,
  inactive: {
    default: 0.8,
    min: 0.1,
    max: 1.0,
    step: 0.1,
  },
} as const;
