import React, { useState, useEffect } from 'react';
import { AppVersionInfo } from '@shared/types';

interface VersionInfoProps {
  className?: string;
  onShowAbout?: () => void;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ className = '', onShowAbout }) => {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadVersionInfo = async () => {
      try {
        const info = await window.electronAPI.getVersion();
        setVersionInfo(info);
      } catch (error) {
        console.error('バージョン情報の取得に失敗しました:', error);
      }
    };

    loadVersionInfo();
  }, []);

  if (!versionInfo) {
    return null;
  }

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
    <div className={`version-info ${className}`}>
      <div className="version-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>アプリケーション情報</h3>
        <span className="version-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      <div className="version-basic">
        <div className="version-item">
          <span className="version-label">バージョン:</span>
          <span className="version-value">{versionInfo.version}</span>
        </div>
        <div className="version-item">
          <span className="version-label">プラットフォーム:</span>
          <span className="version-value">
            {formatPlatform(versionInfo.platform, versionInfo.arch)}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="version-details">
          <div className="version-item">
            <span className="version-label">アプリケーション名:</span>
            <span className="version-value">{versionInfo.name}</span>
          </div>
          <div className="version-item">
            <span className="version-label">Electron:</span>
            <span className="version-value">{versionInfo.electronVersion}</span>
          </div>
          <div className="version-item">
            <span className="version-label">Node.js:</span>
            <span className="version-value">{versionInfo.nodeVersion}</span>
          </div>
          <div className="version-item">
            <span className="version-label">Chromium:</span>
            <span className="version-value">{versionInfo.chromiumVersion}</span>
          </div>
        </div>
      )}

      {onShowAbout && (
        <div className="version-actions">
          <button onClick={onShowAbout} className="show-about-button">
            詳細情報を表示...
          </button>
        </div>
      )}
    </div>
  );
};
