import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('locallie_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('locallie_theme');
    return saved !== 'light'; // Default to true (dark mode)
  });

  // Global tab navigation state
  // Tabs: 'landing', 'feed', 'dashboard', 'chatbot'
  const [activeTab, setActiveTab] = useState('landing');
  const [globalNotification, setGlobalNotification] = useState(null);

  // Sync dark mode class with html tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('locallie_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('locallie_theme', 'light');
    }
  }, [darkMode]);

  const showNotification = (message, type = 'info') => {
    setGlobalNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setGlobalNotification(null);
    }, 4500);
  };

  const login = async (email, password) => {
    try {
      const data = await api.auth.login(email, password);
      setUser(data.user);
      localStorage.setItem('locallie_user', JSON.stringify(data.user));
      showNotification(`Welcome back, ${data.user.username}!`, 'success');
      setActiveTab('dashboard');
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const register = async (username, email, password, role) => {
    try {
      const data = await api.auth.register(username, email, password, role);
      setUser(data.user);
      localStorage.setItem('locallie_user', JSON.stringify(data.user));
      showNotification(`Welcome to LocalFix, ${data.user.username}!`, 'success');
      setActiveTab('dashboard');
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('locallie_user');
    showNotification('Logged out successfully', 'info');
    setActiveTab('landing');
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const updated = await api.auth.getUserProfile(user.id);
      setUser(updated);
      localStorage.setItem('locallie_user', JSON.stringify(updated));
    } catch (err) {
      console.error("Error refreshing user profile:", err);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        darkMode,
        activeTab,
        globalNotification,
        login,
        register,
        logout,
        refreshUser,
        toggleDarkMode,
        setActiveTab,
        showNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
