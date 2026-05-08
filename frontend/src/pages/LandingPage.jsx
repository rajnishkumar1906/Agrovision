import React, { useState, useContext } from 'react';
import { Leaf, Camera, Sprout, CloudSun, ArrowRight, Bot, ChevronDown } from 'lucide-react';
import { LanguageContext } from '../App';

const translations = {
  en: {
    heroBadge: "New: Advanced KrishiBot is here to help!",
    heroTitle: "Empowering Farmers with",
    heroSubtitle: "Smart Technology",
    heroDesc: "Identify crop diseases, get soil-specific recommendations, and talk to our expert in your own language.",
    ctaStart: "Get Started",
    ctaDemo: "Try Disease Scan",
    features: {
      disease: {
        title: "Crop Health",
        desc: "Identify diseases and get solutions with just one photo."
      },
      crop: {
        title: "Crop Guide",
        desc: "Get suggestions for the best crops to grow in your soil."
      },
      weather: {
        title: "Weather Info",
        desc: "Accurate weather updates for your farm planning."
      },
      krishibot: {
        title: "KrishiBot",
        desc: "Talk to our AI assistant for instant farming help in your language."
      }
    },
    nav: {
      login: "Login",
      register: "Register"
    }
  },
  hi: {
    heroBadge: "नया: आपकी मदद के लिए उन्नत कृषिबॉट यहाँ है!",
    heroTitle: "किसानों को सशक्त बनाना",
    heroSubtitle: "स्मार्ट तकनीक के साथ",
    heroDesc: "फसल रोगों की पहचान करें, मिट्टी-विशिष्ट सलाह प्राप्त करें, और अपनी भाषा में हमारे विशेषज्ञ से बात करें।",
    ctaStart: "शुरू करें",
    ctaDemo: "रोग जांच आजमाएं",
    features: {
      disease: {
        title: "फसल स्वास्थ्य",
        desc: "सिर्फ एक फोटो के साथ रोगों की पहचान और समाधान पाएं।"
      },
      crop: {
        title: "फसल गाइड",
        desc: "अपनी मिट्टी में उगाने के लिए सर्वोत्तम फसलों की सलाह लें।"
      },
      weather: {
        title: "मौसम की जानकारी",
        desc: "खेत की योजना बनाने के लिए सटीक मौसम अपडेट।"
      },
      krishibot: {
        title: "कृषिबॉट",
        desc: "अपनी भाषा में खेती की सलाह के लिए हमारे AI सहायक से बात करें।"
      }
    },
    nav: {
      login: "लॉगिन",
      register: "पंजीकरण"
    }
  },
  pa: {
    heroBadge: "ਨਵਾਂ: ਤੁਹਾਡੀ ਮਦਦ ਲਈ ਉੱਨਤ ਕ੍ਰਿਸ਼ੀਬੋਟ ਇੱਥੇ ਹੈ!",
    heroTitle: "ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ",
    heroSubtitle: "ਸਮਾਰਟ ਤਕਨਾਲੋਜੀ ਨਾਲ",
    heroDesc: "ਫਸਲਾਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਕਰੋ, ਮਿੱਟੀ-ਵਿਸ਼ੇਸ਼ ਸਲਾਹ ਪ੍ਰਾਪਤ ਕਰੋ, ਅਤੇ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਾਡੇ ਮਾਹਰ ਨਾਲ ਗੱਲਬਾਤ ਕਰੋ।",
    ctaStart: "ਸ਼ੁਰੂ ਕਰੋ",
    ctaDemo: "ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ ਕਰੋ",
    features: {
      disease: {
        title: "ਫਸਲ ਦੀ ਸਿਹਤ",
        desc: "ਸਿਰਫ਼ ਇੱਕ ਫੋਟੋ ਨਾਲ ਬਿਮਾਰੀਆਂ ਦੀ ਪਛਾਣ ਅਤੇ ਹੱਲ ਲੱਭੋ।"
      },
      crop: {
        title: "ਫਸਲ ਗਾਈਡ",
        desc: "ਆਪਣੀ ਮਿੱਟੀ ਵਿੱਚ ਉਗਾਉਣ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲਾਂ ਦੀ ਸਲਾਹ ਲਓ।"
      },
      weather: {
        title: "ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ",
        desc: "ਖੇਤ ਦੀ ਯੋਜਨਾਬੰਦੀ ਲਈ ਸਹੀ ਮੌਸਮ ਅਪਡੇਟ।"
      },
      krishibot: {
        title: "ਕ੍ਰਿਸ਼ੀਬੋਟ",
        desc: "ਖੇਤੀ ਦੀ ਸਹਾਇਤਾ ਲਈ ਸਾਡੇ AI ਸਹਾਇਕ ਨਾਲ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਗੱਲ ਕਰੋ।"
      }
    },
    nav: {
      login: "ਲੌਗਇਨ",
      register: "ਰਜਿਸਟਰ"
    }
  }
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform group">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const LandingPage = ({ onNavigate }) => {
  const { language, changeLanguage } = useContext(LanguageContext);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = translations[language] || translations.en;

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const LanguageSelector = () => (
    <div className="relative">
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-200"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="text-xs font-bold text-slate-700">{currentLang.name}</span>
        <ChevronDown 
          size={12} 
          className={`text-slate-500 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isLangOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsLangOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all duration-200 ${
                  language === lang.code
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <span className="ml-auto text-emerald-500 text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative">

      {/* Full Page Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/landing_bg.png")', 
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Reduced overlay for better visibility of the background image */}
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto backdrop-blur-md bg-white/30 rounded-b-3xl border-b border-white/20 shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xl group cursor-pointer">
            <Leaf className="fill-current group-hover:scale-110 transition-transform" />
            <span className="tracking-tight text-slate-900">AgroVision</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <LanguageSelector />
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => onNavigate('login')} className="text-slate-800 font-bold hover:text-emerald-700 transition-colors">
                {t.nav.login}
              </button>
              <button 
                onClick={() => onNavigate('register')}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                {t.nav.register}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative pt-16 pb-32 flex flex-col items-center text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-emerald-700 text-sm font-bold mb-8 border border-white/50 shadow-xl animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {t.heroBadge}
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 max-w-4xl leading-[1.1] drop-shadow-sm">
            {t.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">{t.heroSubtitle}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-800 max-w-2xl mb-12 leading-relaxed font-bold bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-24">
            <button 
              onClick={() => onNavigate('register')} 
              className="group w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-900/20 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {t.ctaStart} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('disease')}
              className="w-full sm:w-auto px-10 py-5 bg-white/90 backdrop-blur-md text-slate-800 border border-white/50 rounded-2xl font-bold text-lg hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10"
            >
              <Camera size={22} className="text-emerald-600" /> {t.ctaDemo}
            </button>
          </div>

          {/* Feature Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full px-4 mb-32">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl border border-white/50 shadow-2xl relative h-full">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                  <Camera className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{t.features.disease.title}</h3>
                <p className="text-slate-700 leading-relaxed font-semibold">{t.features.disease.desc}</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl border border-white/50 shadow-2xl relative h-full">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                  <Sprout className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{t.features.crop.title}</h3>
                <p className="text-slate-700 leading-relaxed font-semibold">{t.features.crop.desc}</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl border border-white/50 shadow-2xl relative h-full">
                <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                  <CloudSun className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{t.features.weather.title}</h3>
                <p className="text-slate-700 leading-relaxed font-semibold">{t.features.weather.desc}</p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl border border-white/50 shadow-2xl relative h-full">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform">
                  <Bot className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">{t.features.krishibot.title}</h3>
                <p className="text-slate-700 leading-relaxed font-semibold">{t.features.krishibot.desc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Presentation Section */}
        <div className="mt-32 w-full max-w-6xl px-4 text-left pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] border border-white/50 shadow-2xl">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80" 
                alt="Farmer using technology" 
                className="rounded-[2.5rem] shadow-2xl border-8 border-white/50"
              />
              <div className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 max-w-[200px] animate-bounce">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Leaf size={20} />
                  </div>
                  <span className="font-bold text-slate-900">Smart Farm</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">Helping thousands of farmers grow better crops every day.</p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                {language === 'hi' ? 'खेती करने का नया और आसान तरीका' : language === 'pa' ? 'ਖੇਤੀ ਕਰਨ ਦਾ ਨਵਾਂ ਅਤੇ ਸੌਖਾ ਤਰੀਕਾ' : 'The New and Easy Way to Farm'}
              </h2>
              <p className="text-lg text-slate-800 font-semibold leading-relaxed">
                {language === 'hi' ? 'हमारा लक्ष्य हर किसान को आधुनिक तकनीक से जोड़ना है ताकि वे अपनी फसलों का बेहतर ध्यान रख सकें और अधिक मुनाफा कमा सकें।' : language === 'pa' ? 'ਸਾਡਾ ਉਦੇਸ਼ ਹਰ ਕਿਸਾਨ ਨੂੰ ਆਧੁਨਿਕ ਤਕਨਾਲੋਜੀ ਨਾਲ ਜੋੜਨਾ ਹੈ ਤਾਂ ਜੋ ਉਹ ਆਪਣੀਆਂ ਫਸਲਾਂ ਦੀ ਬਿਹਤਰ ਦੇਖਭਾਲ ਕਰ ਸਕਣ ਅਤੇ ਵਧੇਰੇ ਮੁਨਾਫਾ ਕਮਾ ਸਕਣ।' : 'Our mission is to connect every farmer with modern technology so they can take better care of their crops and earn more profit.'}
              </p>
              <ul className="space-y-4">
                {[
                  { hi: 'फसल के रोगों की तुरंत पहचान', pa: 'ਫਸਲ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦੀ ਤੁਰੰਤ ਪਛਾਣ', en: 'Instant crop disease identification' },
                  { hi: 'मिट्टी के अनुसार सही खाद और फसल की सलाह', pa: 'ਮਿੱਟੀ ਅਨੁਸਾਰ ਸਹੀ ਖਾਦ ਅਤੇ ਫਸਲ ਦੀ ਸਲਾਹ', en: 'Best fertilizer and crop advice for your soil' },
                  { hi: 'अपनी भाषा में विशेषज्ञों से मदद', pa: 'ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਮਾਹਰਾਂ ਤੋਂ ਮਦਦ', en: 'Help from experts in your own language' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold text-slate-900 bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 hover:bg-white/40 transition-colors">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm shadow-lg">✓</div>
                    {item[language] || item.en}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;