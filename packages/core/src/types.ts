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
  openai: 'gpt-4.1-mini',
  anthropic: 'claude-sonnet-4-20250514',
  gemini: 'gemini-2.5-flash-lite',
  openrouter: 'openai/gpt-4.1-mini',
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
