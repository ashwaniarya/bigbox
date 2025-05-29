import React from 'react';
import { IoApps, IoChatbubbleEllipses, IoSettings } from 'react-icons/io5';

interface DockContainerProps {
  activeModal: 'list' | 'chat' | 'settings' | null;
  onIconClick: (modal: 'list' | 'chat' | 'settings' | null) => void;
  className?: string;
}

export const DockContainer: React.FC<DockContainerProps> = ({ 
  activeModal, 
  onIconClick,
  className 
}) => {
  return (
    <div className={`ios-dock ${className || ''}`}>
      <div className="dock-container">
        <button 
          className={`dock-app ${activeModal === 'list' ? 'active' : ''}`}
          onClick={() => onIconClick(activeModal === 'list' ? null : 'list')}
        >
          <div className="dock-app-icon">
            <IoApps />
          </div>
        </button>
        
        <button 
          className={`dock-app ${activeModal === 'chat' ? 'active' : ''}`}
          onClick={() => onIconClick(activeModal === 'chat' ? null : 'chat')}
        >
          <div className="dock-app-icon">
            <IoChatbubbleEllipses />
          </div>
        </button>
        
        <button 
          className={`dock-app ${activeModal === 'settings' ? 'active' : ''}`}
          onClick={() => onIconClick(activeModal === 'settings' ? null : 'settings')}
        >
          <div className="dock-app-icon">
            <IoSettings />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DockContainer;
