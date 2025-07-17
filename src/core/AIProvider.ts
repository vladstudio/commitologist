import type { AIProviderError, AIProviderResponse, Config } from './types.js';

export abstract class AIProvider {
  protected config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  abstract validateConfig(): Promise<void>;

  abstract generateCommitMessage(prompt: string): Promise<AIProviderResponse>;

  abstract getSupportedModels(): string[];

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
}
