import React, { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';
import './SplashScreen.css';

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinish, 800); // Wait for fade out animation
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Image with Overlay - Matching Landing Page Transparency */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/agrovision_splash_bg.png" 
          alt="Splash Background" 
          className="w-full h-full object-cover"
        />
        {/* Minimal overlay for maximum background visibility, matching landing page */}
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20"></div>
      </div>

      {/* Main Logo Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glassmorphism Rectangular Container for Logo and Title */}
        <div className="bg-white/20 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center justify-center shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] border border-white/40 animate-pulse-slow overflow-hidden relative group">
          <div className="relative mb-4">
            <img src="/agro-logo.svg" alt="AgroVision Logo" className="w-24 h-24 drop-shadow-2xl animate-float" />
            <Sprout className="absolute -bottom-2 -right-2 w-10 h-10 text-emerald-400 drop-shadow-lg" />
          </div>

          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
              Agro<span className="text-emerald-400">Vision</span>
            </h1>
            
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="h-[2px] w-8 bg-white/40 rounded-full"></div>
              <p className="text-white font-bold tracking-[0.3em] uppercase text-xs md:text-sm drop-shadow-md">
                Smart Farming
              </p>
              <div className="h-[2px] w-8 bg-white/40 rounded-full"></div>
            </div>
          </div>
          
          {/* Shining Sweep Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
        </div>

        {/* Progress Bar with Glassmorphism */}
        <div className="mt-12 w-64 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/10 shadow-inner">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 animate-loading-bar shadow-[0_0_20px_rgba(52,211,153,0.8)]"></div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-10 text-white/40 text-[10px] font-black tracking-[0.5em] uppercase z-10 drop-shadow-sm">
        Empowering Indian Farmers
      </div>
    </div>
  );
};

export default SplashScreen;
