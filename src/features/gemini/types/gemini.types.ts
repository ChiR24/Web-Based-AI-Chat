/**
 * Search result type definition
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  relevanceScore?: number;
  timestamp?: Date | string;
  favicon?: string;
  source?: string;
  clickable?: boolean;
  target?: string;
  enhancedContent?: {
    fullContent?: string;
    summary?: string;
    extractedDates?: string[];
    headings?: Array<{type: string, text: string}>;
    metadata?: {
      description?: string;
      keywords?: string;
      author?: string;
      publishedDate?: string;
    };
  } | null;
}

/**
 * Thinking process types (inspired by Perplexity)
 */
export interface ThinkingProcess {
  steps: ThinkingStep[];
  progress?: number;
  searchResults?: SearchResult[];
  suggestions?: string[];
  activeStep?: number;
  searchQueries?: string[];
  citations?: Citation[];
  reasoningPath: ReasoningStep[];
  informationGaps?: string[];
  sourceDiversity?: {
    domains?: string[];
    types?: string[];
    perspectives?: string[];
  };
  confidenceScore?: number;
  domainContext?: string;
  subtopics?: string[];
  potentialSources?: string[];
  stageProgress?: {
    currentStage: string;
    stageNumber: number;
    totalStages: number;
    percentComplete: number;
    detail?: string;
  };
}

export interface ThinkingStep {
  id?: string;
  type?: 'thinking' | 'reflection' | 'search' | 'error';
  content?: string;
  timestamp?: number;
  description?: string;
  status?: 'in_progress' | 'complete' | 'error';
  substeps?: Array<{
    description: string;
    status: 'in_progress' | 'complete' | 'error';
  }>;
}

export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
  source: string;
  relevance: number;
}

export interface ReasoningStep {
  thought: string;
  action?: string;
  outcome?: string;
}

/**
 * Gemini model type definition
 */
export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  maxInputTokens: number;
  capabilities: string[];
  isDefault?: boolean;
  experimental?: boolean;
  supportsThinking?: boolean;
  supportsWebSearch?: boolean;
} 