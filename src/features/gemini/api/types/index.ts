import { SearchResult, ThinkingProcess } from '../../types/gemini.types';

/**
 * Interface for multi-round search state
 */
export interface MultiRoundSearchState {
  originalQuery: string;
  currentRound: number;
  maxRounds: number;
  previousQueries: string[];
  allResults: SearchResult[];
  sufficientResults: boolean;
  confidenceScore: number;
  domainContext?: string;
  entityType?: string;
  failureReason?: string;
}

/**
 * Interface for web search state
 */
export interface WebSearchState {
  query: string;
  results: SearchResult[];
  originalQuery: string;
  searchComplete: boolean;
  errorMessage?: string;
}

/**
 * Interface for Gemini response with search results
 */
export interface GeminiWebSearchResponse {
  text: string;
  searchResults: SearchResult[];
  thinkingProcess?: ThinkingProcess;
}

/**
 * Interface for message options when sending to Gemini
 */
export interface MessageOptions {
  model?: string;
  temperature?: number;
  webSearch?: boolean;
  maxTokens?: number;
}

/**
 * Interface for deep search options
 */
export interface DeepSearchOptions extends MessageOptions {
  maxRounds?: number;
  satisfactionThreshold?: number;
}

/**
 * Interface for Gemini response
 */
export interface GeminiResponse {
  content: string;
  metadata?: {
    thinking?: ThinkingProcess | null;
    searchResults?: SearchResult[];
  };
} 