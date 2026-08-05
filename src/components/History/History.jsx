import React, { useEffect, useRef, useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const History = () => {
  const { state, todayStr } = useStudy();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [stats, setStats] = useState({ totalHours: 0, avgHours: 0, daysTracked: 0, maxHours: 0, maxDate: '' });

  useEffect(() => {
    renderChart();
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [state.hours]);

  const renderChart = () => {
    const canvas = chartRef.current;
    if (!canvas) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get data from August 4th to today
    const startDate = new Date('2026-08-04');
    const endDate = new Date(todayStr() + "T00:00:00");
    
    const data = [];
    let totalHours = 0;
    let daysWithData = 0;
    let maxHours = 0;
    let maxDate = '';
    
    // Loop from start date to end date
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      const label = currentDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
      const hours = state.hours[dateStr] || 0;
      data.push({ label, hrs: hours, date: dateStr });
      totalHours += hours;
      // Count ALL days, including those with 0 hours
      daysWithData++;
      if (hours > maxHours) {
        maxHours = hours;
        maxDate = label;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalDays = data.length;
    const avgHours = totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0;
    
    setStats({ totalHours, avgHours, daysTracked: totalDays, maxHours, maxDate });

    const ctx = canvas.getContext('2d');
    
    // Find max value for y-axis
    const maxValue = Math.max(...data.map(d => d.hrs), 1);
    const yMax = Math.ceil(maxValue / 0.5) * 0.5 + 0.5;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Hours',
          data: data.map(d => d.hrs),
          backgroundColor: data.map(d => 
            d.hrs === maxHours && maxHours > 0 
              ? 'rgba(251, 191, 36, 0.8)' 
              : d.hrs > 0 
                ? 'rgba(129, 140, 248, 0.6)' 
                : 'rgba(60, 60, 80, 0.3)'
          ),
          borderColor: data.map(d => 
            d.hrs === maxHours && maxHours > 0 
              ? '#fbbf24' 
              : d.hrs > 0 
                ? '#818cf8' 
                : '#3a3a4a'
          ),
          borderWidth: 1,
          borderRadius: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { 
              color: '#8B9099', 
              font: { size: 9 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10
            },
            grid: { color: '#2A2D33' }
          },
          y: {
            ticks: { 
              color: '#8B9099', 
              font: { size: 11 },
              stepSize: 0.5
            },
            grid: { color: '#2A2D33' },
            beginAtZero: true,
            max: yMax
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} hours`;
              }
            }
          }
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="glass-card">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
            <span>📊 Total Hours</span>
          </div>
          <div className="font-space text-2xl font-bold gradient-text">
            {Math.round(stats.totalHours * 10) / 10}h
          </div>
          <div className="text-xs text-text-faint mt-1">
            Since Aug 4, 2026
          </div>
        </div>
        <div className="glass-card">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
            <span>📈 Daily Average</span>
          </div>
          <div className="font-space text-2xl font-bold gradient-text">
            {stats.avgHours}h
          </div>
          <div className="text-xs text-text-faint mt-1">
            Per day average
          </div>
        </div>
        <div className="glass-card">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
            <span>📅 Days Tracked</span>
          </div>
          <div className="font-space text-2xl font-bold gradient-text">
            {stats.daysTracked}
          </div>
          <div className="text-xs text-text-faint mt-1">
            Total days (including 0 hours)
          </div>
        </div>
        <div className="glass-card">
          <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
            <span>🏆 Best Day</span>
          </div>
          <div className="font-space text-2xl font-bold gradient-text">
            {stats.maxHours}h
          </div>
          <div className="text-xs text-text-faint mt-1">
            {stats.maxDate || 'No data yet'}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <span>📊 Study History</span>
            <span className="text-xs text-text-faint">Aug 4, 2026 - Today</span>
          </div>
          {stats.maxHours > 0 && (
            <div className="text-xs text-text-faint flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-400/80 inline-block"></span>
              <span>Best: {stats.maxHours}h on {stats.maxDate}</span>
            </div>
          )}
        </div>
        <div className="h-[240px]">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default History;