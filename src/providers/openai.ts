import { AIProvider } from '../core/AIProvider.js';
import type { AIProviderError, AIProviderResponse } from '../core/types.js';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface OpenAIResponse {
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

export class OpenAIProvider extends AIProvider {
  private readonly baseURL = 'https://api.openai.com/v1';
  private readonly supportedModels = [
    // GPT-4.1 Series (Latest - April 2025)
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    // GPT-4o Series
    'gpt-4o',
    'gpt-4o-mini',
    'chatgpt-4o-latest',
    // GPT-4 Turbo Series
    'gpt-4-turbo',
    'gpt-4-turbo-2024-04-09',
    // GPT-3.5 Series
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0125',
  ];

  async validateConfig(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (!this.config.model) {
      throw new Error('OpenAI model is required');
    }

    if (!this.supportedModels.includes(this.config.model)) {
      throw new Error(`Unsupported OpenAI model: ${this.config.model}`);
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
          throw new Error('Invalid OpenAI API key');
        }
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate OpenAI configuration');
    }
  }

  async generateCommitMessage(prompt: string): Promise<AIProviderResponse> {
    if (!this.config.apiKey) {
      throw this.handleError(new Error('OpenAI API key is required'));
    }

    const request: OpenAIRequest = {
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

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;

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

      const data = (await response.json()) as OpenAIResponse;
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
    });
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
