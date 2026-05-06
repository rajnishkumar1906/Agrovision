import React, { useState, useContext } from 'react';
import { Camera, UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import useAuthStore from '../../store/useAuthStore';
import { LanguageContext } from '../../App';
import { getTranslatedDisease, getTranslatedCrop } from '../../utils/diseaseTranslations';

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
    <div className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm ${fullPage ? 'h-full' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            {t('disease.title')}
          </h3>
          <p className="text-sm text-slate-400">{t('disease.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer group h-64 flex flex-col items-center justify-center
              ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-slate-100'}
              ${preview ? 'border-emerald-500' : ''}
            `}
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrag}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
            
            {preview ? (
              <div className="relative w-full h-full">
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                >
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 relative">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-slate-800 font-semibold mb-1">{t('disease.upload')}</h4>
                <p className="text-slate-400 text-xs">{language === 'hi' ? 'पौधे की पत्ती की फोटो अपलोड करें' : language === 'pa' ? 'ਪੌਦੇ ਦੇ ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ' : 'Upload a photo of the plant leaf'}</p>
              </div>
            )}
          </div>

          <button 
            onClick={analyzeImage}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
              ${!file || loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-200'}
            `}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('disease.analyze')}
          </button>

          {/* Decorative images outside the upload area */}
          {!preview && !result && (
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="relative h-24 rounded-xl overflow-hidden shadow-sm group">
                <img src="https://images.unsplash.com/photo-1597250861267-429663f244a8?auto=format&fit=crop&w=300&q=80" alt="Plant 1" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <div className="relative h-24 rounded-xl overflow-hidden shadow-sm group">
                <img src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=300&q=80" alt="Plant 2" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <div className="relative h-24 rounded-xl overflow-hidden shadow-sm group">
                <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=300&q=80" alt="Plant 3" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="flex-1 bg-emerald-50 rounded-2xl p-6 border border-emerald-100 animate-fade-in">
            <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
              <CheckCircle size={20} /> {t('disease.result')}
            </h4>
            
            <div className="space-y-4">
              {/* Crop Name */}
              {result.predicted_crop && (
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                    {language === 'hi' ? 'फसल' : language === 'pa' ? 'ਫਸਲ' : 'Crop'}
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    {result.crop_translated || result.predicted_crop}
                  </p>
                </div>
              )}
              
              {/* Disease Name - Gemini Translated */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">{t('disease.disease')}</p>
                <p className="text-xl font-bold text-slate-800 break-words">
                  {getDiseaseDisplay()}
                </p>
                {/* Show original disease name for reference */}
                {getOriginalDisease() && (
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'hi' ? 'मूल' : language === 'pa' ? 'ਮੂਲ' : 'Original'}: {getOriginalDisease()}
                  </p>
                )}
              </div>
              
              {/* Confidence Score */}
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">{t('disease.confidence')}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(getConfidence() * 100, 100)}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-700">{Math.round(getConfidence() * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex-1 bg-red-50 rounded-2xl p-6 border border-red-100 flex items-center justify-center text-red-600 font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetectionModule;