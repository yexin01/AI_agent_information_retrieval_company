import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';

interface ChatbotToggleButtonProps {
  onClick: () => void;
}

export const ChatbotToggleButton: React.FC<ChatbotToggleButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 transform hover:scale-110 z-20 animate-fade-in"
      aria-label="Open AI chatbot"
    >
      <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
    </button>
  );
};
