import React, { useEffect, useState } from 'react';
import { Leaf, Sprout } from 'lucide-react';

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
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ease-in-out ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/agrovision_splash_bg.jpeg" 
          alt="Splash Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/10"></div>
      </div>

      {/* Main Logo Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-emerald-900/10 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-emerald-900/10 animate-bounce overflow-hidden relative group">
            <img src="/agro-logo.svg" alt="AgroVision Logo" className="w-14 h-14" />
            
            {/* Shining Sweep Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent -translate-x-full animate-shimmer"></div>
          </div>
          <Sprout className="absolute -bottom-2 -right-2 w-8 h-8 text-emerald-600 animate-pulse" />
        </div>

        <h1 className="text-4xl font-black text-emerald-900 tracking-tight mb-2">
          Agro<span className="text-emerald-600">Vision</span>
        </h1>
        
        <div className="flex items-center gap-2">
          <div className="h-[2px] w-8 bg-emerald-600/30 rounded-full"></div>
          <p className="text-emerald-800/70 text-sm font-medium tracking-[0.2em] uppercase">
            Smart Farming
          </p>
          <div className="h-[2px] w-8 bg-emerald-600/30 rounded-full"></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
          <div className="h-full bg-emerald-400 animate-loading-bar shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-10 text-emerald-900/40 text-[10px] font-bold tracking-widest uppercase z-10">
        AgroVision Smart Farming
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 50%; transform: translateX(0%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s infinite ease-in-out;
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

export default SplashScreen;
