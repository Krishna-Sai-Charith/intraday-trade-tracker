import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar({ onAddTrade, onManageCapital, capital, totalPnL }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <div className="title">Intraday Trader Tracker</div>

      <div className="stats">
        <span className="cap">Cap: ₹{capital?.toFixed(2) || '0.00'}</span>
        <span className={`pnl ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
          P/L: ₹{totalPnL?.toFixed(2) || '0.00'}
        </span>
      </div>

      <div className="actions">
        <button
          onClick={() => navigate('/profile')}
          className="nav-btn"
        >
          Profile
        </button>
        <button
          onClick={onManageCapital}
          className="nav-btn"
        >
          Capital
        </button>
        <button
          onClick={handleLogout}
          className="nav-btn"
        >
          Logout
        </button>
        <button
          onClick={onAddTrade}
          className="add-btn"
        >
          +
        </button>
      </div>
    </div>
  );
}