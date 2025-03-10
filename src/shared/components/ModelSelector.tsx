import React from 'react';
import { GEMINI_MODELS, findModelById } from '../utils/geminiModels';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
  webSearchEnabled?: boolean;
}

/**
 * ModelSelector component for selecting Gemini models
 * Using native select element for maximum reliability
 */
const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onSelectModel,
  disabled = false,
  className = '',
  webSearchEnabled = false
}) => {
  // Get current selected model
  const currentModel = findModelById(selectedModel) || GEMINI_MODELS[0];
  
  // If web search is enabled and current model doesn't support it, switch to a model that does
  React.useEffect(() => {
    if (webSearchEnabled && currentModel && !currentModel.supportsWebSearch) {
      // Find the first model that supports web search
      const webSearchModel = GEMINI_MODELS.find(model => model.supportsWebSearch);
      
      if (webSearchModel) {
        onSelectModel(webSearchModel.id);
      }
    }
  }, [webSearchEnabled, currentModel, onSelectModel]);
  
  // Handle model selection
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    console.log('Selecting model:', modelId);
    onSelectModel(modelId);
  };
  
  return (
    <div className={`${className}`}>
      <select
        value={currentModel?.id}
        onChange={handleChange}
        disabled={disabled}
        className={`px-3 py-1.5 rounded-full text-sm font-medium appearance-none bg-[#1d1e20] text-white border border-[#333] hover:bg-[#252525] cursor-pointer pr-8 ${
          disabled ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '12px'
        }}
      >
        {GEMINI_MODELS.map((model) => {
          // Determine if this model should be disabled - only disable models that don't support web search
          const isModelDisabled = webSearchEnabled && !model.supportsWebSearch;
          
          return (
            <option 
              key={model.id} 
              value={model.id}
              disabled={isModelDisabled}
            >
              {model.name} {isModelDisabled ? "(Web search not supported)" : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default ModelSelector; 