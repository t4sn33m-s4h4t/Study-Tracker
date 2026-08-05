import React, { useState, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';

const Settings = () => {
  const { state, setState, SYLLABUS, bySubjectId, showToast, todayStr } = useStudy();
  const [managingSubjects, setManagingSubjects] = useState(false);
  const [examDate, setExamDate] = useState(state.settings?.examDate || '');
  const [startDate, setStartDate] = useState(state.settings?.startDate || '');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importData, setImportData] = useState(null);
  const fileInputRef = useRef(null);

  // Calculate days tracked
  const getDaysTracked = () => {
    const startDate = new Date('2026-08-04');
    const endDate = new Date(todayStr() + "T00:00:00");
    let count = 0;
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      count++;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  };

  // Initialize settings if null
  const initializeSettings = () => {
    if (!state.settings) {
      setState(prev => ({
        ...prev,
        settings: {
          subjects: [],
          examDate: '',
          startDate: todayStr()
        }
      }));
    }
  };

  React.useEffect(() => {
    initializeSettings();
  }, []);

  const handleSaveSubjects = () => {
    setManagingSubjects(false);
    if (!state.settings.subjects.includes(state.activeSubject)) {
      setState(prev => ({ ...prev, activeSubject: state.settings.subjects[0] || null }));
    }
    showToast('Subjects saved ✅');
  };

  const toggleSubject = (id) => {
    const arr = [...state.settings.subjects];
    const index = arr.indexOf(id);
    if (index >= 0) {
      arr.splice(index, 1);
    } else {
      arr.push(id);
    }
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, subjects: arr }
    }));
  };

  const handleExport = () => {
    const payload = {
      settings: state.settings,
      progress: state.progress,
      hours: state.hours,
      exams: state.exams,
      courses: state.courses,
      openChapters: state.openChapters,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-tracker-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded ✅');
  };

  const handleImport = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || typeof data !== 'object' || !data.settings) {
          showToast('Invalid backup file ❌');
          return;
        }
        setImportData(data);
        setShowRestoreConfirm(true);
      } catch (err) {
        showToast('Invalid backup file ❌');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmRestore = () => {
    if (!importData) return;
    setState(prev => ({
      ...prev,
      settings: importData.settings || null,
      progress: importData.progress || {},
      hours: importData.hours || {},
      exams: importData.exams || [],
      courses: importData.courses || [],
      openChapters: importData.openChapters || {},
      activeSubject: importData.settings ? ((importData.settings.subjects || [])[0] || null) : null,
      managingSubjects: false
    }));
    setShowRestoreConfirm(false);
    setImportData(null);
    showToast('Backup restored ✅');
  };

  const handleClearAllData = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setState({
      settings: { subjects: [], examDate: '', startDate: todayStr() },
      progress: {},
      hours: {},
      exams: [],
      courses: [],
      activeSubject: null,
      managingSubjects: false,
      openChapters: {}
    });
    setShowClearConfirm(false);
    showToast('All data cleared 🗑️');
  };

  const daysTracked = getDaysTracked();

  // Confirm Modals
  const RestoreConfirmModal = () => {
    if (!showRestoreConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-bold text-text-primary mb-2">⚠️ Restore Backup</h3>
          <p className="text-text-secondary text-sm mb-6">
            This will replace all current data.
            <br />
            <span className="text-text-faint text-xs">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3">
            <button 
              className="flex-1 btn-secondary py-2.5"
              onClick={() => {
                setShowRestoreConfirm(false);
                setImportData(null);
              }}
            >
              Cancel
            </button>
            <button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 transition-colors"
              onClick={confirmRestore}
            >
              Restore
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ClearConfirmModal = () => {
    if (!showClearConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Clear All Data</h3>
          <p className="text-text-secondary text-sm mb-6">
            This will delete ALL your data.
            <br />
            <span className="text-text-faint text-xs">This action cannot be undone.</span>
          </p>
          <div className="flex gap-3">
            <button 
              className="flex-1 btn-secondary py-2.5"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </button>
            <button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 transition-colors"
              onClick={confirmClear}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If no subjects selected, show onboarding
  if (!state.settings?.subjects?.length && !managingSubjects) {
    return (
      <div className="space-y-6">
        <div className="glass-card text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Welcome to Study Tracker!</h2>
          <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
            Let's get started by setting up your subjects and exam date.
          </p>
          <button 
            className="btn-primary px-8 py-3 text-base"
            onClick={() => setManagingSubjects(true)}
          >
            Get Started →
          </button>
        </div>

        <div className="glass-card">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">📅 Set Your Exam Date</h3>
          <input
            type="date"
            className="input-field"
            value={examDate}
            min={todayStr()}
            onChange={(e) => {
              setExamDate(e.target.value);
              setState(prev => ({
                ...prev,
                settings: { ...prev.settings, subjects: prev.settings?.subjects || [], examDate: e.target.value, startDate: prev.settings?.startDate || todayStr() }
              }));
            }}
            placeholder="Select your exam date"
          />
          <p className="text-xs text-text-faint mt-2">This helps track your countdown to exam day.</p>
        </div>
      </div>
    );
  }

  if (managingSubjects) {
    const selectedCount = state.settings?.subjects?.length || 0;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold gradient-text">📚 Manage Subjects</h2>
            <p className="text-text-muted text-sm mt-1">
              {selectedCount} subject{selectedCount !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button 
            className="btn-secondary text-sm"
            onClick={() => setManagingSubjects(false)}
          >
            Cancel
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {SYLLABUS.map(s => {
            const isSelected = state.settings?.subjects?.includes(s.id) || false;
            return (
              <button
                key={s.id}
                onClick={() => toggleSubject(s.id)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? 'border-accent bg-accent/10 shadow-lg shadow-accent/5' 
                    : 'border-white/5 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className={`text-sm ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {s.name}
                </span>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'bg-accent text-bg-main' 
                    : 'border border-white/10'
                }`}>
                  {isSelected && '✓'}
                </div>
              </button>
            );
          })}
        </div>
        
        <button 
          className="btn-primary w-full py-3 text-base"
          onClick={handleSaveSubjects}
          disabled={!state.settings?.subjects?.length}
        >
          {state.settings?.subjects?.length ? `Save ${state.settings.subjects.length} Subjects ✅` : 'Select at least one subject'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card text-center py-4">
          <div className="text-2xl font-bold gradient-text">{state.settings?.subjects?.length || 0}</div>
          <div className="text-xs text-text-muted">Subjects</div>
        </div>
        <div className="glass-card text-center py-4">
          <div className="text-2xl font-bold gradient-text">{state.courses?.length || 0}</div>
          <div className="text-xs text-text-muted">Courses</div>
        </div>
        <div className="glass-card text-center py-4">
          <div className="text-2xl font-bold gradient-text">{state.exams?.length || 0}</div>
          <div className="text-xs text-text-muted">Exam Results</div>
        </div>
        <div className="glass-card text-center py-4">
          <div className="text-2xl font-bold gradient-text">{daysTracked}</div>
          <div className="text-xs text-text-muted">Days Tracked</div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">📚 Subjects</h3>
        <button 
          className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          onClick={() => setManagingSubjects(true)}
        >
          <div>
            <div className="text-sm text-text-primary">Manage tracked subjects</div>
            <div className="text-xs text-text-faint mt-0.5">{state.settings?.subjects?.length || 0} selected</div>
          </div>
          <span className="text-text-muted text-lg">→</span>
        </button>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">📅 Important Dates</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-text-faint block mb-1.5">Exam Date</label>
            <input
              type="date"
              className="input-field"
              value={examDate}
              min={todayStr()}
              onChange={(e) => {
                setExamDate(e.target.value);
                setState(prev => ({
                  ...prev,
                  settings: { ...prev.settings, examDate: e.target.value }
                }));
              }}
            />
          </div>
          <div>
            <label className="text-xs text-text-faint block mb-1.5">Countdown Start Date</label>
            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setState(prev => ({
                  ...prev,
                  settings: { ...prev.settings, startDate: e.target.value }
                }));
              }}
            />
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-sm font-semibold text-text-secondary mb-3">💾 Data Management</h3>
        <div className="space-y-3">
          <button className="btn-primary w-full" onClick={handleExport}>
            ⬇ Export Backup (JSON)
          </button>
          <button 
            className="btn-secondary w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            ⬆ Import Backup (JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
          <button 
            className="w-full p-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            onClick={handleClearAllData}
          >
            🗑 Clear All Data
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-text-faint">
        💡 All data is saved locally in your browser. No account needed.
      </p>

      <RestoreConfirmModal />
      <ClearConfirmModal />
    </div>
  );
};

export default Settings;