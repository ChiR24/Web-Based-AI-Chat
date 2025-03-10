import React from 'react';

interface WelcomeMessageProps {
  onSendMessage: (message: string) => void;
}

/**
 * WelcomeMessage component for displaying a welcome message when there are no messages
 */
const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onSendMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Welcome to Gemi</h2>
      <p className="text-gray-400 mb-8 max-w-lg">
        Powered by Google's Gemini models, Gemi can help you with a wide range of tasks, from answering questions to generating creative content.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        <button
          onClick={() => onSendMessage("What are the key features of Gemini 2.0?")}
          className="p-4 bg-[#1d1e20] rounded-xl text-left text-white hover:bg-[#252525] transition-colors border border-[#333]"
        >
          <span className="block font-medium mb-1">What are the key features of Gemini 2.0?</span>
          <span className="text-sm text-gray-400">Learn about the latest capabilities</span>
        </button>
        
        <button
          onClick={() => onSendMessage("/search What's happening in the world today?")}
          className="p-4 bg-[#1d1e20] rounded-xl text-left text-white hover:bg-[#252525] transition-colors border border-[#333]"
        >
          <span className="block font-medium mb-1">What's happening in the world today?</span>
          <span className="text-sm text-gray-400">Try web search with /search</span>
        </button>
        
        <button
          onClick={() => onSendMessage("Write a short story about a robot learning to paint")}
          className="p-4 bg-[#1d1e20] rounded-xl text-left text-white hover:bg-[#252525] transition-colors border border-[#333]"
        >
          <span className="block font-medium mb-1">Write a short story about a robot learning to paint</span>
          <span className="text-sm text-gray-400">Generate creative content</span>
        </button>
        
        <button
          onClick={() => onSendMessage("Explain quantum computing in simple terms")}
          className="p-4 bg-[#1d1e20] rounded-xl text-left text-white hover:bg-[#252525] transition-colors border border-[#333]"
        >
          <span className="block font-medium mb-1">Explain quantum computing in simple terms</span>
          <span className="text-sm text-gray-400">Get explanations on complex topics</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeMessage; 