import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import ModelSelector from '../../../shared/components/ModelSelector';
import { SearchIcon } from '../../../shared/components/icons/SearchIcon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

/**
 * ChatInput component for sending messages
 * Redesigned to match Perplexity's clean interface
 */
const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedModel, setSelectedModel } = useChat();
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    // Handle web search queries
    if (trimmedMessage.startsWith('/search ')) {
      const searchQuery = trimmedMessage.replace('/search ', '');
      onSendMessage(`/search ${searchQuery}`);
    } else if (isWebSearchEnabled) {
      onSendMessage(`/search ${trimmedMessage}`);
    } else {
      onSendMessage(trimmedMessage);
    }
    
    // Clear input
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleWebSearch = () => {
    setIsWebSearchEnabled(!isWebSearchEnabled);
  };

  return (
    <div className="chat-input-container">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className={`chat-input-box ${disabled ? 'opacity-50' : ''}`}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isWebSearchEnabled ? "Search the web..." : "Send a message..."}
              className="chat-textarea"
              disabled={disabled}
              rows={1}
            />
            
            <div className="chat-input-actions">
              <button
                type="button"
                onClick={toggleWebSearch}
                className={`chat-input-action-button ${isWebSearchEnabled ? 'active bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-400 hover:text-white'}`}
                title={isWebSearchEnabled ? "Disable web search" : "Enable web search"}
                disabled={disabled}
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              
              <div className="border-l border-gray-700 h-6 mx-2"></div>
              
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                disabled={disabled}
                className="mr-2"
                webSearchEnabled={isWebSearchEnabled}
              />
              
              <button
                type="submit"
                disabled={!message.trim() || disabled}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !message.trim() || disabled
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                  Send
                </span>
              </button>
            </div>
          </div>
          
          {isWebSearchEnabled && (
            <div className="mt-2 text-xs text-center text-blue-400">
              <span className="flex items-center justify-center">
                <SearchIcon className="w-3 h-3 mr-1" />
                Web search is enabled. Your query will search the internet for the most up-to-date information.
              </span>
            </div>
          )}
          
          
        </form>
      </div>
    </div>
  );
};

export default ChatInput; 