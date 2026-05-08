import React, { useState, useEffect, createContext } from 'react';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import useAuthStore from './store/useAuthStore';
import useLanguageStore from './store/useLanguageStore';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const { isAuthenticated, token, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated && token && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, token, currentPage]);

  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const handleNavigate = (page) => {
    if (page === 'dashboard' && !isAuthenticated) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
  };

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard');
  };

  const contextValue = {
    t,
    language,
    changeLanguage: setLanguage
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {currentPage === 'landing' && (
          <LandingPage 
            onNavigate={handleNavigate} 
          />
        )}
        
        {(currentPage === 'login' || currentPage === 'register') && (
          <AuthPage 
            type={currentPage}
            onBack={() => setCurrentPage('landing')}
            onSuccess={handleAuthSuccess}
            onNavigate={handleNavigate}
          />
        )}
        
        {(currentPage === 'dashboard' || currentPage === 'disease' || currentPage === 'crop' || currentPage === 'history') && (
          <Dashboard 
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            initialTab={currentPage === 'dashboard' ? 'dashboard' : currentPage}
          />
        )}
      </div>
    </LanguageContext.Provider>
  );
}

export default App;