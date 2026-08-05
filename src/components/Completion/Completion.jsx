import React from 'react';
import { useStudy } from '../../context/StudyContext';

const Completion = () => {
  const { state, bySubjectId, subjectStats } = useStudy();

  if (!state.settings?.subjects?.length) {
    return (
      <div className="glass-card text-center py-16">
        <div className="text-6xl mb-4">📘</div>
        <h2 className="text-xl font-bold gradient-text mb-2">No Subjects Selected</h2>
        <p className="text-text-muted text-sm">
          Go to Settings to add subjects and start tracking your progress.
        </p>
      </div>
    );
  }

  // Calculate overall progress - average of all subject percentages
  let totalSubjects = 0;
  let totalPercentage = 0;
  
  const subjectData = state.settings.subjects.map(id => {
    const stats = subjectStats(id);
    const subject = bySubjectId[id];
    const chapters = subject?.chapters || [];
    const progress = state.progress[id] || {};
    
    const chaptersWithProgress = chapters.filter(ch => progress[ch] && progress[ch].length > 0);
    
    const totalBoxes = chapters.reduce((sum, ch) => {
      const rows = progress[ch] || [];
      return sum + rows.reduce((s, r) => s + r.total, 0);
    }, 0);
    const checkedBoxes = chapters.reduce((sum, ch) => {
      const rows = progress[ch] || [];
      return sum + rows.reduce((s, r) => s + r.checked.filter(Boolean).length, 0);
    }, 0);
    
    const subjectPct = stats.pct || 0;
    totalSubjects++;
    totalPercentage += subjectPct;
    
    // Determine category
    let category = 'Other';
    if (id.includes('physics')) category = 'Physics';
    else if (id.includes('chem')) category = 'Chemistry';
    else if (id.includes('math')) category = 'Mathematics';
    else if (id.includes('biology')) category = 'Biology';
    else if (id.includes('bangla')) category = 'Bangla';
    else if (id.includes('eng')) category = 'English';
    else if (id.includes('ict')) category = 'ICT';
    
    return {
      id,
      name: subject?.name || id,
      stats,
      totalBoxes,
      checkedBoxes,
      boxPct: totalBoxes ? Math.round(checkedBoxes / totalBoxes * 100) : 0,
      chaptersWithProgress: chaptersWithProgress.length,
      totalChapters: chapters.length,
      chapters: chapters,
      progress: progress,
      subjectPct: subjectPct,
      category: category
    };
  });

  const overallPct = totalSubjects > 0 ? Math.round(totalPercentage / totalSubjects) : 0;

  // Group subjects by category
  const groupedSubjects = {};
  subjectData.forEach(subj => {
    if (!groupedSubjects[subj.category]) {
      groupedSubjects[subj.category] = [];
    }
    groupedSubjects[subj.category].push(subj);
  });

  // Sort categories
  const categoryOrder = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Bangla', 'English', 'ICT', 'Other'];
  const sortedCategories = Object.keys(groupedSubjects).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <span className="text-lg">📊</span>
            <span>Overall Progress</span>
          </div>
          <span className="font-space text-2xl font-bold gradient-text">{overallPct}%</span>
        </div>
        <div className="progress-track h-2.5">
          <div className="progress-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-text-faint mt-1.5">
          <span>{totalSubjects} subject{totalSubjects > 1 ? 's' : ''}</span>
          <span>Average: {overallPct}%</span>
        </div>
      </div>

      {/* Subject Cards - Grouped by category */}
      {sortedCategories.map(category => {
        const subjects = groupedSubjects[category];
        return (
          <div key={category}>
            <div className="text-xs uppercase tracking-wider text-text-faint mb-3 mt-2">
              {category}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map(subj => (
                <div key={subj.id} className="glass-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{subj.name}</h3>
                      <span className="text-xs text-text-muted">
                        {subj.chaptersWithProgress} of {subj.totalChapters} chapters
                      </span>
                    </div>
                    <span className="font-space text-lg font-bold gradient-text">{subj.stats.pct}%</span>
                  </div>
                  <div className="progress-track h-2 mb-3">
                    <div className="progress-fill" style={{ width: `${subj.stats.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-text-faint">
                    <span>📝 {subj.totalBoxes} total items</span>
                    <span>✅ {subj.checkedBoxes} completed</span>
                    <span>{subj.boxPct}% done</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Detailed Chapter Progress - 2 Columns with grouping */}
      <div className="glass-card">
        <div className="flex items-center gap-2 text-text-muted text-sm mb-4">
          <span className="text-lg">📖</span>
          <span>Chapter-wise Progress</span>
        </div>
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
          {sortedCategories.map(category => {
            const subjects = groupedSubjects[category];
            return (
              <div key={category}>
                <div className="text-xs uppercase tracking-wider text-text-faint mb-3">
                  {category}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map(id => {
                    const subject = bySubjectId[id.id];
                    if (!subject) return null;
                    const progress = state.progress[id.id] || {};
                    
                    return (
                      <div key={id.id} className="border border-border rounded-xl p-4 bg-surface2">
                        <div className="text-sm font-semibold text-text-secondary mb-3">
                          {subject.name}
                        </div>
                        <div className="space-y-2.5">
                          {subject.chapters.map(ch => {
                            const rows = progress[ch] || [];
                            const total = rows.reduce((s, r) => s + r.total, 0);
                            const checked = rows.reduce((s, r) => s + r.checked.filter(Boolean).length, 0);
                            const pct = total ? Math.round(checked / total * 100) : 0;
                            
                            return (
                              <div key={ch} className="flex items-center gap-2">
                                <span className="text-xs text-text-secondary flex-1 min-w-[60px] leading-tight">
                                  {ch.length > 30 ? ch.substring(0, 28) + '…' : ch}
                                </span>
                                <div className="progress-track flex-1 min-w-[50px] h-2">
                                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="font-space text-xs text-text-muted min-w-[32px] text-right">
                                  {pct}%
                                </span>
                                <span className="text-[10px] text-text-faint min-w-[50px] text-right">
                                  {checked}/{total}
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Completion;