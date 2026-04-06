import React, { useState, useLayoutEffect } from 'react';
import './ThemeSwitcher.css';

const themes = [
  { name: 'Neon', color: '#ccff00' },
  { name: 'Cyber', color: '#00f2ff' },
  { name: 'Solar', color: '#ff4d00' },
  { name: 'Plasma', color: '#bd00ff' },
  { name: 'Gold', color: '#ffcc00' }
];

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState(1); // Default to Cyber

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--accent-neon', themes[currentTheme].color);
  }, [currentTheme]);

  const cycleTheme = () => {
    setCurrentTheme((prev) => (prev + 1) % themes.length);
  };

  return (
    <div className="theme-switcher">
      <button 
        onClick={cycleTheme} 
        className="theme-button cursor-hover"
        title="Cycle Atmosphere"
      >
        <span className="theme-dot" style={{ backgroundColor: themes[currentTheme].color }}></span>
        <span className="theme-label">{themes[currentTheme].name}</span>
      </button>
    </div>
  );
}
