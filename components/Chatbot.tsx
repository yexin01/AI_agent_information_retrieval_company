import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, ChatResponse, ChatOptions } from '../services/geminiService';
import { XMarkIcon } from './icons/XMarkIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { LogoIcon } from './icons/LogoIcon';
import { Source } from '../types';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChatSources } from './ChatSources';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { ToggleSwitch } from './ToggleSwitch';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: Source[];
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  companyContext?: string | null;
}

const getInitialMessage = (companyContext?: string | null): ChatMessage => {
  if (companyContext) {
    return {
      role: 'model',
      content: `Hello! I'm ready to answer your questions about **${companyContext}**. Feel free to ask about its financials, business, or anything else.`
    };
  }
  return {
    role: 'model',
    content: "Hello! I'm the Profile Agent Assistant. Ask me anything about public companies or financial topics."
  };
};


export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, companyContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialMessage(companyContext)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isDeepAnalysisEnabled, setIsDeepAnalysisEnabled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const prevCompanyContext = useRef(companyContext);

  // Effect to reset chat when company context changes
  useEffect(() => {
    if (companyContext !== prevCompanyContext.current) {
      setMessages([getInitialMessage(companyContext)]);
      prevCompanyContext.current = companyContext;
    }
  }, [companyContext]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  // Click outside handler for settings popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };
    if (isSettingsOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [isSettingsOpen]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await sendChatMessage(
        input, 
        { isWebSearchEnabled, isDeepAnalysisEnabled }, 
        companyContext || undefined
      );
      const modelMessage: ChatMessage = { 
        role: 'model', 
        content: response.text,
        sources: response.sources,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100%-3rem)] max-w-lg h-[70vh] max-h-[600px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-30 animate-fade-in-up">
      {/* Header */}
      <header className="relative p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <LogoIcon className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-white leading-tight">AI Assistant</h3>
                    {companyContext && (
                        <p className="text-xs text-slate-400 leading-tight truncate max-w-[200px] sm:max-w-xs" title={companyContext}>
                            Context: {companyContext}
                        </p>
                    )}
                </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <div className="flex items-center justify-between gap-2 mt-3">
            <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                {!isWebSearchEnabled && !isDeepAnalysisEnabled && (
                    <span className="flex items-center gap-1.5 px-2 py-1">
                        Standard Mode
                    </span>
                )}
                {isWebSearchEnabled && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-700 rounded-md">
                        <GlobeAltIcon className="w-4 h-4 text-cyan-400"/> Web Search
                    </span>
                )}
                {isDeepAnalysisEnabled && (
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-700 rounded-md">
                        <SparklesIcon className="w-4 h-4 text-violet-400"/> Deep Analysis
                    </span>
                )}
            </div>
            <button
                onClick={() => setIsSettingsOpen(prev => !prev)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Chat settings"
            >
                <Cog6ToothIcon className="w-5 h-5" />
            </button>
        </div>
        {isSettingsOpen && (
            <div
                ref={settingsRef} 
                className="absolute top-full right-4 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 p-2 animate-fade-in-up"
                style={{ animationDuration: '200ms' }}
            >
                <ToggleSwitch
                    label="Web Search"
                    description="Get up-to-date answers."
                    icon={<GlobeAltIcon className="w-5 h-5"/>}
                    enabled={isWebSearchEnabled}
                    onChange={setIsWebSearchEnabled}
                />
                <ToggleSwitch
                    label="Deep Analysis"
                    description="For complex questions."
                    icon={<SparklesIcon className="w-5 h-5"/>}
                    enabled={isDeepAnalysisEnabled}
                    onChange={setIsDeepAnalysisEnabled}
                />
            </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <LogoIcon className="w-5 h-5 text-cyan-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-700 text-slate-300 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*([^*]+)\*/g, '<strong>$1</strong>') }}></div>
                {msg.sources && msg.sources.length > 0 && <ChatSources sources={msg.sources} />}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <LogoIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="max-w-[80%] p-3 rounded-xl bg-slate-700 text-slate-300 rounded-bl-none flex items-center">
                    <SpinnerIcon className="w-5 h-5 animate-spin" />
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors duration-200 disabled:opacity-50"
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute inset-y-0 right-0 px-4 flex items-center text-cyan-400 disabled:text-slate-500 disabled:cursor-not-allowed hover:text-cyan-300"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};