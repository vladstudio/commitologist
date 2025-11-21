import { AIProvider } from '../AIProvider.js';
import { createProviderError, getSystemPrompt, parseJsonErrorResponse } from '../ProviderUtils.js';
import type { AIProviderResponse } from '../types.js';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterProvider extends AIProvider {
  private readonly baseURL = 'https://openrouter.ai/api/v1';
  // Model list reference: https://openrouter.ai/docs/models
  private readonly recommendedModels = [
    // Latest Models (November 2025)
    'google/gemini-3-pro-preview',
    'openai/gpt-5',
    'openai/gpt-5-mini',
    'openai/gpt-5-nano',
    'anthropic/claude-haiku-4-5-20251001',
    'anthropic/claude-sonnet-4-5-20250929',
    'deepseek/deepseek-v3',
    'qwen/qwen3:235b',
    // Advanced Models (2025)
    'deepseek/deepseek-r1',
    'moonshotai/kimi-k2',
    'microsoft/phi-4',
    'qwen/qwen2.5-coder:32b',
    'qwen/qwen2.5:72b',
    // OpenAI Models
    'openai/gpt-4.1',
    'openai/gpt-4.1-mini',
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/gpt-3.5-turbo',
    // Anthropic Models (latest)
    'anthropic/claude-opus-4-1-20250805',
    'anthropic/claude-opus-4-20250514',
    'anthropic/claude-3-5-sonnet-20241022',
    // Meta Models
    'meta-llama/llama-4-maverick-400b',
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    // Google Models
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-lite',
    // Mistral Models
    'mistralai/mistral-small-3.1',
    'mistralai/mixtral-8x7b-instruct',
  ];

  async validateConfig(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    if (!this.config.model) {
      throw new Error('OpenRouter model is required');
    }

    // Test API key by making a simple request
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid OpenRouter API key');
        }
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate OpenRouter configuration');
    }
  }

  async generateCommitMessage(prompt: string): Promise<AIProviderResponse> {
    if (!this.config.apiKey) {
      throw this.handleError(new Error('OpenRouter API key is required'));
    }

    const request: OpenRouterRequest = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    };

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://commitologist.dev',
          'X-Title': 'Commitologist',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorMessage = await parseJsonErrorResponse(response);
        throw createProviderError(response.status, errorMessage);
      }

      const data = (await response.json()) as OpenRouterResponse;
      const message = data.choices[0]?.message?.content?.trim();

      if (!message) {
        throw createProviderError('NO_RESPONSE', 'No commit message generated');
      }

      return {
        message,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    });
  }

  getRecommendedModels(): string[] {
    return [...this.recommendedModels];
  }
}
