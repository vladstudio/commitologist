import type { AIProviderError, AIProviderResponse, Config } from './types.js';

export abstract class AIProvider {
  protected config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  abstract validateConfig(): Promise<void>;

  abstract generateCommitMessage(prompt: string): Promise<AIProviderResponse>;

  abstract getRecommendedModels(): string[];

  protected handleError(error: unknown): AIProviderError {
    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        details: error,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
    };
  }

  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error during retry attempts');

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain error types
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          throw error;
        }

        // Wait with exponential backoff
        const delay = baseDelay * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  private isNonRetryableError(error: unknown): boolean {
    if (error instanceof Error && 'code' in error) {
      const errorCode = (error as Error & { code: string }).code;
      return [
        'INVALID_API_KEY',
        'INSUFFICIENT_PERMISSIONS',
        'MODEL_NOT_FOUND',
        'NO_RESPONSE',
      ].includes(errorCode);
    }
    return false;
  }
}
