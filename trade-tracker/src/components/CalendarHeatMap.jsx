import { useState, useEffect } from 'react';

const CalendarHeatmap = ({ dailyStats, year, onYearChange, onDayClick }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  
  // Generate all days of the year
  const generateYearGrid = () => {
    const startDate = new Date(year, 0, 1); // Jan 1
    const endDate = new Date(year, 11, 31); // Dec 31
    
    // Find the first Sunday before/on Jan 1
    const firstDay = new Date(startDate);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    
    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(firstDay);
    
    // Generate 53 weeks
    for (let week = 0; week < 53; week++) {
      currentWeek = [];
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isCurrentYear = currentDate.getFullYear() === year;
        
        // Find stats for this day
        const dayData = dailyStats.find(stat => stat.date === dateStr);
        
        currentWeek.push({
          date: dateStr,
          displayDate: new Date(currentDate),
          isCurrentYear,
          pnl: dayData?.pnl || 0,
          count: dayData?.count || 0,
          winRate: dayData?.winRate || 0
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // Get color intensity based on P/L
  const getColor = (pnl, count) => {
    if (count === 0) return 'var(--heatmap-empty)';
    
    if (pnl > 0) {
      // Green for profit
      if (pnl >= 5000) return 'var(--heatmap-profit-high)';
      if (pnl >= 2000) return 'var(--heatmap-profit-med)';
      if (pnl >= 500) return 'var(--heatmap-profit-low)';
      return 'var(--heatmap-profit-min)';
    } else if (pnl < 0) {
      // Red for loss
      const absLoss = Math.abs(pnl);
      if (absLoss >= 5000) return 'var(--heatmap-loss-high)';
      if (absLoss >= 2000) return 'var(--heatmap-loss-med)';
      if (absLoss >= 500) return 'var(--heatmap-loss-low)';
      return 'var(--heatmap-loss-min)';
    }
    
    return 'var(--heatmap-neutral)';
  };

  const weeks = generateYearGrid();
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="calendar-heatmap-container">
      <div className="calendar-header">
        <h3 className="calendar-title">📅 Trading Activity</h3>
        
        <div className="year-selector">
          <button 
            className="year-nav-btn"
            onClick={() => onYearChange(year - 1)}
          >
            ◄
          </button>
          <span className="year-display">{year}</span>
          <button 
            className="year-nav-btn"
            onClick={() => onYearChange(year + 1)}
            disabled={year >= new Date().getFullYear()}
          >
            ►
          </button>
        </div>
      </div>

      <div className="heatmap-wrapper">
        {/* Month labels */}
        <div className="month-labels">
          {monthLabels.map((month, idx) => (
            <span key={idx} className="month-label">{month}</span>
          ))}
        </div>

        {/* Day labels */}
        <div className="day-labels">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>

        {/* Heatmap grid */}
        <div className="heatmap-grid">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="heatmap-week">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`heatmap-day ${!day.isCurrentYear ? 'out-of-year' : ''}`}
                  style={{ backgroundColor: day.isCurrentYear ? getColor(day.pnl, day.count) : 'transparent' }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => day.count > 0 && onDayClick(day.date)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && hoveredDay.isCurrentYear && (
          <div className="heatmap-tooltip">
            <div className="tooltip-date">
              {hoveredDay.displayDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
            {hoveredDay.count > 0 ? (
              <>
                <div className={`tooltip-pnl ${hoveredDay.pnl >= 0 ? 'profit' : 'loss'}`}>
                  {hoveredDay.pnl >= 0 ? '+' : ''}₹{hoveredDay.pnl.toFixed(2)}
                </div>
                <div className="tooltip-stats">
                  {hoveredDay.count} trade{hoveredDay.count !== 1 ? 's' : ''} • {hoveredDay.winRate}% win
                </div>
              </>
            ) : (
              <div className="tooltip-empty">No trades</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-label">Less</span>
        <div className="legend-squares">
          <div className="legend-square" style={{ backgroundColor: 'var(--heatmap-empty)' }}></div>
          <div className="legend-square" style={{ backgroundColor: 'var(--heatmap-profit-min)' }}></div>
          <div className="legend-square" style={{ backgroundColor: 'var(--heatmap-profit-low)' }}></div>
          <div className="legend-square" style={{ backgroundColor: 'var(--heatmap-profit-med)' }}></div>
          <div className="legend-square" style={{ backgroundColor: 'var(--heatmap-profit-high)' }}></div>
        </div>
        <span className="legend-label">More</span>
      </div>

      {/* Summary stats */}
      <div className="heatmap-summary">
        📊 {dailyStats.length} trading days • 
        ₹{dailyStats.reduce((sum, d) => sum + d.pnl, 0).toFixed(2)} total P/L
      </div>
    </div>
  );
};

export default CalendarHeatmap;