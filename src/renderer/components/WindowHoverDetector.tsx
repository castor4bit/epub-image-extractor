import React, { useEffect } from 'react';

export const WindowHoverDetector: React.FC = () => {
  useEffect(() => {
    const handleMouseEnter = () => {
      window.electronAPI.send('window:mouseenter');
    };

    const handleMouseLeave = () => {
      window.electronAPI.send('window:mouseleave');
    };

    // ウィンドウ全体のマウスイベントを監視
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // このコンポーネントは何も表示しない
  return null;
};