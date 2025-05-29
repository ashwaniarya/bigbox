import { useState } from 'react';
import * as sandboxManager from '../services/sandbox-manager';

interface SandboxListModalProps {
  sandboxes: sandboxManager.Sandbox[];
  runningSandbox: string | null;
  onClose: () => void;
  onSandboxAction: (sandbox: sandboxManager.Sandbox) => void;
  onRefresh: () => void;
}

export function SandboxListModal({ 
  sandboxes, 
  runningSandbox, 
  onClose, 
  onSandboxAction, 
  onRefresh 
}: SandboxListModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSandboxes = sandboxes.filter(sandbox => {
    const title = (sandbox.meta?.title as string) || '';
    const description = (sandbox.meta?.description as string) || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (sandbox: sandboxManager.Sandbox, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the sandbox action
    
    if (confirm(`Delete "${sandbox.meta?.title || 'App'}"?`)) {
      try {
        await sandboxManager.destroy(sandbox.id);
        onRefresh();
      } catch (error) {
        console.error('Failed to delete sandbox:', error);
        alert('Failed to delete app. Please try again.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content apps-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📱 All Apps</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search apps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Sandbox Grid */}
          <div className="sandbox-grid">
            {filteredSandboxes.length === 0 ? (
              <div className="empty-state">
                <p>📱</p>
                <p>No apps found</p>
                {sandboxes.length === 0 && (
                  <p>Create your first app using the Chat feature!</p>
                )}
              </div>
            ) : (
              filteredSandboxes.map(sandbox => (
                <div 
                  key={sandbox.id} 
                  className={`sandbox-card ${runningSandbox === sandbox.id ? 'running' : ''}`}
                  onClick={() => onSandboxAction(sandbox)}
                >
                  <div className="sandbox-card-header">
                    <span className="sandbox-emoji">
                      {getEmojiForTitle(sandbox.meta?.title as string)}
                    </span>
                    <button 
                      className="delete-button"
                      onClick={(e) => handleDelete(sandbox, e)}
                      title="Delete app"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="sandbox-card-content">
                    <h3 className="sandbox-title">
                      {(sandbox.meta?.title as string) || 'Unnamed App'}
                      {runningSandbox === sandbox.id && <span className="running-indicator">🔄</span>}
                    </h3>
                    
                    {sandbox.meta?.description && (
                      <p className="sandbox-description">
                        {sandbox.meta.description as string}
                      </p>
                    )}
                    
                    <div className="sandbox-meta">
                      <span className="created-date">
                        Created: {new Date(sandbox.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="refresh-button" onClick={onRefresh}>
            🔄 Refresh
          </button>
          <span className="app-count">
            {filteredSandboxes.length} of {sandboxes.length} apps
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function to get emoji based on title
function getEmojiForTitle(title?: string): string {
  if (!title) return '📱';
  
  const iconMap: Record<string, string> = {
    'calculator': '🧮',
    'game': '🎮',
    'todo': '📝',
    'note': '📄',
    'chat': '💬',
    'music': '🎵',
    'photo': '📷',
    'video': '🎬',
    'map': '🗺️',
    'weather': '🌤️',
    'calendar': '📅',
    'email': '✉️',
    'browser': '🌐',
    'code': '💻',
    'test': '🚀',
    'sandbox': '📦',
  };
  
  const lowerTitle = title.toLowerCase();
  for (const [key, emoji] of Object.entries(iconMap)) {
    if (lowerTitle.includes(key)) {
      return emoji;
    }
  }
  
  return '📱';
} 