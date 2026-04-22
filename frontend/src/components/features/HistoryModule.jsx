import React, { useState, useEffect, useContext } from 'react';
import { History, Camera, Sprout } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import useAuthStore from '../../store/useAuthStore';
import { LanguageContext } from '../../App';

const HistoryModule = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.logs) {
          setHistory(data.data.logs);
        }
      } catch (e) {
        console.error("History fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  if (loading) return <div className="p-8 text-center text-slate-400">{t('dashboard.noActivity')}...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-purple-500" />
        {t('nav.history')}
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {history.length === 0 ? (
          <p className="text-center text-slate-400 py-10">{t('dashboard.noActivity')}</p>
        ) : (
          history.map((item) => (
            <div key={item._id} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  item.action === 'DISEASE_DETECTION' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.action === 'DISEASE_DETECTION' ? t('nav.diseaseDetect') : t('nav.cropGuide')}
                </span>
                <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.action === 'DISEASE_DETECTION' ? <Camera size={16} className="text-slate-400" /> : <Sprout size={16} className="text-slate-400" />}
                <p className="font-semibold text-slate-700 text-sm">
                  {item.action === 'DISEASE_DETECTION' 
                    ? `${t('disease.result')}: ${item.details?.result?.disease || 'Unknown'}` 
                    : `${t('crop.recommendation')}: ${item.details?.result?.recommended_crop || 'Unknown'}`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryModule;