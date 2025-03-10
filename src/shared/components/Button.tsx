import React, { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'success';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isActive?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}

/**
 * Button component for user interactions
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isActive = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = false,
  className = '',
  disabled = false,
  children,
  ...rest
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border border-transparent focus:ring-blue-500';
      case 'secondary':
        return 'bg-[#1d1e20] hover:bg-[#252525] active:bg-[#2a2a2c] text-white border border-[#333] focus:ring-[#444]';
      case 'tertiary':
        return 'bg-[#0E0E0F] hover:bg-[#1a1a1b] active:bg-[#1d1e1f] text-white border border-[#222] focus:ring-[#333]';
      case 'ghost':
        return 'bg-transparent hover:bg-gray-700/10 active:bg-gray-700/20 text-gray-300 border border-transparent focus:ring-gray-500';
      case 'outline':
        return 'bg-transparent hover:bg-gray-700/10 active:bg-gray-700/20 text-gray-300 border border-[#333] focus:ring-gray-500';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border border-transparent focus:ring-red-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border border-transparent focus:ring-green-500';
      default:
        return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border border-transparent focus:ring-blue-500';
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-xs py-1 px-2';
      case 'sm':
        return 'text-sm py-1.5 px-3';
      case 'lg':
        return 'text-base py-2.5 px-5';
      case 'md':
      default:
        return 'text-sm py-2 px-4';
    }
  };
  
  const loadingSpinner = (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
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
  
  const classes = [
    'inline-flex items-center justify-center',
    'transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
    getVariantClasses(),
    getSizeClasses(),
    rounded ? 'rounded-full' : 'rounded-md',
    isActive ? 'ring-2' : '',
    fullWidth ? 'w-full' : '',
    disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
    className
  ].join(' ');
  
  return (
    <button
      disabled={disabled || isLoading}
      className={classes}
      {...rest}
    >
      {isLoading && loadingSpinner}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button; 