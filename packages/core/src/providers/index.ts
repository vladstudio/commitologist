export { AnthropicProvider } from './anthropic.js';
export { ClaudeCliProvider } from './claude-cli.js';
export { CodexCliProvider } from './codex-cli.js';
export { GeminiProvider } from './gemini.js';
export { OllamaProvider } from './ollama.js';
export { OpenAIProvider } from './openai.js';
export { OpenRouterProvider } from './openrouter.js';

import type { AIProvider } from '../AIProvider.js';
import type { AIProviderType, Config } from '../types.js';
import { AnthropicProvider } from './anthropic.js';
import { ClaudeCliProvider } from './claude-cli.js';
import { CodexCliProvider } from './codex-cli.js';
import { GeminiProvider } from './gemini.js';
import { OllamaProvider } from './ollama.js';
import { OpenAIProvider } from './openai.js';
import { OpenRouterProvider } from './openrouter.js';

export function createProvider(config: Config): AIProvider {
  switch (config.aiProvider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'openrouter':
      return new OpenRouterProvider(config);
    case 'ollama':
      return new OllamaProvider(config);
    case 'claude-cli':
      return new ClaudeCliProvider(config);
    case 'codex-cli':
      return new CodexCliProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.aiProvider}`);
  }
}

export function getProviderDisplayName(provider: AIProviderType): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'anthropic':
      return 'Anthropic';
    case 'gemini':
      return 'Google Gemini';
    case 'openrouter':
      return 'OpenRouter';
    case 'ollama':
      return 'Ollama';
    case 'claude-cli':
      return 'Claude Code';
    case 'codex-cli':
      return 'Codex';
    default:
      return provider;
  }
}
