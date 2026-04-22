import React, { useContext } from 'react';
import { Leaf, Globe } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { LanguageContext } from '../../App';

const Navbar = ({ onNavigate }) => {
  const { isAuthenticated, logout } = useAuthStore();
  const { t, language, changeLanguage } = useContext(LanguageContext);

  const LanguageSelector = () => (
    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
      <Globe size={14} className="text-emerald-100" />
      <select 
        value={language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
      >
        <option value="en" className="text-slate-800">English</option>
        <option value="hi" className="text-slate-800">हिंदी (Hindi)</option>
        <option value="pa" className="text-slate-800">ਪੰਜਾਬੀ (Punjabi)</option>
      </select>
    </div>
  );

  return (
    <nav className="flex items-center justify-between px-6 py-4 md:px-12 sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 z-50 border-b border-emerald-500/30 shadow-lg shadow-emerald-900/10">
      <div 
        className="flex items-center gap-2 text-white font-bold text-xl cursor-pointer group"
        onClick={() => onNavigate('landing')}
      >
        <Leaf className="fill-current text-emerald-200 group-hover:scale-110 transition-transform" />
        <span className="tracking-tight">{t('appName')}</span>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSelector />
        {isAuthenticated ? (
          <>
            <button onClick={() => onNavigate('dashboard')} className="text-emerald-100 font-semibold hover:text-white transition-colors">{t('nav.dashboard')}</button>
            <button onClick={logout} className="text-emerald-100 font-semibold hover:text-white transition-colors">{t('nav.logout')}</button>
          </>
        ) : (
          <>
            <button onClick={() => onNavigate('login')} className="text-emerald-100 font-semibold hover:text-white transition-colors">{t('nav.login')}</button>
            <button onClick={() => onNavigate('register')} className="bg-white text-emerald-700 px-5 py-2 rounded-full font-bold hover:bg-emerald-50 transition-all shadow-xl active:scale-95">
              {t('nav.register')}
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;