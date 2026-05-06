import React, { useState, useEffect } from 'react';
import { TestTube, AlertTriangle, History, Camera, Sprout, ChevronRight } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import WeatherCard from '../components/dashboard/WeatherCard';
import StatCard from '../components/dashboard/StatCard';
import DiseaseDetectionModule from '../components/features/DiseaseDetectionModule';
import CropRecommendationModule from '../components/features/CropRecommendationModule';
import HistoryModule from '../components/features/HistoryModule';
import ChatbotModule from '../components/features/ChatbotModule';
import useAuthStore from '../store/useAuthStore';
import { API_BASE_URL } from '../config';
import { useTranslation } from 'react-i18next';

const Dashboard = ({ onLogout, initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('Local Weather');
  const [recentActivity, setRecentActivity] = useState([]);
  const { user, token } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.logs) {
          setRecentActivity(data.data.logs.slice(0, 5));
        }
      } catch (e) {
        console.error("History fetch failed");
      }
    };

    if (activeTab === 'dashboard') {
      fetchHistory();
    }
  }, [token, activeTab]);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
        const weatherData = await weatherRes.json();
        setWeatherData(weatherData);

        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const geoData = await geoRes.json();
        const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Local Weather';
        setLocationName(city);
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        () => fetchWeather(28.61, 77.20)
      );
    } else {
      fetchWeather(28.61, 77.20);
    }
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-24">
          
          {activeTab === 'dashboard' && (
            <>
              <div className="relative overflow-hidden rounded-3xl bg-emerald-900 text-white p-8 mb-8 shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-bold mb-2">{t('dashboard.overview')}</h2>
                  <p className="text-emerald-100 text-lg">{t('dashboard.welcome')}, {user?.username || 'Farmer'}. {t('dashboard.summary')}</p>
                </div>
                {/* Decorative background image */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
                  <img 
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" 
                    alt="Farm background" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-emerald-900"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <WeatherCard data={weatherData} locationName={locationName || t('dashboard.weather')} />
                <StatCard title={t('dashboard.soilNitrogen')} value="Optimal" subValue="120 kg/ha" icon={<TestTube className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50 text-emerald-600" />
                <StatCard title={t('dashboard.alerts')} value={`2 ${t('common.new') || 'New'}`} subValue={t('dashboard.pestDetected') || 'Pest detected'} icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} color="bg-amber-50 text-amber-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Agricultural Initiative Banner */}
                  <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg group">
                    <img 
                      src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80" 
                      alt="Agricultural Initiative" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <span className="bg-emerald-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                        {t('dashboard.initiative.badge')}
                      </span>
                      <h4 className="text-xl font-bold">{t('dashboard.initiative.title')}</h4>
                      <p className="text-white/80 text-sm">{t('dashboard.initiative.desc')}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                      <History className="w-5 h-5 text-emerald-600" />
                      {t('dashboard.recentActivity')}
                    </h3>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((item) => (
                          <div key={item._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${item.action === 'DISEASE_DETECTION' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {item.action === 'DISEASE_DETECTION' ? <Camera size={18} /> : <Sprout size={18} />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">
                                  {item.action === 'DISEASE_DETECTION' ? t('nav.diseaseDetect') : t('nav.cropGuide')}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {item.action === 'DISEASE_DETECTION' 
                                    ? `Result: ${item.details?.result?.disease || 'Unknown'}` 
                                    : `Suggested: ${item.details?.result?.recommended_crop || 'Unknown'}`}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-4">{t('dashboard.noActivity')}</p>
                      )}
                    </div>
                    <button onClick={() => setActiveTab('history')} className="w-full mt-4 py-2 text-sm text-emerald-600 font-semibold hover:bg-emerald-50 rounded-lg transition-colors">
                      {t('dashboard.viewAll')}
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <CropRecommendationModule weatherData={weatherData} />
                </div>
              </div>

              {/* Farmer's Market / Ads Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-800">{t('dashboard.market.title')}</h3>
                  <button className="text-emerald-600 font-bold text-sm">{t('dashboard.market.seeAll')}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[
                    { id: 1, name: t('dashboard.market.products.wheat'), price: "₹2400/q", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80" },
                    { id: 2, name: t('dashboard.market.products.tomatoes'), price: "₹40/kg", img: "https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?auto=format&fit=crop&w=400&q=80" },
                    { id: 3, name: t('dashboard.market.products.honey'), price: "₹450/kg", img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80" },
                    { id: 4, name: t('dashboard.market.products.rice'), price: "₹6500/q", img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80" },
                    { id: 5, name: t('dashboard.market.products.chillies'), price: "₹60/kg", img: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80" }
                  ].map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                      <div className="h-32 overflow-hidden relative">
                        <img 
                          src={product.img} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                          {t('dashboard.market.fresh')}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-slate-800">{product.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-slate-500">{t('dashboard.market.local')}</p>
                          <p className="text-xs font-bold text-emerald-600">{product.price}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Expert Advice Section */}
              <div className="mt-8 mb-12">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{t('dashboard.advice.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: t('dashboard.advice.articles.pest'), date: "May 10, 2026", img: "https://images.unsplash.com/photo-1599933333394-84bc1f599df6?auto=format&fit=crop&w=600&q=80" },
                    { title: t('dashboard.advice.articles.irrigation'), date: "May 12, 2026", img: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80" },
                    { title: t('dashboard.advice.articles.soil'), date: "May 15, 2026", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80" }
                  ].map((tip, idx) => (
                    <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                      <div className="h-40 overflow-hidden relative">
                        <img src={tip.img} alt={tip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-600 shadow-sm">
                          {t('dashboard.advice.tips')}
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">{tip.date}</p>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">{tip.title}</h4>
                        <button className="text-emerald-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                          {t('dashboard.advice.readMore')} <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'disease' && <DiseaseDetectionModule fullPage />}
          {activeTab === 'crop' && <CropRecommendationModule weatherData={weatherData} fullPage />}
          {activeTab === 'history' && <HistoryModule />}

        </div>

        <ChatbotModule />
      </div>
    </div>
  );
};

export default Dashboard;