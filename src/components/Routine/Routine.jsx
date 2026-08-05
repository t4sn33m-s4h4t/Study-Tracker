import React from 'react';
import { useStudy } from '../../context/StudyContext';

const Routine = () => {
  const { state, bySubjectId, todayStr, daysBetween } = useStudy();

  // Helper function to convert time to minutes for sorting
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return Infinity;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return Infinity;
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    if (isNaN(hours) || isNaN(minutes)) return Infinity;
    return hours * 60 + minutes;
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

  // Collect all routine slots from all courses
  const allSlots = [];
  state.courses.forEach(c => {
    (c.routine || []).forEach(slot => {
      allSlots.push({ ...slot, courseName: c.name, subjId: c.subjId });
    });
  });

  if (!allSlots.length) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🗓️</div>
        <div className="text-lg font-semibold mb-2">No routine yet</div>
        <div className="text-text-muted text-sm">
          Add routine JSON to your courses to see the date-wise schedule here.
        </div>
      </div>
    );
  }

  const today = todayStr();

  // Separate past, today, and future
  const pastSlots = [];
  const todaySlots = [];
  const futureSlots = [];
  const undated = [];

  allSlots.forEach(slot => {
    if (!slot.date) {
      undated.push(slot);
      return;
    }
    
    const diff = daysBetween(slot.date, today);
    // diff < 0 = date is in the future (e.g., Aug 7: -1)
    // diff === 0 = date is today
    // diff > 0 = date is in the past (e.g., Aug 4: 2)
    if (diff < 0) {
      futureSlots.push(slot);
    } else if (diff === 0) {
      todaySlots.push(slot);
    } else {
      pastSlots.push(slot);
    }
  });

  // Sort slots within each group by time
  const sortSlots = (slots) => {
    return [...slots].sort((a, b) => {
      if (a.time && b.time) return timeToMinutes(a.time) - timeToMinutes(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
  };

  const sortedTodaySlots = sortSlots(todaySlots);
  const sortedUndated = sortSlots(undated);

  // Group future slots by date
  const futureByDate = {};
  sortSlots(futureSlots).forEach(slot => {
    if (!futureByDate[slot.date]) futureByDate[slot.date] = [];
    futureByDate[slot.date].push(slot);
  });
  const futureDates = Object.keys(futureByDate).sort((a, b) => a.localeCompare(b));

  // Get ONLY the MOST RECENT past date (closest to today)
  let mostRecentPastDate = null;
  let minDiff = Infinity;
  
  pastSlots.forEach(slot => {
    const diff = daysBetween(slot.date, today);
    if (diff < minDiff) {
      minDiff = diff;
      mostRecentPastDate = slot.date;
    }
  });
  
  // Get slots for ONLY the most recent past date
  let mostRecentPastSlots = [];
  if (mostRecentPastDate) {
    mostRecentPastSlots = sortSlots(pastSlots.filter(s => s.date === mostRecentPastDate));
  }

  const formatDayHead = (dateStr) => {
    const dt = new Date(dateStr + "T00:00:00");
    const weekday = dt.toLocaleDateString("en-US", { weekday: 'long' });
    const md = dt.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
    // Use today as first param to get correct diff sign
    const diff = daysBetween(today, dateStr);
    let badge = '';
    if (diff === 0) badge = 'Today';
    else if (diff === 1) badge = 'Tomorrow';
    else if (diff === -1) badge = 'Yesterday';
    else if (diff < -1) badge = `${Math.abs(diff)} days ago`;
    return { text: `${weekday}, ${md}`, badge, diff };
  };

  // Check if there's any content to show
  const hasContent = sortedTodaySlots.length > 0 || futureDates.length > 0 || mostRecentPastSlots.length > 0 || sortedUndated.length > 0;

  if (!hasContent) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📅</div>
        <div className="text-lg font-semibold mb-2">No upcoming routines</div>
        <div className="text-text-muted text-sm">
          Add routines to your courses to see them here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Most Recent Past Routine - Always show the last passed day */}
      {mostRecentPastSlots.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden opacity-60">
          <div className="px-5 py-3.5 font-semibold text-sm bg-surface2 border-b border-border flex items-center gap-2">
            📅 {formatDayHead(mostRecentPastDate).text}
            <span className="text-[11px] text-text-faint ml-auto">
              {formatDayHead(mostRecentPastDate).badge || 'Past'}
            </span>
          </div>
          {mostRecentPastSlots.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-3.5 px-5 py-3 border-b border-border2 last:border-b-0">
              <span className="font-space text-sm text-text-muted min-w-[90px]">
                {formatTime(slot.time)}
              </span>
              <span className="w-2 h-2 rounded-full bg-text-faint flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-text-secondary">{slot.topic || ''}</div>
                <div className="text-sm text-text-muted">
                  {slot.courseName} · {(bySubjectId[slot.subjId]?.name || slot.subjId || '')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Today's Routine */}
      {sortedTodaySlots.length > 0 && (
        <div className="bg-surface border border-accent rounded-xl overflow-hidden shadow-lg shadow-accent/5">
          <div className="px-5 py-3.5 font-semibold text-sm bg-surface2 border-b border-border flex items-center gap-2">
            📅 {formatDayHead(today).text}
            <span className="text-[11px] font-semibold text-bg-main bg-accent rounded-full px-2.5 py-0.5 ml-auto">
              Today
            </span>
          </div>
          {sortedTodaySlots.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-3.5 px-5 py-3 border-b border-border2 last:border-b-0">
              <span className="font-space text-sm text-text-muted min-w-[90px]">
                {formatTime(slot.time)}
              </span>
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 shadow-lg shadow-accent/20" />
              <div className="flex-1">
                <div className="text-sm font-medium">{slot.topic || ''}</div>
                <div className="text-sm text-text-muted">
                  {slot.courseName} · {(bySubjectId[slot.subjId]?.name || slot.subjId || '')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Future Routines - ALL future dates */}
      {futureDates.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider text-text-faint px-1">
            📅 Upcoming ({futureDates.length} day{futureDates.length > 1 ? 's' : ''})
          </div>
          {futureDates.map(dateStr => {
            const slots = futureByDate[dateStr];
            const { text, badge, diff } = formatDayHead(dateStr);
            const isTomorrow = diff === 1;
            
            return (
              <div 
                key={dateStr} 
                className={`bg-surface border rounded-xl overflow-hidden ${
                  isTomorrow ? 'border-accent/50' : 'border-border'
                }`}
              >
                <div className="px-5 py-3.5 font-semibold text-sm bg-surface2 border-b border-border flex items-center gap-2">
                  📅 {text}
                  {badge && (
                    <span className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ml-auto ${
                      isTomorrow ? 'bg-accent/20 text-accent' : 'bg-surface2 text-text-muted border border-border'
                    }`}>
                      {badge}
                    </span>
                  )}
                </div>
                {slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 px-5 py-3 border-b border-border2 last:border-b-0">
                    <span className="font-space text-sm text-text-muted min-w-[90px]">
                      {formatTime(slot.time)}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{slot.topic || ''}</div>
                      <div className="text-sm text-text-muted">
                        {slot.courseName} · {(bySubjectId[slot.subjId]?.name || slot.subjId || '')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}

      {/* Undated Routines */}
      {sortedUndated.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 font-semibold text-sm bg-surface2 border-b border-border flex items-center gap-2">
            🗒️ No fixed date
          </div>
          {sortedUndated.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-3.5 px-5 py-3 border-b border-border2 last:border-b-0">
              <span className="font-space text-sm text-text-muted min-w-[90px]">
                {slot.time ? formatTime(slot.time) : '—'}
              </span>
              <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{slot.topic || ''}</div>
                <div className="text-sm text-text-muted">
                  {slot.courseName} · {(bySubjectId[slot.subjId]?.name || slot.subjId || '')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Routine;