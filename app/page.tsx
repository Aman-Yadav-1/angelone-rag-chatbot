'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Info, X, Loader2 } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Suggested questions for quick input
const SUGGESTED_QUESTIONS = [
  "What insurance plans do you offer?",
  "How do I file a claim?",
  "What's covered in my policy?",
  "How can I update my payment method?"
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    if (showWelcome) setShowWelcome(false);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);
    
    try {
      const history = messages.slice(-6).map(({ role, content }) => ({
        role: role === 'user' ? 'user' : 'assistant',
        content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      addMessage('assistant', data.text || 'I apologize, but I encountered an error.');
    } catch (error) {
      console.error('Error:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    "What are the benefits of the 2500 Gold plan?",
    "What does the 5000 HSA plan cover?",
    "What's the difference between Bronze and Gold plans?",
    "How do I file a claim?"
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              AngelOne Insurance
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-400 text-white px-3 py-1 rounded-full shadow-sm">
              Beta
            </span>
            <button
              onClick={() => setShowWelcome(!showWelcome)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-all duration-200 hover:scale-105"
              aria-label="Toggle welcome message"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome Message */}
          {showWelcome && (
            <div className="mb-8 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-fadeIn">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      Welcome to AngelOne Insurance
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="Close welcome message"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 pl-1">
                  I'm here to help you with any questions about your insurance policies, claims, or coverage options.
                  Try one of these common questions:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setInput(question);
                        inputRef.current?.focus();
                      }}
                      className="group text-left p-3.5 rounded-xl border border-gray-200 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-900/50 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 hover:shadow-sm hover:-translate-y-0.5"
                    >
                      <span className="group-hover:text-blue-500 transition-colors">{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {messages.length === 0 && !showWelcome && (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 mb-5">
                <Sparkles className="h-9 w-9 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How can I help you today?</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Ask me anything about your insurance policies, claims, or coverage options.
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                {suggestedQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setInput(question);
                      inputRef.current?.focus();
                    }}
                    className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm shadow-lg'
                    : 'bg-white dark:bg-gray-800 shadow-md rounded-bl-sm border border-gray-100 dark:border-gray-700/50 backdrop-blur-sm'
                } transition-all duration-200 hover:shadow-md`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
                <div className={`mt-1.5 flex items-center justify-end space-x-2 ${
                  message.role === 'user' ? 'text-blue-100/90' : 'text-gray-400'
                }`}>
                  <span className="text-xs font-medium">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.role === 'assistant' && (
                    <span className="text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-blue-400 text-white px-2 py-0.5 rounded-full">
                      AI Assistant
                    </span>
                  )}
                </div>
                {message.role === 'user' ? (
                  <div className="absolute -bottom-3 right-0 w-3 h-3 bg-blue-500 transform rotate-45 origin-bottom-right"></div>
                ) : (
                  <div className="absolute -bottom-3 left-0 w-3 h-3 bg-white dark:bg-gray-800 border-l border-b border-gray-100 dark:border-gray-700/50 transform rotate-45 origin-bottom-left"></div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-3xl mx-auto p-4">
          <div className="relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full pr-14 py-3.5 pl-5 text-gray-900 dark:text-white bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[56px] max-h-40 overflow-y-auto transition-all duration-200 shadow-sm"
                style={{ minHeight: '56px', height: 'auto' }}
                rows={1}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 rounded-full text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 shadow-md hover:shadow-lg disabled:shadow-none"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {input.length}/1000 characters
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}