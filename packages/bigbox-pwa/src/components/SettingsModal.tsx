import { useState, useEffect, useRef } from 'react';

interface SettingsModalProps {
  onClose: () => void;
  wallpaper: string;
  onWallpaperChange: (wallpaper: string) => void;
}

interface Settings {
  presetPrompts: string[];
  theme: 'light' | 'dark';
  notifications: boolean;
}

export function SettingsModal({ onClose, wallpaper, onWallpaperChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    presetPrompts: [
      'Create a calculator app',
      'Make a todo list app',
      'Build a simple game',
      'Create a note-taking app',
      'Make a weather app'
    ],
    theme: 'light',
    notifications: true,
  });
  
  const [newPrompt, setNewPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wallpaperOptions = [
    { id: 'gradient-blue', name: 'Ocean Blue', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient-sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
    { id: 'gradient-forest', name: 'Forest', preview: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' },
    { id: 'gradient-purple', name: 'Purple Night', preview: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)' },
    { id: 'gradient-minimal', name: 'Minimal', preview: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
  ];

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('bigbox-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bigbox-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const addPresetPrompt = () => {
    if (newPrompt.trim() && !settings.presetPrompts.includes(newPrompt.trim())) {
      handleSettingChange('presetPrompts', [...settings.presetPrompts, newPrompt.trim()]);
      setNewPrompt('');
    }
  };

  const removePresetPrompt = (index: number) => {
    const updated = settings.presetPrompts.filter((_, i) => i !== index);
    handleSettingChange('presetPrompts', updated);
  };

  const clearData = () => {
    if (confirm('This will delete all your apps and settings. Are you sure?')) {
      try {
        // Clear IndexedDB
        indexedDB.deleteDatabase('BigBoxSandboxes');
        // Clear localStorage
        localStorage.removeItem('bigbox-settings');
        alert('All data cleared successfully. The page will refresh.');
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear some data. Please try again.');
      }
    }
  };

  const exportData = async () => {
    try {
      // This is a simplified export - in a real app you'd export the actual IndexedDB data
      const exportData = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `bigbox-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const fileContents = await file.text();
      const importedData = JSON.parse(fileContents);
      
      // Validate imported data has the required structure
      if (importedData.settings) {
        // Apply imported settings
        setSettings(prev => ({ ...prev, ...importedData.settings }));
        
        // Store in localStorage
        localStorage.setItem('bigbox-settings', JSON.stringify(importedData.settings));
        
        alert('Settings imported successfully!');
      } else {
        alert('Invalid data format. Could not import settings.');
      }
      
      // Reset the file input for future imports
      if (event.target) event.target.value = '';
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format and try again.');
      
      // Reset the file input
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body settings-content">
          
          {/* Appearance Section */}
          <section className="settings-section">
            <h3>🎨 Appearance</h3>
            
            <div className="setting-group">
              <label>Wallpaper</label>
              <div className="wallpaper-grid">
                {wallpaperOptions.map(option => (
                  <div
                    key={option.id}
                    className={`wallpaper-option ${wallpaper === option.id ? 'selected' : ''}`}
                    style={{ background: option.preview }}
                    onClick={() => onWallpaperChange(option.id)}
                    title={option.name}
                  >
                    {wallpaper === option.id && <span className="check-mark">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
                Enable notifications
              </label>
            </div>
          </section>

          {/* AI Chat Section */}
          <section className="settings-section">
            <h3>🤖 AI Chat</h3>
            
            <div className="setting-group">
              <label>Preset Prompts</label>
              <div className="preset-prompts">
                {settings.presetPrompts.map((prompt, index) => (
                  <div key={index} className="preset-prompt">
                    <span>{prompt}</span>
                    <button 
                      onClick={() => removePresetPrompt(index)}
                      className="remove-prompt"
                      title="Remove prompt"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-prompt">
                <input
                  type="text"
                  placeholder="Add new preset prompt..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPresetPrompt()}
                  maxLength={100}
                />
                <button onClick={addPresetPrompt} disabled={!newPrompt.trim()}>
                  Add
                </button>
              </div>
            </div>
          </section>

          {/* Data Management Section */}
          <section className="settings-section">
            <h3>📁 Data Management</h3>
            
            <div className="setting-group">
              <div className="data-actions">
                <button onClick={exportData} className="export-button">
                  📤 Export Data
                </button>
                <button onClick={triggerFileInput} className="import-button">
                  📥 Import Data
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={importData}
                  accept=".json"
                  style={{ display: 'none' }}
                />
                <button onClick={clearData} className="clear-button">
                  🗑️ Clear All Data
                </button>
              </div>
              <small>Import or export your settings and apps, or clear all data to start fresh</small>
            </div>
          </section>

          {/* About Section */}
          <section className="settings-section">
            <h3>ℹ️ About</h3>
            <div className="about-info">
              <p><strong>BigBox</strong></p>
              <p>Version: 1.0.0 </p>
              <p>AI-Generated Apps Platform</p>
              <p><strong>Features:</strong></p>
              <ul>
                <li>✅ SandboxManager SDK with IndexedDB</li>
                <li>✅ Event system with comprehensive logging</li>
                <li>✅ Android-style Home Shell UI</li>
                <li>✅ AI Chat for app generation</li>
                <li>✅ PWA with Service Worker</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-settings">
            Done
          </button>
        </div>
      </div>
    </div>
  );
} 