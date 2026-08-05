import React, { useState, useEffect } from 'react';

const THEMES = [
  { 
    id: 'purple', 
    name: 'Purple Haze',
    colors: {
      accent: '#818cf8',
      accentDark: '#6366f1',
      accentLight: '#a5b4fc',
      accentGlow: 'rgba(129, 140, 248, 0.08)',
    }
  },
  { 
    id: 'blue', 
    name: 'Ocean Blue',
    colors: {
      accent: '#60a5fa',
      accentDark: '#3b82f6',
      accentLight: '#93c5fd',
      accentGlow: 'rgba(96, 165, 250, 0.08)',
    }
  },
  { 
    id: 'teal', 
    name: 'Teal Dream',
    colors: {
      accent: '#2dd4bf',
      accentDark: '#14b8a6',
      accentLight: '#5eead4',
      accentGlow: 'rgba(45, 212, 191, 0.08)',
    }
  },
  { 
    id: 'emerald', 
    name: 'Emerald Green',
    colors: {
      accent: '#34d399',
      accentDark: '#10b981',
      accentLight: '#6ee7b7',
      accentGlow: 'rgba(52, 211, 153, 0.08)',
    }
  },
  { 
    id: 'rose', 
    name: 'Rose Gold',
    colors: {
      accent: '#f472b6',
      accentDark: '#ec4899',
      accentLight: '#f9a8d4',
      accentGlow: 'rgba(244, 114, 182, 0.08)',
    }
  },
  { 
    id: 'amber', 
    name: 'Amber Glow',
    colors: {
      accent: '#fbbf24',
      accentDark: '#f59e0b',
      accentLight: '#fcd34d',
      accentGlow: 'rgba(251, 191, 36, 0.08)',
    }
  },
  { 
    id: 'cyan', 
    name: 'Cyan Light',
    colors: {
      accent: '#22d3ee',
      accentDark: '#06b6d4',
      accentLight: '#67e8f9',
      accentGlow: 'rgba(34, 211, 238, 0.08)',
    }
  },
  { 
    id: 'violet', 
    name: 'Violet Dream',
    colors: {
      accent: '#a78bfa',
      accentDark: '#8b5cf6',
      accentLight: '#c4b5fd',
      accentGlow: 'rgba(167, 139, 250, 0.08)',
    }
  },
];

const ThemeDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('purple');

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('theme_preference');
    if (saved) {
      setCurrentTheme(saved);
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (themeId) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    const colors = theme.colors;
    
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-dark', colors.accentDark);
    root.style.setProperty('--color-accent-light', colors.accentLight);
    root.style.setProperty('--color-accent-glow', colors.accentGlow);
    
    localStorage.setItem('theme_preference', themeId);
    setCurrentTheme(themeId);
  };

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button - Fixed on left side */}
      <button
        onClick={toggleDrawer}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-surface border border-border border-l-0 rounded-r-xl p-2.5 hover:border-accent transition-all duration-300 group"
        style={{ borderLeft: 'none' }}
      >
        <span className="text-xl group-hover:scale-110 transition-transform duration-300 block">
          🎨
        </span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed left-0 top-0 h-full w-72 bg-surface border-r border-border z-50 transform transition-all duration-400 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold gradient-text">🎨 Themes</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-text-muted mb-4">
            Choose a color theme for your dashboard
          </p>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  currentTheme === theme.id
                    ? 'border-accent bg-accent-glow'
                    : 'border-border hover:border-border-light hover:bg-surface2'
                }`}
              >
                <div className="flex gap-1">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.colors.accentDark }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.colors.accentLight }}
                  />
                </div>
                <span className={`text-sm flex-1 text-left ${
                  currentTheme === theme.id ? 'text-accent' : 'text-text-secondary'
                }`}>
                  {theme.name}
                </span>
                {currentTheme === theme.id && (
                  <span className="text-accent">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => {
                // Reset to default purple
                applyTheme('purple');
              }}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors w-full text-center"
            >
              Reset to default
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeDrawer;