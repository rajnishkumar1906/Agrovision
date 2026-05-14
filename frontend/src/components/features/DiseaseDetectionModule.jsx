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
    <div className={`relative rounded-[3rem] overflow-hidden shadow-2xl ${fullPage ? 'h-full' : 'min-h-[650px]'} group border border-white/20 transition-all duration-700`}>
      {/* Background Layer with Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/disease_detection_bg.png"
          alt="Disease Detection Background"
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105 opacity-80"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80';
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
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 group-hover:rotate-12 transition-transform duration-500">
                <Camera className="w-6 h-6 text-emerald-600" />
              </div>
              {t('disease.title')}
            </h3>
            <p className="text-slate-500 font-bold text-sm ml-1">{t('disease.subtitle')}</p>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-200 shadow-lg">
            <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span className="text-emerald-600 font-black text-xs uppercase tracking-wider">Ready to Scan</span>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${fullPage ? 'lg:grid-cols-2' : ''} gap-6 flex-1`}>
          {/* Left Column: Upload Area */}
          <div className="flex flex-col gap-6">
            <div
              className={`relative border-2 border-dashed rounded-[2.5rem] p-8 text-center transition-all duration-700 cursor-pointer min-h-[300px] flex flex-col items-center justify-center bg-white/70 backdrop-blur-xl
                ${dragActive
                  ? 'border-emerald-400 bg-emerald-50/90 scale-[1.01]'
                  : 'border-slate-300 bg-white/70 hover:border-emerald-400 hover:bg-emerald-50/80'}
                ${preview ? 'border-emerald-400/40 bg-white/90' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrag}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />

              {preview ? (
                <div className="relative w-full h-full animate-fade-in">
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-200 shadow-lg bg-white">
                    <img src={preview} alt="Preview" className="w-full max-h-[280px] object-contain" />

                    {loading && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 animate-scan z-20"></div>
                        <div className="absolute inset-0 bg-emerald-500/10 z-10"></div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all z-30"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-emerald-200 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h4 className="text-slate-700 text-xl font-black mb-3">{t('disease.upload')}</h4>
                  <p className="text-slate-500 text-sm font-bold">Drag and drop leaf photo here</p>
                </div>
              )}
            </div>

            <button
              onClick={analyzeImage}
              disabled={!file || loading}
              className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl bg-white/80 backdrop-blur-xl border border-white/40
                ${!file || loading
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 active:scale-95 border-emerald-400'}
              `}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <>
                  <Activity size={22} className={file ? 'animate-pulse' : ''} />
                  {t('disease.analyze')}
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col h-full">
            {result ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-emerald-200 shadow-xl flex flex-col items-center justify-center text-center animate-fade-in h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/50 blur-3xl rounded-full -mr-20 -mt-20"></div>

                <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center shadow-lg mb-6 transform group-hover/result:rotate-12 transition-all duration-500 border border-emerald-200 relative z-10">
                  <Sprout className="w-10 h-10 text-emerald-600" />
                </div>

                <p className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3 relative z-10">{t('disease.result')}</p>

                <div className="mb-4 relative z-10">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Crop Detected</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{result.crop_translated || result.predicted_crop}</p>
                </div>

                <div className="bg-emerald-50/80 backdrop-blur-sm px-8 py-5 rounded-2xl border border-emerald-200 shadow-sm mb-6 relative z-10">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Disease Found</p>
                  <p className="text-3xl font-black text-red-600 tracking-tight">{getDiseaseDisplay()}</p>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Confidence</span>
                    <span className="text-lg font-black text-emerald-600">{Math.round(getConfidence() * 100)}%</span>
                  </div>
                </div>

                <button className="mt-6 flex items-center gap-3 text-emerald-700 font-black text-sm uppercase tracking-widest hover:gap-5 transition-all relative z-10 group/consult">
                  <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg">
                    <Bot size={18} />
                  </div>
                  Ask KrishiBot
                  <ArrowRight size={18} className="group-hover/consult:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : error ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-10 border border-red-200 shadow-xl flex flex-col items-center justify-center text-center animate-shake h-full">
                <div className="w-16 h-16 bg-red-50 rounded-[1.5rem] flex items-center justify-center shadow-lg mb-6 border border-red-200">
                  <XCircle size={32} className="text-red-500" />
                </div>
                <p className="text-red-500 font-black text-xl mb-2">Detection Failed</p>
                <p className="text-red-400 font-bold text-sm max-w-[240px] leading-relaxed">{error}</p>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-10 text-center h-full">
                <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center shadow-sm mb-6 group-hover/empty:scale-110 transition-transform duration-500 border border-emerald-200">
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-slate-600 font-black text-xl mb-2 tracking-tight">No Image Yet</p>
                <p className="text-slate-400 font-bold text-sm max-w-[220px] leading-relaxed">Upload a leaf photo to detect diseases using AI</p>

                <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-sm">
                  {[
                    { icon: <Camera size={16} />, label: 'Sharp Focus' },
                    { icon: <Activity size={16} />, label: 'Good Light' },
                    { icon: <ShieldCheck size={16} />, label: 'Single Leaf' }
                  ].map((tip, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-emerald-500">{tip.icon}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{tip.label}</span>
                    </div>
                  ))}
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