import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../src/api/axios';
const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [cashBalance, setCashBalance] = useState(0);
  const [portfolioSummary, setPortfolioSummary] = useState({
    cashBalance: 0,
    totalValue: 0,
    profit: 0,
    profitPercentage: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/user_profile");
      setUsername(res.data.username);
      const balance = res.data.balance || 0;
      setCashBalance(balance);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioSummary = async () => {
    try {
      const res = await api.get("/portfolio/my-portfolio/summary");
      setPortfolioSummary(res.data);
    } catch (err) {
      console.error("Failed to fetch portfolio summary", err);
      // Reset to defaults if fetch fails
      setPortfolioSummary({
        cashBalance: 0,
        totalValue: 0,
        profit: 0,
        profitPercentage: 0,
      });
    }
  };

  const refreshUserData = async () => {
    await Promise.all([
      fetchUserProfile(),
      fetchPortfolioSummary()
    ]);
  };

  // Initial load
  useEffect(() => {
    if (localStorage.getItem('token')) {
      refreshUserData();
    }
  }, []);

  const value = {
    username,
    cashBalance,
    portfolioSummary,
    loading,
    refreshUserData,
    setUsername,
    setCashBalance,
    setPortfolioSummary
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;