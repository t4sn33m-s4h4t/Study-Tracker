import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const Progress = () => {
  const { state, setState, todayStr, showToast } = useStudy();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [examDate, setExamDate] = useState(todayStr());
  const [examScore, setExamScore] = useState('');
  const [examMax, setExamMax] = useState('');

  useEffect(() => {
    if (state.exams.length > 0) {
      renderChart();
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [state.exams]);

  const renderChart = () => {
    const canvas = chartRef.current;
    if (!canvas) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const sorted = [...state.exams].sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(ex => {
      const dt = new Date(ex.date + "T00:00:00");
      return dt.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    });
    
    const hoursData = sorted.map(ex => {
      let h = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(ex.date + "T00:00:00");
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        h += state.hours[dateStr] || 0;
      }
      return Math.round(h * 10) / 10;
    });

    const scoreData = sorted.map(ex => 
      ex.maxScore ? Math.round((ex.score / ex.maxScore) * 100) : 0
    );

    const ctx = canvas.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Study hours (7d)',
            data: hoursData,
            backgroundColor: '#3A5F3D',
            yAxisID: 'y',
            borderRadius: 4,
          },
          {
            type: 'line',
            label: 'Exam score %',
            data: scoreData,
            borderColor: '#CFFF3D',
            backgroundColor: '#CFFF3D',
            yAxisID: 'y1',
            tension: 0.3,
            pointRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#8B9099', font: { size: 11 } },
            grid: { color: '#2A2D33' }
          },
          y: {
            position: 'left',
            ticks: { color: '#8B9099', font: { size: 11 } },
            grid: { color: '#2A2D33' }
          },
          y1: {
            position: 'right',
            min: 0,
            max: 150,
            ticks: { color: '#8B9099', font: { size: 11 } },
            grid: { drawOnChartArea: false }
          }
        },
        plugins: {
          legend: {
            labels: { color: '#C7CBD1', font: { size: 11 } }
          }
        }
      }
    });
  };

  const handleAddExam = () => {
    if (!examScore || !examMax) {
      showToast('Please fill in both score and max score');
      return;
    }
    setState(prev => ({
      ...prev,
      exams: [...prev.exams, {
        id: Math.random().toString(36).slice(2, 9),
        date: examDate,
        score: Number(examScore),
        maxScore: Number(examMax)
      }]
    }));
    setExamScore('');
    setExamMax('');
    showToast('Exam result added');
  };

  const handleDeleteExam = (id) => {
    setState(prev => ({
      ...prev,
      exams: prev.exams.filter(e => e.id !== id)
    }));
    showToast('Exam result removed');
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-2 text-text-muted text-sm mb-3">
          <span>📈 Weekly hours vs exam score</span>
        </div>
        {state.exams.length === 0 ? (
          <p className="text-text-faint text-sm">
            Log a coaching exam result below to see your trend.
          </p>
        ) : (
          <div className="h-64">
            <canvas ref={chartRef}></canvas>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 text-text-muted text-sm mb-3">
          <span>Log a coaching exam result</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="date"
            className="input-field"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
          <input
            type="number"
            className="input-field"
            placeholder="Score"
            value={examScore}
            onChange={(e) => setExamScore(e.target.value)}
          />
          <input
            type="number"
            className="input-field"
            placeholder="Out of"
            value={examMax}
            onChange={(e) => setExamMax(e.target.value)}
          />
        </div>
        <button
          className="btn-primary w-full mt-2.5"
          onClick={handleAddExam}
          disabled={!examScore || !examMax}
        >
          Add result
        </button>
      </div>

      {state.exams.length > 0 && (
        <div>
          {[...state.exams]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(ex => {
              const dt = new Date(ex.date + "T00:00:00");
              const label = dt.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
              return (
                <div key={ex.id} className="flex items-center justify-between bg-surface border border-border rounded-xl px-3.5 py-2.5 mb-1.5">
                  <span className="font-space text-sm">{label}</span>
                  <span className="font-space text-sm text-text-muted">
                    {ex.score}/{ex.maxScore} ({Math.round(ex.score/ex.maxScore*100)}%)
                  </span>
                  <button
                    className="bg-none border-none text-text-faint text-sm cursor-pointer hover:text-red-400"
                    onClick={() => handleDeleteExam(ex.id)}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Progress;