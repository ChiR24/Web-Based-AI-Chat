import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../context/ChatContext';

interface HistoryPopupProps {
  onClose: () => void;
}

/**
 * HistoryPopup component for displaying conversation history
 */
const HistoryPopup = forwardRef<HTMLDivElement, HistoryPopupProps>(({ onClose }, ref) => {
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation,
    deleteConversation,
    startNewConversation
  } = useChat();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
    onClose();
  };
  
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(id);
  };
  
  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id);
    setShowDeleteConfirm(null);
  };
  
  const handleNewChat = () => {
    startNewConversation();
    onClose();
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-[#1d1e20] rounded-xl shadow-xl border border-[#333] w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-[#333] flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Conversation History</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-[#333] text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="p-4 border-b border-[#333]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#252525] text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        
        <button
          onClick={handleNewChat}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
        >
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No conversations found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeConversation?.id === conv.id
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'hover:bg-[#252525] border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{conv.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {formatDate(conv.createdAt)}
                    </p>
                  </div>
                  
                  {showDeleteConfirm === conv.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => confirmDelete(conv.id, e)}
                        className="p-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        aria-label="Confirm delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(null);
                        }}
                        className="p-1.5 rounded-full bg-[#333] text-gray-400 hover:bg-[#444]"
                        aria-label="Cancel delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="p-1.5 rounded-full text-gray-400 hover:bg-[#333] hover:text-white"
                      aria-label="Delete conversation"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

HistoryPopup.displayName = 'HistoryPopup';

export default HistoryPopup; 