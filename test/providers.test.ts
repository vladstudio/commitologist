
import { describe, it, expect } from 'vitest';
import { createProvider } from '../src/providers/index';
import { OpenAIProvider } from '../src/providers/openai';
import { AnthropicProvider } from '../src/providers/anthropic';
import { GeminiProvider } from '../src/providers/gemini';
import { OpenRouterProvider } from '../src/providers/openrouter';
import { OllamaProvider } from '../src/providers/ollama';
import type { Config } from '../src/types';

describe('createProvider', () => {
  it('should return OpenAIProvider for openai', () => {
    const config = { aiProvider: 'openai' } as Config;
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it('should return AnthropicProvider for anthropic', () => {
    const config = { aiProvider: 'anthropic' } as Config;
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(AnthropicProvider);
  });

  it('should return GeminiProvider for gemini', () => {
    const config = { aiProvider: 'gemini' } as Config;
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it('should return OpenRouterProvider for openrouter', () => {
    const config = { aiProvider: 'openrouter' } as Config;
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(OpenRouterProvider);
  });

  it('should return OllamaProvider for ollama', () => {
    const config = { aiProvider: 'ollama' } as Config;
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(OllamaProvider);
  });

  it('should throw an error for unsupported provider', () => {
    const config = { aiProvider: 'unsupported' } as Config;
    expect(() => createProvider(config)).toThrow('Unsupported AI provider: unsupported');
  });
});
