import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';

const Courses = () => {
  const { state, setState, bySubjectId, showToast } = useStudy();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    discussUrl: '',
    routine: '[]'
  });

  const handleAddCourse = () => {
    if (!state.settings?.subjects?.length) {
      showToast('⚠️ Add subjects first in Settings');
      return;
    }
    setFormData({
      name: '',
      url: '',
      discussUrl: '',
      routine: '[]'
    });
    setEditingCourse(null);
    setShowAddModal(true);
  };

  const handleEditCourse = (course) => {
    setFormData({
      name: course.name,
      url: course.url || '',
      discussUrl: course.discussUrl || '',
      routine: JSON.stringify(course.routine || [], null, 2)
    });
    setEditingCourse(course);
    setShowAddModal(true);
  };

  const handleSaveCourse = () => {
    if (!formData.name.trim()) {
      showToast('⚠️ Enter a course name');
      return;
    }
    
    let routine = [];
    const routineText = formData.routine.trim();
    
    if (!routineText || routineText === '[]') {
      routine = [];
    } else {
      try {
        const parsed = JSON.parse(routineText);
        if (!Array.isArray(parsed)) {
          showToast('⚠️ Routine must be an array');
          return;
        }
        routine = parsed;
      } catch (e) {
        showToast('⚠️ Invalid JSON format. Please check your syntax.');
        return;
      }
    }

    if (editingCourse) {
      const updated = state.courses.map(c => 
        c.id === editingCourse.id 
          ? { ...c, name: formData.name.trim(), url: formData.url.trim(), discussUrl: formData.discussUrl.trim(), routine }
          : c
      );
      setState(prev => ({ ...prev, courses: updated }));
      showToast('✅ Course updated');
    } else {
      const newCourse = {
        id: Math.random().toString(36).slice(2, 9),
        name: formData.name.trim(),
        url: formData.url.trim(),
        discussUrl: formData.discussUrl.trim(),
        routine
      };
      setState(prev => ({
        ...prev,
        courses: [...prev.courses, newCourse]
      }));
      showToast('✅ Course added');
    }
    setShowAddModal(false);
  };

  const handleDeleteCourse = (id) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== deleteTarget)
    }));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    showToast('🗑️ Course removed');
  };

  const formatRoutineExample = `[
  {
    "date": "2026-08-06",
    "time": "10:00",
    "topic": "Chapter 1: Introduction"
  },
  {
    "date": "2026-08-06",
    "time": "14:30",
    "topic": "Chapter 2: Advanced Concepts"
  },
  {
    "date": "2026-08-06",
    "topic": "Chapter 3: Revision & Practice"
  }
]`;

  // Delete Confirm Modal
  const DeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-lg font-bold text-text-primary mb-2">Remove Course</h3>
          <p className="text-text-secondary text-sm mb-6">
            Are you sure you want to remove this course?
            <br />
            <span className="text-text-faint text-xs">All data including routine will be lost.</span>
          </p>
          <div className="flex gap-3">
            <button 
              className="flex-1 btn-secondary py-2.5"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteTarget(null);
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

  const renderContent = () => {
    if (!state.courses || state.courses.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <div className="text-lg font-semibold mb-2">No courses yet</div>
          <div className="text-text-muted text-sm mb-6">Add your enrolled courses to keep everything in one place.</div>
          <button className="btn-primary px-8 py-3 text-base" onClick={handleAddCourse}>
            + Add Course
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-end mb-4">
          <button className="btn-primary" onClick={handleAddCourse}>
            + Add Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.courses.map(c => (
            <div key={c.id} className="glass-card flex flex-col gap-3">
              <div>
                <div className="text-sm font-semibold text-text-primary">{c.name}</div>
                {c.subjId && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-surface2 border border-border text-text-muted mt-1.5">
                    {bySubjectId?.[c.subjId]?.name || c.subjId}
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-1">
                {c.url ? (
                  <button 
                    className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium bg-surface2 border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    onClick={() => window.open(c.url, '_blank')}
                  >
                    🌐 Open
                  </button>
                ) : (
                  <button className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium bg-surface2 border border-border text-text-faint opacity-50 cursor-default">
                    No URL
                  </button>
                )}
                {c.discussUrl && (
                  <button 
                    className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium bg-surface2 border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    onClick={() => window.open(c.discussUrl, '_blank')}
                  >
                    💬 Discuss
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs bg-surface2 border border-border text-text-secondary hover:border-accent hover:text-accent transition-colors"
                  onClick={() => handleEditCourse(c)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs bg-surface2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={() => handleDeleteCourse(c.id)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      {renderContent()}
      
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-16 overflow-y-auto transition-all duration-300 ${
          showAddModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddModal(false);
          }
        }}
      >
        <div className="bg-surface border border-border rounded-2xl p-6 w-[95%] max-w-[520px] relative shadow-2xl transform transition-all duration-300">
          <button 
            className="absolute top-4 right-4 bg-none border-none text-text-muted text-xl hover:text-text-primary transition-colors"
            onClick={() => setShowAddModal(false)}
          >
            ✕
          </button>
          <h2 className="font-space text-xl font-bold gradient-text mb-5">
            {editingCourse ? '✏️ Edit Course' : '➕ Add Course'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1.5 font-medium">Course / Platform name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Udvash Physics Batch 2025"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1.5 font-medium">Course URL</label>
              <input 
                type="url" 
                className="input-field" 
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1.5 font-medium">Discussion group URL (optional)</label>
              <input 
                type="url" 
                className="input-field" 
                placeholder="https://facebook.com/groups/..."
                value={formData.discussUrl}
                onChange={(e) => setFormData({ ...formData, discussUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1.5 font-medium">Routine (JSON)</label>
              <textarea 
                className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-text-primary outline-none min-h-[150px] font-mono text-xs resize-y focus:border-accent transition-colors"
                placeholder={formatRoutineExample}
                value={formData.routine}
                onChange={(e) => setFormData({ ...formData, routine: e.target.value })}
              />
              <div className="text-[11px] text-text-faint mt-1.5">
                <strong>Format:</strong> Array of objects with: 
                <br />• <strong>date</strong> (required): YYYY-MM-DD
                <br />• <strong>topic</strong> (required): String
                <br />• <strong>time</strong> (optional): HH:MM (24-hour format)
                <br /><span className="text-text-muted">Leave empty or use [] for no routine</span>
              </div>
            </div>
            <button className="btn-primary w-full py-3 text-base" onClick={handleSaveCourse}>
              {editingCourse ? '💾 Update Course' : '💾 Save Course'}
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal />
    </>
  );
};

export default Courses;