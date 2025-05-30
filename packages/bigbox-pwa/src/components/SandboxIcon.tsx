import * as sandboxManager from '../services/sandbox-manager';

interface SandboxIconProps {
  sandbox: sandboxManager.Sandbox;
  onClick: () => void;
}

export function SandboxIcon({ sandbox, onClick }: SandboxIconProps) {
  // Generate icon from sandbox title or use default
  const getIconEmoji = (title?: string) => {
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
    
    return '📱'; // Default icon
  };

  const getDisplayTitle = (sandbox: sandboxManager.Sandbox) => {
    const title = sandbox.meta?.title as string;
    if (title && title.length > 12) {
      return title.substring(0, 16) + '...';
    }
    return title || 'App';
  };

  return (
    <div className="sandbox-icon" onClick={onClick}>
      <div className="icon-image">
        <span className="icon-emoji">
          {getIconEmoji(sandbox.meta?.title as string)}
        </span>
      </div>
      <span className="icon-label">
        {getDisplayTitle(sandbox)}
      </span>
    </div>
  );
} 