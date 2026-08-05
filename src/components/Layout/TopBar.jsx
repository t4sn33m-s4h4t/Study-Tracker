import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { id: 'today', label: 'Today', icon: '📅', path: '/today' },
  { id: 'subjects', label: 'Targets', icon: '📚', path: '/targets' },
  { id: 'completion', label: 'Completion', icon: '📘', path: '/completion' },
  { id: 'courses', label: 'Courses', icon: '🎯', path: '/courses' },
  { id: 'routine', label: 'Routine', icon: '📋', path: '/routine' },
  { id: 'progress', label: 'Progress', icon: '📈', path: '/progress' },
  { id: 'history', label: 'History', icon: '📊', path: '/history' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
];

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex gap-1 sm:gap-2 py-3 overflow-x-auto scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 min-w-[60px] sm:min-w-[80px] py-2.5 px-2 sm:px-4 rounded-xl text-center transition-all duration-200 ${
                currentPath === tab.path
                  ? 'bg-white/10 text-white font-semibold shadow-lg shadow-white/5' 
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xl sm:text-2xl">{tab.icon}</span>
                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBar;