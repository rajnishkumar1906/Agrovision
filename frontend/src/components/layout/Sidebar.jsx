import  { useContext, useState } from 'react';
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
      <aside className="hidden md:flex flex-col w-20 lg:w-64 relative border-r border-white/5 h-full flex-shrink-0 transition-all duration-300 shadow-2xl overflow-hidden group/sidebar">
        {/* Background Image with Enhanced Transparency */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/sidenav_bg.png" 
            alt="Sidebar Background" 
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay for text contrast without losing background image clarity */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="h-20 flex items-center px-6 lg:px-8 border-b border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 text-white font-black text-xl min-w-max drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md border border-white/20 shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="tracking-tight opacity-0 lg:opacity-100 lg:group-hover/sidebar:opacity-100 transition-opacity duration-300">AgroVision</span>
            </div>
          </div>

          <nav className="flex-1 px-3 lg:px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl text-sm font-black transition-all duration-300 group drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white shadow-2xl scale-105 backdrop-blur-xl border border-white/30'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
                title={item.label}
              >
                <div className={`flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className="truncate opacity-0 lg:opacity-100 transition-opacity duration-300 tracking-wide">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-3 lg:p-4 border-t border-white/10">
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-red-100 hover:bg-red-500/20 hover:text-white rounded-xl text-sm font-black transition-all group drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              title={t('common.logout')}
            >
              <LogOut size={20} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
              <span className="opacity-0 lg:opacity-100 transition-opacity duration-300 tracking-wide">
                {t('common.logout')}
              </span>
            </button>
          </div>
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