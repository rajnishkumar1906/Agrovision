import React, { useState, useEffect, createContext } from 'react';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import Navbar from './components/layout/Navbar';
import useAuthStore from './store/useAuthStore';
import { API_BASE_URL } from './config';

// Create Language Context
export const LanguageContext = createContext();

const translations = {
  en: {
    appName: 'AgroVision',
    nav: {
      dashboard: 'Dashboard',
      diseaseDetect: 'Disease Detection',
      cropGuide: 'Crop Guide',
      history: 'History',
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    },
    auth: {
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Sign in to your account',
      registerTitle: 'Create Account',
      registerSubtitle: 'Join AgroVision today',
      username: 'Username',
      email: 'Email Address',
      password: 'Password',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signUp: 'Sign up',
      logIn: 'Log in'
    },
    dashboard: {
      overview: 'Dashboard Overview',
      welcome: 'Welcome back',
      summary: 'Here\'s your farming intelligence summary',
      weather: 'Local Weather',
      soilNitrogen: 'Soil Health',
      alerts: 'Alerts',
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity',
      viewAll: 'View All Activity'
    },
    crop: {
      title: 'Crop Recommendation',
      subtitle: 'AI-powered crop suggestions',
      autofill: 'Auto-fill Weather',
      nitrogen: 'Nitrogen (N)',
      phosphorus: 'Phosphorus (P)',
      potassium: 'Potassium (K)',
      ph: 'pH Level',
      envData: 'Environmental Data',
      temp: 'Temperature (°C)',
      humidity: 'Humidity (%)',
      rainfall: 'Rainfall (mm)',
      submit: 'Get Recommendations',
      recommendation: 'AI Recommendation',
      recommendedCrop: 'Recommended Crop',
      match: 'Match Confidence'
    },
    disease: {
      title: 'Disease Detection',
      subtitle: 'Upload leaf image for analysis',
      upload: 'Click or drag to upload',
      analyze: 'Analyze Image',
      result: 'Analysis Result',
      disease: 'Detected Disease',
      confidence: 'Confidence Score'
    },
    landing: {
      heroBadge: 'AI-Powered Farming Assistant',
      heroTitle: 'Smart Farming with',
      heroSubtitle: 'AgroVision AI',
      heroDesc: 'Detect crop diseases, get personalized crop recommendations, and access real-time weather data - all in one platform.',
      ctaStart: 'Get Started Free',
      ctaDemo: 'Try Disease Detection',
      features: {
        disease: {
          title: 'Disease Detection',
          desc: 'Upload leaf photos and get instant AI-powered disease diagnosis with treatment suggestions.'
        },
        crop: {
          title: 'Crop Recommendation',
          desc: 'Get personalized crop suggestions based on your soil nutrients and weather conditions.'
        },
        weather: {
          title: 'Weather Intelligence',
          desc: 'Access hyper-local weather data for better farm planning and management.'
        }
      }
    },
    common: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      logout: 'Logout',
      areYouSure: 'Are you sure?',
    },
    logoutModal: {
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout? ',
      cancel: 'Cancel',
      confirm: 'Logout'
    }
  },
  hi: {
    appName: 'एग्रोविजन',
    nav: {
      dashboard: 'डैशबोर्ड',
      diseaseDetect: 'रोग पहचान',
      cropGuide: 'फसल गाइड',
      history: 'इतिहास',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      logout: 'लॉगआउट'
    },
    auth: {
      loginTitle: 'वापसी पर स्वागत है',
      loginSubtitle: 'अपने खाते में साइन इन करें',
      registerTitle: 'खाता बनाएं',
      registerSubtitle: 'आज ही एग्रोविजन से जुड़ें',
      username: 'उपयोगकर्ता नाम',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      signIn: 'साइन इन',
      createAccount: 'खाता बनाएं',
      noAccount: 'खाता नहीं है?',
      haveAccount: 'पहले से खाता है?',
      signUp: 'साइन अप',
      logIn: 'लॉग इन'
    },
    dashboard: {
      overview: 'डैशबोर्ड अवलोकन',
      welcome: 'वापसी पर स्वागत है',
      summary: 'आपकी खेती बुद्धिमत्ता सारांश',
      weather: 'स्थानीय मौसम',
      soilNitrogen: 'मिट्टी स्वास्थ्य',
      alerts: 'सूचनाएं',
      recentActivity: 'हालिया गतिविधि',
      noActivity: 'कोई हालिया गतिविधि नहीं',
      viewAll: 'सभी गतिविधियां देखें'
    },
    crop: {
      title: 'फसल अनुशंसा',
      subtitle: 'एआई-संचालित फसल सुझाव',
      autofill: 'मौसम भरें',
      nitrogen: 'नाइट्रोजन (N)',
      phosphorus: 'फॉस्फोरस (P)',
      potassium: 'पोटेशियम (K)',
      ph: 'पीएच स्तर',
      envData: 'पर्यावरण डेटा',
      temp: 'तापमान (°C)',
      humidity: 'आर्द्रता (%)',
      rainfall: 'वर्षा (मिमी)',
      submit: 'अनुशंसा प्राप्त करें',
      recommendation: 'एआई अनुशंसा',
      recommendedCrop: 'अनुशंसित फसल',
      match: 'मिलान विश्वसनीयता'
    },
    disease: {
      title: 'रोग पहचान',
      subtitle: 'विश्लेषण के लिए पत्ती की फोटो अपलोड करें',
      upload: 'अपलोड करने के लिए क्लिक करें',
      analyze: 'छवि विश्लेषण करें',
      result: 'विश्लेषण परिणाम',
      disease: 'पहचाना गया रोग',
      confidence: 'विश्वसनीयता स्कोर'
    },
    landing: {
      heroBadge: 'एआई-संचालित किसान सहायक',
      heroTitle: 'स्मार्ट खेती',
      heroSubtitle: 'एग्रोविजन एआई के साथ',
      heroDesc: 'फसल रोगों का पता लगाएं, व्यक्तिगत फसल अनुशंसाएं प्राप्त करें, और वास्तविक समय मौसम डेटा देखें - सभी एक मंच पर।',
      ctaStart: 'मुफ्त शुरू करें',
      ctaDemo: 'रोग पहचान आजमाएं',
      features: {
        disease: {
          title: 'रोग पहचान',
          desc: 'पत्ती की फोटो अपलोड करें और तुरंत एआई-संचालित रोग निदान प्राप्त करें।'
        },
        crop: {
          title: 'फसल अनुशंसा',
          desc: 'अपनी मिट्टी के पोषक तत्वों और मौसम के आधार पर व्यक्तिगत फसल सुझाव प्राप्त करें।'
        },
        weather: {
          title: 'मौसम बुद्धिमत्ता',
          desc: 'बेहतर खेती योजना के लिए स्थानीय मौसम डेटा प्राप्त करें।'
        }
      }
    },
    common: {
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      logout: 'लॉगआउट',
      areYouSure: 'क्या आप सुनिश्चित हैं?',
    },
    logoutModal: {
      title: 'लॉगआउट की पुष्टि करें',
      message: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
      cancel: 'रद्द करें',
      confirm: 'लॉगआउट'
    }
  },
  pa: {
    appName: 'ਐਗਰੋਵਿਜ਼ਨ',
    nav: {
      dashboard: 'ਡੈਸ਼ਬੋਰਡ',
      diseaseDetect: 'ਰੋਗ ਪਛਾਣ',
      cropGuide: 'ਫਸਲ ਗਾਈਡ',
      history: 'ਇਤਿਹਾਸ',
      login: 'ਲਾਗਿਨ',
      register: 'ਰਜਿਸਟਰ',
      logout: 'ਲਾਗਆਉਟ'
    },
    auth: {
      loginTitle: 'ਵਾਪਸੀ ਤੇ ਸੁਆਗਤ ਹੈ',
      loginSubtitle: 'ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸਾਈਨ ਇਨ ਕਰੋ',
      registerTitle: 'ਖਾਤਾ ਬਣਾਓ',
      registerSubtitle: 'ਅੱਜ ਹੀ ਐਗਰੋਵਿਜ਼ਨ ਨਾਲ ਜੁੜੋ',
      username: 'ਉਪਭੋਗਤਾ ਨਾਮ',
      email: 'ਈਮੇਲ ਪਤਾ',
      password: 'ਪਾਸਵਰਡ',
      signIn: 'ਸਾਈਨ ਇਨ',
      createAccount: 'ਖਾਤਾ ਬਣਾਓ',
      noAccount: 'ਖਾਤਾ ਨਹੀਂ ਹੈ?',
      haveAccount: 'ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?',
      signUp: 'ਸਾਈਨ ਅਪ',
      logIn: 'ਲਾਗ ਇਨ'
    },
    dashboard: {
      overview: 'ਡੈਸ਼ਬੋਰਡ ਸੰਖੇਪ',
      welcome: 'ਵਾਪਸੀ ਤੇ ਸੁਆਗਤ ਹੈ',
      summary: 'ਤੁਹਾਡੀ ਖੇਤੀ ਬੁੱਧੀਮਤਾ ਸੰਖੇਪ',
      weather: 'ਸਥਾਨਕ ਮੌਸਮ',
      soilNitrogen: 'ਮਿੱਟੀ ਸਿਹਤ',
      alerts: 'ਸੂਚਨਾਵਾਂ',
      recentActivity: 'ਹਾਲੀਆ ਗਤੀਵਿਧੀ',
      noActivity: 'ਕੋਈ ਹਾਲੀਆ ਗਤੀਵਿਧੀ ਨਹੀਂ',
      viewAll: 'ਸਾਰੀਆਂ ਗਤੀਵਿਧੀਆਂ ਦੇਖੋ'
    },
    crop: {
      title: 'ਫਸਲ ਸਿਫਾਰਸ਼',
      subtitle: 'ਏਆਈ-ਸੰਚਾਲਿਤ ਫਸਲ ਸੁਝਾਅ',
      autofill: 'ਮੌਸਮ ਭਰੋ',
      nitrogen: 'ਨਾਈਟ੍ਰੋਜਨ (N)',
      phosphorus: 'ਫਾਸਫੋਰਸ (P)',
      potassium: 'ਪੋਟਾਸ਼ੀਅਮ (K)',
      ph: 'ਪੀਐਚ ਪੱਧਰ',
      envData: 'ਵਾਤਾਵਰਣ ਡੇਟਾ',
      temp: 'ਤਾਪਮਾਨ (°C)',
      humidity: 'ਨਮੀ (%)',
      rainfall: 'ਵਰਖਾ (ਮਿਮੀ)',
      submit: 'ਸਿਫਾਰਸ਼ ਪ੍ਰਾਪਤ ਕਰੋ',
      recommendation: 'ਏਆਈ ਸਿਫਾਰਸ਼',
      recommendedCrop: 'ਸਿਫਾਰਸ਼ੀ ਫਸਲ',
      match: 'ਮਿਲਾਨ ਵਿਸ਼ਵਸਨੀਯਤਾ'
    },
    disease: {
      title: 'ਰੋਗ ਪਛਾਣ',
      subtitle: 'ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ',
      upload: 'ਅਪਲੋਡ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
      analyze: 'ਚਿੱਤਰ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ',
      result: 'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ',
      disease: 'ਪਛਾਣਿਆ ਗਿਆ ਰੋਗ',
      confidence: 'ਵਿਸ਼ਵਸਨੀਯਤਾ ਸਕੋਰ'
    },
    landing: {
      heroBadge: 'ਏਆਈ-ਸੰਚਾਲਿਤ ਕਿਸਾਨ ਸਹਾਇਕ',
      heroTitle: 'ਸਮਾਰਟ ਖੇਤੀ',
      heroSubtitle: 'ਐਗਰੋਵਿਜ਼ਨ ਏਆਈ ਨਾਲ',
      heroDesc: 'ਫਸਲ ਰੋਗਾਂ ਦਾ ਪਤਾ ਲਗਾਓ, ਵਿਅਕਤੀਗਤ ਫਸਲ ਸਿਫਾਰਸ਼ਾਂ ਪ੍ਰਾਪਤ ਕਰੋ, ਅਤੇ ਅਸਲ-ਸਮੇਂ ਮੌਸਮ ਡੇਟਾ ਦੇਖੋ - ਸਭ ਇੱਕ ਮੰਚ ਤੇ।',
      ctaStart: 'ਮੁਫਤ ਸ਼ੁਰੂ ਕਰੋ',
      ctaDemo: 'ਰੋਗ ਪਛਾਣ ਅਜ਼ਮਾਓ',
      features: {
        disease: {
          title: 'ਰੋਗ ਪਛਾਣ',
          desc: 'ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਤੁਰੰਤ ਏਆਈ-ਸੰਚਾਲਿਤ ਰੋਗ ਨਿਦਾਨ ਪ੍ਰਾਪਤ ਕਰੋ।'
        },
        crop: {
          title: 'ਫਸਲ ਸਿਫਾਰਸ਼',
          desc: 'ਆਪਣੀ ਮਿੱਟੀ ਦੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਅਤੇ ਮੌਸਮ ਦੇ ਆਧਾਰ ਤੇ ਵਿਅਕਤੀਗਤ ਫਸਲ ਸੁਝਾਅ ਪ੍ਰਾਪਤ ਕਰੋ।'
        },
        weather: {
          title: 'ਮੌਸਮ ਬੁੱਧੀਮਤਾ',
          desc: 'ਬਿਹਤਰ ਖੇਤੀ ਯੋਜਨਾ ਲਈ ਸਥਾਨਕ ਮੌਸਮ ਡੇਟਾ ਪ੍ਰਾਪਤ ਕਰੋ।'
        }
      }
    },
    common: {
      cancel: 'ਰੱਦ ਕਰੋ',
      confirm: 'ਪੁਸ਼ਟੀ ਕਰੋ',
      logout: 'ਲਾਗਆਉਟ',
      areYouSure: 'ਕੀ ਤੁਹਾਨੂੰ ਯਕੀਨ ਹੈ?',
    },
    logoutModal: {
      title: 'ਲਾਗਆਉਟ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
      message: 'ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਲਾਗਆਉਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',
      cancel: 'ਰੱਦ ਕਰੋ',
      confirm: 'ਲਾਗਆਉਟ'
    }
  }
};

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [language, setLanguage] = useState('en');
  const { isAuthenticated, token, user, logout } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, token, currentPage]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value) value = value[k];
      else break;
    }
    return value || key;
  };

  const handleNavigate = (page) => {
    if (page === 'dashboard' && !isAuthenticated) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('landing');
  };

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard');
  };

  // Show dashboard if authenticated and on dashboard or related pages
  if (isAuthenticated && (currentPage === 'dashboard' || currentPage === 'disease' || currentPage === 'crop' || currentPage === 'history')) {
    return (
      <LanguageContext.Provider value={{ t, language, changeLanguage }}>
        <Dashboard 
          onLogout={handleLogout} 
          initialTab={currentPage === 'dashboard' ? 'dashboard' : currentPage}
        />
      </LanguageContext.Provider>
    );
  }

  // Landing page with navbar
  if (currentPage === 'landing') {
    return (
      <LanguageContext.Provider value={{ t, language, changeLanguage }}>
        <div className="min-h-screen bg-white">
          <Navbar onNavigate={handleNavigate} />
          <LandingPage onNavigate={handleNavigate} />
        </div>
      </LanguageContext.Provider>
    );
  }

  // Auth pages
  if (currentPage === 'login' || currentPage === 'register') {
    return (
      <LanguageContext.Provider value={{ t, language, changeLanguage }}>
        <AuthPage 
          type={currentPage}
          onSuccess={handleAuthSuccess}
          onNavigate={handleNavigate}
        />
      </LanguageContext.Provider>
    );
  }

  // Fallback to landing
  return (
    <LanguageContext.Provider value={{ t, language, changeLanguage }}>
      <div className="min-h-screen bg-white">
        <Navbar onNavigate={handleNavigate} />
        <LandingPage onNavigate={handleNavigate} />
      </div>
    </LanguageContext.Provider>
  );
}

export default App;