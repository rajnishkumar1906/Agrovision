import React, { useContext, useState } from 'react';
import { LayoutDashboard, Camera, Sprout, History, LogOut, Leaf, X } from 'lucide-react';
import { LanguageContext } from '../../App';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const { t } = useContext(LanguageContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t('nav.dashboard') },
    { id: 'disease', icon: <Camera size={20} />, label: t('nav.diseaseDetect') },
    { id: 'crop', icon: <Sprout size={20} />, label: t('nav.cropGuide') },
    { id: 'history', icon: <History size={20} />, label: t('nav.history') },
  ];

  const handleLogoutClick = () => {
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
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-emerald-700 to-emerald-900 border-r border-emerald-800 h-full flex-shrink-0 transition-all shadow-2xl">
        <div className="h-20 flex items-center px-8 border-b border-emerald-600/30">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Leaf className="fill-current text-emerald-300" />
            <span className="tracking-tight">AgroVision</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-white text-emerald-800 shadow-xl scale-105'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-600/30">
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-emerald-200 hover:bg-red-500/20 hover:text-red-300 rounded-xl text-sm font-semibold transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

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

export default Sidebar;