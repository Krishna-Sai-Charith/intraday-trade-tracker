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

  // In real app, this will fetch from /user/profile
  useEffect(() => {
    if (!currentUser) return;

    // TEMP: Simulate real data from backend
    const mockTrades = JSON.parse(localStorage.getItem('trades') || '[]');
    const mockCapital = parseFloat(localStorage.getItem('capital') || '0');

    setTrades(mockTrades);
    setCapital(mockCapital);
    setTotalPnL(mockTrades.reduce((sum, t) => sum + t.profitLoss, 0));
  }, [currentUser]);

  const handleTradeSaved = (trade) => {
    const newTrades = [...trades, trade];
    setTrades(newTrades);
    setTotalPnL(newTrades.reduce((sum, t) => sum + t.profitLoss, 0));
    
    // Save to localStorage for demo
    localStorage.setItem('trades', JSON.stringify(newTrades));
    
    setToast({ show: true, message: '✅ Trade saved!', success: true });
    setShowTradeModal(false);
    setTimeout(() => setToast({ ...toast, show: false }), 2500);
  };

  const handleCapitalSaved = (newCapital) => {
    setCapital(newCapital);
    localStorage.setItem('capital', newCapital.toString());
    setShowCapitalModal(false);
    setToast({ show: true, message: '✅ Capital updated!', success: true });
    setTimeout(() => setToast({ ...toast, show: false }), 2500);
  };

  return (
    <div className="container">
      {/* Navbar */}
      <Navbar 
        onAddTrade={() => setShowTradeModal(true)} 
        onManageCapital={() => setShowCapitalModal(true)}
        capital={capital}
        totalPnL={totalPnL}
      />

      {/* Recent Trades */}
      <div className="trades-section">
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Recent Trades</h2>
        {trades.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center' }}>No trades yet</p>
        ) : (
          trades.map((t, i) => (
            <div key={i} className="trade-card" onClick={() => alert(JSON.stringify(t, null, 2))}>
              <span className="stock">{t.stock}</span>
              <span className={`pnl ${t.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                ₹{t.profitLoss.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal 
          onClose={() => setShowTradeModal(false)} 
          onSaved={handleTradeSaved}
        />
      )}

      {/* Capital Modal */}
      {showCapitalModal && (
        <CapitalModal 
          onClose={() => setShowCapitalModal(false)} 
          onSaved={handleCapitalSaved}
          currentCapital={capital}
        />
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`toast ${toast.success ? 'success' : 'error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}