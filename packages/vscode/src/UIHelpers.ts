import * as vscode from 'vscode';
import type { AIProviderType } from '@commitologist/core';
import { createProvider } from '@commitologist/core';

/**
 * UI utility functions for VSCode extension
 */

export function handleError(error: unknown, context: string): string {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  if (error instanceof Error && error.stack) {
    console.error(`${context}: ${errorMessage}\nStack trace: ${error.stack}`);
  }
  return errorMessage;
}

export function showSuccessNotification(title: string): void {
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 100 });
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  );
}

export function insertMessageIntoGit(message: string, outputChannel: vscode.OutputChannel): void {
  const gitExtension = vscode.extensions.getExtension('vscode.git');
  if (gitExtension?.isActive) {
    try {
      const git = gitExtension.exports.getAPI(1);
      if (git?.repositories?.length) {
        const repository = git.repositories[0];
        if (repository?.inputBox) {
          repository.inputBox.value = message;
          outputChannel.appendLine('Commit message inserted into Source Control input');
        } else {
          outputChannel.appendLine('Git repository or input box not available');
        }
      } else {
        outputChannel.appendLine('No Git repositories found');
      }
    } catch (gitError) {
      outputChannel.appendLine(`Error accessing Git extension: ${gitError}`);
    }
  } else {
    outputChannel.appendLine('Git extension not active');
  }
}

export async function selectModel(providerValue: AIProviderType): Promise<string | undefined> {
  const providerForModelList = createProvider({
    aiProvider: providerValue,
    model: 'temp',
    promptPreset: 'conventional',
    includeUnstagedFiles: true,
  });

  const recommendedModels = providerForModelList.getRecommendedModels();
  const modelOptions = [
    ...recommendedModels.map((model) => ({ label: model, value: model })),
    { label: 'Other (Custom)', value: 'OTHER' },
  ];

  const selectedModelOption = await vscode.window.showQuickPick(modelOptions, {
    placeHolder: 'Select a model or choose "Other" for custom',
  });

  if (!selectedModelOption?.value) return undefined;

  if (selectedModelOption.value === 'OTHER') {
    const customModel = await vscode.window.showInputBox({
      prompt: 'Enter custom model ID',
      placeHolder: 'e.g., custom-model-name',
    });
    return customModel;
  }

  return selectedModelOption.value;
}

export async function getApiKey(providerLabel: string): Promise<string | undefined> {
  return await vscode.window.showInputBox({
    prompt: `Enter ${providerLabel} API key`,
    password: true,
  });
}

export async function getOllamaUrl(): Promise<string | undefined> {
  return await vscode.window.showInputBox({
    prompt: 'Enter Ollama server URL',
    value: 'http://localhost:11434',
  });
}

export async function selectAIProvider(): Promise<{ label: string; value: string } | undefined> {
  return await vscode.window.showQuickPick(
    [
      { label: 'OpenAI', value: 'openai' },
      { label: 'Anthropic', value: 'anthropic' },
      { label: 'Google Gemini', value: 'gemini' },
      { label: 'OpenRouter', value: 'openrouter' },
      { label: 'Ollama (Local)', value: 'ollama' },
    ],
    {
      placeHolder: 'Select AI provider',
    }
  );
}

export async function handleProviderSpecificConfig(aiProvider: {
  label: string;
  value: string;
}): Promise<{ apiKey?: string; ollamaUrl?: string }> {
  if (aiProvider.value !== 'ollama') {
    const apiKey = await getApiKey(aiProvider.label);
    if (!apiKey) throw new Error('API key required');
    return { apiKey };
  }

  if (aiProvider.value === 'ollama') {
    const ollamaUrl = await getOllamaUrl();
    if (!ollamaUrl) throw new Error('Ollama URL required');
    return { ollamaUrl };
  }

  return {};
}