import React, { useState, useContext } from 'react';
import { Camera, UploadCloud, CheckCircle, XCircle, Info, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import useAuthStore from '../../store/useAuthStore';
import { LanguageContext } from '../../App';
import { getTranslatedCrop } from '../../utils/diseaseTranslations';

const DiseaseDetectionModule = ({ fullPage }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const token = useAuthStore((state) => state.token);
  const { t, language } = useContext(LanguageContext);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
    else if (e.type === "drop") {
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const selected = e.dataTransfer.files[0];
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
      }
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Pass language as query parameter to get Gemini translation from backend
      const response = await fetch(`${API_BASE_URL}/api/disease-detect?language=${language}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        // Backend now returns translated disease name via Gemini
        const resultData = data.data;
        
        setResult({
          predicted_crop: resultData.predicted_crop,
          disease: resultData.disease,
          disease_translated: resultData.disease_translated || resultData.disease,
          disease_key: resultData.disease_key,
          confidence: resultData.confidence,
          class_index: resultData.class_index,
          // If backend doesn't provide translation, fallback to local translations
          crop_translated: getTranslatedCrop(resultData.predicted_crop, language),
          original_disease: resultData.disease
        });
      } else {
        setError(data.message || 'Detection failed');
      }
    } catch (err) {
      console.error('Detection error:', err);
      setError('Server error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Get confidence value (handle different response formats)
  const getConfidence = () => {
    if (result?.confidence) return result.confidence;
    if (result?.confidence_score) return result.confidence_score;
    return 0;
  };

  // Get disease display text (prioritize Gemini translation)
  const getDiseaseDisplay = () => {
    if (result?.disease_translated) return result.disease_translated;
    if (result?.disease) return result.disease;
    return 'Unknown';
  };

  // Get original disease text for reference
  const getOriginalDisease = () => {
    if (result?.original_disease && result.original_disease !== getDiseaseDisplay()) {
      return result.original_disease;
    }
    return null;
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${fullPage ? 'h-full' : 'min-h-[600px]'} group border border-white/10`}>
      {/* Background Image with High Transparency */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/disease_detection_bg.png" 
          alt="Disease Detection Background" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        {/* Minimal blur and subtle dark overlays for text contrast */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/70"></div>
      </div>

      <div className="relative z-10 p-5 md:p-7 h-full flex flex-col custom-scrollbar overflow-y-auto">
        {/* Glassmorphism Header - More Transparent */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/20 shadow-2xl shadow-black/40">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/40 transform -rotate-3 group-hover:rotate-0 transition-transform">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                {t('disease.title')}
              </span>
            </h3>
            <p className="text-white/90 text-xs font-black mt-1 ml-1 drop-shadow-md">{t('disease.subtitle')}</p>
          </div>
          <div className="mt-3 md:mt-0 flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-400/30 backdrop-blur-xl shadow-lg">
            <div className="relative">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
            </div>
            <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em]">Neural Engine Active</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1">
          {/* Left Column: Upload Section */}
          <div className="flex-1 flex flex-col gap-6">
            <div 
              className={`relative border-2 border-dashed rounded-[2.5rem] p-6 text-center transition-all duration-700 cursor-pointer group/upload min-h-[320px] flex flex-col items-center justify-center overflow-hidden
                ${dragActive 
                  ? 'border-emerald-400 bg-emerald-500/20 scale-[1.02] shadow-emerald-500/20 shadow-2xl' 
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 shadow-xl'}
                ${preview ? 'border-emerald-400/50 bg-white/5' : ''}
                backdrop-blur-[2px]
              `}
              onDragEnter={handleDrag} 
              onDragLeave={handleDrag} 
              onDragOver={handleDrag} 
              onDrop={handleDrag}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
              
              {preview ? (
                <div className="relative w-full h-full animate-fade-in group/preview">
                  <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl opacity-0 group-hover/preview:opacity-100 transition-opacity duration-700"></div>
                  <img src={preview} alt="Preview" className="relative w-full max-h-[320px] object-contain rounded-2xl shadow-2xl border border-white/20 transform transition-transform duration-700 group-hover/preview:scale-[1.02]" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center backdrop-blur-md">
                    <div className="p-3 bg-white/10 rounded-full border border-white/20 mb-3">
                      <UploadCloud size={24} className="text-white" />
                    </div>
                    <p className="text-white font-black text-sm tracking-wide uppercase drop-shadow-md">
                      Change Photo
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
                    className="absolute -top-2 -right-2 p-2 bg-red-500/90 text-white rounded-xl shadow-2xl hover:bg-red-600 hover:scale-110 transition-all z-20 backdrop-blur-md border border-red-400/50"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 relative">
                  <div className="w-24 h-24 bg-white/10 rounded-[2rem] shadow-2xl flex items-center justify-center mb-6 group-hover/upload:scale-110 group-hover/upload:bg-emerald-500/20 transition-all duration-700 border border-white/20 backdrop-blur-md relative rotate-3 group-hover/upload:rotate-0">
                    <UploadCloud className="w-10 h-10 text-white drop-shadow-lg" />
                    <div className="absolute inset-0 rounded-[2rem] bg-emerald-400/30 animate-pulse opacity-40"></div>
                  </div>
                  <h4 className="text-white text-xl font-black mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{t('disease.upload')}</h4>
                  <p className="text-white/90 text-sm font-black max-w-[240px] leading-relaxed drop-shadow-md">
                    {language === 'hi' ? 'पौधे की पत्ती की फोटो यहाँ खींचें या अपलोड करें' : language === 'pa' ? 'ਪੌਦੇ ਦੇ ਪੱਤੇ ਦੀ ਫੋਟੋ ਇੱਥੇ ਖਿੱਚੋ ਜਾਂ ਅਪਲੋਡ ਕਰੋ' : 'Drag or upload a photo of the plant leaf'}
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={analyzeImage}
              disabled={!file || loading}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]
                ${!file || loading 
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 hover:shadow-emerald-500/40 border border-emerald-400/50 group-hover:translate-y-[-2px]'}
                backdrop-blur-md uppercase tracking-[0.2em]
              `}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Activity size={20} />
                  {t('disease.analyze')}
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results/Tips */}
          <div className="flex-1 flex flex-col gap-6">
            {result ? (
              <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] animate-fade-in flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-white text-lg flex items-center gap-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
                      <CheckCircle size={18} />
                    </div>
                    {t('disease.result')}
                  </h4>
                  <div className="px-4 py-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/30 backdrop-blur-md">
                    Analysis Complete
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Crop Name */}
                  {result.predicted_crop && (
                    <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 transform hover:scale-[1.02]">
                      <p className="text-[9px] text-white/60 uppercase font-black tracking-[0.3em] mb-1 drop-shadow-sm">
                        {language === 'hi' ? 'पहचानी गई फसल' : language === 'pa' ? 'ਪਛਾਣੀ ਗਈ ਫਸਲ' : 'Identified Crop'}
                      </p>
                      <p className="text-xl font-black text-white tracking-tight drop-shadow-md">
                        {result.crop_translated || result.predicted_crop}
                      </p>
                    </div>
                  )}
                  
                  {/* Disease Name */}
                  <div className="bg-emerald-500/10 backdrop-blur-xl p-5 rounded-2xl border border-emerald-500/30 shadow-2xl relative group/result overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover/result:translate-x-[100%] transition-transform duration-1000"></div>
                    <p className="text-[9px] text-emerald-300 uppercase font-black tracking-[0.3em] mb-1 drop-shadow-sm">{t('disease.disease')}</p>
                    <p className="text-2xl font-black text-white leading-tight drop-shadow-md">
                      {getDiseaseDisplay()}
                    </p>
                    {getOriginalDisease() && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg border border-white/10 backdrop-blur-md">
                        <span className="text-[8px] text-white/40 uppercase font-black tracking-tighter">Scientific:</span>
                        <span className="text-[9px] text-emerald-100/70 font-black italic tracking-wide">{getOriginalDisease()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Confidence Score */}
                  <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[9px] text-white/60 uppercase font-black tracking-[0.3em] drop-shadow-sm">{t('disease.confidence')}</p>
                      <span className="font-black text-emerald-400 text-lg drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{Math.round(getConfidence() * 100)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400 rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_20px_rgba(52,211,153,0.5)]" 
                        style={{ width: `${Math.min(getConfidence() * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Action */}
                  <button className="group/btn w-full mt-4 py-4 bg-white text-emerald-950 rounded-2xl text-sm font-black flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all duration-500 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] active:scale-95 overflow-hidden relative">
                    <div className="absolute inset-0 bg-emerald-500/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700"></div>
                    <Activity size={18} className="relative z-10 text-emerald-600" /> 
                    <span className="relative z-10 uppercase tracking-[0.1em]">
                      {language === 'hi' ? 'कृषिबॉट से उपचार पूछें' : language === 'pa' ? 'ਕ੍ਰਿਸ਼ੀਬੋਟ ਨੂੰ ਇਲਾਜ ਪੁੱਛੋ' : 'Get Treatment via KrishiBot'}
                    </span>
                    <ArrowRight size={18} className="relative z-10 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-2 transition-all duration-500" />
                  </button>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-500/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-red-500/30 flex flex-col items-center justify-center text-red-100 gap-4 shadow-2xl flex-1 animate-shake">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/40 shadow-2xl transform rotate-3">
                  <XCircle size={32} className="text-red-400 drop-shadow-lg" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-black text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Analysis Failed</p>
                  <p className="font-black text-red-100/70 max-w-[200px] text-xs drop-shadow-sm">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)} 
                  className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-2xl shadow-red-500/30 active:scale-95"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6">
                {/* Tips for accurate results */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/20 shadow-2xl flex-1 relative overflow-hidden group/tips">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full -mr-24 -mt-24 transition-transform duration-1000 group-hover/tips:scale-125"></div>
                  
                  <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 drop-shadow-sm">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                      <Info size={14} />
                    </div>
                    {language === 'hi' ? 'सटीक परिणाम के लिए सुझाव' : language === 'pa' ? 'ਸਹੀ ਨਤੀਜਿਆਂ ਲਈ ਸੁਝਾਅ' : 'Analysis Guidelines'}
                  </h5>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { 
                        title: { hi: 'स्पष्टता', pa: 'ਸਪਸ਼ਟਤਾ', en: 'Sharp Focus' },
                        desc: { hi: 'पत्ती पर ध्यान केंद्रित करें', pa: 'ਪੱਤੇ ਤੇ ਧਿਆਨ ਦਿਓ', en: 'Center leaf and ensure sharp focus' },
                        icon: <Camera className="text-blue-400" size={18} />,
                        color: 'from-blue-500/20 to-cyan-500/20'
                      },
                      { 
                        title: { hi: 'रोशनी', pa: 'ਰੋਸ਼ਨੀ', en: 'Natural Light' },
                        desc: { hi: 'पर्याप्त रोशनी सुनिश्चित करें', pa: 'ਢੁਕਵੀਂ ਰੋਸ਼ਨੀ ਯਕੀਨੀ ਬਣਾਓ', en: 'Use bright, indirect sunlight' },
                        icon: <Activity className="text-amber-400" size={18} />,
                        color: 'from-amber-500/20 to-orange-500/20'
                      },
                      { 
                        title: { hi: 'एंगल', pa: 'ਐਂਗਲ', en: 'Single Leaf' },
                        desc: { hi: 'पत्ती को सीधा रखें', pa: 'ਪੱਤੇ ਨੂੰ ਸਿੱਧਾ ਰੱਖੋ', en: 'Capture leaf against neutral background' },
                        icon: <ShieldCheck className="text-emerald-400" size={18} />,
                        color: 'from-emerald-500/20 to-teal-500/20'
                      }
                    ].map((tip, i) => (
                      <div key={i} className={`flex items-start gap-3 p-4 bg-gradient-to-br ${tip.color} rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-500 group/tip transform hover:scale-[1.02] backdrop-blur-md`}>
                        <div className="p-2.5 bg-white/10 rounded-xl group-hover/tip:scale-110 group-hover/tip:bg-white/20 transition-all duration-500 shadow-xl border border-white/10">
                          {tip.icon}
                        </div>
                        <div className="pt-0.5">
                          <p className="text-white font-black text-xs uppercase tracking-tight mb-0.5 drop-shadow-sm">{tip.title[language] || tip.title.en}</p>
                          <p className="text-white/80 text-[10px] font-black leading-relaxed drop-shadow-sm">{tip.desc[language] || tip.desc.en}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Steps - Simplified and Glassy */}
                <div className="px-6 py-4 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10">
                  <h4 className="text-[9px] font-black text-white/50 uppercase tracking-[0.4em] mb-4 text-center drop-shadow-sm">
                    AI Diagnostic Workflow
                  </h4>
                  <div className="flex items-center justify-between gap-2 max-w-xs mx-auto">
                    {[
                      { icon: <UploadCloud size={14} />, label: 'Upload' },
                      { icon: <Activity size={14} />, label: 'Analyze' },
                      { icon: <CheckCircle size={14} />, label: 'Result' }
                    ].map((step, i) => (
                      <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-2 group">
                          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-sm backdrop-blur-2xl group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:scale-110 transition-all duration-700 shadow-2xl">
                            {step.icon}
                          </div>
                          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest drop-shadow-sm">{step.label}</span>
                        </div>
                        {i < 2 && (
                          <div className="flex-1 h-[1.5px] bg-gradient-to-r from-white/5 via-white/20 to-white/5 rounded-full mt-[-16px]"></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionModule;