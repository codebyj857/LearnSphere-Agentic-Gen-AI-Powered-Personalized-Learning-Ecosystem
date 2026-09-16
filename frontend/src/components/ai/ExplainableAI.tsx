import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, Sparkles, BarChart3, PieChart, TrendingUp, Target, BookOpen, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  analysis?: any;
  explanation?: string;
  confidence?: number;
  sources?: string[];
  related_topics?: string[];
}

interface AIResponse {
  response: string;
  explanation: string;
  confidence: number;
  analysis: any;
  sources: string[];
  related_topics: string[];
  timestamp: string;
}

const ExplainableAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [visualization, setVisualization] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check AI status on mount
    fetch('http://localhost:5002/api/ai-status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiStatus(data.status);
        }
      })
      .catch(err => console.error('Status check failed:', err));
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);
    setVisualization(null);

    try {
      const response = await fetch('http://localhost:5002/api/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          user_id: 'user_' + Date.now()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.data.response,
            timestamp: data.data.timestamp,
            analysis: data.data.analysis,
            explanation: data.data.explanation,
            confidence: data.data.confidence,
            sources: data.data.sources,
            related_topics: data.data.related_topics
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Enhanced AI error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the enhanced AI system. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateVisualization = async (data: any, type: string = 'auto') => {
    try {
      const response = await fetch('http://localhost:5002/api/generate-visualization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          type: type
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVisualization(result.visualization);
        }
      }
    } catch (error) {
      console.error('Visualization error:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'learning': return <BookOpen size={16} className="text-blue-400" />;
      case 'career': return <Target size={16} className="text-green-400" />;
      case 'technical': return <Brain size={16} className="text-purple-400" />;
      case 'advice': return <Lightbulb size={16} className="text-yellow-400" />;
      default: return <Sparkles size={16} className="text-pink-400" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('http://localhost:5002/api/clear-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: 'user_' + Date.now()
        })
      });
      setMessages([]);
      setVisualization(null);
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Explainable AI Assistant
              </h1>
              <p className="text-xs text-gray-400">Intelligent Learning Companion</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {aiStatus && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${aiStatus.gemini_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-400">
                  {aiStatus.gemini_connected ? 'Gemini Connected' : 'Fallback Mode'}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="px-3 py-1 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              {showAnalysis ? 'Hide' : 'Show'} Analysis
            </button>
            <button
              onClick={clearHistory}
              className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Explainable AI</h2>
                <p className="text-gray-400 mb-4">Ask me anything about learning, careers, or technology!</p>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                  {['How do I learn Python?', 'What skills do I need for data science?', 'Career advice for developers'].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInputText(prompt)}
                      className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {message.role === 'user' ? (
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">U</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* AI Analysis Section */}
                        {message.role === 'assistant' && showAnalysis && message.analysis && (
                          <div className="mt-4 space-y-3 border-t border-gray-700 pt-3">
                            {/* Analysis Badges */}
                            <div className="flex flex-wrap gap-2">
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-lg text-xs">
                                {getIntentIcon(message.analysis.intent)}
                                <span>Intent: {message.analysis.intent}</span>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-lg text-xs">
                                <span>Domain: {message.analysis.domain}</span>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-lg text-xs">
                                <span>Complexity: {message.analysis.complexity}</span>
                              </div>
                            </div>
                            
                            {/* Confidence Score */}
                            {message.confidence && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm">Confidence:</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-300 ${
                                        message.confidence >= 0.8 ? 'bg-green-400' :
                                        message.confidence >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                                      }`}
                                      style={{ width: `${message.confidence * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className={`text-sm font-bold ${getConfidenceColor(message.confidence)}`}>
                                    {Math.round(message.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Explanation */}
                            {message.explanation && (
                              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm font-semibold text-blue-400">Explanation</span>
                                </div>
                                <p className="text-sm text-gray-300">{message.explanation}</p>
                              </div>
                            )}
                            
                            {/* Sources */}
                            {message.sources && message.sources.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="w-4 h-4 text-green-400" />
                                  <span className="text-sm font-semibold text-green-400">Sources</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {message.sources.map((source, i) => (
                                    <span key={i} className="px-2 py-1 bg-green-600/10 border border-green-500/20 rounded text-xs">
                                      {source}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Related Topics */}
                            {message.related_topics && message.related_topics.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Target className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm font-semibold text-purple-400">Related Topics</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {message.related_topics.map((topic, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setInputText(`Tell me more about ${topic}`)}
                                      className="px-2 py-1 bg-purple-600/10 border border-purple-500/20 rounded text-xs hover:bg-purple-600/20 transition-colors"
                                    >
                                      {topic}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                      <span className="text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about learning, careers, or technology..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => generateVisualization({
                    title: 'Sample Learning Progress',
                    categories: ['Python', 'JavaScript', 'React', 'Node.js', 'Database'],
                    values: [85, 70, 60, 45, 30]
                  }, 'bar')}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Sample Chart
                </button>
                <button
                  onClick={() => generateVisualization({
                    title: 'Skill Distribution',
                    labels: ['Technical', 'Creative', 'Analytical', 'Communication'],
                    values: [40, 25, 20, 15]
                  }, 'pie')}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  <PieChart className="w-4 h-4" />
                  Skill Chart
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visualization Panel */}
        {visualization && (
          <div className="w-96 bg-gray-800/50 backdrop-blur-sm border-l border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Visualization</h3>
              <button
                onClick={() => setVisualization(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <img src={visualization} alt="Visualization" className="w-full h-auto rounded" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplainableAI;
