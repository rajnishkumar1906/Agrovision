import React, { useState, useEffect } from 'react';
import { Leaf, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import useAuthStore from '../store/useAuthStore';
import useLanguageStore from '../store/useLanguageStore';
import { useTranslation } from 'react-i18next';

const AuthPage = ({ type, onSuccess, onNavigate }) => {
  const { language: currentLang } = useLanguageStore();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    preferredLanguage: currentLang || 'en',
    gender: 'male'
  });
  
  // Update formData if currentLang changes (e.g., from landing page)
  useEffect(() => {
    if (currentLang && type === 'register') {
      setFormData(prev => ({ ...prev, preferredLanguage: currentLang }));
    }
  }, [currentLang, type]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pa', name: 'Punjabi' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success || response.ok) {
        if (type === 'login') {
          const user = data.data.user;
          setAuth(user, data.data.token);
          if (user.preferredLanguage) {
            setLanguage(user.preferredLanguage);
          }
          onSuccess();
        } else {
          onNavigate('login');
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/auth_bg.png")' }}
      >
        <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-md w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/20 relative z-10 my-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
            <Leaf className="fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {type === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {type === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{t('auth.username')}</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Farmer John"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}
          {type === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{t('auth.preferredLanguage') || 'Preferred Language'}</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({...formData, preferredLanguage: e.target.value})}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          )}
          {type === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{t('auth.gender') || 'Gender'}</label>
              <div className="flex gap-4 mt-2">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g })}
                    className={`flex-1 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      formData.gender === g
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {g === 'male' ? (currentLang === 'hi' ? 'पुरुष' : currentLang === 'pa' ? 'ਪੁਰਸ਼' : 'Male') :
                     g === 'female' ? (currentLang === 'hi' ? 'महिला' : currentLang === 'pa' ? 'ਮਹਿਲਾ' : 'Female') :
                     (currentLang === 'hi' ? 'अन्य' : currentLang === 'pa' ? 'ਹੋਰ' : 'Other')}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{t('auth.email')}</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">{t('auth.password')}</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              type === 'login' ? t('auth.signIn') : t('auth.createAccount')
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {type === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
          <button 
            onClick={() => onNavigate(type === 'login' ? 'register' : 'login')}
            className="text-emerald-600 font-bold hover:underline ml-1"
          >
            {type === 'login' ? t('auth.signUp') : t('auth.logIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;