import { AIProvider } from '../AIProvider.js';
import { createProviderError, getSystemPrompt, parseJsonErrorResponse } from '../ProviderUtils.js';
import type { AIProviderResponse } from '../types.js';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream: false;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

interface OllamaResponse {
  message: {
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaProvider extends AIProvider {
  private readonly recommendedModels = [
    // Llama 3 Series
    'llama3.3',
    'llama3.2',
    'llama3.1',
    'llama3.1:8b',
    'llama3.1:70b',
    'llama3.2:1b',
    'llama3.2:3b',
    // Code-specialized models
    'codellama',
    'codellama:7b-code',
    'codellama:7b-instruct',
    'codellama:34b',
    'qwen2.5-coder',
    'qwen2.5-coder:1.5b',
    'qwen2.5-coder:7b',
    'qwen2.5-coder:32b',
    // Mistral Series
    'mistral:7b',
    'mistral:7b-instruct',
    // Other popular models
    'deepseek-r1',
    'phi-4',
    'gemma3',
    'qwen2.5',
    'qwen2.5:7b',
    'qwen2.5:14b',
    'qwen2.5:32b',
  ];

  private get baseURL(): string {
    return this.config.ollamaUrl || 'http://localhost:11434';
  }

  async validateConfig(): Promise<void> {
    if (!this.config.model) {
      throw new Error('Ollama model is required');
    }

    // Test connection to Ollama instance
    try {
      const response = await fetch(`${this.baseURL}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ollama server error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { models: Array<{ name: string }> };
      const availableModels = data.models?.map((m) => m.name) || [];

      // Check if the requested model is available
      if (!availableModels.some((model: string) => model.startsWith(this.config.model))) {
        throw new Error(
          `Model ${this.config.model} is not available in Ollama. Available models: ${availableModels.join(', ')}`
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate Ollama configuration');
    }
  }

  async generateCommitMessage(prompt: string): Promise<AIProviderResponse> {
    const request: OllamaRequest = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 150,
      },
    };

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorMessage = await parseJsonErrorResponse(response);
        throw createProviderError(response.status, errorMessage);
      }

      const data = (await response.json()) as OllamaResponse;
      const message = data.message?.content?.trim();

      if (!message) {
        throw createProviderError('NO_RESPONSE', 'No commit message generated');
      }

      // Ollama doesn't provide detailed token usage like other providers
      // We'll estimate based on response
      const estimatedPromptTokens = Math.ceil(prompt.length / 4);
      const estimatedCompletionTokens = Math.ceil(message.length / 4);

      return {
        message,
        usage: {
          promptTokens: estimatedPromptTokens,
          completionTokens: estimatedCompletionTokens,
          totalTokens: estimatedPromptTokens + estimatedCompletionTokens,
        },
      };
    });
  }

  getRecommendedModels(): string[] {
    return [...this.recommendedModels];
  }
}
