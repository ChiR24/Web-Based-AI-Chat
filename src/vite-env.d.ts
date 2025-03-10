/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_MAX_SEARCH_ROUNDS?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// For custom environment variables in window
interface Window {
  _env_?: {
    GEMINI_API_KEY?: string;
    MAX_SEARCH_ROUNDS?: string;
    [key: string]: any;
  };
} 