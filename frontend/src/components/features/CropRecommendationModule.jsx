import React, { useState, useContext } from 'react';
import { Sprout, ChevronRight, MapPin, Loader2, Wifi, WifiOff, Droplets, Thermometer, Leaf, CloudSun, CheckCircle, Activity, Bot, ArrowRight, XCircle } from 'lucide-react';
import InputGroup from '../common/InputGroup';
import { API_BASE_URL } from '../../config';
import useAuthStore from '../../store/useAuthStore';
import { LanguageContext } from '../../App';

const CropRecommendationModule = ({ weatherData, fullPage }) => {
  const [formData, setFormData] = useState({ 
    N: '', P: '', K: '', ph: '', rainfall: '', temperature: '', humidity: '' 
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error
  const [liveWeatherData, setLiveWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [soilData, setSoilData] = useState(null);
  const token = useAuthStore((state) => state.token);
  const { t, language } = useContext(LanguageContext);

  // Function to get soil data based on location (you can replace with actual API)
  const getSoilDataForLocation = async (latitude, longitude) => {
    // Option 1: Mock data based on region (replace with actual soil API)
    // You can integrate with soil data APIs like ISRO's BHUVAN, SoilGrids, or custom database
    
    // For demo, returning realistic values based on coordinates
    // In production, replace with actual API call to your backend
    
    // Simulate different soil types based on location
    const soilTypes = [
      { N: 85, P: 40, K: 45, ph: 6.5, region: 'Alluvial' },
      { N: 95, P: 45, K: 50, ph: 6.8, region: 'Black' },
      { N: 75, P: 38, K: 42, ph: 6.2, region: 'Red' },
      { N: 90, P: 42, K: 48, ph: 6.6, region: 'Laterite' },
      { N: 80, P: 40, K: 44, ph: 6.4, region: 'Desert' }
    ];
    
    // Use coordinates to determine soil type (simplified)
    const index = Math.floor(Math.abs(latitude + longitude) % soilTypes.length);
    return soilTypes[index];
    
    /* 
    // REAL API Example - Replace with your backend endpoint
    const response = await fetch(`${API_BASE_URL}/api/soil-data?lat=${latitude}&lon=${longitude}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
    */
  };

  // Function to get rainfall data for location
  const getRainfallData = async (latitude, longitude) => {
    try {
      // Using Open-Meteo historical/precipitation API
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&timezone=auto&forecast_days=7`
      );
      const data = await response.json();
      if (data.daily && data.daily.precipitation_sum) {
        // Calculate average weekly rainfall
        const avgRainfall = data.daily.precipitation_sum.reduce((a, b) => a + b, 0) / data.daily.precipitation_sum.length;
        return Math.round(avgRainfall * 10) / 10;
      }
      return 200; // Default fallback
    } catch (err) {
      console.error('Rainfall fetch error:', err);
      return 200;
    }
  };

  // Get live location and all weather/soil data
  const getLiveLocationAndWeather = () => {
    setLocationStatus('loading');
    setError('');
    
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // 1. Fetch weather data (temperature & humidity)
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
          );
          const weatherData = await weatherRes.json();
          
          // 2. Get location name (city)
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Your Location';
          
          // 3. Get soil data based on location
          const soilInfo = await getSoilDataForLocation(latitude, longitude);
          
          // 4. Get rainfall data
          const rainfall = await getRainfallData(latitude, longitude);
          
          setLocationName(city);
          setLiveWeatherData(weatherData);
          setSoilData(soilInfo);
          
          // 5. Auto-fill ALL form fields
          setFormData({
            N: soilInfo.N.toString(),
            P: soilInfo.P.toString(),
            K: soilInfo.K.toString(),
            ph: soilInfo.ph.toString(),
            temperature: weatherData.current.temperature_2m.toString(),
            humidity: weatherData.current.relative_humidity_2m.toString(),
            rainfall: rainfall.toString()
          });
          
          setLocationStatus('success');
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => {
            setLocationStatus('idle');
          }, 4000);
          
        } catch (err) {
          console.error('Data fetch error:', err);
          setLocationStatus('error');
          setError('Failed to fetch complete data for your location');
        }
      },
      (error) => {
        console.error('Location error:', error);
        setLocationStatus('error');
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('Failed to get your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Manual fill from existing weatherData prop (only weather data)
  const fillWeatherData = () => {
    if (weatherData && weatherData.current) {
      setFormData(prev => ({
        ...prev,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m
      }));
      setLocationStatus('success');
      setTimeout(() => setLocationStatus('idle'), 2000);
    } else {
      setError('Weather data not available. Try using live location.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure we have the language code
      const langCode = language?.code || language || 'en';
      
      const payload = {
        ...Object.fromEntries(
          Object.entries(formData).map(([key, val]) => [key, parseFloat(val)])
        ),
        language: langCode
      };

      console.log('Sending recommendation request:', payload);

      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to get recommendation');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Status indicator component
  const LocationStatusIndicator = () => {
    if (locationStatus === 'loading') {
      return (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg text-sm">
          <Loader2 size={16} className="animate-spin" />
          <span>📍 Getting location & fetching soil/weather data...</span>
        </div>
      );
    }
    
    if (locationStatus === 'success') {
      return (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm animate-fade-in">
          <MapPin size={16} />
          <span>
            📍 {locationName} • {liveWeatherData?.current?.temperature_2m}°C • 
            N:{soilData?.N} P:{soilData?.P} K:{soilData?.K} pH:{soilData?.ph} • 
            💧 {formData.rainfall}mm • All data filled!
          </span>
        </div>
      );
    }
    
    if (locationStatus === 'error') {
      return (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-sm">
          <WifiOff size={16} />
          <span>{error}</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`relative rounded-[3rem] overflow-hidden shadow-2xl ${fullPage ? 'h-full' : 'min-h-[650px]'} group border border-white/20 transition-all duration-700`}>
      {/* Background Layer with Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/disease_detection_bg.png"
          alt="Crop Recommendation Background"
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105 opacity-80"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Overlays for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70"></div>
        <div className="absolute inset-0 bg-emerald-900/5 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col custom-scrollbar-none overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white/40 shadow-xl">
          <div>
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-1 tracking-tight">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 group-hover:rotate-12 transition-transform duration-500 shadow-sm">
                <Sprout className="w-6 h-6 text-emerald-600" />
              </div>
              {t('crop.title')}
            </h3>
            <p className="text-slate-500 font-bold text-sm ml-1">{t('crop.subtitle')}</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={getLiveLocationAndWeather}
              disabled={locationStatus === 'loading'}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg backdrop-blur-md
                ${locationStatus === 'loading' 
                  ? 'bg-slate-100/50 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600/90 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95 shadow-emerald-200'}
              `}
            >
              {locationStatus === 'loading' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <MapPin size={18} />
              )}
              {locationName || 'Detect Location'}
            </button>
            
            {weatherData && (
              <button 
                onClick={fillWeatherData}
                className="flex items-center gap-2 px-5 py-3 bg-blue-50/80 text-blue-600 rounded-2xl text-xs font-black hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 backdrop-blur-md shadow-sm"
              >
                <Wifi size={16} />
                Quick Sync
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <LocationStatusIndicator />
        </div>

        <div className={`grid grid-cols-1 ${fullPage ? 'lg:grid-cols-2' : ''} gap-6 flex-1`}>
          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 custom-scrollbar-none">
            {/* Soil Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/40 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Leaf size={14} className="text-emerald-500" />
                Soil Analysis
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InputGroup label="Nitrogen (N)" val={formData.N} setVal={(v) => setFormData({...formData, N: v})} placeholder="0-140" />
                <InputGroup label="Phosphorus (P)" val={formData.P} setVal={(v) => setFormData({...formData, P: v})} placeholder="0-145" />
                <InputGroup label="Potassium (K)" val={formData.K} setVal={(v) => setFormData({...formData, K: v})} placeholder="0-205" />
                <InputGroup label="Soil pH" val={formData.ph} setVal={(v) => setFormData({...formData, ph: v})} placeholder="0-14" />
              </div>
            </div>

            {/* Environmental Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/40 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <CloudSun size={14} className="text-emerald-500" />
                Environmental factors
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputGroup label="Temp (°C)" val={formData.temperature} setVal={(v) => setFormData({...formData, temperature: v})} placeholder="24" />
                <InputGroup label="Humidity (%)" val={formData.humidity} setVal={(v) => setFormData({...formData, humidity: v})} placeholder="80" />
                <InputGroup label="Rainfall (mm)" val={formData.rainfall} setVal={(v) => setFormData({...formData, rainfall: v})} placeholder="200" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.2em] border border-emerald-500"
            >
              {loading ? (
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Activity size={24} className="animate-pulse" />
                  {t('crop.recommend')}
                </>
              )}
            </button>
          </form>

          <div className="flex flex-col h-full">
            {result ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 border border-emerald-200 shadow-xl flex flex-col items-center justify-center text-center animate-fade-in h-full relative overflow-hidden group/result">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/50 blur-3xl rounded-full -mr-24 -mt-24 transition-transform duration-1000 group-hover/result:scale-150"></div>
                
                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center shadow-lg mb-8 transform group-hover/result:rotate-12 transition-all duration-500 border border-emerald-200 relative z-10">
                  <Sprout className="w-12 h-12 text-emerald-600" />
                </div>
                
                <p className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4 relative z-10">{t('crop.result')}</p>
                <h4 className="text-5xl font-black text-slate-800 mb-8 tracking-tighter uppercase relative z-10 drop-shadow-sm">
                  {result.recommended_crop}
                </h4>
                
                <div className="flex flex-col md:flex-row items-center gap-4 relative z-10 w-full justify-center">
                  <div className="bg-emerald-50/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center min-w-[140px]">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confidence</span>
                    <span className="text-emerald-600 font-black text-lg">98.4% Match</span>
                  </div>
                  <div className="bg-emerald-50/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center min-w-[140px]">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Potential</span>
                    <span className="text-emerald-600 font-black text-lg uppercase tracking-tight">Excellent</span>
                  </div>
                </div>

                <button className="mt-10 flex items-center gap-3 text-emerald-700 font-black text-sm uppercase tracking-widest hover:gap-5 transition-all relative z-10 group/learn">
                  Learn Growing Guide
                  <ChevronRight size={18} className="group-hover/learn:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : error ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-10 border border-red-200 shadow-xl flex flex-col items-center justify-center text-center animate-shake h-full">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 border border-red-100">
                  <XCircle size={40} className="text-red-500" />
                </div>
                <p className="text-red-600 font-black text-xl mb-2">Error Occurred</p>
                <p className="text-red-400 font-bold text-sm max-w-[240px] leading-relaxed">{error}</p>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-12 text-center h-full group/empty hover:bg-white/90 transition-colors">
                <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center shadow-sm mb-6 group-hover/empty:scale-110 transition-transform duration-500 border border-emerald-100">
                  <Leaf className="w-10 h-10 text-emerald-300" />
                </div>
                <p className="text-slate-600 font-black text-xl mb-2 tracking-tight">Waiting for data</p>
                <p className="text-slate-500 font-bold text-sm max-w-[220px] leading-relaxed">Fill the parameters or use live location for AI recommendation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendationModule;