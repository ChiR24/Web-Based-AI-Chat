import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GeminiService } from '../services/GeminiService';

// Declare only the Window interface for custom environment variables
declare global {
  // For custom environment variables in window
  interface Window {
    _env_?: {
      GEMINI_API_KEY?: string;
      MAX_SEARCH_ROUNDS?: string;
      [key: string]: any;
    };
  }
}

interface GeminiServiceContextType {
  geminiService: GeminiService | null;
  isLoading: boolean;
  error: Error | null;
}

const GeminiServiceContext = createContext<GeminiServiceContextType>({
  geminiService: null,
  isLoading: true,
  error: null
});

/**
 * Get API key from environment variables
 * Checks both Vite env vars and runtime env vars
 */
const getApiKey = (): string => {
  // Check Vite environment variables (build time)
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  // Check runtime environment variables (set in window._env_)
  if (window._env_ && window._env_.GEMINI_API_KEY) {
    return window._env_.GEMINI_API_KEY;
  }
  
  // Fallback to empty string (will show error in UI)
  return '';
};

/**
 * Get max search rounds from environment variables
 * Defaults to 5 if not specified
 */
const getMaxSearchRounds = (): number => {
  // Check Vite environment variables (build time)
  if (import.meta.env.VITE_MAX_SEARCH_ROUNDS) {
    const rounds = parseInt(import.meta.env.VITE_MAX_SEARCH_ROUNDS, 10);
    if (!isNaN(rounds) && rounds > 0) {
      return rounds;
    }
  }
  
  // Check runtime environment variables (set in window._env_)
  if (window._env_ && window._env_.MAX_SEARCH_ROUNDS) {
    const rounds = parseInt(window._env_.MAX_SEARCH_ROUNDS, 10);
    if (!isNaN(rounds) && rounds > 0) {
      return rounds;
    }
  }
  
  // Default to 5 rounds
  return 5;
};

interface GeminiServiceProviderProps {
  children: ReactNode;
  apiKey?: string;
  maxSearchRounds?: number;
}

/**
 * Provider component for Gemini service
 */
export const GeminiServiceProvider: React.FC<GeminiServiceProviderProps> = ({ 
  children, 
  apiKey = getApiKey(),
  maxSearchRounds = getMaxSearchRounds()
}) => {
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeService = async () => {
      try {
        if (!apiKey) {
          throw new Error('Gemini API key is required. Please provide a valid API key.');
        }
        
        console.log('Initializing Gemini service with API key:', apiKey.substring(0, 4) + '...');
        console.log('Using max search rounds:', maxSearchRounds);
        
        const service = new GeminiService(apiKey, { maxSearchRounds });
        setGeminiService(service);
        setError(null);
      } catch (err) {
        console.error('Error initializing Gemini service:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();
    
    // Cleanup
    return () => {
      setGeminiService(null);
    };
  }, [apiKey, maxSearchRounds]);

  return (
    <GeminiServiceContext.Provider value={{ geminiService, isLoading, error }}>
      {children}
    </GeminiServiceContext.Provider>
  );
};

/**
 * Hook to use the Gemini service context
 */
export const useGeminiService = (): GeminiServiceContextType => {
  const context = useContext(GeminiServiceContext);
  if (context === undefined) {
    throw new Error('useGeminiService must be used within a GeminiServiceProvider');
  }
  return context;
}; 