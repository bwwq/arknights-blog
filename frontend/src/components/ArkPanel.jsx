import React from 'react';
import './ArkPanel.css';

const ArkPanel = ({ children, className = '', title, glow = false }) => {
  return (
    <div className={`ark-panel ${glow ? 'pulse-border' : ''} ${className}`}>
      {title && (
        <div className="ark-panel-title">
          <span className="title-text">{title}</span>
          <div className="title-line"></div>
        </div>
      )}
      <div className="ark-panel-content">
        {children}
      </div>
    </div>
  );
};

export default ArkPanel;
