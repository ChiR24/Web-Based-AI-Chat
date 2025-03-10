import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button' | 'switch';
  showLabel?: boolean;
  className?: string;
}

/**
 * ThemeToggle component for toggling between light and dark themes
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  variant = 'switch',
  showLabel = false,
  className = ''
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      case 'md':
      default:
        return 'text-sm';
    }
  };
  
  const renderIconToggle = () => {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full transition-colors ${
          isDark 
            ? 'bg-[#1d1e20] text-yellow-300 hover:bg-[#252525]' 
            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        } ${getSizeClasses()} ${className}`}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? (
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
    );
  };
  
  const renderButtonToggle = () => {
    return (
      <button
        onClick={toggleTheme}
        className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-2 ${
          isDark 
            ? 'bg-[#1d1e20] text-white hover:bg-[#252525] border border-[#333]' 
            : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
        } ${getSizeClasses()} ${className}`}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? (
          <>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            {showLabel && <span>Light mode</span>}
          </>
        ) : (
          <>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
            {showLabel && <span>Dark mode</span>}
          </>
        )}
      </button>
    );
  };
  
  const renderSwitchToggle = () => {
    return (
      <button
        onClick={toggleTheme}
        className={`relative inline-flex items-center ${className}`}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        <span className="sr-only">{isDark ? 'Switch to light theme' : 'Switch to dark theme'}</span>
        <span
          className={`${
            isDark ? 'bg-[#1d1e20] border-[#333]' : 'bg-gray-200'
          } relative inline-block h-6 w-11 flex-shrink-0 rounded-full border transition-colors duration-200 ease-in-out`}
        >
          <span
            className={`${
              isDark ? 'translate-x-5 bg-blue-500' : 'translate-x-1 bg-white'
            } pointer-events-none relative inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out mt-1`}
          >
            {isDark ? (
              <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
                <svg 
                  className="h-3 w-3 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </span>
            ) : (
              <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity">
                <svg 
                  className="h-3 w-3 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
                </svg>
              </span>
            )}
          </span>
        </span>
        {showLabel && (
          <span className={`ml-2 ${getSizeClasses()}`}>
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    );
  };
  
  switch (variant) {
    case 'icon':
      return renderIconToggle();
    case 'button':
      return renderButtonToggle();
    case 'switch':
    default:
      return renderSwitchToggle();
  }
};

export default ThemeToggle; 