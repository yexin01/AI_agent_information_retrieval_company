import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { ChatResponse, sendChatMessage } from '../services/geminiService';
import { Source } from '../types';
import { ChatSources } from './ChatSources';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { GlobeAltIcon } from './icons/GlobeAltIcon';
import { LogoIcon } from './icons/LogoIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { XMarkIcon } from './icons/XMarkIcon';
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
  const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const prevCompanyContext = useRef(companyContext);

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
        { isWebSearchEnabled, model: selectedModel },
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

  const handleSpeak = (text: string, index: number) => {
    if (isSpeaking && speakingMessageIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
    };
    setSpeakingMessageIndex(index);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[90vw] max-w-3xl h-[85vh] max-h-[800px] glass-panel rounded-2xl border border-white/10 shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <header className="relative p-4 border-b border-white/10 flex-shrink-0 bg-slate-900/50 backdrop-blur-xl rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-white/10">
              <LogoIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">AI Assistant</h3>
              {companyContext && (
                <p className="text-xs text-slate-400 leading-tight truncate max-w-[200px] sm:max-w-xs" title={companyContext}>
                  Context: {companyContext}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close chat"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
            <span className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
              selectedModel === 'gemini-2.5-pro'
                ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
                : "bg-white/5 border-white/5"
            )}>
              <SparklesIcon className="w-3.5 h-3.5" /> {selectedModel === 'gemini-2.5-pro' ? 'Pro' : 'Flash'}
            </span>
            {isWebSearchEnabled && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 text-cyan-300 rounded-full border border-cyan-500/20">
                <GlobeAltIcon className="w-3.5 h-3.5" /> RAG
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSettingsOpen(prev => !prev)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isSettingsOpen ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
            aria-label="Chat settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
        {isSettingsOpen && (
          <div
            ref={settingsRef}
            className="absolute top-full right-4 mt-2 w-72 glass-panel border border-white/10 rounded-xl shadow-2xl z-40 p-3 animate-in fade-in zoom-in-95 duration-200"
          >
            <ToggleSwitch
              label="Web Search (RAG)"
              description="Search the web for answers."
              icon={<GlobeAltIcon className="w-5 h-5 text-cyan-400" />}
              enabled={isWebSearchEnabled}
              onChange={setIsWebSearchEnabled}
            />
            <div className="h-px bg-white/5 my-2" />
            <ToggleSwitch
              label="Pro Model"
              description="Use Gemini 2.5 Pro for deeper reasoning."
              icon={<SparklesIcon className="w-5 h-5 text-violet-400" />}
              enabled={selectedModel === 'gemini-2.5-pro'}
              onChange={(enabled) => setSelectedModel(enabled ? 'gemini-2.5-pro' : 'gemini-2.5-flash')}
            />
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 border border-white/10 mt-1">
                <LogoIcon className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user'
                  ? "bg-cyan-600 text-white rounded-br-sm"
                  : "bg-slate-800/80 text-slate-200 rounded-bl-sm border border-white/5"
              )}
            >
              <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*([^*]+)\*/g, '<strong>$1</strong>') }}></div>
              {msg.sources && msg.sources.length > 0 && <ChatSources sources={msg.sources} />}
              {msg.role === 'model' && (
                <button
                  onClick={() => handleSpeak(msg.content, index)}
                  className="mt-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-xs"
                  title={isSpeaking && speakingMessageIndex === index ? "Stop speaking" : "Read aloud"}
                >
                  <SpeakerWaveIcon className={cn("w-3.5 h-3.5", isSpeaking && speakingMessageIndex === index && "text-cyan-400 animate-pulse")} />
                  {isSpeaking && speakingMessageIndex === index ? "Stop" : "Read"}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 border border-white/10 mt-1">
              <LogoIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 rounded-bl-sm border border-white/5 flex items-center gap-2">
              <SpinnerIcon className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 flex-shrink-0 bg-slate-900/30">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3.5 bg-slate-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all duration-200 disabled:opacity-50 text-sm text-white placeholder:text-slate-500"
            autoFocus
          />
          <button
            onClick={handleListen}
            className={cn(
              "absolute inset-y-0 right-10 my-1 px-2 flex items-center justify-center rounded-lg transition-colors",
              isListening ? "text-red-400 animate-pulse" : "text-slate-400 hover:text-white"
            )}
            aria-label="Voice input"
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute inset-y-0 right-1 my-1 px-3 flex items-center justify-center rounded-lg text-cyan-400 disabled:text-slate-600 disabled:cursor-not-allowed hover:bg-cyan-500/10 transition-colors"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};