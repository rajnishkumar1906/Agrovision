import React, { useContext, useState } from 'react';
import { Leaf, Search, LogOut, Globe, ChevronDown, X } from 'lucide-react';
import { LanguageContext } from '../../App';

const Header = ({ user, onLogout }) => {
  const { t, language, changeLanguage } = useContext(LanguageContext);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleLogoutClick = () => {
    setIsLangOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <header className="h-20 bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-500/30 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shadow-lg shadow-emerald-900/10">
        <div className="flex items-center gap-4">
          <div className="md:hidden text-white font-bold flex gap-2">
            <Leaf className="text-emerald-200" /> {t('appName')}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100 w-4 h-4 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm w-64 text-white placeholder:text-emerald-100 focus:ring-2 focus:ring-white/30 outline-none transition-all" 
            />
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-white/20">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <span className="text-sm">{currentLang.flag}</span>
                <span className="text-xs font-bold text-white hidden sm:inline">{currentLang.name}</span>
                <ChevronDown 
                  size={12} 
                  className={`text-white transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isLangOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLangOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-200 ${
                          language === lang.code
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.name}</span>
                        {language === lang.code && (
                          <span className="ml-auto text-emerald-500 text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white">{user?.username || 'User'}</p>
              <p className="text-xs text-emerald-100">{user?.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white/30 shadow-sm backdrop-blur-sm">
              {user?.username?.[0].toUpperCase() || 'U'}
            </div>
            <button 
              onClick={handleLogoutClick}
              className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors md:flex items-center gap-2"
              title={t('common.logout')}
            >
              <LogOut size={18} />
              <span className="text-xs font-bold hidden lg:block">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal - Translated */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
          onClick={handleOutsideClick}
        >
          <div 
            className="bg-white rounded-2xl w-96 max-w-[90%] shadow-2xl animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{t('logoutModal.title')}</h3>
              </div>
              <button 
                onClick={handleCancelLogout}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <p className="text-slate-600 leading-relaxed">
                {t('logoutModal.message')}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={handleCancelLogout}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
              >
                {t('logoutModal.cancel')}
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                {t('logoutModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;