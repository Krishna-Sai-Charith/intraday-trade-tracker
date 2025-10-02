// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode token to get user info (optional but useful)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          token,
          id: payload.userId,
          email: payload.email
        });
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({
        token,
        id: payload.userId,
        email: payload.email
      });
      localStorage.setItem('token', token);
    } catch (e) {
      console.error('Invalid token');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};