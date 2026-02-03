export type AIProviderType =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'ollama'
  | 'claude-cli'
  | 'codex-cli';

export interface Config {
  aiProvider: AIProviderType;
  apiKey?: string;
  model: string;
  promptPreset: string;
  customPrompt?: string;
  ollamaUrl?: string;
  includeUnstagedFiles: boolean;
}

export interface GitDiffResult {
  stagedFiles: string[];
  unstagedFiles: string[];
  stagedDiff: string;
  unstagedDiff: string;
  hasChanges: boolean;
}

export interface AIProviderResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PromptContext {
  diff: string;
  stagedFiles: string[];
  unstagedFiles: string[];
  includeUnstaged: boolean;
}

export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openai: 'gpt-5-mini',
  anthropic: 'claude-haiku-4-5',
  gemini: 'gemini-3-flash',
  openrouter: 'openai/gpt-5-mini',
  ollama: 'llama3.3',
  'claude-cli': '',
  'codex-cli': '',
};

export const PROMPT_PRESETS = {
  conventional: 'conventional',
  descriptive: 'descriptive',
  concise: 'concise',
  custom: 'custom',
} as const;

export type PromptPreset = (typeof PROMPT_PRESETS)[keyof typeof PROMPT_PRESETS];
