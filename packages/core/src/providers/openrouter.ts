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
  // Model list reference: https://openrouter.ai/models
  private readonly recommendedModels = [
    // Fast, low-cost models for short commit messages
    'openai/gpt-5-mini',
    'openai/gpt-5-nano',
    'openai/gpt-4.1-mini',
    'anthropic/claude-haiku-4-5',
    'google/gemini-3-flash',
    'google/gemini-2.5-flash-lite',
    'deepseek/deepseek-v3.2',
    'mistralai/mistral-small-3.1',
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
