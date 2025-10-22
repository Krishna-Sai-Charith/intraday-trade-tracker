import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FastTradeModal from '../components/FastTradeModal';
import CapitalModal from '../components/CapitalModal';
import TradeDetailModal from '../components/TradeDetailModal';
import CalendarHeatmap from '../components/CalendarHeatmap';
import StatsTabs from '../components/StatsTabs';
import '../index.css';

export default function CompleteDashboard() {
  const { currentUser } = useAuth();
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [capitalAction, setCapitalAction] = useState('ADD');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', success: true });
  const [capital, setCapital] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar and Stats state
  const [calendarData, setCalendarData] = useState({
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
    yearlyStats: [],
    yearSummary: { pnl: 0, count: 0, winRate: 0 }
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Gamification stats
  const [stats, setStats] = useState({
    winStreak: 0,
    totalWins: 0,
    totalLosses: 0,
    winRate: 0
  });

  const API_BASE = 'http://localhost:5000';

  const fetchUserData = async () => {
    if (!currentUser?.token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });

      if (res.ok) {
        const userData = await res.json();
        setTrades(userData.trades || []);
        setCapital(userData.capital || 0);
        const total = (userData.trades || []).reduce((sum, t) => sum + (t.profitLoss || 0), 0);
        setTotalPnL(total);
        calculateStats(userData.trades || []);
      }
    } catch (err) {
      console.error('🌐 Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarStats = async (year) => {
    if (!currentUser?.token) return;

    try {
      const res = await fetch(`${API_BASE}/api/trades/calendar-stats?year=${year}`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCalendarData({
          dailyStats: data.dailyStats || [],
          weeklyStats: data.weeklyStats || [],
          monthlyStats: data.monthlyStats || [],
          yearlyStats: data.yearlyStats || [],
          yearSummary: data.summary || { pnl: 0, count: 0, winRate: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching calendar stats:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchCalendarStats(selectedYear);
  }, [currentUser]);

  const calculateStats = (tradesData) => {
    const wins = tradesData.filter(t => t.profitLoss > 0);
    const losses = tradesData.filter(t => t.profitLoss < 0);
    
    // Calculate win streak
    let currentStreak = 0;
    for (let i = tradesData.length - 1; i >= 0; i--) {
      if (tradesData[i].profitLoss > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    const winRate = tradesData.length > 0 
      ? ((wins.length / tradesData.length) * 100).toFixed(1)
      : 0;

    setStats({
      winStreak: currentStreak,
      totalWins: wins.length,
      totalLosses: losses.length,
      winRate
    });
  };

 const handleTradeSaved = async (trade) => {
  if (!trade) return;
  const newTrades = [...trades, trade];
  setTrades(newTrades);
  const newTotalPnL = newTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);
  setTotalPnL(newTotalPnL);
  calculateStats(newTrades);
  fetchCalendarStats(selectedYear);
  
  // ✅ NEW: Auto-reduce capital if loss
  if (trade.profitLoss < 0) {
    const newCapital = capital + trade.profitLoss; // Subtract loss
    await handleCapitalUpdate(newCapital);
    setToast({ show: true, message: '✅ Trade saved! Capital adjusted for loss.', success: true });
  } else {
    setToast({ show: true, message: '✅ Trade saved successfully!', success: true });
  }
  
  setShowTradeModal(false);
  setTimeout(() => setToast({ show: false, message: '', success: true }), 3000);
};

  const handleDeleteTrade = async (tradeId) => {
    if (!currentUser?.token) return;

    try {
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });

      if (res.ok) {
        const updatedTrades = trades.filter(t => t._id !== tradeId);
        setTrades(updatedTrades);
        setTotalPnL(updatedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0));
        calculateStats(updatedTrades);
        fetchCalendarStats(selectedYear);
        setToast({ show: true, message: '🗑️ Trade deleted successfully!', success: true });
      } else {
        setToast({ show: true, message: '❌ Failed to delete trade', success: false });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ show: true, message: '🌐 Network error', success: false });
    }
    setTimeout(() => setToast({ show: false, message: '', success: true }), 3000);
  };

  const handleCapitalSaved = async (newCapital) => {
    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ capital: newCapital })
      });

      if (res.ok) {
        setCapital(newCapital);
        setToast({ 
          show: true, 
          message: capitalAction === 'ADD' ? '✅ Deposit successful!' : '✅ Withdrawal successful!', 
          success: true 
        });
      }
    } catch (err) {
      console.error('Capital update error:', err);
      setToast({ show: true, message: '❌ Failed to update capital', success: false });
    }
    setShowCapitalModal(false);
    setTimeout(() => setToast({ show: false, message: '', success: true }), 3000);
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    fetchCalendarStats(newYear);
  };

  const handleDayClick = (date) => {
    console.log('Clicked day:', date);
    // Future: Filter trades table to show only trades from this day
  };

  const handleCapitalUpdate = async (newCapital) => {
  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.token}`
      },
      body: JSON.stringify({ capital: newCapital })
    });

    if (res.ok) {
      setCapital(newCapital);
    }
  } catch (err) {
    console.error('Capital update error:', err);
  }
};

  if (loading) {
    return (
      <div className="container" style={{ 
        textAlign: 'center', 
        padding: '100px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #2a2a2a',
          borderTop: '4px solid #10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#9ca3af', fontSize: '15px' }}>Loading your portfolio...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <Navbar />

      {/* Main Content Grid */}
      <div className="dashboard-grid-compact">
        {/* Left Side - Trades Table */}
        <div className="trades-section-compact">
          <div className="section-header-compact">
            <h2 className="section-title-compact">Trade History</h2>
            <button
              onClick={() => setShowTradeModal(true)}
              className="add-btn-compact"
              title="Add new trade"
            >
              +
            </button>
          </div>

          {/* Trades Table */}
          {trades.length === 0 ? (
            <div className="no-trades-compact">
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.3 }}>📊</div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>No trades yet</p>
              <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
                Click + to add your first trade
              </p>
            </div>
          ) : (
            <div className="table-wrapper-compact">
              <table className="trades-table-compact">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Entry</th>
                    <th>Exit</th>
                    <th>P/L</th>
                    <th>%</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice().reverse().map((t) => {
                    const percentChange = ((t.profitLoss / (t.entryPrice * t.quantity)) * 100).toFixed(2);
                    const isProfitable = t.profitLoss >= 0;
                    
                    return (
                      <tr 
                        key={t._id}
                        onClick={() => setSelectedTrade(t)}
                        className="trade-row-compact"
                      >
                        <td className="stock-cell">
                          <div className="stock-name">{t.stock || 'N/A'}</div>
                        </td>
                        <td>
                          <span className={`trade-type-badge ${t.tradeType === 'BUY' ? 'long' : 'short'}`}>
                            {t.tradeType === 'BUY' ? 'LONG' : 'SHORT'}
                          </span>
                        </td>
                        <td className="qty-cell">{t.quantity || 0}</td>
                        <td className="price-cell">₹{(t.entryPrice || 0).toFixed(2)}</td>
                        <td className="price-cell">₹{(t.exitPrice || 0).toFixed(2)}</td>
                        <td className={`pnl-cell ${isProfitable ? 'positive' : 'negative'}`}>
                          {isProfitable ? '+' : ''}₹{(t.profitLoss || 0).toFixed(2)}
                        </td>
                        <td className={`percent-cell ${isProfitable ? 'positive' : 'negative'}`}>
                          {isProfitable ? '+' : ''}{percentChange}%
                        </td>
                        <td className="action-cell">
                          <button
                            className="delete-btn-compact"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this trade?')) {
                                handleDeleteTrade(t._id);
                              }
                            }}
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Placeholder for Future Charts */}
          <div className="future-section-placeholder">
            <p style={{ fontSize: '12px', color: '#4b5563', textAlign: 'center' }}>
              📊 Charts coming soon
            </p>
          </div>
        </div>

        {/* Right Side - Compact Wallet */}
        <div className="wallet-section-compact">
          <h3 className="wallet-title-compact">Wallet</h3>
          
          <div className="balance-display-compact">
            <div className="balance-label-compact">Total Balance</div>
            <div className="balance-amount-compact">
              ₹{capital.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`pnl-display-compact ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
              {totalPnL >= 0 ? '+' : '-'}₹{Math.abs(totalPnL).toFixed(2)}
            </div>
          </div>

          <div className="wallet-actions-compact">
            <button 
              onClick={() => {
                setCapitalAction('ADD');
                setShowCapitalModal(true);
              }} 
              className="wallet-btn-compact deposit"
            >
              Deposit
            </button>
            <button 
              onClick={() => {
                setCapitalAction('REMOVE');
                setShowCapitalModal(true);
              }} 
              className="wallet-btn-compact withdraw"
            >
              Withdraw
            </button>
          </div>

          {/* Quick Stats */}
          {trades.length > 0 && (
            <div className="quick-stats-compact">
              <div className="stat-item-compact">
                <span className="stat-label-compact">Total Trades</span>
                <span className="stat-value-compact">{trades.length}</span>
              </div>
              <div className="stat-item-compact">
                <span className="stat-label-compact">Win Rate</span>
                <span className={`stat-value-compact ${stats.winRate >= 50 ? 'positive' : 'negative'}`}>
                  {stats.winRate}%
                </span>
              </div>
              <div className="stat-item-compact">
                <span className="stat-label-compact">Win Streak</span>
                <span className="stat-value-compact">{stats.winStreak}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Heatmap */}
      <CalendarHeatmap 
        dailyStats={calendarData.dailyStats}
        year={selectedYear}
        onYearChange={handleYearChange}
        onDayClick={handleDayClick}
      />

      {/* Stats Tabs */}
      <StatsTabs 
        weeklyStats={calendarData.weeklyStats}
        monthlyStats={calendarData.monthlyStats}
        yearlyStats={calendarData.yearlyStats}
        yearSummary={calendarData.yearSummary}
      />

      {/* Modals */}
      {showTradeModal && (
        <FastTradeModal 
          onClose={() => setShowTradeModal(false)} 
          onSaved={handleTradeSaved}
        />
      )}

      {showCapitalModal && (
        <CapitalModal 
          onClose={() => setShowCapitalModal(false)} 
          onSaved={handleCapitalSaved}
          currentCapital={capital}
          defaultAction={capitalAction}
        />
      )}

      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          capital={capital}
          onClose={() => setSelectedTrade(null)}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.success ? 'success' : 'error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}