import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';

interface MessageRendererProps {
  content: string;
  className?: string;
  citations?: Array<{
    id: number;
    title: string;
    url: string;
    snippet?: string;
    source?: string;
  }>;
}

/**
 * MessageRenderer component for rendering markdown content
 * Enhanced with Perplexity-style citation display
 */
const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content, 
  className = '', 
  citations = []
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Function to clean the content
  const cleanContent = (rawContent: string) => {
    return DOMPurify.sanitize(rawContent);
  };

  // Handle copying code to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  // Handle citation reference clicks
  const handleCitationClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target && target.classList.contains('citation-reference')) {
      const citationId = target.getAttribute('data-citation');
      const url = target.getAttribute('data-url');
      
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (citationId) {
        // If no URL but we have a citation ID, toggle showing citation info
        const id = parseInt(citationId, 10);
        setActiveCitation(activeCitation === id ? null : id);
      }
    }
  };

  // Effect to add click event listener to citation references
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('click', handleCitationClick);
    }
    
    return () => {
      if (contentElement) {
        contentElement.removeEventListener('click', handleCitationClick);
      }
    };
  }, [activeCitation]);

  // Convert citation references to interactive elements
  const processCitations = (text: string) => {
    // Match patterns like [1], [2], etc.
    return text.replace(/\[(\d+)\]/g, (match, citationNumber) => {
      const citationId = parseInt(citationNumber, 10);
      const citation = citations.find(c => c.id === citationId);
      
      // Use data attributes instead of inline onclick handlers
      let attributes = `class="citation-reference" data-citation="${citationId}"`;
      
      // Add data attributes for citation data if available
      if (citation) {
        if (citation.url && citation.url !== '#') {
          attributes += ` data-url="${citation.url}"`;
        }
        if (citation.title) attributes += ` data-title="${citation.title || ''}"`;
        if (citation.snippet) attributes += ` data-snippet="${citation.snippet || ''}"`;
        if (citation.source) attributes += ` data-source="${citation.source || ''}"`;
        
        // Add clickable attributes to ensure it opens in a new tab
        attributes += ` role="link" tabindex="0"`;
      }
      
      return `<span ${attributes}>${match}</span>`;
    });
  };

  return (
    <div ref={contentRef} className={`prose prose-chat ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');
            
            if (inline) {
              return (
                <code className="bg-gray-800 text-gray-200 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            
            const index = Math.random();
            
            return (
              <div className="relative mt-4 mb-6 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
                <div className="flex justify-between items-center py-2 px-4 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs text-gray-400 font-medium">
                    {language || 'code'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(code, index as any)}
                    className="text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors"
                  >
                    {copiedIndex === index ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language || 'text'}
                  PreTag="div"
                  wrapLines={true}
                  wrapLongLines={true}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    backgroundColor: '#1f2937',
                    borderRadius: 0,
                    fontSize: '0.875rem',
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            );
          },
          // Enhanced paragraph with citation handling
          p({ children }: any) {
            const processedChildren = React.Children.map(children, child => {
              if (typeof child === 'string') {
                // Create HTML with citation spans
                const html = processCitations(child);
                return <span dangerouslySetInnerHTML={{ __html: cleanContent(html) }} />;
              }
              return child;
            });
            
            return <p className="mb-4 leading-relaxed">{processedChildren}</p>;
          },
          ul({ children }: any) {
            return <ul className="mb-4 pl-6 list-disc">{children}</ul>;
          },
          ol({ children }: any) {
            return <ol className="mb-4 pl-6 list-decimal">{children}</ol>;
          },
          li({ children }: any) {
            const processedChildren = React.Children.map(children, child => {
              if (typeof child === 'string') {
                // Create HTML with citation spans
                const html = processCitations(child);
                return <span dangerouslySetInnerHTML={{ __html: cleanContent(html) }} />;
              }
              return child;
            });
            
            return <li className="mb-1">{processedChildren}</li>;
          },
          h1({ children }: any) {
            return <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>;
          },
          h2({ children }: any) {
            return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
          },
          h3({ children }: any) {
            return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
          },
          // Enhanced link component with special handling for citations
          a({ href, children }: any) {
            const isExternalLink = href && (href.startsWith('http') || href.startsWith('https'));
            
            return (
              <a 
                href={href}
                target={isExternalLink ? "_blank" : undefined}
                rel={isExternalLink ? "noopener noreferrer" : undefined}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={(e) => {
                  if (isExternalLink) {
                    // Standard behavior for external links - let them open in a new tab
                    // No need to prevent default
                  } else if (href?.startsWith('#citation-')) {
                    // Handle citation links
                    e.preventDefault();
                    const citationId = href.replace('#citation-', '');
                    const citation = citations.find(c => c.id === parseInt(citationId, 10));
                    if (citation && citation.url) {
                      window.open(citation.url, '_blank', 'noopener,noreferrer');
                    }
                  }
                }}
              >
                {children}
              </a>
            );
          },
          // Enhanced blockquote for better visual appearance
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-gray-600 pl-4 py-1 my-4 bg-gray-800/30 rounded-r-md">
                {children}
              </blockquote>
            );
          },
          // Table styling
          table({ children }: any) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-gray-700 border border-gray-700 rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }: any) {
            return <thead className="bg-gray-800">{children}</thead>;
          },
          tbody({ children }: any) {
            return <tbody className="divide-y divide-gray-700">{children}</tbody>;
          },
          tr({ children }: any) {
            return <tr>{children}</tr>;
          },
          th({ children }: any) {
            return (
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                {children}
              </th>
            );
          },
          td({ children }: any) {
            return <td className="px-4 py-3 text-sm text-gray-400">{children}</td>;
          },
          img({ src, alt, title }: any) {
            return (
              <img
                src={src}
                alt={alt || ''}
                title={title || ''}
                className="max-w-full h-auto my-4 rounded-lg"
              />
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
      
      {/* Add CSS for citations without using jsx prop */}
      <style dangerouslySetInnerHTML={{ __html: `
        .citation-reference {
          display: inline-flex;
          align-items: center;
          color: #6366F1;
          background-color: rgba(99, 102, 241, 0.15);
          border-radius: 4px;
          padding: 0.15rem 0.4rem;
          margin: 0 0.15rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          text-decoration: none;
        }
        
        .citation-reference:hover {
          background-color: rgba(99, 102, 241, 0.25);
          text-decoration: underline;
        }
        
        .citation-reference[data-url]:after {
          content: "↗";
          margin-left: 3px;
          font-size: 0.7rem;
          opacity: 0.7;
        }
        
        .citation-reference[data-url]:hover:after {
          opacity: 1;
        }
        
        .source-citation {
          display: inline-flex;
          align-items: center;
          color: #6366F1;
          background-color: rgba(99, 102, 241, 0.15);
          border-radius: 4px;
          padding: 0.15rem 0.4rem;
          margin: 0 0.15rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .source-citation:hover {
          background-color: rgba(99, 102, 241, 0.25);
        }
      `}} />
    </div>
  );
};

export default MessageRenderer; 