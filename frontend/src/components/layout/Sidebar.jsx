import  { useContext, useState } from 'react';
import { LayoutDashboard, Camera, Sprout, History, LogOut, Leaf, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LanguageContext } from '../../App';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const { t } = useContext(LanguageContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t('nav.dashboard') },
    { id: 'disease', icon: <Camera size={20} />, label: t('nav.diseaseDetect') },
    { id: 'crop', icon: <Sprout size={20} />, label: t('nav.cropGuide') },
    { id: 'history', icon: <History size={20} />, label: t('nav.history') },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
      <aside className={`hidden md:flex flex-col relative border-r border-white/5 h-full flex-shrink-0 transition-all duration-500 shadow-2xl overflow-hidden group/sidebar ${isCollapsed ? 'w-[115px]' : 'w-[345px] lg:w-[384px]'}`}>
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

        {/* Sidebar Toggler */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-0 top-10 z-50 bg-white/10 backdrop-blur-xl border border-white/20 text-white p-1.5 rounded-l-xl hover:bg-white/20 transition-all shadow-xl group/toggler translate-x-[1px]"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="relative z-10 flex flex-col h-full">
          <div className="h-24 flex items-center px-6 lg:px-8 border-b border-white/10 overflow-hidden">
            <div className="flex items-center gap-4 text-white font-black text-2xl min-w-max drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <span className={`tracking-tight transition-all duration-500 ${isCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'}`}>AgroVision</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-black transition-all duration-300 group drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white shadow-2xl scale-[1.02] backdrop-blur-xl border border-white/30'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <div className={`flex-shrink-0 transition-transform duration-300 ${activeTab === item.id ? 'scale-125' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                <span className={`truncate transition-all duration-500 tracking-wide ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="p-4 lg:p-6 border-t border-white/10">
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-4 px-4 py-4 text-red-100 hover:bg-red-500/20 hover:text-white rounded-2xl text-base font-black transition-all group drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              title={isCollapsed ? t('common.logout') : ''}
            >
              <LogOut size={22} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
              <span className={`transition-all duration-500 tracking-wide ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {t('common.logout')}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal - Redesigned with Glassmorphism */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in"
          onClick={handleOutsideClick}
        >
          {/* Decorative background glow */}
          <div className="absolute w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>

          <div 
            className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] w-[420px] max-w-[90%] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 animate-slide-up overflow-hidden relative group"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle inner shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center p-7 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/10 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                  <LogOut size={24} className="text-red-400 drop-shadow-md" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">
                    {t('logoutModal.title')}
                  </h3>
                  <div className="h-1 w-8 bg-red-500/50 rounded-full mt-1"></div>
                </div>
              </div>
              <button 
                onClick={handleCancelLogout}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-300 group/close"
              >
                <X size={20} className="text-white/60 group-hover/close:text-white group-hover/close:rotate-90 transition-all duration-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 relative z-10">
              <p className="text-white/80 font-bold text-lg leading-relaxed drop-shadow-sm">
                {t('logoutModal.message')}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-8 pt-2 relative z-10">
              <button
                onClick={handleCancelLogout}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all active:scale-95 shadow-lg"
              >
                {t('logoutModal.cancel')}
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black uppercase tracking-widest text-xs hover:from-red-500 hover:to-red-400 transition-all active:scale-95 shadow-xl shadow-red-500/20 border border-red-400/30"
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