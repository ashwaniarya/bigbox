import React from 'react';
import * as sandboxManager from '@bigbox/sandbox-manager';
import { SandboxIcon } from '../SandboxIcon';

interface HomeScreenContainerProps {
  sandboxes: sandboxManager.Sandbox[];
  onSandboxClick: (sandbox: sandboxManager.Sandbox) => void;
  onAddAppClick: () => void;
  className?: string;
}

export const HomeScreenContainer: React.FC<HomeScreenContainerProps> = ({
  sandboxes,
  onSandboxClick,
  onAddAppClick,
  className
}) => {
  return (
    <div className={`home-screen ${className || ''}`}>
      <div className="wallpaper-area">
        <div className="app-grid">
          {sandboxes.map(sandbox => (
            <SandboxIcon
              key={sandbox.id}
              sandbox={sandbox}
              onClick={() => onSandboxClick(sandbox)}
            />
          ))}
          
          {/* Add App Icon */}
          <div 
            className="sandbox-icon add-app"
            onClick={onAddAppClick}
          >
            <div className="icon-image">
              <span className="icon-plus">+</span>
            </div>
            <span className="icon-label">Add App</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreenContainer; 