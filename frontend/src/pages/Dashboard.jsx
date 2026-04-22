import React, { useState, useEffect, useContext } from 'react';
import { TestTube, AlertTriangle, History, Camera, Sprout } from 'lucide-react';
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
import { LanguageContext } from '../App';

const Dashboard = ({ onLogout, initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('Local Weather');
  const [recentActivity, setRecentActivity] = useState([]);
  const { user, token } = useAuthStore();
  const { t } = useContext(LanguageContext);

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
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.overview')}</h2>
                <p className="text-slate-500">{t('dashboard.welcome')}, {user?.username || 'Farmer'}. {t('dashboard.summary')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <WeatherCard data={weatherData} locationName={locationName || t('dashboard.weather')} />
                <StatCard title={t('dashboard.soilNitrogen')} value="Optimal" subValue="120 kg/ha" icon={<TestTube className="w-5 h-5 text-emerald-600" />} color="bg-emerald-50 text-emerald-600" />
                <StatCard title={t('dashboard.alerts')} value="2 New" subValue="Pest detected" icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} color="bg-amber-50 text-amber-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
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
                  <DiseaseDetectionModule />
                </div>
                <div className="lg:col-span-1">
                  <CropRecommendationModule weatherData={weatherData} />
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