// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TradeModal from '../components/TradeModal';
import CapitalModal from '../components/CapitalModal';
import '../index.css';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', success: true });
  const [capital, setCapital] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5000';

  const fetchUserData = async () => {
    if (!currentUser?.token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setTrades(userData.trades || []);
        setCapital(userData.capital || 0);
        const total = (userData.trades || []).reduce((sum, t) => sum + (t.profitLoss || 0), 0);
        setTotalPnL(total);
      }
    } catch (err) {
      console.error('🌐 Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const handleTradeSaved = (trade) => {
    if (!trade) return;
    const newTrades = [...trades, trade];
    setTrades(newTrades);
    setTotalPnL(newTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0));
    setToast({ show: true, message: '✅ Trade saved!', success: true });
    setShowTradeModal(false);
    setTimeout(() => setToast({ show: false, message: '', success: true }), 2500);
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!currentUser?.token) return;

    try {
      const res = await fetch(`${API_BASE}/api/trades/${tradeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (res.ok) {
        const updatedTrades = trades.filter(t => t._id !== tradeId);
        setTrades(updatedTrades);
        setTotalPnL(updatedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0));
        setToast({ show: true, message: '🗑️ Trade deleted!', success: true });
      } else {
        setToast({ show: true, message: '❌ Failed to delete trade', success: false });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setToast({ show: true, message: '🌐 Network error', success: false });
    }
    setTimeout(() => setToast({ show: false, message: '', success: true }), 2500);
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
        setToast({ show: true, message: '✅ Capital updated!', success: true });
      }
    } catch (err) {
      console.error('Capital update error:', err);
    }
    setShowCapitalModal(false);
    setTimeout(() => setToast({ show: false, message: '', success: true }), 2500);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        Loading your portfolio...
      </div>
    );
  }

  return (
    <div className="container">
      <Navbar 
        onAddTrade={() => setShowTradeModal(true)} 
        onManageCapital={() => setShowCapitalModal(true)}
        capital={capital}
        totalPnL={totalPnL}
      />

      <div className="trades-section">
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Recent Trades</h2>
        {trades.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center' }}>No trades recorded yet</p>
        ) : (
          trades.map((t) => (
            <div key={t._id} className="trade-card">
              {/* Delete button */}
              <button
                className="delete-trade-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTrade(t._id);
                }}
                title="Delete trade"
              >
                ✕
              </button>

              {/* Trade content */}
              <span
                className="trade-content"
                onClick={() => alert(JSON.stringify(t, null, 2))}
              >
                <span className="stock">{t.stock || 'Unknown'}</span>
                <span className={`pnl ${(t.profitLoss ?? 0) >= 0 ? 'positive' : 'negative'}`}>
                  ₹{(t.profitLoss ?? 0).toFixed(2)}
                </span>
              </span>
            </div>
          ))
        )}
      </div>

      {showTradeModal && (
        <TradeModal 
          onClose={() => setShowTradeModal(false)} 
          onSaved={handleTradeSaved}
        />
      )}

      {showCapitalModal && (
        <CapitalModal 
          onClose={() => setShowCapitalModal(false)} 
          onSaved={handleCapitalSaved}
          currentCapital={capital}
        />
      )}

      {toast.show && (
        <div className={`toast ${toast.success ? 'success' : 'error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}