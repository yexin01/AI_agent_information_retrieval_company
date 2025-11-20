import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';

interface ChatbotToggleButtonProps {
  onClick: () => void;
}

export const ChatbotToggleButton: React.FC<ChatbotToggleButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 group z-20"
      aria-label="Open AI chatbot"
    >
      <div className="absolute inset-0 bg-cyan-500 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
      <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-4 rounded-full shadow-xl border border-white/20 hover:scale-110 transition-transform duration-300 flex items-center justify-center">
        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
      </div>
    </button>
  );
};
