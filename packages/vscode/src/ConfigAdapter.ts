import * as vscode from 'vscode';
import type { AIProviderType, Config } from '@commitologist/core';

/**
 * ConfigAdapter bridges VSCode settings with the core ConfigManager interface
 * This allows the core package to remain platform-agnostic while providing
 * VSCode-specific configuration management
 */
export class ConfigAdapter {
  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Load configuration from VSCode settings and secrets
   */
  async loadConfig(): Promise<Config | null> {
    const config = vscode.workspace.getConfiguration('commitologist');

    const aiProvider = config.get<AIProviderType>('aiProvider');
    const model = config.get<string>('model');
    const promptPreset = config.get<string>('promptPreset');
    const customPrompt = config.get<string>('customPrompt');
    const includeUnstagedFiles = config.get<boolean>('includeUnstagedFiles');
    const ollamaUrl = config.get<string>('ollamaUrl');

    if (!aiProvider || !model || !promptPreset) {
      return null;
    }

    let apiKey: string | undefined;
    if (aiProvider !== 'ollama') {
      apiKey = await this.context.secrets.get(`commitologist.${aiProvider}.apiKey`);
      if (!apiKey) {
        return null;
      }
    }

    return {
      aiProvider,
      model,
      promptPreset,
      customPrompt,
      includeUnstagedFiles: includeUnstagedFiles ?? true,
      ollamaUrl,
      apiKey,
    } as Config;
  }

  /**
   * Save provider-specific configuration to VSCode settings and secrets
   */
  async saveProviderConfig(
    providerValue: string,
    model: string,
    apiKey?: string,
    ollamaUrl?: string
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration('commitologist');
    await config.update('aiProvider', providerValue, vscode.ConfigurationTarget.Global);
    await config.update('model', model, vscode.ConfigurationTarget.Global);

    if (apiKey) {
      await this.context.secrets.store(`commitologist.${providerValue}.apiKey`, apiKey);
    }

    if (ollamaUrl) {
      await config.update('ollamaUrl', ollamaUrl, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * Save preset-specific configuration to VSCode settings
   */
  async savePresetConfig(
    promptPreset: string,
    includeUnstagedFiles: boolean,
    customPrompt?: string
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration('commitologist');
    await config.update('promptPreset', promptPreset, vscode.ConfigurationTarget.Global);
    await config.update(
      'includeUnstagedFiles',
      includeUnstagedFiles,
      vscode.ConfigurationTarget.Global
    );

    if (customPrompt) {
      await config.update('customPrompt', customPrompt, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * Check if configuration exists and is valid
   */
  async configExists(): Promise<boolean> {
    const config = await this.loadConfig();
    return config !== null;
  }
}