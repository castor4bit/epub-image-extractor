import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsWindow.css';
import { VersionInfo } from './VersionInfo';
import './VersionInfo.css';

interface Settings {
  outputDirectory: string;
  language: string;
  alwaysOnTop: boolean;
  includeOriginalFilename: boolean;
  includePageSpread: boolean;
}

interface SettingsWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAbout?: () => void;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = ({ isOpen, onClose, onShowAbout }) => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<Settings>({
    outputDirectory: '',
    language: i18n.language,
    alwaysOnTop: true,
    includeOriginalFilename: true,
    includePageSpread: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 設定を読み込む
      window.electronAPI.getSettings().then((loadedSettings) => {
        setSettings({
          outputDirectory: loadedSettings.outputDirectory ?? '',
          language: loadedSettings.language ?? 'ja',
          alwaysOnTop: loadedSettings.alwaysOnTop ?? true,
          includeOriginalFilename: loadedSettings.includeOriginalFilename ?? true,
          includePageSpread: loadedSettings.includePageSpread ?? true,
        });
      });
    }
  }, [isOpen]);

  const handleSelectDirectory = async () => {
    const directory = await window.electronAPI.selectOutputDirectory();
    if (directory) {
      setSettings((prev) => ({ ...prev, outputDirectory: directory }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 言語設定が変更された場合、i18nの言語を変更
      if (settings.language !== i18n.language) {
        i18n.changeLanguage(settings.language);
      }

      await window.electronAPI.saveSettings(settings);
      onClose();
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings = await window.electronAPI.resetSettings();
    setSettings({
      outputDirectory: defaultSettings.outputDirectory ?? '',
      language: defaultSettings.language ?? 'ja',
      alwaysOnTop: defaultSettings.alwaysOnTop ?? true,
      includeOriginalFilename: defaultSettings.includeOriginalFilename ?? true,
      includePageSpread: defaultSettings.includePageSpread ?? true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-window" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>{t('settings.title')}</h2>
          <button className="close-button" onClick={onClose}>
            {t('settings.close')}
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="output-directory">{t('settings.outputDirectory.label')}</label>
            <div className="directory-input">
              <input id="output-directory" type="text" value={settings.outputDirectory} readOnly />
              <button onClick={handleSelectDirectory} className="browse-button">
                {t('settings.outputDirectory.browse')}
              </button>
            </div>
            <small>{t('settings.outputDirectory.description')}</small>
          </div>

          <div className="setting-group">
            <label htmlFor="language">{t('language.label')}</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
            >
              <option value="ja">{t('language.ja')}</option>
              <option value="en">{t('language.en')}</option>
            </select>
          </div>

          <div className="setting-group">
            <label htmlFor="always-on-top">
              <input
                id="always-on-top"
                type="checkbox"
                checked={settings.alwaysOnTop}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, alwaysOnTop: e.target.checked }))
                }
              />
              {t('settings.alwaysOnTop')}
            </label>
          </div>

          <div className="setting-group">
            <h3>{t('settings.filenameOptions.title')}</h3>
            <label htmlFor="include-original-filename">
              <input
                id="include-original-filename"
                type="checkbox"
                checked={settings.includeOriginalFilename}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, includeOriginalFilename: e.target.checked }))
                }
              />
              {t('settings.filenameOptions.includeOriginalFilename')}
            </label>
            <label htmlFor="include-page-spread">
              <input
                id="include-page-spread"
                type="checkbox"
                checked={settings.includePageSpread}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, includePageSpread: e.target.checked }))
                }
              />
              {t('settings.filenameOptions.includePageSpread')}
            </label>
          </div>

          <VersionInfo onShowAbout={onShowAbout} />
        </div>

        <div className="settings-footer">
          <button onClick={handleReset} className="reset-button">
            {t('settings.actions.reset')}
          </button>
          <div className="footer-buttons">
            <button onClick={onClose} className="cancel-button">
              {t('settings.actions.cancel')}
            </button>
            <button onClick={handleSave} className="save-button" disabled={isSaving}>
              {isSaving ? t('settings.actions.saving') : t('settings.actions.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
