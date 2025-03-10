import { GeminiModel } from '../../features/gemini/types/gemini.types';

// Model capabilities
const TEXT = "Text generation";
const MULTIMODAL = "Multimodal (text + images)";
const LONGCONTEXT = "Long context";
const CODE = "Code generation";
const REASONING = "Advanced reasoning";
const THINKING = "Thinking process";

/**
 * Available Gemini models
 */
export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: "gemini-2.0-flash-thinking-exp",
    name: "Gemini 2.0 Flash Thinking",
    description: "Experimental model with explicit thinking capabilities",
    isDefault: false,
    experimental: true,
    capabilities: [TEXT, CODE, MULTIMODAL, THINKING],
    maxInputTokens: 32768,
    supportsWebSearch: true,
    supportsThinking: true
  },
  {
    id: "gemini-2.0-pro-exp",
    name: "Gemini 2.0 Pro",
    description: "Most capable model for complex tasks",
    isDefault: false,
    capabilities: [TEXT, CODE, REASONING, LONGCONTEXT],
    maxInputTokens: 32768,
    supportsWebSearch: true,
    supportsThinking: true
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    description: "Fast model with vision capabilities",
    isDefault: true,
    capabilities: [TEXT, CODE, MULTIMODAL],
    maxInputTokens: 32768,
    supportsWebSearch: true,
    supportsThinking: true
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Previous generation pro model",
    capabilities: [TEXT, CODE, REASONING, LONGCONTEXT],
    maxInputTokens: 16384,
    supportsWebSearch: true,
    supportsThinking: false
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Previous generation fast model",
    capabilities: [TEXT, CODE],
    maxInputTokens: 16384,
    supportsWebSearch: true,
    supportsThinking: false
  }
];

// Log models for debugging
console.log('GEMINI_MODELS loaded:', GEMINI_MODELS);

/**
 * Get the default model
 */
export const getDefaultModel = (): GeminiModel => {
  const defaultModel = GEMINI_MODELS.find(model => model.isDefault) || GEMINI_MODELS[0];
  console.log('Default model:', defaultModel);
  return defaultModel;
};

/**
 * Find a model by ID
 */
export const findModelById = (id: string): GeminiModel | undefined => {
  const model = GEMINI_MODELS.find(model => model.id === id);
  console.log(`Finding model by ID ${id}:`, model);
  return model;
}; 