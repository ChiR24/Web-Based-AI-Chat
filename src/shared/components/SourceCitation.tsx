import React from 'react';
import { motion } from 'framer-motion';

/**
 * Source interface defining a citation source
 */
export interface Source {
  id: number;
  title: string;
  url: string;
  snippet?: string;
  source?: string;
  favicon?: string;
  relevance?: number;
}

interface SourceCitationProps {
  sources: Source[];
  className?: string;
  onSourceClick?: (source: Source) => void;
}

/**
 * Component to display search result sources in a grid format
 * with clickable cards that open in a new tab
 */
const SourceCitation: React.FC<SourceCitationProps> = ({ 
  sources, 
  className = '',
  onSourceClick
}) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  /**
   * Get a clean display URL from a full URL
   */
  const getDisplayUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  /**
   * Handle source click with fallback behaviors
   */
  const handleSourceClick = (source: Source) => {
    if (onSourceClick) {
      onSourceClick(source);
    } else if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`source-citations-container ${className}`}>
      {/* Top sources section - display in a grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
        {sources.slice(0, 6).map((source) => (
          <motion.a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleSourceClick(source)}
            className="source-item grid-view p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors flex flex-col h-full"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex items-start mb-1">
              {source.favicon && (
                <img 
                  src={source.favicon} 
                  alt=""
                  className="w-4 h-4 mr-2 mt-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="source-name text-xs text-gray-400">
                {source.source || getDisplayUrl(source.url)}
              </div>
            </div>
            <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 hover:text-blue-400">
              {source.title}
            </h3>
            {source.snippet && (
              <p className="text-xs text-gray-300 line-clamp-2">
                {source.snippet}
              </p>
            )}
          </motion.a>
        ))}
      </div>

      {/* Additional sources list - more compact display */}
      {sources.length > 6 && (
        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Additional sources:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {sources.slice(6).map((source) => (
              <a 
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center py-1 px-2 text-sm cursor-pointer hover:bg-gray-800 rounded-md"
              >
                {source.favicon && (
                  <img 
                    src={source.favicon} 
                    alt=""
                    className="w-3 h-3 mr-2 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <span className="truncate text-gray-300 hover:text-blue-400" title={source.title}>
                  {source.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-right">
        <span className="text-xs text-gray-400">
          {sources.length} source{sources.length !== 1 ? 's' : ''} total
        </span>
      </div>
    </div>
  );
};

export default SourceCitation; 