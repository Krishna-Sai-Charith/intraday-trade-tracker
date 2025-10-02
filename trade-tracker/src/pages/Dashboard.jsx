// src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TradeForm from '../components/TradeForm';
import '../index.css';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Dashboard</h1>
        <a href="#" onClick={handleLogout} className="logout-link">Logout</a>
      </div>

      <TradeForm />
    </div>
  );
}