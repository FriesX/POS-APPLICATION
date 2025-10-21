// src/components/Window.jsx
import React from 'react';
import '../App.css';

function Window({ title, children }) {
  return (
    <div className="window">
      <div className="window-titlebar">
        <span>{title}</span>
        <div className="window-controls">
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
}

export default Window;