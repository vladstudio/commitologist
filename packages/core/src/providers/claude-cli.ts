import { execSync } from 'node:child_process';
import { AIProvider } from '../AIProvider.js';
import type { AIProviderError, AIProviderResponse } from '../types.js';

export class ClaudeCliProvider extends AIProvider {
  async validateConfig(): Promise<void> {
    try {
      // Check if claude command is available
      execSync('which claude', { stdio: 'pipe' });
    } catch (_error) {
      throw new Error('Claude CLI not found. Please install Claude Code CLI.');
    }
  }

  async generateCommitMessage(prompt: string): Promise<AIProviderResponse> {
    try {
      // Escape single quotes for shell safety
      const escapedPrompt = prompt.replace(/'/g, "'\\''");

      // Use claude command in headless mode with -p flag
      const result = execSync(`claude -p '${escapedPrompt}'`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000, // 60 second timeout
      });

      const message = result.trim();

      if (!message) {
        throw new Error('Claude CLI returned empty response');
      }

      return {
        message,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        const execError = error as Error & { code?: number; stderr?: string };
        throw new Error(
          `Claude CLI execution failed: ${execError.message}${
            execError.stderr ? ` - ${execError.stderr}` : ''
          }`
        );
      }
      throw new Error('Unknown error occurred while calling Claude CLI');
    }
  }

  getRecommendedModels(): string[] {
    // Claude CLI doesn't have model selection, return empty array
    return [];
  }

  protected handleError(error: unknown): AIProviderError {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return {
          code: 'CLI_NOT_FOUND',
          message: 'Claude CLI not found. Please install Claude Code CLI.',
          details: error,
        };
      }
      if (error.message.includes('timeout')) {
        return {
          code: 'TIMEOUT',
          message: 'Claude CLI request timed out',
          details: error,
        };
      }
    }
    return super.handleError(error);
  }
}
