import React, { useState, useEffect } from 'react';
import { AppVersionInfo } from '@shared/types';
import './AboutDialog.css';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        const info = await window.electronAPI.getVersion();
        setVersionInfo(info);
      } catch (error) {
        console.error('バージョン情報の取得に失敗しました:', error);
      }
    };

    if (isOpen) {
      loadVersionInfo();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPlatform = (platform: string, arch: string) => {
    const platformMap: { [key: string]: string } = {
      win32: 'Windows',
      darwin: 'macOS',
      linux: 'Linux',
    };
    const archMap: { [key: string]: string } = {
      x64: '64-bit',
      arm64: 'ARM64',
      ia32: '32-bit',
    };
    return `${platformMap[platform] || platform} (${archMap[arch] || arch})`;
  };

  return (
    <div className="about-overlay" onClick={handleBackdropClick}>
      <div className="about-dialog">
        <div className="about-header">
          <div className="about-icon">📚</div>
          <h2>{versionInfo?.name || 'EPUB Image Extractor'}</h2>
          <p className="about-description">EPUBファイルから章別に画像を抽出するアプリケーション</p>
        </div>

        <div className="about-content">
          {versionInfo && (
            <>
              <div className="about-version">
                <h3>バージョン情報</h3>
                <div className="about-item">
                  <span className="about-label">バージョン:</span>
                  <span className="about-value">{versionInfo.version}</span>
                </div>
                <div className="about-item">
                  <span className="about-label">プラットフォーム:</span>
                  <span className="about-value">
                    {formatPlatform(versionInfo.platform, versionInfo.arch)}
                  </span>
                </div>
              </div>

              <div className="about-technical">
                <h3>技術情報</h3>
                <div className="about-item">
                  <span className="about-label">Electron:</span>
                  <span className="about-value">{versionInfo.electronVersion}</span>
                </div>
                <div className="about-item">
                  <span className="about-label">Node.js:</span>
                  <span className="about-value">{versionInfo.nodeVersion}</span>
                </div>
                <div className="about-item">
                  <span className="about-label">Chromium:</span>
                  <span className="about-value">{versionInfo.chromiumVersion}</span>
                </div>
              </div>
            </>
          )}

          <div className="about-license">
            <h3>ライセンス</h3>
            <p>このソフトウェアはMITライセンスの下で配布されています。</p>
            <p>
              詳細については、アプリケーションに同梱されている
              <br />
              LICENSEファイルをご確認ください。
            </p>
          </div>
        </div>

        <div className="about-footer">
          <button onClick={onClose} className="about-close-button">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
