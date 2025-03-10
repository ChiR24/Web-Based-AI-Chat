import React from 'react';

interface HeaderProps {
  toggleHistory: () => void;
  onClearChat?: () => void;
}

/**
 * Header component for the chat application
 */
const Header: React.FC<HeaderProps> = ({
  toggleHistory,
  onClearChat
}) => {
  const handleNewChat = () => {
    if (onClearChat) {
      onClearChat();
    }
  };

  // Custom Grok logo component
  const GrokLogo = () => (
    <div className="flex items-center">
      <svg width="24" height="24" viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="2">
        <circle cx="18" cy="18" r="16" fill="transparent"/>
        <path d="M18 10L28 24H8L18 10Z" fill="transparent"/>
      </svg>
      <span className="text-white text-lg font-medium ml-2">Gemi</span>
    </div>
  );

  return (
    <header className="border-b border-[#222] py-3 bg-[#0E0E0F]">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <GrokLogo />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleNewChat}
            className="px-3 py-1.5 rounded-full bg-[#1d1e20] text-white text-sm font-medium border border-[#333] hover:bg-[#252525] transition-colors"
          >
            New chat
          </button>
          
          <button
            onClick={toggleHistory}
            className="p-2 rounded-full bg-[#1d1e20] border border-[#333] text-white hover:bg-[#252525] transition-colors"
            aria-label="Toggle history"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 