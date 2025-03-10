import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getDefaultModel } from '../../../shared/utils/geminiModels';
import { useGemini } from '../../gemini/hooks/useGemini';
import { SearchResult } from '../../gemini/types/gemini.types';
import { ThinkingProcess } from '../../gemini/types/gemini.types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelId?: string;
  isDeepSearch?: boolean;
  metadata?: {
    thinking?: ThinkingProcess;
  };
}

interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
  modelId: string;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (id: string | null) => void;
  updateConversationTitle: (id: string, title: string) => void;
  startNewConversation: () => void;
  deleteConversation: (id: string) => void;
  suggestedQuestions: string[];
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isLoading: false,
  sendMessage: () => {},
  clearMessages: () => {},
  conversations: [],
  activeConversation: null,
  setActiveConversation: () => {},
  updateConversationTitle: () => {},
  startNewConversation: () => {},
  deleteConversation: () => {},
  suggestedQuestions: [],
  selectedModel: getDefaultModel().id,
  setSelectedModel: () => {}
});

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  // Define helper functions first
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };
  
  const getFirstMessageTitle = (content: string) => {
    // Create a title from the first message
    const words = content.split(' ').slice(0, 5);
    let title = words.join(' ');
    if (content.length > title.length) title += '...';
    return title;
  };
  
  // Now use the functions in state initialization and other places
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [
      {
        id: generateId(),
        title: 'New Chat',
        createdAt: Date.now(),
        messages: [],
        modelId: getDefaultModel().id
      }
    ];
  });
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const saved = localStorage.getItem('activeConversationId');
    return saved || conversations[0]?.id || null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What are the key features of Gemini 2.0?",
    "How does web search work in this chat?",
    "Can you write code examples in Python?",
    "Explain quantum computing in simple terms"
  ]);
  
  const [selectedModel, setSelectedModel] = useState<string>(getDefaultModel().id);
  
  const { generateContent, generateWithWebSearch } = useGemini();
  
  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);
  
  // Save active conversation ID to localStorage
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    }
  }, [activeConversationId]);
  
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  
  const setActiveConversation = (id: string | null) => {
    setActiveConversationId(id);
  };
  
  const updateConversationTitle = (id: string, title: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, title } : conv
      )
    );
  };
  
  const handleSetSelectedModel = (modelId: string) => {
    setSelectedModel(modelId);
    
    // Update the active conversation's model
    if (activeConversationId) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversationId ? { ...conv, modelId } : conv
        )
      );
    }
  };
  
  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      createdAt: Date.now(),
      messages: [],
      modelId: selectedModel
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };
  
  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    
    // If the active conversation is deleted, set the first available conversation as active
    if (activeConversationId === id) {
      const remainingConversations = conversations.filter(conv => conv.id !== id);
      if (remainingConversations.length > 0) {
        setActiveConversationId(remainingConversations[0].id);
      } else {
        // If no conversations left, create a new one
        startNewConversation();
      }
    }
  };
  
  const sendMessage = async (content: string) => {
    if (!activeConversationId || !content.trim()) return;
    
    // Check if this is a DeepSearch query
    const isDeepSearch = content.toLowerCase().startsWith('/search ');
    const cleanContent = isDeepSearch ? content.substring(8).trim() : content;
    
    // Create user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: cleanContent,
      timestamp: Date.now(),
      modelId: selectedModel,
      isDeepSearch
    };
    
    // Add user message to conversation
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, userMessage],
              title: conv.messages.length === 0 ? getFirstMessageTitle(cleanContent) : conv.title
            } 
          : conv
      )
    );
    
    // Start loading
    setIsLoading(true);
    
    try {
      let responseText: string;
      let searchResults: SearchResult[] = [];
      let thinkingProcess: ThinkingProcess | undefined;
      
      // Generate response based on whether DeepSearch is enabled
      if (isDeepSearch) {
        // Use web search with enhanced functionality
        const response = await generateWithWebSearch(cleanContent, selectedModel);
        responseText = response.text;
        searchResults = response.searchResults;
        thinkingProcess = response.thinkingProcess;
        
        // Enhance the response with search result analysis if available
        if (searchResults.length > 0) {
          // Add a separator between the original response and our analysis
          responseText += '\n\n---\n\n';
          
          // Add search result summary
          responseText += `**Search Results Summary:** Found ${searchResults.length} relevant results.\n\n`;
          
          // Add top sources
          const topSources = searchResults.slice(0, 3).map((result, index) => {
            try {
              const url = new URL(result.url);
              return `${index + 1}. [${result.title}](${result.url}) (${url.hostname})`;
            } catch {
              return `${index + 1}. [${result.title}](${result.url})`;
            }
          });
          
          responseText += '**Top Sources:**\n' + topSources.join('\n') + '\n\n';
          
          // Add key points if available in thinking process
          if (thinkingProcess?.reasoningPath && thinkingProcess.reasoningPath.length > 0) {
            const keyPoints = thinkingProcess.reasoningPath
              .filter(step => step.outcome)
              .map(step => step.thought || step.action || step.outcome)
              .filter(Boolean);
              
            if (keyPoints.length > 0) {
              responseText += '**Key Insights:**\n';
              keyPoints.forEach(point => {
                responseText += `- ${point}\n`;
              });
            }
          }
        }
      } else {
        // Use regular generation
        responseText = await generateContent(cleanContent, selectedModel, false);
      }
      
      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        modelId: selectedModel,
        isDeepSearch,
        metadata: isDeepSearch ? {
          thinking: thinkingProcess
        } : undefined
      };
      
      // Add assistant message to conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversationId 
            ? { ...conv, messages: [...conv.messages, assistantMessage] } 
            : conv
        )
      );
      
      // Generate new suggested questions
      setSuggestedQuestions([
        "Tell me more about " + cleanContent.split(' ').slice(0, 3).join(' '),
        "How does " + cleanContent.split(' ').slice(0, 2).join(' ') + " compare to alternatives?",
        "Can you provide examples of " + cleanContent.split(' ').slice(0, 3).join(' '),
        "What are the limitations of " + cleanContent.split(' ').slice(0, 2).join(' ')
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Create error message
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error while processing your request. Please try again later.`,
        timestamp: Date.now(),
        modelId: selectedModel
      };
      
      // Add error message to conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversationId 
            ? { ...conv, messages: [...conv.messages, errorMessage] } 
            : conv
        )
      );
    } finally {
      // Stop loading
      setIsLoading(false);
    }
  };
  
  const clearMessages = () => {
    if (!activeConversationId) return;
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [] } 
          : conv
      )
    );
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages: activeConversation?.messages || [],
        isLoading,
        sendMessage,
        clearMessages,
        conversations,
        activeConversation,
        setActiveConversation,
        updateConversationTitle,
        startNewConversation,
        deleteConversation,
        suggestedQuestions,
        selectedModel,
        setSelectedModel: handleSetSelectedModel
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 