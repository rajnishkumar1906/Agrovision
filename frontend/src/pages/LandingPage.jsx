import React, { useContext } from 'react';
import { Leaf, Camera, Sprout, CloudSun } from 'lucide-react';
import { LanguageContext } from '../App';

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg mb-4`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const LandingPage = ({ onNavigate }) => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative pt-16 pb-32 flex flex-col items-center text-center px-4 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-6 border border-emerald-100 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {t('landing.heroBadge')}
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl">
          {t('landing.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{t('landing.heroSubtitle')}</span>
        </h1>
        
        <p className="text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
          {t('landing.heroDesc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button onClick={() => onNavigate('register')} className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-200 hover:scale-105 transition-transform">
            {t('landing.ctaStart')}
          </button>
          <button 
            onClick={() => onNavigate('disease')}
            className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Camera size={20} /> {t('landing.ctaDemo')}
          </button>
        </div>

        {/* Feature Preview Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          <FeatureCard 
            icon={<Camera className="text-white" size={24} />} 
            title={t('landing.features.disease.title')} 
            desc={t('landing.features.disease.desc')}
            color="bg-blue-500"
          />
          <FeatureCard 
            icon={<Sprout className="text-white" size={24} />} 
            title={t('landing.features.crop.title')} 
            desc={t('landing.features.crop.desc')}
            color="bg-emerald-500"
          />
          <FeatureCard 
            icon={<CloudSun className="text-white" size={24} />} 
            title={t('landing.features.weather.title')} 
            desc={t('landing.features.weather.desc')}
            color="bg-amber-500"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;