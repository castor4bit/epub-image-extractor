import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppVersionInfo } from '@shared/types';
import iconUrl from '../../../build/icon.png';
import './AboutDialog.css';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
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

    if (isOpen) {
      loadVersionInfo();
    }
  }, [isOpen]);

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

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
          <button className="about-close-x" onClick={onClose} title={t('about.close')}>
            ×
          </button>
          <div className="about-icon">
            <img src={iconUrl} alt="App Icon" className="about-app-icon" />
          </div>
          <h2>{versionInfo?.name || 'EPUB Image Extractor'}</h2>
        </div>

        <div className="about-content">
          {versionInfo && (
            <div className="about-system">
              <h3>{t('about.systemInfo')}</h3>
              <div className="about-item">
                <span className="about-label">{t('about.version')}:</span>
                <span className="about-value">{versionInfo.version}</span>
              </div>
              <div className="about-item">
                <span className="about-label">{t('about.platform')}:</span>
                <span className="about-value">
                  {formatPlatform(versionInfo.platform, versionInfo.arch)}
                </span>
              </div>
              <div className="about-item">
                <span className="about-label">Electron:</span>
                <span className="about-value">{versionInfo.electronVersion}</span>
              </div>
            </div>
          )}

          <div className="about-license">
            <h3>{t('about.license')}</h3>
            <p className="license-simple">
              {t('about.licenseText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
