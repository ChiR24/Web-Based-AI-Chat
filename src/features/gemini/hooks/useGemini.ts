import { useState } from 'react';
import { useGeminiService } from '../context/GeminiServiceContext';
import { SearchResult, ThinkingProcess } from '../types/gemini.types';

interface UseGeminiReturn {
  generateContent: (prompt: string, modelId: string, includeFormatting?: boolean) => Promise<string>;
  generateWithWebSearch: (query: string, modelId: string) => Promise<{
    text: string;
    searchResults: SearchResult[];
    thinkingProcess?: ThinkingProcess;
  }>;
  generateEmbeddings: (text: string) => Promise<number[]>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to use the Gemini service
 */
export const useGemini = (): UseGeminiReturn => {
  const { geminiService, isLoading: serviceLoading, error: serviceError } = useGeminiService();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Generate content using the specified model
   */
  const generateContent = async (prompt: string, modelId: string, includeFormatting: boolean = true): Promise<string> => {
    if (!geminiService) {
      return 'Gemini service is not available';
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.generateContent(prompt, modelId, includeFormatting);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return `Error generating content: ${errorMessage}`;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate content with web search
   */
  const generateWithWebSearch = async (query: string, modelId: string): Promise<{
    text: string;
    searchResults: SearchResult[];
    thinkingProcess?: ThinkingProcess;
  }> => {
    if (!geminiService) {
      return {
        text: 'Gemini service is not available',
        searchResults: []
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.generateWithWebSearch(query, modelId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      return {
        text: `Error generating content with web search: ${errorMessage}`,
        searchResults: []
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate embeddings for text
   */
  const generateEmbeddings = async (text: string): Promise<number[]> => {
    if (!geminiService) {
      throw new Error('Gemini service is not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const embeddings = await geminiService.generateEmbeddings(text);
      return embeddings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      throw new Error(`Error generating embeddings: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateContent,
    generateWithWebSearch,
    generateEmbeddings,
    isLoading: isLoading || serviceLoading,
    error: error || serviceError
  };
}; 