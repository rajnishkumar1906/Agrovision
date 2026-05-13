import  { useMemo, useRef, useEffect, useState, useContext } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { API_BASE_URL } from '../../config';
import { Mic, Send, Volume2, X, Bot, Sparkles, ChevronRight } from 'lucide-react';
import { LanguageContext } from '../../App';

const ChatbotModule = ({ fullPage = false }) => {
  const { t, language } = useContext(LanguageContext);
  const [isChatOpen, setIsChatOpen] = useState(fullPage);

  const initialMessages = useMemo(() => {
    const msgs = {
      en: [
        {
          id: 1,
          html: `Hello! I am <strong>KrishiBot</strong>. I am your digital farming assistant.<br><br>
                I can help you with crop diseases, fertilizers, govt schemes, and farming problems.<br><br>
                You can ask in English, Hindi, or Punjabi. 🚜`,
          sender: 'bot',
          timestamp: new Date(),
        }
      ],
      hi: [
        {
          id: 1,
          html: `नमस्ते! मैं <strong>कृषिबॉट</strong> हूँ। मैं आपका डिजिटल खेती सहायक हूँ!<br><br>
                मैं आपकी फसलों, खाद, सरकारी योजनाओं और खेती की समस्याओं में मदद कर सकता हूँ।<br><br>
                आप हिंदी, अंग्रेजी या पंजाबी में पूछ सकते हैं। 🚜`,
          sender: 'bot',
          timestamp: new Date(),
        }
      ],
      pa: [
        {
          id: 1,
          html: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ <strong>ਕ੍ਰਿਸ਼ੀਬੋਟ</strong> ਹਾਂ। ਮੈਂ ਤੁਹਾਡਾ ਡਿਜੀਟਲ ਖੇਤੀ ਸਹਾਇਕ ਹਾਂ!<br><br>
                ਮੈਂ ਫਸਲਾਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ, ਖਾਦਾਂ, ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਖੇਤੀਬਾੜੀ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।<br><br>
                ਤੁਸੀਂ ਪੰਜਾਬੀ, ਹਿੰਦੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਪੁੱਛ ਸਕਦੇ ਹੋ। 🚜`,
          sender: 'bot',
          timestamp: new Date(),
        }
      ]
    };
    return msgs[language] || msgs.en;
  }, [language]);

  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [lastBotAnswer, setLastBotAnswer] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [silenceTimeout, setSilenceTimeout] = useState(null);

  // Custom "Amazing" Floating Mic SVG Component
  const FloatingMicIcon = ({ isListening, isProcessing }) => (
    <div className="relative flex items-center justify-center">
      {/* Outer Pulse Rings */}
      {isListening && !isProcessing && (
        <>
          <div className="absolute w-40 h-40 bg-emerald-500/10 rounded-full animate-ping opacity-40"></div>
          <div className="absolute w-32 h-32 bg-emerald-400/20 rounded-full animate-pulse opacity-30"></div>
        </>
      )}

      {/* The "Real" Mic SVG */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={`relative z-20 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-transform duration-500 ${isListening ? 'scale-110' : 'scale-100'}`}>
        <defs>
          <linearGradient id="micGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="innerShadow">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="2" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.3" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>
        
        {/* Mic Body */}
        <rect x="45" y="20" width="30" height="55" rx="15" fill="url(#micGradient)" filter="url(#innerShadow)" />
        
        {/* Mic Stand/U-Shape */}
        <path d="M35 55C35 68.8071 46.1929 80 60 80C73.8071 80 85 68.8071 85 55" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        
        {/* Bottom Stem */}
        <line x1="60" y1="80" x2="60" y2="95" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        <line x1="45" y1="95" x2="75" y2="95" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        
        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <circle cx="60" cy="48" r="35" stroke="#10b981" strokeWidth="4" strokeDasharray="50 150" strokeLinecap="round" className="animate-spin" style={{ transformOrigin: 'center' }} />
        )}
      </svg>
    </div>
  );

  // Custom "Amazing" Floating Speaker SVG Component
  const FloatingSpeakerIcon = ({ isSpeaking }) => (
    <div className="relative flex items-center justify-center">
      {/* Outer Pulse Rings */}
      {isSpeaking && (
        <>
          <div className="absolute w-48 h-48 bg-blue-500/10 rounded-full animate-ping opacity-30"></div>
          <div className="absolute w-40 h-40 bg-blue-400/20 rounded-full animate-pulse opacity-20"></div>
          <div className="absolute w-32 h-32 border border-blue-400/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          
          {/* Sound Particles */}
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-particle"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 0.5}s`,
                '--dx': `${(i % 2 === 0 ? 1 : -1) * (40 + Math.random() * 60)}px`,
                '--dy': `${- (40 + Math.random() * 60)}px`
              }}
            />
          ))}
        </>
      )}

      {/* The "Real" Speaker SVG */}
      <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className={`relative z-20 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-700 ${isSpeaking ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}`}>
        <defs>
          <linearGradient id="speakerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="speakerInnerShadow">
            <feOffset dx="0" dy="4" />
            <feGaussianBlur stdDeviation="3" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.4" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Speaker Housing */}
        <path d="M50 50H35C31.134 50 28 53.134 28 57V83C28 86.866 31.134 90 35 90H50L75 105V35L50 50Z" fill="url(#speakerGradient)" filter="url(#speakerInnerShadow)" />
        
        {/* Speaker Driver (Circle inside) */}
        <circle cx="45" cy="70" r="8" fill="white" opacity="0.2" />
        
        {/* Sound Waves - Dynamic */}
        {isSpeaking && (
          <g filter="url(#glow)">
            <path d="M88 55C95 62 95 78 88 85" stroke="white" strokeWidth="6" strokeLinecap="round" className="animate-pulse-fast" opacity="0.9" />
            <path d="M105 45C115 55 115 85 105 95" stroke="white" strokeWidth="5" strokeLinecap="round" className="animate-pulse-slow" opacity="0.6" />
            <path d="M120 35C135 50 135 90 120 105" stroke="white" strokeWidth="4" strokeLinecap="round" className="animate-pulse-v-slow" opacity="0.3" />
          </g>
        )}
      </svg>
    </div>
  );

  const quickActions = [
    { label: 'Disease Scan', query: 'How do I use the disease detection tool?', desc: 'Upload a leaf photo to identify crop diseases instantly.' },
    { label: 'Crop Recommendation', query: 'How does crop recommendation work?', desc: 'Get AI-based crop suggestions based on your soil data (N-P-K).' },
    { label: 'Weather Info', query: 'Show me my local weather forecast.', desc: 'Check hyper-local weather data for better farm planning.' },
    { label: 'Soil Health', query: 'How to improve soil health?', desc: 'Learn tips to maintain and improve your soil fertility.' }
  ];

  const messagesWrapperRef = useRef(null);
  const speakerTextRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const { token } = useAuthStore();

  const scrollToBottom = () => {
    const el = messagesWrapperRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : language === 'pa' ? 'pa-IN' : 'en-IN';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        console.log("Speech recognition started");
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).replace(/\.+$/, '').trim();
        
        // Filter out junk characters like "伦" which can appear due to browser/driver bugs
        if (currentText.includes('伦') || currentText.length > 50 && /^[\u4e00-\u9fa5\s]+$/.test(currentText)) {
          console.warn("Junk transcript detected, ignoring:", currentText);
          return;
        }

        setTranscript(currentText);
        transcriptRef.current = currentText;

        // Reset silence timer on every speech result
        if (silenceTimeout) clearTimeout(silenceTimeout);
        
        // snappier 2.5s silence detection instead of 5s
        const timeout = setTimeout(() => {
          if (currentText.trim()) {
            console.log("Silence detected, stopping recording...");
            stopRecording();
            // Close modal immediately for faster feel
            setIsMicModalOpen(false);
          }
        }, 2500); 
        
        setSilenceTimeout(timeout);
      };
      
      recognitionRef.current.onerror = (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setIsMicModalOpen(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) { }
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Teleprompter / Auto-scroll logic for Speaker Modal
  useEffect(() => {
    let scrollInterval;
    if (isSpeakerModalOpen && isSpeaking && speakerTextRef.current) {
      const container = speakerTextRef.current;
      
      // Reset scroll to top initially
      container.scrollTop = 0;

      // Small delay to let the modal open transition finish
      const timeout = setTimeout(() => {
        // Calculate total scrollable height
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        if (maxScroll <= 0) return;

        // Estimate speed: roughly 30 pixels per second, or adjusted by text length
        // We'll use a smoother linear animation if possible, but interval is safer for simple implementation
        const duration = 15000; // Assume 15 seconds for long text, or calculate based on text
        const startTime = Date.now();

        scrollInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          container.scrollTop = progress * maxScroll;

          if (progress >= 1) clearInterval(scrollInterval);
        }, 50);
      }, 1000);

      return () => {
        clearTimeout(timeout);
        clearInterval(scrollInterval);
      };
    }
  }, [isSpeakerModalOpen, isSpeaking]);

  const startRecording = async () => {
    try {
      // Clear transcript and input before starting
      setTranscript('');
      transcriptRef.current = '';
      setInputValue('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Use latest transcript from ref for immediate UI feedback
        const userQuery = transcriptRef.current;
        if (userQuery.trim()) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            html: userQuery,
            sender: 'user',
            timestamp: new Date()
          }]);
        }
        handleVoiceUpload(audioBlob, userQuery);
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recognition for visual feedback
      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Recognition already started:", e);
        }
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsMicModalOpen(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      // Fallback to browser recognition only
      if (recognitionRef.current && !isListening) {
        setIsMicModalOpen(true);
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 300);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsMicModalOpen(false);
    }
  };

  const handleVoiceUpload = async (audioBlob, localQuery = '') => {
    setIsTyping(true);
    setIsProcessingVoice(true);
    try {
      const { user } = useAuthStore.getState();
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      
      const response = await fetch(`${API_BASE_URL}/api/chatbot/ask-voice?language=${language}&gender=${user?.gender || 'male'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 504 || response.status === 500) {
          throw new Error('Processing took too long. Please try again with a shorter message.');
        }
        throw new Error('Voice upload failed');
      }

      const result = await response.json();
      if (result.success && result.data?.status === 'success') {
        const { query, answer, audio_file } = result.data;

        // Only add user message if we didn't add it locally already
        if (!localQuery) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            html: query,
            sender: 'user',
            timestamp: new Date()
          }]);
        }

        // Add bot response
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          html: answer.replace(/\n/g, '<br>'),
          sender: 'bot',
          timestamp: new Date()
        }]);

        setLastBotAnswer(answer);

        // Play audio response if available
        if (audio_file) {
          const audioUrl = `${API_BASE_URL}/api/chatbot/audio/${audio_file.split('/').pop()}`;
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
          }
          currentAudioRef.current = new Audio(audioUrl);
          
          setIsSpeaking(true);
          setIsSpeakerModalOpen(true);

          currentAudioRef.current.onended = () => {
            setIsSpeaking(false);
            setIsSpeakerModalOpen(false);
          };

          currentAudioRef.current.play().catch(err => {
            console.error('Audio playback failed:', err);
            // Fallback to TTS if audio file fails
            speakText(answer);
          });
        } else {
          // Fallback to TTS
          speakText(answer);
        }
      }
    } catch (error) {
      console.error('Voice error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        html: error.message || "Voice input failed. Please try typing.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      setIsProcessingVoice(false);
      setIsMicModalOpen(false);
    }
  };

  const handleSendMessage = async (text = inputValue.trim()) => {
    if (!text) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      html: text.replace(/\n/g, '<br>'),
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { user } = useAuthStore.getState();
      // Send as JSON with query in URL
      const response = await fetch(`${API_BASE_URL}/api/chatbot/ask-text?query=${encodeURIComponent(text)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: text,
          language: language, // Pass the current language
          gender: user?.gender || 'male' // Pass gender from user store
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Extract answer from different response formats
      let answer = null;
      let audio_file = null;
      if (data.success && data.data) {
        answer = data.data.answer || data.data.response;
        audio_file = data.data.audio_file;
      } else if (data.status === 'success') {
        answer = data.answer;
        audio_file = data.audio_file;
      } else if (data.answer) {
        answer = data.answer;
        audio_file = data.audio_file;
      }

      if (answer) {
        const botMessage = {
          id: Date.now() + 1,
          html: answer.replace(/\n/g, '<br>'),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setLastBotAnswer(answer);

        // Play audio response if available
        if (audio_file) {
          const audioUrl = `${API_BASE_URL}/api/chatbot/audio/${audio_file.split('/').pop()}`;
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
          }
          currentAudioRef.current = new Audio(audioUrl);
          
          setIsSpeaking(true);
          setIsSpeakerModalOpen(true);

          currentAudioRef.current.onended = () => {
            setIsSpeaking(false);
            setIsSpeakerModalOpen(false);
          };

          currentAudioRef.current.play().catch(err => {
            console.error('Audio playback failed:', err);
            // Fallback to TTS if audio file fails
            speakText(answer);
          });
        } else {
          // Fallback to TTS
          speakText(answer);
        }
      } else {
        throw new Error('No answer received from server');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        html: 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।\n\nSorry, something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const closeMicModal = () => {
    try {
      if (silenceTimeout) clearTimeout(silenceTimeout);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } catch (e) { }
    setIsMicModalOpen(false);
  };

  const closeSpeakerModal = () => {
    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setIsSpeakerModalOpen(false);
    setIsSpeaking(false);
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    setIsSpeaking(true);
    setIsSpeakerModalOpen(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang === 'hi-IN');
      if (hindiVoice) utterance.voice = hindiVoice;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsSpeakerModalOpen(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsSpeakerModalOpen(false);
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) setShowQuickActions(false);
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action.query);
    setShowQuickActions(false);
  };

  return (
    <>
      {/* FAB Button - Only show when chat is closed and not in fullPage mode */}
      {!fullPage && !isChatOpen && !isMicModalOpen && !isSpeakerModalOpen && (
        <div className="krishibot-fab group">
          <span className="fab-tooltip">
            {language === 'hi' ? 'कृषिबॉट से बात करें' : language === 'pa' ? 'ਕ੍ਰਿਸ਼ੀਬੋਟ ਨਾਲ ਗੱਲ ਕਰੋ' : 'Speak to KrishiBot'}
          </span>
          <button
            className="fab-main relative overflow-hidden group"
            onClick={toggleChat}
            title="Open KrishiBot"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-transparent animate-pulse" />
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-shine group-hover:duration-1000" />
            <Bot size={32} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <Sparkles size={16} className="absolute top-3 right-3 text-emerald-200 animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {(isChatOpen || fullPage) && (
    <div className={`krishibot ${fullPage ? 'h-full' : 'floating shadow-2xl'}`}>
      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon bg-white/20 p-2 rounded-xl">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div className="logo-text">
                <h1 className="text-lg font-black tracking-tight leading-none mb-1">
                  {language === 'hi' ? 'कृषिबॉट' : language === 'pa' ? 'ਕ੍ਰਿਸ਼ੀਬੋਟ' : 'KrishiBot'}
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none">
                  {language === 'hi' ? 'आपका किसान साथी' : language === 'pa' ? 'ਤੁਹਾਡਾ ਕਿਸਾਨ ਸਾਥੀ' : 'AI Farm Assistant'}
                </p>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className={`action-btn ${showQuickActions ? 'active' : ''}`}
                onClick={() => setShowQuickActions(!showQuickActions)}
                title="Quick Actions"
              >
                <Sparkles size={18} />
              </button>
              
              <button
                type="button"
                className={`action-btn ${isRecording ? 'active bg-red-500 text-white animate-pulse' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                title="Voice Input"
              >
                <Mic size={18} />
              </button>

              <button
                type="button"
                className={`action-btn ${isSpeaking ? 'active' : ''}`}
                onClick={() => speakText(lastBotAnswer)}
                disabled={!lastBotAnswer || isSpeaking}
                title="Listen Response"
              >
                <Volume2 size={18} />
              </button>

              {!fullPage && (
                <button
                  className="action-btn bg-white/10 hover:bg-white/20"
                  onClick={toggleChat}
                  title="Close"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="chat-container">
          {showQuickActions && (
            <div className="absolute inset-0 bg-white/95 z-20 p-6 animate-fade-in overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Common Tasks</h3>
                <button onClick={() => setShowQuickActions(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <div className="grid gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-left p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <p className="font-bold text-slate-800 group-hover:text-emerald-700 mb-1">{action.label}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{action.desc}</p>
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} className="text-emerald-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="messages-wrapper custom-scrollbar" ref={messagesWrapperRef}>
            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-bubble">
                    <div className="message-icon">
                      {msg.sender === 'user' ? '👤' : <Bot size={16} />}
                    </div>
                    <div
                      className="message-content shadow-sm"
                      dangerouslySetInnerHTML={{ __html: msg.html }}
                    />
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="message bot">
                  <div className="message-bubble">
                    <div className="message-icon">
                      <Bot size={16} />
                    </div>
                    <div className="message-content bg-white shadow-sm">
                      <div className="flex flex-col gap-2">
                        <div className="typing-dots">
                          <span />
                          <span />
                          <span />
                        </div>
                        <span className="typing-text italic opacity-60">
                          {language === 'hi' ? 'कृषिबॉट सोच रहा है...' : language === 'pa' ? 'ਕ੍ਰਿਸ਼ੀਬੋਟ ਸੋਚ ਰਿਹਾ ਹੈ...' : 'KrishiBot is thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Input Area */}
        <div className="input-container bg-white border-t border-slate-100 p-4">
          <div className="input-wrapper bg-slate-50 border border-slate-200 focus-within:border-emerald-500 transition-all rounded-2xl p-2 flex items-center gap-2">
            <input
              type="text"
              className="question-input flex-1 bg-transparent px-3 py-2 text-sm outline-none font-medium"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={language === 'hi' ? 'अपना सवाल यहाँ लिखें...' : 'Type your question here...'}
              disabled={isTyping}
              autoComplete="off"
            />
            <button
              type="button"
              className="send-btn bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
      )}

      {/* Mic Modal - Redesigned for a purely Floating Experience */}
      <div
        className={`krishibot-modal ${isMicModalOpen ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Voice Input"
        onClick={closeMicModal}
      >
        {/* Full screen backdrop for clicks */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMicModal}></div>

        <div className="relative z-50 w-full h-full flex flex-col items-center justify-center pointer-events-none" onClick={(e) => e.stopPropagation()}>
          
          {/* Large Floating Mic Icon */}
          <div className="pointer-events-auto mb-16">
            <FloatingMicIcon isListening={isRecording} isProcessing={isProcessingVoice} />
            
            {/* Minimal Status Hint */}
            <div className="text-center mt-8">
              {isProcessingVoice ? (
                <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">AI Processing...</p>
              ) : transcript ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                  <p className="text-emerald-400/80 font-black uppercase tracking-[0.5em] text-[8px]">Auto-sending on silence</p>
                </div>
              ) : (
                <p className="text-white/30 font-black uppercase tracking-[0.6em] text-[10px] animate-pulse">Speak to KrishiBot</p>
              )}
            </div>
          </div>

          {/* Floating Transcript - Large, Centered, and Independent */}
          <div className={`transition-all duration-1000 transform ${transcript ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'} w-full text-center px-10 pointer-events-auto`}>
            <div className="relative inline-block w-full max-w-5xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[160%] bg-emerald-500/5 blur-[150px] rounded-full -z-10"></div>
              <p className="relative z-10 text-white text-5xl md:text-7xl font-black leading-tight tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,1)]">
                {transcript}
              </p>
            </div>
          </div>

          {/* Cancel Control */}
          <button 
            onClick={closeMicModal}
            className="absolute bottom-10 right-10 p-5 rounded-full bg-white/5 border border-white/10 text-white/20 hover:bg-red-500/20 hover:text-white transition-all backdrop-blur-xl pointer-events-auto group"
            title="Cancel"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Speaker Modal - Redesigned for Floating Experience */}
      <div
        className={`krishibot-modal ${isSpeakerModalOpen ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Voice Output"
        onClick={closeSpeakerModal}
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeSpeakerModal}></div>

        <div className="relative z-50 w-full h-full flex flex-col items-center justify-center pointer-events-none" onClick={(e) => e.stopPropagation()}>
          
          {/* Large Floating Speaker Icon */}
          <div className="pointer-events-auto mb-16">
            <FloatingSpeakerIcon isSpeaking={isSpeaking} />
            
            {/* Minimal Status Hint */}
            <div className="text-center mt-8">
              <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
                {isSpeaking ? (language === 'hi' ? 'कृषिबॉट बोल रहा हूँ...' : language === 'pa' ? 'ਕ੍ਰਿਸ਼ੀਬੋਟ ਬੋਲ ਰਿਹਾ ਹਾਂ...' : 'KrishiBot Speaking...') : 'Stopped'}
              </p>
            </div>
          </div>

          {/* Response Text Display - Teleprompter / Auto-scrolling */}
          <div className={`transition-all duration-1000 transform ${isSpeaking ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'} w-full text-center px-10 pointer-events-auto max-h-[60vh] relative group/teleprompter`}>
            
            {/* Massive background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[150%] bg-blue-500/5 blur-[120px] rounded-full -z-10 animate-pulse pointer-events-none"></div>

            {/* Gradient Masks for "Shifting" effect */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 pointer-events-none"></div>

            <div 
              ref={speakerTextRef}
              className="relative z-10 max-w-5xl mx-auto h-[60vh] overflow-y-auto custom-scrollbar-none py-[25vh] space-y-10"
              style={{ scrollBehavior: 'smooth' }}
            >
              <p 
                className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                style={{
                  textShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.1)'
                }}
              >
                {lastBotAnswer}
              </p>
              
              {/* Subtle visual indicator below text */}
              {isSpeaking && (
                <div className="flex justify-center gap-2 pb-10">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-10 bg-blue-400/30 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Close Control */}
          <button 
            onClick={closeSpeakerModal}
            className="absolute bottom-10 right-10 p-5 rounded-full bg-white/5 border border-white/10 text-white/20 hover:bg-blue-500/20 hover:text-white transition-all backdrop-blur-xl pointer-events-auto group"
            title="Close"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatbotModule;