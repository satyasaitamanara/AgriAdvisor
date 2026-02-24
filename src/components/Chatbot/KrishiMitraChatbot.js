import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X, Volume2, VolumeX, Minimize2,  Bot, Sprout } from 'lucide-react';

  // Enhanced agriculture greetings
  const GREETINGS = {
    en: "Hello! I'm Krishi Mitra 🌾, your AI agriculture assistant. I can help with crops, fertilizers, pests, irrigation, and weather advice. How can I assist you today?",
    te: "నమస్కారం! నేను కృషి మిత్రుడ్ని 🌾, మీ AI వ్యవసాయ సహాయకుడిని. పంటలు, ఎరువులు, కీటకాలు, నీటిపారుదల, వాతావరణ సలహాలు - ఇవన్నీ ఇవ్వగలను. ఈరోజు మీకు ఎలా సహాయపడగలను?"
  };


const KrishiMitraChatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // API endpoint - adjust based on your backend URL
  const API_URL = "https://agriadvisor-l9g9.onrender.com/api/chatbot/chat";



  // Initialize with greeting
useEffect(() => {
  setMessages([{
    text: GREETINGS[language],
    sender: 'bot',
    lang: language,
    timestamp: new Date(),
    type: 'greeting'
  }]);
}, [language]);


  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        detectLanguage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  const detectLanguage = (text) => {
    if (!text) return 'en';
    const teluguRegex = /[\u0C00-\u0C7F]/;
    const newLang = teluguRegex.test(text) ? 'te' : 'en';
    setLanguage(newLang);
    return newLang;
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
        setConnectionError(false);
      } catch (error) {
        console.error('Speech recognition error:', error);
        setIsListening(false);
      }
    } else {
      const input = language === 'te' 
        ? 'మైక్ సపోర్ట్ లేదు. దయచేసి టైప్ చేయండి.' 
        : 'Microphone not supported. Please type your question.';
      setInputText(input);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Text-to-Speech function
  const speakText = (text) => {
    if (!text || isSpeaking) return;
    
    setIsSpeaking(true);
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'te' ? 'te-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        language === 'te' 
          ? voice.lang.includes('te') || voice.lang.includes('hi')
          : voice.lang.includes('en')
      );
      
      if (preferredVoice) utterance.voice = preferredVoice;
      
      speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Send message to backend
  const sendMessageToAI = async (userInput) => {
    try {
      setIsLoading(true);
      setConnectionError(false);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          language: language,
          history: messages.filter(msg => msg.sender !== 'bot' || msg.type !== 'greeting').map(msg => ({
            sender: msg.sender,
            text: msg.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.response;
      } else {
        throw new Error(data.response);
      }
    } catch (error) {
      console.error('API Error:', error);
      setConnectionError(true);
      return language === 'te' 
        ? `క్షమించండి, సర్వర్‌కు కనెక్ట్ కావడంలో సమస్య. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేయండి.`
        : `Sorry, there was a problem connecting to the server. Please check your internet connection.`;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userInput = inputText.trim();
    
    // Add user message
    const userMessage = { 
      text: userInput, 
      sender: 'user', 
      lang: language, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Get AI response
    const botResponse = await sendMessageToAI(userInput);
    const botMessage = { 
      text: botResponse, 
      sender: 'bot', 
      lang: language, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, botMessage]);
    
    // Speak the response
    if (!isSpeaking) {
      setTimeout(() => speakText(botResponse), 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action buttons
  const quickActions = {
    en: [
      "Best crops for sandy soil?",
      "How to control pests in paddy?",
      "Drip irrigation benefits",
      "Organic fertilizer preparation"
    ],
    te: [
      "ఇసుక నేలకు మంచి పంటలు?",
      "వరిలో పురుగులు ఎలా నియంత్రించాలి?",
      "డ్రిప్ నీటిపారుదల ప్రయోజనాలు",
      "సేంద్రీయ ఎరువు తయారీ"
    ]
  };

  const handleQuickAction = (action) => {
    setInputText(action);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-green-600 to-emerald-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Bot size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:top-4 sm:right-4 sm:left-auto sm:bottom-4 sm:w-96 sm:max-w-[95vw] w-full h-full max-h-[100vh] bg-white rounded-none sm:rounded-2xl shadow-2xl border border-green-200 flex flex-col z-50 overflow-hidden">
      {/* Enhanced Header - Always Visible */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-4 rounded-none sm:rounded-t-2xl flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sprout size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Krishi Mitra</h3>
              <p className="text-sm opacity-90 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                AI Agriculture Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={isSpeaking ? stopSpeaking : () => speakText(messages[messages.length - 1]?.text || '')}
              disabled={messages.length === 0}
              className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
              title={isSpeaking ? "Stop speaking" : "Speak last message"}
            >
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors hidden sm:flex"
              title="Minimize"
            >
              <Minimize2 size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        {/* Connection Status */}
        {connectionError && (
          <div className="mt-2 p-2 bg-red-500/20 rounded-lg text-sm flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            {language === 'te' ? 'కనెక్షన్ సమస్య' : 'Connection Issue'}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-3 bg-green-50 border-b flex-shrink-0">
          <p className="text-xs text-green-800 font-medium mb-2">
            {language === 'te' ? 'త్వరిత ప్రశ్నలు:' : 'Quick Questions:'}
          </p>
          <div className="flex flex-wrap gap-1">
            {quickActions[language].map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="text-xs bg-white text-green-700 px-2 py-1 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-green-50 to-white">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl ${
              message.sender === 'user' 
                ? 'bg-green-500 text-white rounded-br-none shadow-md' 
                : 'bg-white text-gray-800 rounded-bl-none border border-green-100 shadow-sm'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                {message.sender === 'bot' && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">AI</span>
                )}
                {message.lang === 'te' && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">తెలుగు</span>
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block max-w-[85%] px-4 py-3 rounded-2xl bg-white border border-green-100 rounded-bl-none shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">AI</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  {language === 'te' ? 'తెలుగు' : 'English'}
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-green-200 bg-white flex-shrink-0">
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              language === 'en' 
                ? 'bg-green-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('te')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              language === 'te' 
                ? 'bg-green-500 text-white shadow-sm' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            తెలుగు
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-shrink-0 w-12 h-12 rounded-full transition-all flex items-center justify-center ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                detectLanguage(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              placeholder={language === 'te' ? 'మీ వ్యవసాయ ప్రశ్నను ఇక్కడ టైప్ చేయండి...' : 'Type your agriculture question here...'}
              className="w-full border border-green-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all bg-white"
              rows="1"
              style={{ minHeight: '50px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
            title="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500">
            {isListening ? (language === 'te' ? 'వినడంలో... మాట్లాడండి' : 'Listening... Speak now') : 
             isSpeaking ? (language === 'te' ? 'మాట్లాడుతోంది...' : 'Speaking...') : 
             isLoading ? (language === 'te' ? 'ప్రతిస్పందించడం...' : 'Responding...') :
             (language === 'te' ? 'మైక్‌ను నొక్కి మాట్లాడండి లేదా టైప్ చేయండి' : 'Press mic to speak or type your question')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KrishiMitraChatbot;
