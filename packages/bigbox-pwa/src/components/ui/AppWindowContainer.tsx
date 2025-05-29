import React, { forwardRef } from 'react';
import { IoChevronBack } from 'react-icons/io5';

interface AppWindowContainerProps {
  title: string;
  onBackClick: () => void;
  className?: string;
}

export const AppWindowContainer = forwardRef<HTMLDivElement, AppWindowContainerProps>(
  ({ title, onBackClick, className }, ref) => {
    return (
      <div className={`sandbox-fullscreen ${className || ''}`}>
        <div className="sandbox-header ios-header">
          <button className="back-button" onClick={onBackClick}>
            <IoChevronBack /> <span>Home</span>
          </button>
          <span className="sandbox-title">
            {title}
          </span>
        </div>
        <div 
          ref={ref}
          className="sandbox-display"
        />
      </div>
    );
  }
);

AppWindowContainer.displayName = 'AppWindowContainer';

export default AppWindowContainer;
