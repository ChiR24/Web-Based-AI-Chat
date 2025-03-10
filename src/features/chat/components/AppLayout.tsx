import React, { useState, useEffect, useRef, ReactNode } from 'react';
import Header from './Header';
import Chat from './Chat';
import ChatInput from './ChatInput';
import { AnimatePresence, motion } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import HistoryPopup from './HistoryPopup';

interface AppLayoutProps {
  children?: ReactNode;
}

/**
 * AppLayout component for the chat application
 */
const AppLayout: React.FC<AppLayoutProps> = () => {
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const { startNewConversation, sendMessage, isLoading } = useChat();
  
  // Handle clicking outside the history popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showHistory && 
          historyRef.current && 
          !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHistory]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle history
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowHistory(prev => !prev);
      }
      
      // Cmd/Ctrl + N to start new conversation
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        startNewConversation();
      }
    };
    
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [startNewConversation]);
  
  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };
  
  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };
  
  return (
    <div className="flex flex-col h-screen bg-black">
      <Header 
        toggleHistory={toggleHistory}
        onClearChat={startNewConversation}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <Chat />
        
        <div className="p-4 border-t border-[#222] bg-[#0E0E0F]">
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
      
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <HistoryPopup 
              ref={historyRef}
              onClose={() => setShowHistory(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout; 