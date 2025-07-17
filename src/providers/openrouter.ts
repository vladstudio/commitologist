import { AIProvider } from '../core/AIProvider.js';
import type { AIProviderError, AIProviderResponse } from '../core/types.js';

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
  private readonly supportedModels = [
    // OpenAI Models
    'openai/gpt-4o',
    'openai/gpt-4o-mini',
    'openai/gpt-4-turbo',
    'openai/gpt-3.5-turbo',
    'openai/chatgpt-4o-latest',
    // Anthropic Models
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    'anthropic/claude-3-opus',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-haiku',
    // Meta Models
    'meta-llama/llama-3.1-8b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.2-3b-instruct',
    'meta-llama/llama-3.2-1b-instruct',
    // Google Models
    'google/gemini-pro-1.5',
    'google/gemini-flash-1.5',
    // Amazon Models
    'amazon/nova-lite-v1',
    'amazon/nova-micro-v1',
    'amazon/nova-pro-v1',
    // Mistral Models
    'mistralai/mistral-7b-instruct',
    'mistralai/mixtral-8x7b-instruct',
    // Other popular models
    'qwen/qwen-2.5-coder-32b-instruct',
    'deepseek/deepseek-r1',
    'microsoft/phi-4',
  ];

  async validateConfig(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    if (!this.config.model) {
      throw new Error('OpenRouter model is required');
    }

    if (!this.supportedModels.includes(this.config.model)) {
      throw new Error(`Unsupported OpenRouter model: ${this.config.model}`);
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
          content:
            'You are an expert at writing clear, concise commit messages. Generate a commit message based on the provided git diff.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    };

    try {
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
        const errorText = await response.text();
        let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // Keep the default error message if JSON parsing fails
        }

        throw this.createProviderError(response.status, errorMessage);
      }

      const data = (await response.json()) as OpenRouterResponse;
      const message = data.choices[0]?.message?.content?.trim();

      if (!message) {
        throw this.createProviderError('NO_RESPONSE', 'No commit message generated');
      }

      return {
        message,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      throw this.handleError(error);
    }
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  private createProviderError(code: string | number, message: string): AIProviderError {
    const errorCode = typeof code === 'number' ? this.getErrorCodeFromStatus(code) : code;
    return {
      code: errorCode,
      message,
    };
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case 401:
        return 'INVALID_API_KEY';
      case 403:
        return 'INSUFFICIENT_PERMISSIONS';
      case 429:
        return 'RATE_LIMIT_EXCEEDED';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'API_ERROR';
    }
  }
}
