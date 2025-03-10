import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// CSS overrides for syntax highlighter
const customStyle = {
  borderRadius: '0.5rem',
  margin: 0,
  padding: '1rem',
  background: '#1E1E1E',
};

interface CodeBlockProps {
  language: string;
  code: string;
  lineStart?: number;
  fileName?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

/**
 * CodeBlock component for displaying code with syntax highlighting
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ 
  language, 
  code,
  lineStart = 1,
  fileName,
  showLineNumbers: initialShowLineNumbers = true,
  highlightLines = [],
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(initialShowLineNumbers);
  const codeRef = useRef<HTMLDivElement>(null);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copied]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (codeRef.current && !codeRef.current.contains(event.target as Node)) {
        // Close any open dropdown here if needed
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  // Normalize the language for syntax highlighter
  const normalizedLanguage = normalizeLanguage(language);
  
  return (
    <div 
      ref={codeRef}
      className={`rounded-lg overflow-hidden bg-[#1E1E1E] mb-4 ${className}`}
    >
      {/* Code header */}
      <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-[#333]">
        <div className="flex items-center">
          {fileName && (
            <span className="text-sm font-medium text-gray-300 mr-3">
              {fileName}
            </span>
          )}
          <span className="text-xs font-medium text-gray-500 bg-[#3e3e42] rounded px-2 py-0.5">
            {normalizedLanguage}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-[#3e3e42] transition-colors text-xs"
            title={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </button>
          
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-[#3e3e42] transition-colors text-xs"
            title="Copy code"
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Code content */}
      <div className="relative overflow-auto max-h-[500px]">
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          startingLineNumber={lineStart}
          customStyle={customStyle}
          lineProps={(lineNumber) => {
            const style: React.CSSProperties = { display: 'block' };
            if (highlightLines.includes(lineNumber)) {
              style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              style.borderLeft = '3px solid #3b82f6';
            }
            return { style };
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

/**
 * Normalize language string for syntax highlighter
 */
function normalizeLanguage(language: string): string {
  language = language.toLowerCase();
  
  // Map of languages to their normalized form
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'py': 'python',
    'rb': 'ruby',
    'rs': 'rust',
    'go': 'go',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'md': 'markdown',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'shell': 'bash',
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
  };
  
  return languageMap[language] || language;
}

export default CodeBlock; 