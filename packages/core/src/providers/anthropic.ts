import { AIProvider } from '../AIProvider.js';
import { createProviderError, getSystemPrompt, parseJsonErrorResponse } from '../ProviderUtils.js';
import type { AIProviderResponse } from '../types.js';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
  temperature?: number;
}

interface AnthropicResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends AIProvider {
  private readonly baseURL = 'https://api.anthropic.com/v1';
  // Model list reference: https://docs.claude.com/en/docs/about-claude/models/overview
  private readonly recommendedModels = [
    // Claude Haiku 4.5 Series (Latest - October 2025)
    'claude-haiku-4-5-20251001',
    'claude-haiku-4-5',
    // Claude Sonnet 4.5 Series (September 2025)
    'claude-sonnet-4-5-20250929',
    'claude-sonnet-4-5',
    // Claude Opus 4.1 Series (August 2025)
    'claude-opus-4-1-20250805',
    'claude-opus-4-1',
    // Claude Opus 4 Series (May 2025)
    'claude-opus-4-20250514',
    'claude-sonnet-4-20250514',
    // Claude 3.7 Series (deprecated, kept for compatibility)
    'claude-3-7-sonnet-20250219',
    // Claude 3.5 Series (deprecated)
    'claude-3-5-sonnet-20241022',
  ];

  async validateConfig(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    if (!this.config.model) {
      throw new Error('Anthropic model is required');
    }

    // Test API key by making a simple request
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Anthropic API key');
        }
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate Anthropic configuration');
    }
  }

  async generateCommitMessage(prompt: string): Promise<AIProviderResponse> {
    if (!this.config.apiKey) {
      throw this.handleError(new Error('Anthropic API key is required'));
    }

    const request: AnthropicRequest = {
      model: this.config.model,
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: getSystemPrompt(),
      temperature: 0.3,
    };

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorMessage = await parseJsonErrorResponse(response);
        throw createProviderError(response.status, errorMessage);
      }

      const data = (await response.json()) as AnthropicResponse;
      const message = data.content[0]?.text?.trim();

      if (!message) {
        throw createProviderError('NO_RESPONSE', 'No commit message generated');
      }

      return {
        message,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
      };
    });
  }

  getRecommendedModels(): string[] {
    return [...this.recommendedModels];
  }
}
