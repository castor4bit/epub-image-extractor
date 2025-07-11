import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppVersionInfo } from '@shared/types';

interface VersionInfoProps {
  className?: string;
  onShowAbout?: () => void;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ className = '', onShowAbout }) => {
  const { t } = useTranslation();
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

    loadVersionInfo();
  }, []);

  if (!versionInfo) {
    return null;
  }

  return (
    <div className={`version-info ${className}`}>
      <div className="version-header">
        <h3>{t('about.title')}</h3>
      </div>

      <div className="version-basic">
        <div className="version-item">
          <span className="version-label">{t('about.version')}:</span>
          <span className="version-value">{versionInfo.version}</span>
        </div>
      </div>

      {onShowAbout && (
        <div className="version-actions">
          <button onClick={onShowAbout} className="show-about-button">
            {t('about.showDetails')}
          </button>
        </div>
      )}
    </div>
  );
};
