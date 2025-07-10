import React, { useState, useEffect } from 'react';
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
  const [settings, setSettings] = useState<Settings>({
    outputDirectory: '',
    language: 'ja',
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
          <h2>設定</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="output-directory">出力先ディレクトリ</label>
            <div className="directory-input">
              <input id="output-directory" type="text" value={settings.outputDirectory} readOnly />
              <button onClick={handleSelectDirectory} className="browse-button">
                参照...
              </button>
            </div>
          </div>

          <div className="setting-group">
            <label htmlFor="language">言語</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
            >
              <option value="ja">日本語</option>
              <option value="en" disabled>
                English (今後対応予定)
              </option>
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
              ウィンドウを最前面に表示
            </label>
          </div>

          <div className="setting-group">
            <h3>ファイル名設定</h3>
            <label htmlFor="include-original-filename">
              <input
                id="include-original-filename"
                type="checkbox"
                checked={settings.includeOriginalFilename}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, includeOriginalFilename: e.target.checked }))
                }
              />
              元のファイル名を含める
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
              左右情報（left/right）を含める
            </label>
          </div>

          <VersionInfo onShowAbout={onShowAbout} />
        </div>

        <div className="settings-footer">
          <button onClick={handleReset} className="reset-button">
            デフォルトに戻す
          </button>
          <div className="footer-buttons">
            <button onClick={onClose} className="cancel-button">
              キャンセル
            </button>
            <button onClick={handleSave} className="save-button" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
