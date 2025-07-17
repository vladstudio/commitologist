import { AIProvider } from '../core/AIProvider.js';
import type { AIProviderError, AIProviderResponse } from '../core/types.js';

interface GeminiContent {
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiProvider extends AIProvider {
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly supportedModels = [
    // Gemini 2.5 Series (Latest)
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    // Gemini 2.0 Series
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    // Gemini 1.5 Series
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    // Gemini 1.0 Series
    'gemini-1.0-pro',
  ];

  async validateConfig(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Google Gemini API key is required');
    }

    if (!this.config.model) {
      throw new Error('Gemini model is required');
    }

    if (!this.supportedModels.includes(this.config.model)) {
      throw new Error(`Unsupported Gemini model: ${this.config.model}`);
    }

    // Test API key by making a simple request
    try {
      const response = await fetch(
        `${this.baseURL}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: 'test' }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 1,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid Google Gemini API key');
        }
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate Gemini configuration');
    }
  }

  async generateCommitMessage(prompt: string): Promise<AIProviderResponse> {
    if (!this.config.apiKey) {
      throw this.handleError(new Error('Google Gemini API key is required'));
    }

    const systemPrompt =
      'You are an expert at writing clear, concise commit messages. Generate a commit message based on the provided git diff.';
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const request: GeminiRequest = {
      contents: [
        {
          parts: [{ text: fullPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 150,
      },
    };

    try {
      const response = await fetch(
        `${this.baseURL}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;

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

      const data = (await response.json()) as GeminiResponse;
      const message = data.candidates[0]?.content?.parts[0]?.text?.trim();

      if (!message) {
        throw this.createProviderError('NO_RESPONSE', 'No commit message generated');
      }

      return {
        message,
        usage: {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
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
      case 403:
        return 'INVALID_API_KEY';
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
