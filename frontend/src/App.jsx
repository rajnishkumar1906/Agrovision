import  { useState, useEffect, createContext, useMemo } from 'react';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import SplashScreen from './components/SplashScreen/SplashScreen';
import useAuthStore from './store/useAuthStore';
import useLanguageStore from './store/useLanguageStore';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

function App() {
  const { isAuthenticated, token, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(() => {
    // Initial page based on auth state to avoid "white flash" transitions
    return (isAuthenticated && token) ? 'dashboard' : 'landing';
  });
  const [showSplash, setShowSplash] = useState(true);
  const { language, setLanguage } = useLanguageStore();
  const { i18n, t } = useTranslation();

  // Sync page with auth state changes
  useEffect(() => {
    if (isAuthenticated && token && currentPage === 'landing') {
      setCurrentPage('dashboard');
    } else if (!isAuthenticated && (currentPage === 'dashboard' || currentPage === 'disease' || currentPage === 'crop' || currentPage === 'history')) {
      setCurrentPage('landing');
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

  const contextValue = useMemo(() => ({
    t,
    language,
    changeLanguage: setLanguage
  }), [t, language, setLanguage]);

  // Handle case where currentPage might be set to an invalid value
  const renderContent = () => {
    if (currentPage === 'landing') {
      return <LandingPage onNavigate={handleNavigate} />;
    }
    
    if (currentPage === 'login' || currentPage === 'register') {
      return (
        <AuthPage 
          type={currentPage}
          onBack={() => setCurrentPage('landing')}
          onSuccess={handleAuthSuccess}
          onNavigate={handleNavigate}
        />
      );
    }
    
    // Default to Dashboard for all other authenticated tabs
    return (
      <Dashboard 
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        initialTab={currentPage === 'dashboard' ? 'dashboard' : currentPage}
      />
    );
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 animate-fade-in">
          {renderContent()}
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export default App;