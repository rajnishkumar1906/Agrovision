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
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [lastBotAnswer, setLastBotAnswer] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickActions = [
    { label: 'Disease Scan', query: 'How do I use the disease detection tool?', desc: 'Upload a leaf photo to identify crop diseases instantly.' },
    { label: 'Crop Recommendation', query: 'How does crop recommendation work?', desc: 'Get AI-based crop suggestions based on your soil data (N-P-K).' },
    { label: 'Weather Info', query: 'Show me my local weather forecast.', desc: 'Check hyper-local weather data for better farm planning.' },
    { label: 'Soil Health', query: 'How to improve soil health?', desc: 'Learn tips to maintain and improve your soil fertility.' }
  ];

  const messagesWrapperRef = useRef(null);
  const recognitionRef = useRef(null);
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
      recognitionRef.current.lang = 'hi-IN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setTimeout(() => {
          setIsMicModalOpen(false);
          handleSendMessage(transcript);
        }, 250);
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

  const startRecording = async () => {
    try {
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
        handleVoiceUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsMicModalOpen(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      // Fallback to browser recognition
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

  const handleVoiceUpload = async (audioBlob) => {
    setIsTyping(true);
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

      if (!response.ok) throw new Error('Voice upload failed');

      const result = await response.json();
      if (result.success && result.data?.status === 'success') {
        const { query, answer, audio_file } = result.data;

        // Add user message
        setMessages(prev => [...prev, {
          id: Date.now(),
          html: query,
          sender: 'user',
          timestamp: new Date()
        }]);

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
          currentAudioRef.current.play();
        } else {
          // Fallback to TTS
          speakText(answer);
        }
      }
    } catch (error) {
      console.error('Voice error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        html: "Voice input failed. Please try typing.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
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
      if (data.success && data.data) {
        answer = data.data.answer || data.data.response;
      } else if (data.status === 'success') {
        answer = data.answer;
      } else if (data.answer) {
        answer = data.answer;
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
        speakText(answer);
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

      {/* Mic Modal */}
      <div
        className={`krishibot-modal ${isMicModalOpen ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Voice Input"
        onClick={closeMicModal}
      >
        <div className="krishibot-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="krishibot-modal-header">
            <h3>🎤 वॉइस इनपुट</h3>
            <button className="krishibot-modal-close" onClick={closeMicModal}>&times;</button>
          </div>
          <div className="krishibot-modal-body">
            <div className="mic-animation">
              <div className="mic-pulse-ring" />
              <div className={`mic-icon-large ${isRecording ? 'listening' : ''}`}>
                <Mic size={48} />
              </div>
            </div>
            <div className="wave-animation">
              <span /><span /><span /><span /><span />
            </div>
            <p className="voice-status">
              {isRecording ? '🎤 सुन रहा हूँ... Speak now...' : 'बोलिए...'}
            </p>
            <p className="voice-hint">हिंदी या अंग्रेजी में बोलें</p>
          </div>
          <div className="krishibot-modal-footer">
            <button type="button" className="cancel-btn" onClick={closeMicModal}>
              रद्द करें / रोकें
            </button>
          </div>
        </div>
      </div>

      {/* Speaker Modal */}
      <div
        className={`krishibot-modal ${isSpeakerModalOpen ? 'active' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Voice Output"
        onClick={closeSpeakerModal}
      >
        <div className="krishibot-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="krishibot-modal-header">
            <h3>🔊 वॉइस आउटपुट</h3>
            <button className="krishibot-modal-close" onClick={closeSpeakerModal}>&times;</button>
          </div>
          <div className="krishibot-modal-body">
            <div className="speaker-animation">
              <div className="speaker-pulse-ring" />
              <div className={`speaker-icon-large ${isSpeaking ? 'listening' : ''}`}>
                <Volume2 size={48} />
              </div>
            </div>
            <div className="wave-animation">
              <span /><span /><span /><span /><span />
            </div>
            <p className="speaker-status">
              {isSpeaking ? (language === 'hi' ? 'बोल रहा हूँ...' : language === 'pa' ? 'ਬੋਲ ਰਿਹਾ ਹਾਂ...' : 'Speaking...') : (language === 'hi' ? 'बंद किया गया' : 'Stopped')}
            </p>
            <p className="speaker-hint">
              {language === 'hi' ? 'कृषिबॉट का जवाब सुनाया जा रहा है' : language === 'pa' ? 'ਕ੍ਰਿਸ਼ੀਬੋਟ ਦਾ ਜਵਾਬ ਸੁਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ' : "KrishiBot's response is being played"}
            </p>
          </div>
          <div className="krishibot-modal-footer">
            <button type="button" className="cancel-btn" onClick={closeSpeakerModal}>
              बंद करें
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotModule;