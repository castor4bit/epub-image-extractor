import React from 'react';
import { useTranslation } from 'react-i18next';

interface UpdateNotificationBannerProps {
  version: string | null;
  onDismiss: () => void;
}

export const UpdateNotificationBanner: React.FC<UpdateNotificationBannerProps> = ({
  version,
  onDismiss,
}) => {
  const { t } = useTranslation();

  if (!version) {
    return null;
  }

  const handleOpenReleasesPage = async () => {
    try {
      await window.electronAPI.openReleasesPage();
    } catch (error) {
      console.error('GitHubリリースページを開けませんでした:', error);
    }
  };

  return (
    <div className="update-notification-banner">
      <div className="update-notification-content">
        <span className="update-notification-message">
          {t('update.newVersionAvailable', { version })}
        </span>
        <div className="update-notification-actions">
          <button onClick={handleOpenReleasesPage} className="update-notification-view-button">
            {t('update.viewOnGitHub')}
          </button>
          <button onClick={onDismiss} className="update-notification-dismiss-button">
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
