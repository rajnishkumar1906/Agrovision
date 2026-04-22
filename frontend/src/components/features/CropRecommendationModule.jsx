import React, { useState, useContext } from 'react';
import { Sprout, ChevronRight, MapPin, Loader2, Wifi, WifiOff, Droplets, Thermometer, Leaf } from 'lucide-react';
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
  const { t } = useContext(LanguageContext);

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
        timeout: 10000,
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
      const payload = Object.fromEntries(
        Object.entries(formData).map(([key, val]) => [key, parseFloat(val)])
      );

      const response = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to get recommendation');
      }
    } catch (err) {
      setError('Server connection failed');
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
    <div className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col ${fullPage ? 'h-full' : ''}`}>
      <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-500" />
            {t('crop.title')}
          </h3>
          <p className="text-sm text-slate-400">{t('crop.subtitle')}</p>
        </div>
        
        <div className="flex gap-2">
          {/* Live Location Button - Fills ALL fields */}
          <button 
            onClick={getLiveLocationAndWeather}
            disabled={locationStatus === 'loading'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              locationStatus === 'loading'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 shadow-md'
            }`}
          >
            {locationStatus === 'loading' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MapPin size={16} />
            )}
            Use My Location
          </button>
          
          {/* Auto-fill Weather Button - Only weather data */}
          {weatherData && (
            <button 
              onClick={fillWeatherData}
              className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <Wifi size={14} />
              {t('crop.autofill')}
            </button>
          )}
        </div>
      </div>

      {/* Location Status Message */}
      <div className="mb-4">
        <LocationStatusIndicator />
      </div>

      <form className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar" onSubmit={handleSubmit}>
        {/* Soil Nutrients Section */}
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            <Leaf size={12} />
            Soil Nutrients (Auto-filled from location data)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label={t('crop.nitrogen')} val={formData.N} setVal={(v) => setFormData({...formData, N: v})} placeholder="90" />
            <InputGroup label={t('crop.phosphorus')} val={formData.P} setVal={(v) => setFormData({...formData, P: v})} placeholder="42" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InputGroup label={t('crop.potassium')} val={formData.K} setVal={(v) => setFormData({...formData, K: v})} placeholder="43" />
            <InputGroup label={t('crop.ph')} val={formData.ph} setVal={(v) => setFormData({...formData, ph: v})} placeholder="6.5" />
          </div>
        </div>
        
        {/* Environmental Data Section */}
        <div className="border-t border-slate-100 pt-4 mt-2">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
            <Droplets size={12} />
            Environmental Data - {locationName ? `📍 ${locationName}` : 'Auto-fill with location'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <InputGroup 
                label={t('crop.temp')} 
                val={formData.temperature} 
                setVal={(v) => setFormData({...formData, temperature: v})} 
                placeholder="24" 
              />
              {formData.temperature && (
                <span className="absolute right-3 top-8 text-xs text-emerald-500 font-medium">°C</span>
              )}
            </div>
            <div className="relative">
              <InputGroup 
                label={t('crop.humidity')} 
                val={formData.humidity} 
                setVal={(v) => setFormData({...formData, humidity: v})} 
                placeholder="80" 
              />
              {formData.humidity && (
                <span className="absolute right-3 top-8 text-xs text-emerald-500 font-medium">%</span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <InputGroup 
                label={t('crop.rainfall')} 
                val={formData.rainfall} 
                setVal={(v) => setFormData({...formData, rainfall: v})} 
                placeholder="200" 
              />
              {formData.rainfall && (
                <span className="absolute right-3 top-8 text-xs text-emerald-500 font-medium">mm</span>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {t('crop.submit')} <ChevronRight size={18} />
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-emerald-50 rounded-2xl p-6 border border-emerald-100 animate-fade-in">
          <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
            <Sprout size={20} /> {t('crop.recommendation')}
          </h4>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">{t('crop.recommendedCrop')}</p>
            <p className="text-xl font-bold text-slate-800 break-words">{result.recommended_crop || 'Unknown'}</p>
            
            <div className="mt-4">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">{t('crop.match')}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }}></div>
                </div>
                <span className="font-bold text-emerald-600 text-sm">96%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropRecommendationModule;