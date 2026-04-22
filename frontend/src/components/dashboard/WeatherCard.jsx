import React from 'react';
import { MapPin, Wind, Droplets, CloudSun } from 'lucide-react';

const WeatherCard = ({ data, locationName }) => {
  const current = data?.current;
  const weatherCode = current?.weather_code || 0;
  
  const getWeatherDesc = (code) => {
    if (code === 0) return "Clear Sky";
    if (code < 3) return "Partly Cloudy";
    if (code < 50) return "Foggy";
    if (code < 80) return "Rainy";
    return "Thunderstorm";
  };

  return (
    <div className="md:col-span-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-200 group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="relative z-10 flex justify-between h-full">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-100 mb-1">
              <MapPin size={14} />
              <span className="text-sm font-medium">{locationName || 'Local Weather'}</span>
            </div>
            {current ? (
              <>
                <h2 className="text-5xl font-bold mb-1 tracking-tight">{current.temperature_2m}°C</h2>
                <p className="text-blue-100 font-medium">{getWeatherDesc(weatherCode)}</p>
              </>
            ) : (
              <h2 className="text-3xl font-bold mt-2">Loading...</h2>
            )}
          </div>
          
          {current && (
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-blue-100 bg-black/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                <Wind size={12} /> {current.wind_speed_10m} km/h
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-100 bg-black/10 px-2 py-1 rounded-lg backdrop-blur-sm">
                <Droplets size={12} /> {current.relative_humidity_2m}%
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center items-end">
          <CloudSun size={80} className="text-yellow-300 drop-shadow-lg opacity-90 animate-pulse-slow" />
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;