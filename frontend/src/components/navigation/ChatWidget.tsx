import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, X, Mic, Volume2, Maximize2 } from 'lucide-react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useChat } from '../../context/ChatContext';

const ChatWidget = () => {
  const { isOpen, toggleChat, closeChat } = useChat();
  const [messages, setMessages] = useState<{text: string, isBot: boolean}[]>([
    { text: "Hello! I am connected to Google Gemini. Ask me anything about your career path!", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState({ width: 384, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Auto-reconnection logic
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch('/', { 
          method: 'GET',
          mode: 'no-cors'
        });
        setIsOnline(true);
      } catch (error) {
        // Try CORS fallback
        try {
          const res = await fetch('/api/chat', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'ping' })
          });
          setIsOnline(true);
        } catch (err) {
          setIsOnline(false);
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);

  // Resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(350, Math.min(window.innerWidth * 0.9, startWidth + (e.clientX - startX)));
      const newHeight = Math.max(450, Math.min(window.innerHeight * 0.9, startHeight + (e.clientY - startY)));
      
      setSize({ width: newWidth, height: newHeight });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size]);

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'nwse-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
    
    return () => {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  const handleSend = async () => {
    if (!input.trim() || !isOnline) return;
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");
    resetTranscript();
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMsg })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.response || data.error, isBot: true }]);
    } catch (error) {
      console.error("Chat Fetch Error:", error);
      setMessages(prev => [...prev, { text: "Network Error: The Python backend is not responding. Please make sure terminal 1 is running 'python app.py'.", isBot: true }]);
    }
    setIsLoading(false);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) {
    return (
      <button onClick={toggleChat} className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-110 text-white p-4 rounded-full shadow-2xl transition-all">
        <MessageCircle size={32} />
      </button>
    );
  }

  const getStatusColor = () => {
    return isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <div 
        ref={chatRef}
        className="bg-gray-900 border border-purple-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-200"
        style={{ 
          width: `${size.width}px`, 
          height: `${size.height}px`,
          minWidth: '350px',
          minHeight: '450px',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <div className="bg-gray-800/80 p-5 flex justify-between items-center border-b border-gray-700">
          <span className="font-bold text-white flex items-center gap-3 text-lg">
            <span className="relative flex h-3 w-3">
              <span className={`inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
            </span>
            AI Mentor
            {!isOnline && <span className="text-xs text-red-400">(Offline)</span>}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMinimized(!isMinimized)} 
              className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
              title="Minimize/Maximize"
            >
              <Maximize2 size={16} className={isMinimized ? 'rotate-180' : ''} />
            </button>
            <button onClick={closeChat} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={20}/></button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-md ${msg.isBot ? 'bg-gray-800 text-gray-100 rounded-tl-sm' : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm'}`}>
                  <p className="text-[14px] leading-[1.5]">{msg.text}</p>
                  {msg.isBot && <button onClick={() => speak(msg.text)} className="mt-3 text-purple-300 hover:text-white transition-colors"><Volume2 size={16}/></button>}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-gray-500 text-xs ml-4 animate-pulse">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        <div className="p-4 bg-gray-800/80 border-t border-gray-700 flex gap-2 backdrop-blur-md">
          <button onClick={() => SpeechRecognition.startListening()} className={`p-3 rounded-full transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}><Mic size={20}/></button>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={isOnline ? "Ask me..." : "Connecting..."} 
            disabled={!isOnline}
            className="flex-1 bg-gray-900/50 text-white text-[14px] leading-[1.5] rounded-xl px-4 py-2 border border-gray-600 focus:border-purple-500 outline-none transition-all placeholder-gray-500 disabled:opacity-50" 
          />
          <button 
            onClick={handleSend} 
            disabled={!isOnline || !input.trim()}
            className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20}/>
          </button>
        </div>
        {/* Resize Handle */}
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-gradient-to-br from-purple-600/50 to-indigo-600/50 rounded-tl-lg hover:from-purple-600 hover:to-indigo-600 transition-all"
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-l-2 border-b-2 border-gray-400 border-l-gray-400 border-b-gray-400"></div>
        </div>
      </div>
    </div>
  );
};
export default ChatWidget;
