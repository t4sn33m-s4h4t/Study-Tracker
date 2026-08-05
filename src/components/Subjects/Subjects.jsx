import React, { useState, useMemo } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Link } from 'react-router-dom';

const Subjects = () => {
  // ALL HOOKS AT THE TOP
  const { state, setState, bySubjectId, subjectStats, showToast } = useStudy();
  const [showManageTargets, setShowManageTargets] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetBoxes, setNewTargetBoxes] = useState(5);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add this to force refresh

  const subjId = state.activeSubject || '';
  const subject = subjId ? bySubjectId[subjId] : null;
  const subjProgress = subject ? state.progress[subjId] || {} : {};

  // Add refreshKey as a dependency to force recalculation
  const allTargets = useMemo(() => {
    if (!subject) return [];
    const targets = [];
    const seen = new Set();
    subject.chapters.forEach(ch => {
      (subjProgress[ch] || []).forEach(r => {
        if (!seen.has(r.label)) {
          seen.add(r.label);
          targets.push(r.label);
        }
      });
    });
    return targets;
  }, [subject, subjProgress, refreshKey]);

  // Conditional returns AFTER all hooks
  if (!state.settings?.subjects?.length) {
    return (
      <div className="glass-card text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-xl font-bold gradient-text mb-2">No Subjects Selected</h2>
        <p className="text-text-muted text-sm">
          Go to Settings to add subjects and start tracking your progress.
        </p>
        <Link to="/settings" 
          className="btn-primary mt-4 px-6 py-2.5 text-sm"
          
        >
          Go to Settings →
        </Link>
      </div>
    );
  }

  if (!state.activeSubject || !state.settings.subjects.includes(state.activeSubject)) {
    setState(prev => ({ ...prev, activeSubject: state.settings.subjects[0] }));
    return null;
  }

  if (!subject) return <p className="text-text-muted">Subject not found.</p>;

  const toggleBox = (chapter, rowId, idx) => {
    const updated = { ...state.progress };
    if (!updated[subjId]) updated[subjId] = {};
    if (!updated[subjId][chapter]) updated[subjId][chapter] = [];
    const rows = updated[subjId][chapter];
    const row = rows.find(r => r.id === rowId);
    if (row) row.checked[idx] = !row.checked[idx];
    setState(prev => ({ ...prev, progress: updated }));
  };

  const handleDeleteTarget = (label) => {
    setTargetToDelete(label);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const label = targetToDelete;
    if (!label) return;
    const updated = { ...state.progress };
    if (updated[subjId]) {
      subject.chapters.forEach(ch => {
        if (updated[subjId][ch]) {
          updated[subjId][ch] = updated[subjId][ch].filter(r => r.label !== label);
        }
      });
    }
    setState(prev => ({ ...prev, progress: updated }));
    setShowDeleteConfirm(false);
    setTargetToDelete(null);
    setRefreshKey(prev => prev + 1); // Force refresh
    showToast('Target removed');
  };

  const addTarget = () => {
    if (!newTargetName.trim()) {
      showToast('Enter a target name');
      return;
    }
    const label = newTargetName.trim();
    const count = Math.max(1, Math.min(50, Number(newTargetBoxes) || 5));
    const updated = { ...state.progress };
    if (!updated[subjId]) updated[subjId] = {};
    subject.chapters.forEach(ch => {
      if (!updated[subjId][ch]) updated[subjId][ch] = [];
      if (!updated[subjId][ch].find(r => r.label === label)) {
        updated[subjId][ch].push({
          id: Math.random().toString(36).slice(2, 9),
          label,
          total: count,
          checked: Array(count).fill(false)
        });
      }
    });
    setState(prev => ({ ...prev, progress: updated }));
    setNewTargetName('');
    setNewTargetBoxes(5);
    setRefreshKey(prev => prev + 1); // Force refresh
    setShowManageTargets(false);
    showToast('Target added');
  };

  const closeManageTargets = () => {
    setShowManageTargets(false);
    setNewTargetName('');
    setNewTargetBoxes(5);
  };

  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-bold text-text-primary mb-2">Remove Target</h3>
          <p className="text-text-secondary text-sm mb-6">
            Remove "<span className="text-accent font-medium">{targetToDelete}</span>" from all chapters?
            <br />
            <span className="text-text-faint text-xs">All progress will be lost.</span>
          </p>
          <div className="flex gap-3">
            <button 
              className="flex-1 btn-secondary py-2.5"
              onClick={() => {
                setShowDeleteConfirm(false);
                setTargetToDelete(null);
              }}
            >
              Cancel
            </button>
            <button 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl py-2.5 transition-colors"
              onClick={confirmDelete}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  const totalStats = subjectStats(subjId);

  const getShortName = (name) => {
    return name
      .replace(/^অধ্যায়\s*\d+[:：]\s*/, '')
      .replace(/^Chapter\s*\d+[:：]\s*/, '')
      .replace(/^Unit\s*\d+[:：]\s*/, '')
      .replace(/^গদ্য[:：]\s*/, '')
      .replace(/^কবিতা[:：]\s*/, '');
  };

  const midPoint = Math.ceil(subject.chapters.length / 2);
  const leftChapters = subject.chapters.slice(0, midPoint);
  const rightChapters = subject.chapters.slice(midPoint);

  return (
    <div>
      {/* Subject Selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {state.settings.subjects.map(id => {
          const stats = subjectStats(id);
          const isActive = id === state.activeSubject;
          return (
            <button
              key={id}
              onClick={() => setState(prev => ({ ...prev, activeSubject: id }))}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent text-bg-main shadow-lg shadow-accent/25'
                  : 'bg-surface2 text-text-muted hover:text-text-secondary border border-border hover:border-accent/30'
              }`}
            >
              <span className="flex items-center gap-2">
                {bySubjectId[id]?.name || id}
                <span className={`text-xs ${isActive ? 'text-bg-main/70' : 'text-text-faint'}`}>
                  {stats.pct}%
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="glass-card mb-5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-text-primary">{subject.name}</span>
            <span className="text-xs text-text-muted ml-2">• {subject.chapters.length} chapters</span>
          </div>
          <span className="font-space text-xl font-bold gradient-text">{totalStats.pct}%</span>
        </div>
        <div className="progress-track h-1.5 mt-2">
          <div className="progress-fill" style={{ width: `${totalStats.pct}%` }} />
        </div>
      </div>

      {/* Manage Targets Button */}
      <div className="flex items-center justify-between mb-4">
        <button 
          className="btn-primary text-xs py-2 px-4"
          onClick={() => setShowManageTargets(true)}
        >
          Manage Targets
        </button>
        {allTargets.length > 0 && (
          <span className="text-xs text-text-faint">{allTargets.length} targets</span>
        )}
      </div>

      {/* Chapters in 2 columns */}
      {allTargets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-3">
            {leftChapters.map(ch => {
              const rows = subjProgress[ch] || [];
              const chapterTotal = rows.reduce((a, r) => a + r.total, 0);
              const chapterChecked = rows.reduce((a, r) => a + r.checked.filter(Boolean).length, 0);
              const chapterPct = chapterTotal ? Math.round(chapterChecked / chapterTotal * 100) : 0;
              const shortName = getShortName(ch);

              return (
                <div key={ch} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary truncate" title={ch}>
                        {shortName}
                      </span>
                      <span className="text-xs text-text-faint flex-shrink-0">({chapterPct}%)</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="progress-track w-20 h-1.5">
                        <div className="progress-fill" style={{ width: `${chapterPct}%` }} />
                      </div>
                      <span className="text-xs text-text-faint">{chapterChecked}/{chapterTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {allTargets.map(label => {
                      const row = rows.find(r => r.label === label);
                      if (!row) {
                        return (
                          <div key={label} className="flex items-center gap-3 bg-surface2/30 rounded-lg px-3 py-1.5">
                            <span className="text-sm text-text-muted min-w-[70px]">{label}</span>
                            <div className="flex-1 border-l-2 border-border pl-3">
                              <span className="text-xs text-text-faint">—</span>
                            </div>
                          </div>
                        );
                      }
                      const done = row.checked.filter(Boolean).length;
                      const totalBoxes = row.total;
                      
                      return (
                        <div key={row.id} className="flex items-center gap-3 bg-surface2/30 rounded-lg px-3 py-1.5 hover:bg-surface2 transition-colors">
                          <span className="text-sm text-text-muted min-w-[70px]">{label}</span>
                          <div className="flex-1 border-l-2 border-border pl-3">
                            <div className="flex flex-wrap gap-1.5">
                              {row.checked.map((c, i) => (
                                <button
                                  key={i}
                                  className={`w-5 h-5 rounded border-2 transition-all ${
                                    c 
                                      ? 'bg-accent border-accent shadow-sm shadow-accent/30' 
                                      : 'border-border bg-surface hover:border-accent/30 hover:bg-surface2'
                                  } flex items-center justify-center text-[10px] font-bold cursor-pointer`}
                                  onClick={() => toggleBox(ch, row.id, i)}
                                >
                                  {c && '✓'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-text-faint min-w-[35px] text-right">
                            {done}/{totalBoxes}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {rightChapters.map(ch => {
              const rows = subjProgress[ch] || [];
              const chapterTotal = rows.reduce((a, r) => a + r.total, 0);
              const chapterChecked = rows.reduce((a, r) => a + r.checked.filter(Boolean).length, 0);
              const chapterPct = chapterTotal ? Math.round(chapterChecked / chapterTotal * 100) : 0;
              const shortName = getShortName(ch);

              return (
                <div key={ch} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary truncate" title={ch}>
                        {shortName}
                      </span>
                      <span className="text-xs text-text-faint flex-shrink-0">({chapterPct}%)</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="progress-track w-20 h-1.5">
                        <div className="progress-fill" style={{ width: `${chapterPct}%` }} />
                      </div>
                      <span className="text-xs text-text-faint">{chapterChecked}/{chapterTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {allTargets.map(label => {
                      const row = rows.find(r => r.label === label);
                      if (!row) {
                        return (
                          <div key={label} className="flex items-center gap-3 bg-surface2/30 rounded-lg px-3 py-1.5">
                            <span className="text-sm text-text-muted min-w-[70px]">{label}</span>
                            <div className="flex-1 border-l-2 border-border pl-3">
                              <span className="text-xs text-text-faint">—</span>
                            </div>
                          </div>
                        );
                      }
                      const done = row.checked.filter(Boolean).length;
                      const totalBoxes = row.total;
                      
                      return (
                        <div key={row.id} className="flex items-center gap-3 bg-surface2/30 rounded-lg px-3 py-1.5 hover:bg-surface2 transition-colors">
                          <span className="text-sm text-text-muted min-w-[70px]">{label}</span>
                          <div className="flex-1 border-l-2 border-border pl-3">
                            <div className="flex flex-wrap gap-1.5">
                              {row.checked.map((c, i) => (
                                <button
                                  key={i}
                                  className={`w-5 h-5 rounded border-2 transition-all ${
                                    c 
                                      ? 'bg-accent border-accent shadow-sm shadow-accent/30' 
                                      : 'border-border bg-surface hover:border-accent/30 hover:bg-surface2'
                                  } flex items-center justify-center text-[10px] font-bold cursor-pointer`}
                                  onClick={() => toggleBox(ch, row.id, i)}
                                >
                                  {c && '✓'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-text-faint min-w-[35px] text-right">
                            {done}/{totalBoxes}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card text-center py-12">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-text-muted text-sm">No targets yet</p>
          <p className="text-text-faint text-xs mt-1">Click "Manage Targets" to add your first target</p>
        </div>
      )}

      <DeleteConfirmModal />

      {/* Targets Management Modal */}
      {showManageTargets && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 overflow-y-auto">
          <div className="bg-surface border border-border rounded-2xl p-6 w-[95%] max-w-md relative shadow-2xl">
            <button 
              className="absolute top-4 right-4 bg-none border-none text-text-muted text-xl hover:text-text-primary transition-colors"
              onClick={closeManageTargets}
            >
              ✕
            </button>
            <h2 className="font-space text-xl font-bold gradient-text mb-4">Manage Targets</h2>
            <p className="text-text-muted text-sm mb-4">Add or remove targets (rows) for all chapters</p>

            {/* Add Target */}
            <div className="glass-card p-4 mb-4">
              <h3 className="text-sm font-medium text-text-secondary mb-3">Add New Target</h3>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  className="input-field flex-1 min-w-[120px] text-sm py-2 px-3"
                  placeholder="Target name (e.g. Q Bank)"
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                />
                <input
                  type="number"
                  className="input-field w-20 text-sm py-2 px-3"
                  placeholder="Boxes"
                  value={newTargetBoxes}
                  onChange={(e) => setNewTargetBoxes(Math.max(1, Number(e.target.value) || 1))}
                  min="1"
                  max="50"
                />
                <button className="btn-primary text-sm py-2 px-4" onClick={addTarget}>
                  Add
                </button>
              </div>
            </div>

            {/* Existing Targets */}
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Current Targets</h3>
              {allTargets.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {allTargets.map(label => (
                    <div key={label} className="flex items-center justify-between bg-surface2/50 rounded-lg px-4 py-2.5">
                      <span className="text-sm text-text-primary">{label}</span>
                      <button
                        className="text-red-400 hover:text-red-300 transition-colors text-sm"
                        onClick={() => handleDeleteTarget(label)}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-faint text-sm text-center py-4">No targets yet. Add one above.</p>
              )}
            </div>

            <button 
              className="btn-secondary w-full mt-4"
              onClick={closeManageTargets}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;