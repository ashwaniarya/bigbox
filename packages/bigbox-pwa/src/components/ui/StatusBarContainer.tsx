import React from 'react';

interface StatusBarProps {
  className?: string;
}

export const StatusBarContainer: React.FC<StatusBarProps> = ({ className }) => {
  return (
    <div className={`status-bar ${className || ''}`}>
      <div className="status-left">
        <span className="time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="status-right">
        <span className="battery">🔋</span>
        <span className="signal">📶</span>
      </div>
    </div>
  );
};

export default StatusBarContainer;
