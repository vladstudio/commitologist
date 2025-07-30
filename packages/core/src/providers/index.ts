export { AnthropicProvider } from './anthropic.js';
export { GeminiProvider } from './gemini.js';
export { OllamaProvider } from './ollama.js';
export { OpenAIProvider } from './openai.js';
export { OpenRouterProvider } from './openrouter.js';

import type { AIProvider } from '../AIProvider.js';
import type { AIProviderType, Config } from '../types.js';
import { AnthropicProvider } from './anthropic.js';
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
    default:
      return provider;
  }
}
