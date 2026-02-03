import { AIProvider } from '../AIProvider.js';
import { createProviderError, getSystemPrompt, parseJsonErrorResponse } from '../ProviderUtils.js';
import type { AIProviderResponse } from '../types.js';

interface GeminiContent {
  parts: Array<{ text: string }>;
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content?: {
      parts?: Array<{ text: string }>;
      text?: string;
      role?: string;
    };
    text?: string;
    finishReason?: string;
    index?: number;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount?: number;
    totalTokenCount: number;
  };
}

export class GeminiProvider extends AIProvider {
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  // Model list reference: https://ai.google.dev/gemini-api/docs/models
  private readonly recommendedModels = [
    // Fast, cost-effective models for short commit messages
    'gemini-3-flash',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
  ];

  async validateConfig(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Google Gemini API key is required');
    }

    if (!this.config.model) {
      throw new Error('Gemini model is required');
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

        // Special handling for 500 errors with 2.5 models
        if (
          response.status === 500 &&
          (this.config.model.includes('2.5-pro') || this.config.model.includes('2.5-flash'))
        ) {
          throw new Error(
            `Gemini API error: ${response.status} ${response.statusText}. This is a known issue with Gemini 2.5 models. Try using gemini-3-flash or gemini-2.5-flash-lite instead.`
          );
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

    const systemPrompt = getSystemPrompt();

    const request: GeminiRequest = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500, // Reduced for commit messages
      },
    };

    return this.retryWithBackoff(async () => {
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
        const errorMessage = await parseJsonErrorResponse(response);

        // Special handling for 500 errors with 2.5 models
        if (
          response.status === 500 &&
          (this.config.model.includes('2.5-pro') || this.config.model.includes('2.5-flash'))
        ) {
          throw createProviderError(
            response.status,
            `${errorMessage}. This is a known issue with Gemini 2.5 models. Try using gemini-3-flash or gemini-2.5-flash-lite instead.`
          );
        }

        throw createProviderError(response.status, errorMessage);
      }

      const data = (await response.json()) as GeminiResponse;
      const message = this.parseGeminiResponse(data);

      return {
        message,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
      };
    });
  }

  getRecommendedModels(): string[] {
    return [...this.recommendedModels];
  }

  private parseGeminiResponse(data: GeminiResponse): string {
    // Validate candidates exist
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      throw createProviderError('NO_CANDIDATES', 'No candidates in response from Gemini API');
    }

    const candidate = data.candidates[0];
    if (!candidate) {
      throw createProviderError('NO_CANDIDATE', 'No candidate in response from Gemini API');
    }

    // Check for finish reason issues
    this.validateFinishReason(candidate);

    // Extract message from various response structures
    const message = this.extractMessageFromCandidate(candidate);

    if (!message) {
      console.log('Debug - Full response:', JSON.stringify(data, null, 2));
      throw createProviderError('NO_RESPONSE', 'No commit message generated');
    }

    return message;
  }

  private validateFinishReason(candidate: GeminiResponse['candidates'][0]): void {
    if (candidate.finishReason === 'MAX_TOKENS') {
      throw createProviderError('MAX_TOKENS', 'Response was truncated due to token limit');
    }

    if (candidate.finishReason === 'SAFETY') {
      throw createProviderError('SAFETY', 'Response blocked due to safety filters');
    }
  }

  private extractMessageFromCandidate(
    candidate: GeminiResponse['candidates'][0]
  ): string | undefined {
    // Try different response structures in order of preference
    if (candidate.content?.parts && Array.isArray(candidate.content.parts)) {
      return candidate.content.parts[0]?.text?.trim();
    }

    if (candidate.content?.text) {
      return candidate.content.text.trim();
    }

    if (candidate.text) {
      return candidate.text.trim();
    }

    return undefined;
  }
}
