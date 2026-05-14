import React, { useState, useEffect, useContext } from 'react';
import { History, Camera, Sprout, MessageCircle, Search, Filter, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import useAuthStore from '../../store/useAuthStore';
import { LanguageContext } from '../../App';

const HistoryModule = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const token = useAuthStore((state) => state.token);
  const { t } = useContext(LanguageContext);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/api/history`);
      if (filterAction !== 'ALL') url.searchParams.append('action', filterAction);
      if (searchTerm) url.searchParams.append('search', searchTerm);

      const response = await fetch(url.toString(), {
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [token, filterAction, searchTerm]);

  if (loading) return <div className="p-8 text-center text-slate-400">{t('dashboard.noActivity')}...</div>;

  // Helper to get display text based on action
  const getDisplayText = (item) => {
    if (item.action === 'DISEASE_DETECTION') {
      const result = item.details?.result || {};
      const disease = result.disease_translated || result.disease || 'Unknown';
      const crop = result.predicted_crop || '';
      return `${crop ? crop + ': ' : ''}${disease}`;
    }
    if (item.action === 'CROP_RECOMMENDATION') {
      const result = item.details?.result || {};
      const input = item.details?.input || {};
      return (
        <div className="space-y-3 mt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-4 gap-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">N</p>
              <p className="text-slate-800 font-bold">{input.N || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">P</p>
              <p className="text-slate-800 font-bold">{input.P || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">K</p>
              <p className="text-slate-800 font-bold">{input.K || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">pH</p>
              <p className="text-slate-800 font-bold">{input.ph || '-'}</p>
            </div>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Recommended Crop</p>
            <p className="text-slate-700 font-bold text-lg">{result.recommended_crop || 'Unknown'}</p>
          </div>
        </div>
      );
    }
    if (item.action === 'CHATBOT_QUERY') {
      const query = item.details?.query || 'No query';
      const result = item.details?.result || {};
      const answer = item.details?.response || result.answer || result.response || result.data?.answer || 'No response';
      return (
        <div className="space-y-3 mt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Question</p>
            <p className="text-slate-800 font-medium">{query}</p>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">KrishiBot Response</p>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{answer}</p>
          </div>
        </div>
      );
    }
    return item.details?.message || t('dashboard.noActivity');
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
    <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-full group border border-white/20 transition-all duration-700">
      {/* Background Layer with Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/disease_detection_bg.png"
          alt="History Background"
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105 opacity-80"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
          }}
        />

        {/* Overlays for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/70"></div>
        <div className="absolute inset-0 bg-emerald-900/5 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col custom-scrollbar-none overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white/80 backdrop-blur-xl p-5 rounded-[2rem] border border-white/40 shadow-xl">
          <div>
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-1 tracking-tight">
              <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 group-hover:rotate-12 transition-transform duration-500 shadow-sm">
                <History className="w-6 h-6 text-indigo-600" />
              </div>
              {t('nav.history')}
            </h3>
            <p className="text-slate-500 font-bold text-sm ml-1">Archive of your agricultural activity</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-10 py-3 bg-white/60 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all w-full md:w-48 backdrop-blur-md"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter */}
            <div className="relative group/filter">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/filter:text-emerald-500 transition-colors" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="pl-11 pr-10 py-3 bg-white/60 border border-slate-200 rounded-2xl text-sm text-slate-600 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all appearance-none cursor-pointer font-bold backdrop-blur-md"
              >
                <option value="ALL">All Categories</option>
                <option value="DISEASE_DETECTION">Disease Detection</option>
                <option value="CROP_RECOMMENDATION">Crop Recommendation</option>
                <option value="CHATBOT_QUERY">KrishiBot</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar-none relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-black uppercase tracking-widest">Searching history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-24 px-8 bg-white/70 backdrop-blur-xl rounded-[3rem] border border-white/40 shadow-xl">
              <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-sm">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-700 font-black text-xl mb-2">No results found</p>
              <p className="text-slate-400 font-bold text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item._id} className="group/item bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/40 shadow-lg hover:bg-white/95 transition-all duration-500 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full -mr-16 -mt-16 group-hover/item:scale-150 transition-transform duration-1000"></div>
                
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover/item:rotate-6 bg-white border border-slate-100`}>
                    {getIcon(item.action)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${getBadgeStyle(item.action)}`}>
                          {getBadgeLabel(item.action)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="text-slate-700 font-bold text-lg leading-relaxed drop-shadow-sm">
                      {getDisplayText(item)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModule;