import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudyProvider } from './context/StudyContext';
import TopBar from './components/Layout/TopBar';
import ThemeDrawer from './components/Layout/ThemeDrawer';
import Today from './components/Today/Today';
import Subjects from './components/Subjects/Subjects';
import Completion from './components/Completion/Completion';
import Courses from './components/Courses/Courses';
import Routine from './components/Routine/Routine';
import Progress from './components/Progress/Progress';
import History from './components/History/History';
import Settings from './components/Settings/Settings';
import Toast from './components/Layout/Toast';

function App() {
  return (
    <StudyProvider>
      <div className="min-h-screen bg-bg-main flex flex-col">
        <TopBar />
        <ThemeDrawer />
        <div className="flex-1 max-w-[1200px] mx-auto px-4 sm:px-6 py-6 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Today />} />
            <Route path="/targets" element={<Subjects />} />
            <Route path="/completion" element={<Completion />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/routine" element={<Routine />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <footer className="text-center text-xs text-text-faint py-3 border-t border-white/5 max-w-[1200px] mx-auto w-full px-6">
          Made by <a 
            href="https://www.facebook.com/t4sn33m.s4h4t/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-white transition-colors font-medium"
          >Tasneem Sahat</a>
        </footer>
        <Toast />
      </div>
    </StudyProvider>
  );
}

export default App;