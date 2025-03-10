import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThinkingProcess } from '../../gemini/types/gemini.types';

interface ThinkingIndicatorProps {
  thinking: boolean;
  isDeepSearch?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  thinkingProcess?: ThinkingProcess;
}

/**
 * ThinkingIndicator component for displaying thinking steps
 * Redesigned to match Perplexity's cleaner style
 */
const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ 
  thinking,
  isDeepSearch = false,
  isCollapsed = false,
  onToggleCollapse,
  thinkingProcess
}) => {
  // Debug: Log thinking process when it changes
  useEffect(() => {
    console.log('ThinkingIndicator received thinkingProcess:', thinkingProcess);
  }, [thinkingProcess]);

  // Move useState hook to the top level of the component
  const [showAllResults, setShowAllResults] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'steps' | 'sources' | 'reasoning'>('steps');

  // If not thinking and no thinking process, don't render anything
  if (!thinking && (!thinkingProcess || !thinkingProcess.steps || thinkingProcess.steps.length === 0)) {
    console.log('ThinkingIndicator not rendering: thinking=', thinking, 'thinkingProcess=', thinkingProcess);
    return null;
  }
  
  // Format URL to display only domain
  const formatUrlOnly = (text: string): string => {
    try {
      if (text.startsWith('http')) {
        const url = new URL(text);
        return url.hostname;
      }
    } catch (e) {
      // If URL parsing fails, return the original text
    }
    return text;
  };

  // Get progress percentage
  const getProgressPercentage = (): number => {
    if (!thinkingProcess) return 0;
    return thinkingProcess.progress || 0;
  };
  
  // Get thinking steps tab content
  const getThinkingStepsContent = () => {
    // Check if we have actual thinking steps
    if (!thinkingProcess || !thinkingProcess.steps || thinkingProcess.steps.length === 0) {
      // Show fallback steps based on isDeepSearch
      if (isDeepSearch) {
        return (
          <div className="space-y-4">
            <div className="thinking-step">
              <div className="thinking-step-marker animate"></div>
              <div>
                <div className="text-gray-300">Analyzing query to understand intent...</div>
              </div>
            </div>
            <div className="thinking-step">
              <div className="thinking-step-marker animate"></div>
              <div>
                <div className="text-gray-300">Searching the web for relevant information...</div>
              </div>
            </div>
            <div className="thinking-step">
              <div className="thinking-step-marker animate"></div>
              <div>
                <div className="text-gray-300">Evaluating search results for quality and relevance...</div>
              </div>
            </div>
            <div className="thinking-step">
              <div className="thinking-step-marker animate"></div>
              <div>
                <div className="text-gray-300">Synthesizing information from multiple sources...</div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="space-y-4">
            <div className="thinking-step">
              <div className="thinking-step-marker animate"></div>
              <div>
                <div className="text-gray-300">Analyzing your question...</div>
              </div>
            </div>
            <div className="thinking-step">
              <div className="thinking-step-marker animate"></div>
              <div>
                <div className="text-gray-300">Formulating a comprehensive response...</div>
              </div>
            </div>
          </div>
        );
      }
    }
    
    // If we have thinking process steps, render those
    return (
      <div className="space-y-4">
        {thinkingProcess.steps.map((step, index) => (
          <div key={`step-${index}`} className="thinking-step">
            <div className={`thinking-step-marker ${step.status === 'in_progress' ? 'animate' : step.status === 'complete' ? 'complete' : ''}`}></div>
            <div>
              <div className="text-gray-300">{step.content}</div>
              
              {step.substeps && step.substeps.length > 0 && (
                <div className="mt-2 ml-4 space-y-2">
                  {step.substeps.map((substep, subIndex) => (
                    <div key={`substep-${index}-${subIndex}`} className="flex items-start">
                      <div className={`h-1.5 w-1.5 rounded-full mr-2 mt-1.5 ${
                        substep.status === 'in_progress' 
                          ? 'bg-blue-400 animate-pulse' 
                          : substep.status === 'complete' 
                            ? 'bg-green-400' 
                            : 'bg-red-400'
                      }`}></div>
                      <div className="text-sm text-gray-400">{substep.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Get search results tab content
  const getSearchResultsContent = () => {
    if (!thinkingProcess || !thinkingProcess.searchResults || thinkingProcess.searchResults.length === 0) {
      return <div className="text-gray-400 italic">No search results available</div>;
    }
    
    const resultsToShow = showAllResults ? thinkingProcess.searchResults : thinkingProcess.searchResults.slice(0, 5);
    const hasMoreResults = thinkingProcess.searchResults.length > 5;
    
    // Calculate source domain distribution for transparency
    const domainCounts: Record<string, number> = {};
    thinkingProcess.searchResults.forEach(result => {
      try {
        const domain = new URL(result.url).hostname;
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      } catch (e) {
        // Skip invalid URLs
      }
    });
    
    // Sort domains by count
    const topDomains = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
      
    // Estimate confidence based on result quality and diversity
    const confidenceScore = Math.min(
      thinkingProcess.confidenceScore || 
      Math.min(0.95, 0.5 + (thinkingProcess.searchResults.length / 20) * 0.4),
      1
    );
    
    const getConfidenceLabel = (score: number): string => {
      if (score >= 0.8) return 'High';
      if (score >= 0.5) return 'Medium';
      return 'Low';
    };
    
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-300">Sources ({thinkingProcess.searchResults.length})</h4>
          {thinkingProcess.searchQueries && thinkingProcess.searchQueries.length > 0 && (
            <div className="text-xs text-gray-400">{thinkingProcess.searchQueries.length} search queries used</div>
          )}
        </div>
        
        {/* Add source confidence metrics */}
        <div className="bg-gray-800/50 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs text-gray-400">Source Quality</div>
            <div className="text-xs font-medium text-gray-300">
              {getConfidenceLabel(confidenceScore)} Confidence
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
            <div 
              className={`h-1.5 rounded-full ${
                confidenceScore >= 0.8 ? 'bg-green-500' : 
                confidenceScore >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${Math.round(confidenceScore * 100)}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="text-xs text-gray-400">
              <div className="mb-1">Top Sources:</div>
              <div className="space-y-1">
                {topDomains.map(([domain, count], idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{domain}</span>
                    <span className="text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              <div className="mb-1">Source Types:</div>
              <div className="space-y-1">
                {thinkingProcess.sourceDiversity?.types?.slice(0, 5).map((type, idx) => (
                  <div key={idx}>{type}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {resultsToShow.map((result, index) => (
            <a 
              key={`result-${index}`} 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="search-result-item bg-gray-800/30 rounded-md p-3 hover:bg-gray-700/50 transition-colors block border border-gray-700/50 hover:border-gray-600"
            >
              <div className="flex items-start">
                {result.favicon && (
                  <img 
                    src={result.favicon} 
                    alt="" 
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="text-blue-400 font-medium text-sm mb-0.5 line-clamp-1 hover:underline">{result.title}</div>
                  <div className="text-gray-500 text-xs mb-1">{formatUrlOnly(result.url)}</div>
                  {result.snippet && (
                    <div className="text-gray-400 text-xs line-clamp-2">
                      {result.snippet}
                    </div>
                  )}
                  {/* Show date badge for enhanced content */}
                  {result.enhancedContent?.extractedDates && result.enhancedContent.extractedDates.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.enhancedContent.extractedDates.slice(0, 2).map((date, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          {date}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </a>
          ))}
        </div>
        
        {hasMoreResults && (
          <button 
            onClick={() => setShowAllResults(!showAllResults)}
            className="mt-3 w-full text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 border border-gray-700 rounded-md flex items-center justify-center"
          >
            {showAllResults ? (
              <>
                <svg className="w-4 h-4 mr-1 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                Show fewer sources
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                View all {thinkingProcess.searchResults.length} sources
              </>
            )}
          </button>
        )}
      </div>
    );
  };
  
  // Get reasoning tab content
  const getReasoningContent = () => {
    if (!thinkingProcess || !thinkingProcess.reasoningPath || thinkingProcess.reasoningPath.length === 0) {
      return <div className="text-gray-400 italic">No reasoning steps available</div>;
    }
    
    return (
      <div className="space-y-4">
        {thinkingProcess.reasoningPath.map((step, index) => (
          <div key={`reasoning-${index}`} className="thinking-reasoning">
            <div className="text-gray-300 font-medium">{step.thought}</div>
            {step.action && (
              <div className="text-blue-400 text-sm mt-1 ml-3 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                </svg>
                {step.action}
              </div>
            )}
            {step.outcome && (
              <div className="text-green-400 text-sm mt-1 ml-6 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {step.outcome}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Tab navigation system
  const renderTabNavigation = () => {
    return (
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${selectedTab === 'steps' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setSelectedTab('steps')}
        >
          Process
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${selectedTab === 'sources' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setSelectedTab('sources')}
        >
          Sources
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${selectedTab === 'reasoning' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setSelectedTab('reasoning')}
        >
          Reasoning
        </button>
      </div>
    );
  };
  
  // Render the selected tab content
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'steps':
        return getThinkingStepsContent();
      case 'sources':
        return getSearchResultsContent();
      case 'reasoning':
        return getReasoningContent();
      default:
        return getThinkingStepsContent();
    }
  };
  
  return (
    <AnimatePresence>
      {(thinking || (thinkingProcess && thinkingProcess.steps && thinkingProcess.steps.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="thinking-container bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden mb-4 shadow-lg"
        >
          {/* Progress bar */}
          <div className="perplexity-progress">
            {thinking ? (
              <div className="perplexity-progress-pulsate"></div>
            ) : (
              <div 
                className="perplexity-progress-bar" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            )}
          </div>
          
          {/* Header */}
          <div className="thinking-header p-3 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center">
              {thinking ? (
                <div className="flex items-center">
                  <div className="mr-2 w-4 h-4 relative">
                    <div className="absolute inset-0 border-2 border-blue-400 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <span className="text-blue-400 font-medium text-sm">Working on it...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-green-400 font-medium text-sm">Processing complete</span>
                </div>
              )}
              {isDeepSearch && <span className="ml-2 px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full">Deep Search</span>}
            </div>
            <button 
              onClick={onToggleCollapse} 
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={isCollapsed ? "Expand thinking process" : "Collapse thinking process"}
            >
              <svg className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
          
          {/* Content */}
          {!isCollapsed && (
            <div className="p-4">
              {renderTabNavigation()}
              <div className="thinking-content">
                {renderTabContent()}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThinkingIndicator; 