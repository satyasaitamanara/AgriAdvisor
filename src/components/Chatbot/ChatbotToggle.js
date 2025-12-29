import React from 'react';
import { Bot, MessageCircle } from 'lucide-react';

const ChatbotToggle = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-40 ${
        isOpen 
          ? 'bg-red-500 text-white transform scale-110 shadow-lg' 
          : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 hover:scale-110 shadow-lg hover:shadow-xl'
      }`}
      aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
    >
      {isOpen ? (
        <span className="text-2xl font-bold">×</span>
      ) : (
        <>
          <Bot size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center animate-pulse border-2 border-white">
            AI
          </span>
        </>
      )}
    </button>
  );
};

export default ChatbotToggle;