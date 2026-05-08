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
      return result.recommended_crop || 'Unknown';
    }
    if (item.action === 'CHATBOT_QUERY') {
      const query = item.details?.query || 'No query';
      const result = item.details?.result || {};
      const answer = result.answer || result.response || 'No response';
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
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          {t('nav.history')}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full md:w-48"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer text-slate-600 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="DISEASE_DETECTION">Disease Detection</option>
              <option value="CROP_RECOMMENDATION">Crop Recommendation</option>
              <option value="CHATBOT_QUERY">KrishiBot</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400 font-medium">Searching history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-500 font-bold mb-1">No results found</p>
            <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
            {(searchTerm || filterAction !== 'ALL') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterAction('ALL'); }}
                className="mt-4 text-indigo-500 text-sm font-bold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
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
                <div className="mt-1 flex-shrink-0">{getIcon(item.action)}</div>
                <div className="text-slate-700 text-sm leading-relaxed flex-1">
                  {getDisplayText(item)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryModule;