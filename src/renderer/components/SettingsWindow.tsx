import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsWindow.css';
import { VersionInfo } from './VersionInfo';
import './VersionInfo.css';
import { WINDOW_OPACITY } from '../../main/constants/window';

interface Settings {
  outputDirectory: string;
  language: string;
  alwaysOnTop: boolean;
  includeOriginalFilename: boolean;
  includePageSpread: boolean;
  inactiveOpacity?: number;
  enableMouseHoverOpacity?: boolean;
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
    inactiveOpacity: WINDOW_OPACITY.inactive.default,
    enableMouseHoverOpacity: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [wasReset, setWasReset] = useState(false);

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
          inactiveOpacity: loadedSettings.inactiveOpacity ?? WINDOW_OPACITY.inactive.default,
          enableMouseHoverOpacity: loadedSettings.enableMouseHoverOpacity ?? true,
        });
      });
      // ダイアログを開いたときにリセットフラグをクリア
      setWasReset(false);
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

      // Reset window size to default after reset
      if (wasReset) {
        try {
          await window.electronAPI.clearWindowBounds();
        } catch (clearError) {
          // Treat window bounds reset errors as warnings, not failures
          console.warn('Failed to reset window bounds, but settings were saved:', clearError);
        }
      }

      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Notify user of error
      alert('設定の保存に失敗しました。詳細はコンソールをご確認ください。');
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
      inactiveOpacity: defaultSettings.inactiveOpacity ?? WINDOW_OPACITY.inactive.default,
      enableMouseHoverOpacity: defaultSettings.enableMouseHoverOpacity ?? true,
    });
    // リセットフラグを設定
    setWasReset(true);
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

          <div className="setting-group">
            <label htmlFor="inactive-opacity">{t('settings.inactiveOpacity.label')}</label>
            <div className="opacity-slider">
              <input
                id="inactive-opacity"
                type="range"
                min={String(WINDOW_OPACITY.inactive.min)}
                max={String(WINDOW_OPACITY.inactive.max)}
                step={String(WINDOW_OPACITY.inactive.step)}
                value={settings.inactiveOpacity ?? WINDOW_OPACITY.inactive.default}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, inactiveOpacity: parseFloat(e.target.value) }))
                }
              />
              <span className="opacity-value">
                {Math.round((settings.inactiveOpacity ?? WINDOW_OPACITY.inactive.default) * 100)}%
              </span>
            </div>
            <small>{t('settings.inactiveOpacity.description')}</small>
            <label htmlFor="enable-mouse-hover">
              <input
                id="enable-mouse-hover"
                type="checkbox"
                checked={settings.enableMouseHoverOpacity ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, enableMouseHoverOpacity: e.target.checked }))
                }
              />
              {t('settings.inactiveOpacity.enableMouseHover')}
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
