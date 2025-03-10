import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import ThinkingIndicator from './ThinkingIndicator';
import WelcomeMessage from './WelcomeMessage';
import MessageRenderer from '../../../shared/components/MessageRenderer';
import { ThinkingProcess } from '../../gemini/types/gemini.types';

// Conversation title component with edit functionality
const ConversationTitle: React.FC = () => {
  const { activeConversation, updateConversationTitle } = useChat();
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(activeConversation?.title || 'New Chat');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update title value when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      setTitleValue(activeConversation.title);
    }
  }, [activeConversation]);
  
  const handleEditClick = () => {
    setIsEditing(true);
    // Focus the input after it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };
  
  const handleSave = () => {
    if (activeConversation && titleValue.trim()) {
      updateConversationTitle(activeConversation.id, titleValue);
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setTitleValue(activeConversation?.title || 'New Chat');
    }
  };
  
  return (
    <div className="flex items-center justify-center py-4">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="bg-[#1d1e20] text-white border border-[#333] rounded-lg px-3 py-1 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
          maxLength={50}
        />
      ) : (
        <h1 
          className="text-white text-lg font-medium cursor-pointer hover:text-blue-400 transition-colors"
          onClick={handleEditClick}
        >
          {activeConversation?.title || 'New Chat'}
        </h1>
      )}
    </div>
  );
};

/**
 * Chat component
 * Redesigned to match Perplexity's clean design
 */
const Chat: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(false);
  
  // Update scrolling behavior
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const toggleThinkingCollapse = () => {
    setIsThinkingCollapsed(!isThinkingCollapsed);
  };
  
  // Check if a message is a DeepSearch query
  const isDeepSearchMessage = (message: string): boolean => {
    // Check for the /search prefix (case insensitive)
    return message.toLowerCase().trim().startsWith('/search ');
  };
  
  // Clean message text by removing /search prefix
  const cleanMessageText = (message: string): string => {
    if (isDeepSearchMessage(message)) {
      // Remove the /search prefix and trim
      return message.substring(message.toLowerCase().indexOf('/search ') + 8).trim();
    }
    return message;
  };
  
  // Get thinking process from the last assistant message
  const getThinkingProcess = (): ThinkingProcess | undefined => {
    if (isLoading) return undefined;
    
    // Check if the most recent assistant message has a thinking process
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(m => m.role === 'assistant');
    
    if (lastAssistantMessage?.metadata?.thinking) {
      console.log('Found thinking process in last assistant message:', lastAssistantMessage.metadata.thinking);
      return lastAssistantMessage.metadata.thinking;
    }
    
    return undefined;
  };
  
  // Get the last user message
  const getLastUserMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i];
      }
    }
    return null;
  };
  
  // Determine if the current conversation is using DeepSearch
  const isCurrentDeepSearch = (): boolean => {
    // If we're loading and the last user message was a search query, it's DeepSearch
    if (isLoading) {
      const lastUserMsg = getLastUserMessage();
      if (lastUserMsg) {
        return isDeepSearchMessage(lastUserMsg.content);
      }
    }
    
    // If we have a completed response and it's marked as DeepSearch, use that
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(m => m.role === 'assistant');
      
    if (lastAssistantMessage?.isDeepSearch) {
      return true;
    }
    
    // Check if the last user message was a search query
    const lastUserMessage = getLastUserMessage();
    return lastUserMessage ? isDeepSearchMessage(lastUserMessage.content) : false;
  };
  
  // Render the appropriate welcome message or conversation
  const renderContent = () => {
    if (messages.length === 0) {
      return <WelcomeMessage onSendMessage={sendMessage} />;
    }
    
    return (
      <div className="message-container pb-32">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`message ${message.role === 'user' ? 'message--user' : 'message--assistant'}`}
          >
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="shrink-0 mt-1">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Message Content */}
                <div className="flex-1 overflow-hidden">
                  {/* Message Header */}
                  <div className="flex items-center mb-1 gap-2">
                    <div className="font-medium text-sm text-gray-300">
                      {message.role === 'user' ? 'You' : 'Gemini AI'}
                    </div>
                    
                    {message.role === 'assistant' && message.modelId && (
                      <div className="flex items-center gap-2">
                        <div className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-medium">
                          {message.modelId.replace('gemini-', '').replace('-exp', '')}
                        </div>
                        
                        {message.isDeepSearch && (
                          <div className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 font-medium">
                            Web Search
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {/* Message Body */}
                  <div className="message-body">
                    {message.role === 'user' ? (
                      <div className="text-gray-200">{cleanMessageText(message.content)}</div>
                    ) : (
                      <MessageRenderer 
                        content={message.content} 
                        citations={message.metadata?.thinking?.citations || []}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Thinking Process */}
        {isLoading || getThinkingProcess() ? (
          <div className="max-w-3xl mx-auto px-4 mb-4">
            <ThinkingIndicator
              thinking={isLoading}
              isDeepSearch={isCurrentDeepSearch()}
              isCollapsed={isThinkingCollapsed}
              onToggleCollapse={toggleThinkingCollapse}
              thinkingProcess={getThinkingProcess()}
            />
          </div>
        ) : null}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="max-w-3xl mx-auto px-4 mb-4">
            <div className="flex items-center justify-center py-6">
              <div className="perplexity-progress w-16">
                <div className="perplexity-progress-pulsate"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    );
  };
  
  return (
    <div className="chat-container h-full flex flex-col overflow-hidden">
      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="perplexity-progress">
            <div className="perplexity-progress-pulsate"></div>
          </div>
        </div>
      )}
      
      {/* Conversation Title */}
      <ConversationTitle />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Chat; 