import React, { useState, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Link } from 'react-router-dom';

const Today = () => {
  const { state, setState, todayStr, daysBetween, showToast } = useStudy();
  const [hours, setHours] = useState('');
 

  useEffect(() => {
    if (state.hours && state.hours[todayStr()] !== undefined) {
      setHours(state.hours[todayStr()] || '');
    }
  }, [state.hours, todayStr]);

  const handleSaveHours = () => {
    const val = Number(hours) || 0;
    setState(prev => ({
      ...prev,
      hours: { ...prev.hours, [todayStr()]: val }
    }));
    showToast('✅ Hours saved!');
  };

  // Helper function to format time with AM/PM
  const formatTime = (timeStr) => {
    if (!timeStr) return 'Any time';
    const parts = timeStr.split(':');
    if (parts.length !== 2) return timeStr;
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper to convert time to minutes for sorting
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return Infinity;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return Infinity;
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) return Infinity;
    return hours * 60 + minutes;
  };

  if (!state.settings) {
    return (
      <div className="glass-card text-center py-16">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold gradient-text mb-3">Welcome to Study Tracker!</h2>
        <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
          Get started by setting up your subjects and exam date in Settings.
        </p>
        <Link to="/settings"
          className="btn-primary px-8 py-3"
          
        >
          Go to Settings →
        </Link>
      </div>
    );
  }

  const daysLeft = state.settings?.examDate ? daysBetween(todayStr(), state.settings.examDate) : 0;
  const totalSpan = state.settings?.startDate && state.settings?.examDate 
    ? Math.max(1, daysBetween(state.settings.startDate, state.settings.examDate)) 
    : 1;
  const elapsed = state.settings?.startDate 
    ? Math.min(totalSpan, Math.max(0, daysBetween(state.settings.startDate, todayStr()))) 
    : 0;
  const timePct = Math.round(elapsed / totalSpan * 100);

  // Get today's routine from all courses
  const getTodayRoutine = () => {
    const allSlots = [];
    const today = todayStr();  
    
    (state.courses || []).forEach(c => { 
      (c.routine || []).forEach(slot => {
        if (slot.date === today) {
          allSlots.push({ ...slot, courseName: c.name, subjId: c.subjId });
        }
      });
    });
    
    // Sort by time
    return allSlots.sort((a, b) => {
      if (a.time && b.time) return timeToMinutes(a.time) - timeToMinutes(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
  };

  const todayRoutine = getTodayRoutine();  

  // Check if there are any routines scheduled for tomorrow
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tomorrowStr = getTomorrowDate();
  let hasTomorrowRoutine = false;
  let tomorrowCount = 0;
  state.courses.forEach(c => {
    (c.routine || []).forEach(slot => {
      if (slot.date === tomorrowStr) {
        hasTomorrowRoutine = true;
        tomorrowCount++;
      }
    });
  });

  return (
    <div className="space-y-4">
      {/* Hours Log */}
      <div className="glass-card">
        <div className="flex items-center gap-2 text-text-muted text-sm mb-3">
          <span className="text-lg">⏱️</span>
          <span>Log today's study hours</span>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            step="0.5"
            min="0"
            max="24"
            className="input-field flex-1"
            placeholder="e.g. 4.5 hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <button className="btn-primary px-6 whitespace-nowrap" onClick={handleSaveHours}>
            Save Hours
          </button>
        </div>
      </div>

      {/* Countdown */}
      {state.settings?.examDate && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-text-muted text-sm">📅 Time until exam</span>
            <span className="font-space text-sm font-semibold text-accent">
              {daysLeft >= 0 ? `${daysLeft} days left` : '🎉 Exam passed!'}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, timePct))}%` }} />
          </div>
          <div className="font-space text-xs text-text-faint text-right mt-1">
            {timePct}% of study period completed
          </div>
        </div>
      )}

      {/* Today's Routine */}
      {todayRoutine.length > 0 ? (
        <div className="glass-card">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-3">
            <span className="text-lg">📋</span>
            <span>Today's Schedule</span>
            <span className="text-xs text-text-faint ml-auto">{todayRoutine.length} item{todayRoutine.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {todayRoutine.map((slot, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 hover:border-accent/30 transition-all">
                <span className="font-space text-sm text-text-muted min-w-[80px]">
                  {formatTime(slot.time)}
                </span>
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 shadow-lg shadow-accent/20" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{slot.topic || 'Untitled'}</div>
                  <div className="text-xs text-text-muted">
                    {slot.courseName} · {(state.bySubjectId?.[slot.subjId]?.name || slot.subjId || '')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-3">
            <span className="text-lg">📋</span>
            <span>Today's Schedule</span>
          </div>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-text-muted text-sm">No routine scheduled for today</p>
            {hasTomorrowRoutine && (
              <p className="text-xs text-text-faint mt-2">
                📅 {tomorrowCount} item{tomorrowCount > 1 ? 's' : ''} scheduled for tomorrow
              </p>
            )}
            <p className="text-xs text-text-faint mt-1">
              Add routines in the Courses tab to see them here
            </p>
          </div>
        </div>
      )}

      {!state.settings?.subjects?.length && (
        <div className="glass-card text-center py-8">
          <p className="text-text-muted text-sm">
            No subjects selected yet. 
            <button 
              className="text-accent hover:underline ml-1"
              onClick={() => {
                const settingsTab = document.querySelector('[data-tab="settings"]');
                if (settingsTab) settingsTab.click();
              }}
            >
              Go to Settings →
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Today;