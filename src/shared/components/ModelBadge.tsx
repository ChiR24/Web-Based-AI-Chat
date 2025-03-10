import React from 'react';
import { findModelById } from '../utils/geminiModels';

interface ModelBadgeProps {
  modelId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ModelBadge component for displaying the current model
 */
const ModelBadge: React.FC<ModelBadgeProps> = ({ 
  modelId, 
  size = 'md',
  className = ''
}) => {
  const model = findModelById(modelId);
  
  if (!model) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1'
  };
  
  return (
    <span 
      className={`inline-flex items-center rounded-full bg-[#1d1e20] border border-[#333] text-gray-200 font-medium ${sizeClasses[size]} ${className}`}
      title={model.description}
    >
      {model.name}
    </span>
  );
};

export default ModelBadge; 