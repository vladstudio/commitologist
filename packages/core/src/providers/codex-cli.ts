import { execSync } from 'node:child_process';
import { AIProvider } from '../AIProvider.js';
import type { AIProviderError, AIProviderResponse } from '../types.js';

export class CodexCliProvider extends AIProvider {
  async validateConfig(): Promise<void> {
    try {
      // Check if codex command is available
      execSync('which codex', { stdio: 'pipe' });
    } catch (_error) {
      throw new Error('Codex CLI not found. Please install Codex CLI.');
    }
  }

  async generateCommitMessage(prompt: string): Promise<AIProviderResponse> {
    try {
      // Use codex command to generate commit message
      const result = execSync(`codex "${prompt}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 30000, // 30 second timeout
      });

      return {
        message: result.trim(),
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        const execError = error as Error & { code?: number; stderr?: string };
        throw new Error(
          `Codex CLI execution failed: ${execError.message}${
            execError.stderr ? ` - ${execError.stderr}` : ''
          }`
        );
      }
      throw new Error('Unknown error occurred while calling Codex CLI');
    }
  }

  getRecommendedModels(): string[] {
    // Codex CLI doesn't have model selection, return empty array
    return [];
  }

  protected handleError(error: unknown): AIProviderError {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return {
          code: 'CLI_NOT_FOUND',
          message: 'Codex CLI not found. Please install Codex CLI.',
          details: error,
        };
      }
      if (error.message.includes('timeout')) {
        return {
          code: 'TIMEOUT',
          message: 'Codex CLI request timed out',
          details: error,
        };
      }
    }
    return super.handleError(error);
  }
}
