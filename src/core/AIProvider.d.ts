import type { AIProviderError, AIProviderResponse, Config } from './types.js';
export declare abstract class AIProvider {
  protected config: Config;
  constructor(config: Config);
  abstract validateConfig(): Promise<void>;
  abstract generateCommitMessage(prompt: string): Promise<AIProviderResponse>;
  abstract getSupportedModels(): string[];
  protected handleError(error: unknown): AIProviderError;
  protected retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    baseDelay?: number
  ): Promise<T>;
  private isNonRetryableError;
}
//# sourceMappingURL=AIProvider.d.ts.map
