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
    // Latest Popular Models (2025)
    'moonshotai/kimi-k2',
    'qwen/qwen2.5-vl-72b-instruct',
    'qwen/qwen2.5-vl-32b-instruct',
    'qwen/qwen2.5-vl-3b-instruct',
    'deepseek/deepseek-chat-v3.1',
    'deepseek/deepseek-v3.2-exp',
    'deepseek/deepseek-r1-0528-qwen3-8b',
    'deepseek/deepseek-r1-distill-qwen-32b',
    'deepseek/deepseek-r1-distill-qwen-7b',
    'microsoft/phi-4',
    'mistralai/mistral-small-3.1',
    // OpenAI Models
    'openai/o4-mini-2025-04-16',
    'openai/o3-2025-04-16',
    'openai/o3-mini',
    'openai/o1',
    'openai/o1-mini',
    'openai/gpt-4o',
    'openai/gpt-4o-2024-11-20',
    'openai/gpt-4o-mini',
    'openai/gpt-4-turbo',
    'openai/gpt-3.5-turbo',
    'openai/chatgpt-4o-latest',
    // Anthropic Models
    'anthropic/claude-sonnet-4-5-20250929',
    'anthropic/claude-opus-4-1-20250805',
    'anthropic/claude-opus-4-20250514',
    'anthropic/claude-sonnet-4-20250514',
    'anthropic/claude-3-7-sonnet-20250219',
    'anthropic/claude-3-5-sonnet-20241022',
    'anthropic/claude-3-5-haiku-20241022',
    'anthropic/claude-3-opus-20240229',
    'anthropic/claude-3-sonnet-20240229',
    'anthropic/claude-3-haiku-20240307',
    // Meta Models
    'meta-llama/llama-4-maverick-400b',
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.2-3b-instruct',
    'meta-llama/llama-3.2-1b-instruct',
    // Google Models
    'google/gemini-2.5-flash-lite',
    'google/gemini-2.5-flash',
    'google/gemini-2.5-pro',
    'google/gemini-2.0-flash',
    'google/gemini-flash-1.5',
    'google/gemini-pro-1.5',
    // Amazon Models
    'amazon/nova-pro-v1',
    'amazon/nova-lite-v1',
    'amazon/nova-micro-v1',
    // Mistral Models
    'mistralai/mistral-small-3.1',
    'mistralai/mixtral-8x7b-instruct',
    'mistralai/mistral-7b-instruct',
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
