import React, { useState, useEffect, useContext } from 'react';
import { History, Camera, Sprout, MessageCircle } from 'lucide-react';
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

  // Helper to get display text based on action
  const getDisplayText = (item) => {
    if (item.action === 'DISEASE_DETECTION') {
      const disease = item.details?.result?.disease_translated || item.details?.result?.disease || 'Unknown';
      const crop = item.details?.result?.predicted_crop || '';
      return `${crop ? crop + ': ' : ''}${disease}`;
    }
    if (item.action === 'CROP_RECOMMENDATION') {
      return item.details?.result?.recommended_crop || 'Unknown';
    }
    if (item.action === 'CHATBOT_QUERY') {
      const query = item.details?.query || 'No query';
      const answer = item.details?.result?.answer || item.details?.result?.response || 'No response';
      return `${query}: ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}`;
    }
    return t('dashboard.noActivity');
  };

  // Helper to get icon based on action
  const getIcon = (action) => {
    if (action === 'DISEASE_DETECTION') return <Camera size={16} className="text-red-500" />;
    if (action === 'CROP_RECOMMENDATION') return <Sprout size={16} className="text-emerald-500" />;
    if (action === 'CHATBOT_QUERY') return <MessageCircle size={16} className="text-blue-500" />;
    return <History size={16} className="text-slate-400" />;
  };

  // Helper to get badge label
  const getBadgeLabel = (action) => {
    if (action === 'DISEASE_DETECTION') return t('nav.diseaseDetect');
    if (action === 'CROP_RECOMMENDATION') return t('nav.cropGuide');
    if (action === 'CHATBOT_QUERY') return 'KrishiBot';
    return action;
  };

  // Helper to get badge color
  const getBadgeStyle = (action) => {
    switch (action) {
      case 'DISEASE_DETECTION':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'CROP_RECOMMENDATION':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'CHATBOT_QUERY':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
        <History className="w-5 h-5 text-indigo-500" />
        {t('nav.history')}
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-center text-slate-400 py-10">{t('dashboard.noActivity')}</p>
        ) : (
          history.map((item) => (
            <div key={item._id} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(item.action)}`}>
                  {getBadgeLabel(item.action)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(item.action)}</div>
                <p className="font-semibold text-slate-700 text-sm leading-snug">
                  {getDisplayText(item)}
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