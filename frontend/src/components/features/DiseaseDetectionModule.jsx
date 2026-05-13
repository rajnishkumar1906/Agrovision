import React, { useState, useContext } from 'react';
import { Camera, UploadCloud, CheckCircle, XCircle, Info, Activity, ShieldCheck, ArrowRight, Sprout, Bot } from 'lucide-react';
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
    <div className={`relative rounded-[3rem] overflow-hidden shadow-2xl ${fullPage ? 'h-full' : 'min-h-[650px]'} group border border-white/20 transition-all duration-700 hover:shadow-emerald-500/10`}>
      {/* Background Layer with Particles */}
      <div className="absolute inset-0 z-0 bg-[#0a1a10]">
        <img 
          src="/disease_detection_bg.png" 
          alt="Disease Detection Background" 
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105 opacity-80"
        />
        
        {/* Animated Background Particles */}
        <div className="absolute inset-0 opacity-40">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1.5 h-1.5 bg-emerald-300 rounded-full animate-float-dots"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                opacity: Math.random() * 0.6 + 0.3
              }}
            />
          ))}
        </div>

        {/* Dynamic Overlays - Much subtler for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        <div className="absolute inset-0 bg-emerald-900/10 backdrop-blur-[0.5px]"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col custom-scrollbar-none overflow-y-auto">
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group/header">
          {/* Header Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/header:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 transform -rotate-6 group-hover/header:rotate-0 transition-all duration-500">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-lg">
                  {t('disease.title')}
                </h3>
                <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] drop-shadow-md">AI Plant Diagnostics</p>
              </div>
            </div>
            <p className="text-white/80 text-xs font-bold ml-1 drop-shadow-md">{t('disease.subtitle')}</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3 bg-black/20 px-5 py-3 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl">
            <div className="relative flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20 scale-150"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">System Status</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">Neural Engine Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Left Column: Interactive Upload */}
          <div className="flex-1 flex flex-col gap-8">
            <div 
              className={`relative border-2 border-dashed rounded-[3rem] p-8 text-center transition-all duration-700 cursor-pointer group/upload min-h-[380px] flex flex-col items-center justify-center overflow-hidden
                ${dragActive 
                  ? 'border-emerald-400 bg-white/20 scale-[1.01] shadow-[0_0_50px_rgba(16,185,129,0.3)]' 
                  : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15 shadow-2xl'}
                ${preview ? 'border-emerald-400/40 bg-black/30' : ''}
                backdrop-blur-xl
              `}
              onDragEnter={handleDrag} 
              onDragLeave={handleDrag} 
              onDragOver={handleDrag} 
              onDrop={handleDrag}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
              
              {preview ? (
                <div className="relative w-full h-full animate-fade-in group/preview flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-0 group-hover/preview:opacity-100 transition-opacity duration-1000"></div>
                  <div className="relative rounded-3xl overflow-hidden border border-white/30 shadow-2xl">
                    <img src={preview} alt="Preview" className="w-full max-h-[380px] object-contain transform transition-transform duration-1000 group-hover/preview:scale-105" />
                    
                    {/* Scanning Animation */}
                    {loading && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,1)] animate-scan z-20"></div>
                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-brightness-150 z-10"></div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-md">
                      <div className="p-4 bg-white/20 rounded-2xl border border-white/30 mb-4 transform scale-90 group-hover/preview:scale-100 transition-transform duration-500">
                        <UploadCloud size={32} className="text-white" />
                      </div>
                      <p className="text-white font-black text-xs tracking-[0.3em] uppercase drop-shadow-2xl">
                        Replace Specimen
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
                    className="absolute top-0 right-0 p-3 bg-red-500/90 text-white rounded-2xl shadow-2xl hover:bg-red-600 hover:scale-110 transition-all z-30 backdrop-blur-xl border border-red-400/50"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 relative group/empty">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    <div className="w-28 h-28 bg-white/10 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-white/30 backdrop-blur-2xl relative transition-all duration-700 group-hover/upload:rotate-12 group-hover/upload:scale-110">
                      <UploadCloud className="w-12 h-12 text-white drop-shadow-2xl" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-[#0a1a10] shadow-xl animate-bounce">
                      <Camera size={18} className="text-white" />
                    </div>
                  </div>
                  <h4 className="text-white text-2xl font-black mb-4 tracking-tight drop-shadow-2xl">{t('disease.upload')}</h4>
                  <p className="text-white/60 text-xs font-black max-w-[260px] leading-relaxed uppercase tracking-[0.2em] text-center drop-shadow-md">
                    Drag specimen or click to capture leaf photo
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={analyzeImage}
              disabled={!file || loading}
              className={`w-full py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group/btn
                ${!file || loading 
                  ? 'bg-white/10 text-white/20 cursor-not-allowed border border-white/10' 
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400 text-white hover:shadow-emerald-500/40 border border-white/30 active:scale-95'}
                backdrop-blur-xl uppercase tracking-[0.3em]
              `}
            >
              {/* Button Shine Effect */}
              {file && !loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
              )}

              {loading ? (
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <span className="animate-pulse">Analyzing...</span>
                </div>
              ) : (
                <>
                  <Activity size={24} className={file ? 'animate-pulse' : ''} />
                  {t('disease.analyze')}
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Analysis Visualization */}
          <div className="flex-1 flex flex-col gap-8">
            {result ? (
              <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] animate-fade-in flex-1 relative overflow-hidden group/result">
                {/* Glow Backgrounds */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 blur-[80px] rounded-full -ml-24 -mb-24"></div>
                
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-black text-white text-xl flex items-center gap-4 drop-shadow-2xl">
                    <div className="p-3 bg-emerald-500 rounded-2xl shadow-xl border border-white/20">
                      <CheckCircle size={22} />
                    </div>
                    {t('disease.result')}
                  </h4>
                  <div className="px-5 py-2 bg-emerald-500/30 text-emerald-100 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-white/20 backdrop-blur-xl shadow-lg">
                    Diagnostic Validated
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* Crop Profile */}
                  <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 hover:bg-white/20 transition-all duration-700 transform hover:scale-[1.02] shadow-xl group/card">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] text-white/60 uppercase font-black tracking-[0.4em]">Specimen Source</p>
                      <Sprout size={16} className="text-emerald-300" />
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight group-hover/card:text-emerald-300 transition-colors duration-500 drop-shadow-md">
                      {result.crop_translated || result.predicted_crop}
                    </p>
                  </div>
                  
                  {/* Disease Diagnostic */}
                  <div className="bg-emerald-500/20 backdrop-blur-3xl p-7 rounded-[2rem] border border-white/30 shadow-2xl relative group/diag overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/diag:translate-x-full transition-transform duration-[2000ms]"></div>
                    <p className="text-[10px] text-emerald-300 uppercase font-black tracking-[0.4em] mb-3 drop-shadow-md">Clinical Diagnostic</p>
                    <p className="text-3xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
                      {getDiseaseDisplay()}
                    </p>
                    {getOriginalDisease() && (
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/20 backdrop-blur-3xl">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-tighter">Taxonomy:</span>
                        <span className="text-[10px] text-emerald-200 font-black italic tracking-wide">{getOriginalDisease()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Confidence Visualization */}
                  <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-emerald-300" />
                        <p className="text-[10px] text-white/60 uppercase font-black tracking-[0.4em]">AI Confidence</p>
                      </div>
                      <span className="font-black text-emerald-300 text-2xl drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                        {Math.round(getConfidence() * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/10 p-1 shadow-inner relative">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400 rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_20px_rgba(52,211,153,0.8)] relative overflow-hidden" 
                        style={{ width: `${Math.min(getConfidence() * 100, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  {/* Treatment Action */}
                  <button className="group/action w-full py-5 bg-white text-emerald-950 rounded-[2rem] text-sm font-black flex items-center justify-center gap-4 hover:bg-emerald-50 transition-all duration-500 shadow-2xl active:scale-95 overflow-hidden relative border border-white/30">
                    <div className="absolute inset-0 bg-emerald-500/20 -translate-x-full group-hover/action:translate-x-0 transition-transform duration-700"></div>
                    <div className="relative z-10 p-2 bg-emerald-600 rounded-xl text-white shadow-lg">
                      <Bot size={20} />
                    </div>
                    <span className="relative z-10 uppercase tracking-[0.2em] font-black">
                      Consult KrishiBot Advisor
                    </span>
                    <ArrowRight size={20} className="relative z-10 opacity-0 group-hover/action:opacity-100 group-hover/action:translate-x-2 transition-all duration-500 text-emerald-600" />
                  </button>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 backdrop-blur-3xl rounded-[3rem] p-10 border border-red-500/40 flex flex-col items-center justify-center text-red-100 gap-6 shadow-2xl flex-1 animate-shake relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.2),transparent_70%)]"></div>
                <div className="w-20 h-20 bg-red-500/30 rounded-[2rem] flex items-center justify-center border border-red-500/50 shadow-2xl transform rotate-12 relative z-10">
                  <XCircle size={40} className="text-red-400 drop-shadow-2xl" />
                </div>
                <div className="text-center space-y-2 relative z-10">
                  <p className="font-black text-2xl tracking-tight text-white drop-shadow-2xl">Diagnostic Aborted</p>
                  <p className="font-bold text-red-100 max-w-[240px] text-sm leading-relaxed drop-shadow-md">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)} 
                  className="relative z-10 px-10 py-4 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-red-500 transition-all shadow-2xl active:scale-95 border border-white/20"
                >
                  Recalibrate
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-8">
                {/* Enhanced Guidelines Card */}
                <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/30 shadow-2xl flex-1 relative overflow-hidden group/tips">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover/tips:scale-150"></div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <h5 className="text-[11px] font-black text-emerald-300 uppercase tracking-[0.4em] flex items-center gap-3 drop-shadow-md">
                      <div className="p-2 bg-white/20 rounded-xl border border-white/30">
                        <Info size={16} />
                      </div>
                      Expert Guidelines
                    </h5>
                    <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { 
                        title: { hi: 'स्पष्टता', pa: 'ਸਪਸ਼ਟਤਾ', en: 'SHARP FOCUS' },
                        desc: { hi: 'पत्ती पर ध्यान केंद्रित करें', pa: 'ਪੱਤੇ ਤੇ ਧਿਆਨ ਦਿਓ', en: 'Center leaf and ensure sharp focus' },
                        icon: <Camera className="text-blue-300" size={20} />,
                        color: 'from-blue-500/20 to-cyan-500/20'
                      },
                      { 
                        title: { hi: 'रोशनी', pa: 'ਰੋਸ਼ਨੀ', en: 'NATURAL LIGHT' },
                        desc: { hi: 'पर्याप्त रोशनी सुनिश्चित करें', pa: 'ਢੁਕਵੀਂ ਰੋਸ਼ਨੀ ਯਕੀਨੀ ਬਣਾਓ', en: 'Use bright, indirect sunlight' },
                        icon: <Activity className="text-amber-300" size={20} />,
                        color: 'from-amber-500/20 to-orange-500/20'
                      },
                      { 
                        title: { hi: 'एंगल', pa: 'ਐਂਗਲ', en: 'SINGLE LEAF' },
                        desc: { hi: 'पत्ती को सीधा रखें', pa: 'ਪੱਤੇ ਨੂੰ ਸਿੱਧਾ ਰੱਖੋ', en: 'Capture leaf against neutral background' },
                        icon: <ShieldCheck className="text-emerald-300" size={20} />,
                        color: 'from-emerald-500/20 to-teal-500/20'
                      }
                    ].map((tip, i) => (
                      <div key={i} className={`flex items-center gap-5 p-5 bg-gradient-to-br ${tip.color} rounded-[2rem] border border-white/20 hover:border-white/40 transition-all duration-700 group/tip transform hover:scale-[1.03] backdrop-blur-2xl shadow-xl relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/tip:translate-x-full transition-transform duration-1000"></div>
                        <div className="p-4 bg-white/20 rounded-2xl group-hover/tip:scale-110 group-hover/tip:bg-white/30 transition-all duration-700 shadow-xl border border-white/30 relative z-10">
                          {tip.icon}
                        </div>
                        <div className="relative z-10">
                          <p className="text-white font-black text-sm uppercase tracking-[0.1em] mb-1 drop-shadow-lg">{tip.title[language] || tip.title.en}</p>
                          <p className="text-white/70 text-[11px] font-bold leading-relaxed drop-shadow-md">{tip.desc[language] || tip.desc.en}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Tracker */}
                <div className="p-8 bg-black/20 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl">
                  <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-6 text-center drop-shadow-md">
                    AI Diagnostic Pipeline
                  </h4>
                  <div className="flex items-center justify-between gap-4 max-w-sm mx-auto">
                    {[
                      { icon: <UploadCloud size={18} />, label: 'UPLOAD' },
                      { icon: <Activity size={18} />, label: 'ANALYZE' },
                      { icon: <CheckCircle size={18} />, label: 'RESULT' }
                    ].map((step, i) => (
                      <React.Fragment key={i}>
                        <div className="flex flex-col items-center gap-3 group">
                          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-700 shadow-2xl backdrop-blur-2xl relative
                            ${i === 0 && file ? 'bg-emerald-500 border-white/40 text-white' : 'bg-white/10 border-white/10 text-white/30'}
                            group-hover:scale-110
                          `}>
                            {step.icon}
                            {i === 0 && file && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-300 rounded-full border-2 border-[#0a1a10] animate-ping"></div>
                            )}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest drop-shadow-md ${i === 0 && file ? 'text-emerald-300' : 'text-white/20'}`}>
                            {step.label}
                          </span>
                        </div>
                        {i < 2 && (
                          <div className="flex-1 h-[2px] bg-white/10 rounded-full mt-[-24px] relative overflow-hidden">
                            <div className={`absolute inset-0 bg-emerald-500/50 transition-all duration-1000 ${i === 0 && file ? 'translate-x-0' : '-translate-x-full'}`}></div>
                          </div>
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