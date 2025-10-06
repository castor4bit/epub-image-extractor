import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppVersionInfo } from '@shared/types';

interface VersionInfoProps {
  className?: string;
  onShowAbout?: () => void;
}

type UpdateStatus = 'idle' | 'checking' | 'available' | 'latest';

interface UpdateCheckResult {
  updateAvailable: boolean;
  version?: string;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ className = '', onShowAbout }) => {
  const { t } = useTranslation();
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [newVersion, setNewVersion] = useState<string | undefined>(undefined);

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

  const handleCheckForUpdates = async () => {
    setUpdateStatus('checking');
    setNewVersion(undefined);

    try {
      const result: UpdateCheckResult = await window.electronAPI.checkForUpdates();

      if (result.updateAvailable && result.version) {
        setUpdateStatus('available');
        setNewVersion(result.version);
      } else {
        setUpdateStatus('latest');
      }
    } catch (error) {
      console.error('更新確認に失敗しました:', error);
      setUpdateStatus('idle');
    }
  };

  const handleOpenReleasesPage = async () => {
    try {
      await window.electronAPI.openReleasesPage();
    } catch (error) {
      console.error('GitHubリリースページを開けませんでした:', error);
    }
  };

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

      <div className="update-check-section">
        <button
          onClick={handleCheckForUpdates}
          disabled={updateStatus === 'checking'}
          className="check-update-button"
        >
          {updateStatus === 'checking' ? t('update.checking') : t('update.checkNow')}
        </button>

        {updateStatus === 'latest' && <p className="update-latest">{t('update.upToDate')}</p>}

        {updateStatus === 'available' && newVersion && (
          <div className="update-available">
            <p className="update-message">{t('update.newVersionAvailable', { version: newVersion })}</p>
            <button onClick={handleOpenReleasesPage} className="view-github-button">
              {t('update.viewOnGitHub')}
            </button>
          </div>
        )}
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
