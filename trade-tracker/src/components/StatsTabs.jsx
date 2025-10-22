import { useState } from 'react';

const StatsTabs = ({ weeklyStats, monthlyStats, yearlyStats, yearSummary }) => {
  const [activeTab, setActiveTab] = useState('week');

  const formatPnL = (pnl) => {
    return `${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)}`;
  };

  const renderWeekView = () => (
    <div className="stats-tab-content">
      <div className="stats-period-header">
        Current Week ({weeklyStats[0]?.date} - {weeklyStats[6]?.date})
      </div>
      
      <table className="stats-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>P/L</th>
            <th>Trades</th>
            <th>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {weeklyStats.map((day, idx) => (
            <tr key={idx} className={day.count === 0 ? 'no-trades' : ''}>
              <td className="day-cell">
                <span className="day-name">{day.dayName}</span>
                <span className="day-date">{new Date(day.date).getDate()}</span>
              </td>
              <td className={`pnl-cell ${day.pnl >= 0 ? 'profit' : 'loss'}`}>
                {day.count > 0 ? formatPnL(day.pnl) : '-'}
              </td>
              <td className="count-cell">
                {day.count > 0 ? day.count : '-'}
              </td>
              <td className="winrate-cell">
                {day.count > 0 ? `${day.winRate}%` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="stats-summary">
        <span>Total: {formatPnL(weeklyStats.reduce((sum, d) => sum + d.pnl, 0))}</span>
        <span>•</span>
        <span>{weeklyStats.reduce((sum, d) => sum + d.count, 0)} trades</span>
        <span>•</span>
        <span>
          {weeklyStats.reduce((sum, d) => sum + d.count, 0) > 0
            ? ((weeklyStats.reduce((sum, d) => sum + d.wins, 0) / 
                weeklyStats.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)
            : 0}% win rate
        </span>
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="stats-tab-content">
      <div className="stats-period-header">
        {new Date(monthlyStats[0]?.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
      
      <div className="stats-scroll-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>P/L</th>
              <th>Trades</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {monthlyStats.map((day, idx) => (
              <tr key={idx} className={day.count === 0 ? 'no-trades' : ''}>
                <td className="date-cell">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </td>
                <td className={`pnl-cell ${day.pnl >= 0 ? 'profit' : 'loss'}`}>
                  {day.count > 0 ? formatPnL(day.pnl) : '-'}
                </td>
                <td className="count-cell">
                  {day.count > 0 ? day.count : '-'}
                </td>
                <td className="winrate-cell">
                  {day.count > 0 ? `${day.winRate}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <span>Total: {formatPnL(monthlyStats.reduce((sum, d) => sum + d.pnl, 0))}</span>
        <span>•</span>
        <span>{monthlyStats.reduce((sum, d) => sum + d.count, 0)} trades</span>
        <span>•</span>
        <span>
          {monthlyStats.reduce((sum, d) => sum + d.count, 0) > 0
            ? ((monthlyStats.reduce((sum, d) => sum + d.wins, 0) / 
                monthlyStats.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)
            : 0}% win rate
        </span>
      </div>
    </div>
  );

  const renderYearView = () => (
    <div className="stats-tab-content">
      <div className="stats-period-header">
        2024 Summary
      </div>
      
      <div className="stats-scroll-container">
        <table className="stats-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>P/L</th>
              <th>Trades</th>
              <th>Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {yearlyStats.map((month, idx) => (
              <tr key={idx} className={month.count === 0 ? 'no-trades' : ''}>
                <td className="month-cell">{month.monthName}</td>
                <td className={`pnl-cell ${month.pnl >= 0 ? 'profit' : 'loss'}`}>
                  {month.count > 0 ? formatPnL(month.pnl) : '-'}
                </td>
                <td className="count-cell">
                  {month.count > 0 ? month.count : '-'}
                </td>
                <td className="winrate-cell">
                  {month.count > 0 ? `${month.winRate}%` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats-summary">
        <span>Total: {formatPnL(yearSummary.pnl)}</span>
        <span>•</span>
        <span>{yearSummary.count} trades</span>
        <span>•</span>
        <span>{yearSummary.winRate}% win rate</span>
      </div>
    </div>
  );

  return (
    <div className="stats-tabs-container">
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => setActiveTab('week')}
        >
          📅 Week
        </button>
        <button 
          className={`tab-btn ${activeTab === 'month' ? 'active' : ''}`}
          onClick={() => setActiveTab('month')}
        >
          📊 Month
        </button>
        <button 
          className={`tab-btn ${activeTab === 'year' ? 'active' : ''}`}
          onClick={() => setActiveTab('year')}
        >
          📈 Year
        </button>
      </div>

      {activeTab === 'week' && renderWeekView()}
      {activeTab === 'month' && renderMonthView()}
      {activeTab === 'year' && renderYearView()}
    </div>
  );
};

export default StatsTabs;