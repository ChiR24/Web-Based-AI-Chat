import React from 'react';

type LoadingVariant = 'dots' | 'pulse' | 'spinner' | 'bar' | 'gradient' | 'shimmer';
type Size = 'xs' | 'sm' | 'md' | 'lg';
type ColorScheme = 'primary' | 'secondary' | 'gray' | 'white';

interface LoadingIndicatorProps {
  variant?: LoadingVariant;
  size?: Size;
  colorScheme?: ColorScheme;
  text?: string;
  className?: string;
  inline?: boolean;
}

interface SizeConfig {
  dot: number;
  spinner: number;
  bar: {
    width: string;
    height: string;
  };
}

/**
 * Getting size values based on size prop
 */
const getSizeValue = (size: Size): SizeConfig => {
  switch (size) {
    case 'xs':
      return { dot: 4, spinner: 14, bar: { width: '40px', height: '3px' } };
    case 'sm':
      return { dot: 6, spinner: 18, bar: { width: '60px', height: '4px' } };
    case 'lg':
      return { dot: 10, spinner: 30, bar: { width: '100px', height: '6px' } };
    case 'md':
    default:
      return { dot: 8, spinner: 24, bar: { width: '80px', height: '5px' } };
  }
};

/**
 * Getting color values based on colorScheme prop
 */
const getColorValue = (colorScheme: ColorScheme): Record<string, string> => {
  switch (colorScheme) {
    case 'primary':
      return { fill: 'bg-blue-500', text: 'text-blue-500' };
    case 'secondary':
      return { fill: 'bg-purple-500', text: 'text-purple-500' };
    case 'gray':
      return { fill: 'bg-gray-500', text: 'text-gray-500' };
    case 'white':
      return { fill: 'bg-white', text: 'text-white' };
    default:
      return { fill: 'bg-blue-500', text: 'text-blue-500' };
  }
};

/**
 * Getting text size based on size prop
 */
const getTextSize = (size: Size): string => {
  switch (size) {
    case 'xs':
      return 'text-xs';
    case 'sm':
      return 'text-sm';
    case 'lg':
      return 'text-lg';
    case 'md':
    default:
      return 'text-base';
  }
};

/**
 * Loading dots component
 */
const LoadingDots: React.FC<{ size: Size; colorScheme: ColorScheme }> = ({ size, colorScheme }) => {
  const sizeValue = getSizeValue(size).dot;
  const { fill } = getColorValue(colorScheme);
  
  return (
    <div className="flex space-x-1.5">
      <div 
        className={`${fill} rounded-full animate-pulse`} 
        style={{ 
          width: `${sizeValue}px`, 
          height: `${sizeValue}px`,
          animationDelay: '0ms',
          animationDuration: '0.8s'
        }}
      ></div>
      <div 
        className={`${fill} rounded-full animate-pulse`} 
        style={{ 
          width: `${sizeValue}px`, 
          height: `${sizeValue}px`,
          animationDelay: '200ms',
          animationDuration: '0.8s'
        }}
      ></div>
      <div 
        className={`${fill} rounded-full animate-pulse`} 
        style={{ 
          width: `${sizeValue}px`, 
          height: `${sizeValue}px`,
          animationDelay: '400ms',
          animationDuration: '0.8s'
        }}
      ></div>
    </div>
  );
};

/**
 * Loading pulse component
 */
const LoadingPulse: React.FC<{ size: Size; colorScheme: ColorScheme }> = ({ size, colorScheme }) => {
  const sizeValue = getSizeValue(size).dot;
  const { fill } = getColorValue(colorScheme);
  
  return (
    <div className="flex space-x-1.5">
      <div 
        className={`${fill} rounded-full animate-ping`} 
        style={{ 
          width: `${sizeValue}px`, 
          height: `${sizeValue}px`,
          animationDuration: '1.2s',
          animationIterationCount: 'infinite'
        }}
      ></div>
    </div>
  );
};

/**
 * Loading shimmer component
 */
const LoadingShimmer: React.FC<{ size: Size; colorScheme: ColorScheme }> = ({ size, colorScheme }) => {
  const barSize = getSizeValue(size).bar;
  const { fill } = getColorValue(colorScheme);
  
  return (
    <div 
      className={`relative overflow-hidden rounded`} 
      style={{ width: barSize.width, height: barSize.height }}
    >
      <div className={`absolute inset-0 ${fill} opacity-20`}></div>
      <div 
        className={`absolute inset-0 ${fill} opacity-60`}
        style={{
          transform: 'translateX(-100%)',
          animation: 'shimmer 1.5s infinite',
        }}
      ></div>
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Loading spinner component
 */
const LoadingSpinner: React.FC<{ size: Size; colorScheme: ColorScheme }> = ({ size, colorScheme }) => {
  const sizeValue = getSizeValue(size).spinner;
  const { text } = getColorValue(colorScheme);
  
  return (
    <svg 
      className={`animate-spin ${text}`} 
      width={sizeValue} 
      height={sizeValue} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

/**
 * Loading bar component
 */
const LoadingBar: React.FC<{ size: Size; colorScheme: ColorScheme }> = ({ size, colorScheme }) => {
  const barSize = getSizeValue(size).bar;
  const { fill } = getColorValue(colorScheme);
  
  return (
    <div 
      className="relative overflow-hidden rounded"
      style={{ width: barSize.width, height: barSize.height }}
    >
      <div className={`absolute inset-0 ${fill} opacity-30`}></div>
      <div 
        className={`h-full ${fill}`}
        style={{
          animation: 'progress 1.5s ease-in-out infinite',
          transformOrigin: 'left center',
          width: '100%'
        }}
      ></div>
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0.1); }
          50% { transform: scaleX(0.5); }
          100% { transform: scaleX(0.1); }
        }
      `}</style>
    </div>
  );
};

/**
 * Loading gradient component
 */
const LoadingGradient: React.FC<{ size: Size; colorScheme: ColorScheme }> = ({ size, colorScheme }) => {
  const barSize = getSizeValue(size).bar;
  const { fill } = getColorValue(colorScheme);
  const fromColor = fill.replace('bg-', 'from-');
  const toColor = colorScheme === 'white' ? 'to-gray-200' : `to-${colorScheme}-200`;
  
  return (
    <div 
      className={`rounded overflow-hidden bg-gradient-to-r ${fromColor} ${toColor}`}
      style={{ 
        width: barSize.width, 
        height: barSize.height,
        backgroundSize: '200% 100%',
        animation: 'gradient 1.5s ease infinite',
      }}
    >
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

/**
 * Main LoadingIndicator component
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  variant = 'dots',
  size = 'md',
  colorScheme = 'primary',
  text,
  className = '',
  inline = false
}) => {
  // Get text size class
  const textSizeClass = getTextSize(size);
  const { text: textColorClass } = getColorValue(colorScheme);
  
  const renderIndicator = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots size={size} colorScheme={colorScheme} />;
      case 'pulse':
        return <LoadingPulse size={size} colorScheme={colorScheme} />;
      case 'spinner':
        return <LoadingSpinner size={size} colorScheme={colorScheme} />;
      case 'bar':
        return <LoadingBar size={size} colorScheme={colorScheme} />;
      case 'gradient':
        return <LoadingGradient size={size} colorScheme={colorScheme} />;
      case 'shimmer':
        return <LoadingShimmer size={size} colorScheme={colorScheme} />;
      default:
        return <LoadingDots size={size} colorScheme={colorScheme} />;
    }
  };
  
  const container = inline ? 'inline-flex items-center' : 'flex flex-col items-center';
  
  return (
    <div className={`${container} ${className}`}>
      {renderIndicator()}
      
      {text && (
        <span className={`${textSizeClass} ${textColorClass} ${inline ? 'ml-2' : 'mt-2'}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingIndicator; 