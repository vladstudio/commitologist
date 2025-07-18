import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { type AIProviderType, type Config, DEFAULT_MODELS, PROMPT_PRESETS } from './types.js';

export class ConfigManager {
  private static readonly CONFIG_DIR = path.join(os.homedir(), '.commitologist');
  private static readonly CONFIG_FILE = path.join(ConfigManager.CONFIG_DIR, 'config.json');

  private config: Config | null = null;

  async loadConfig(): Promise<Config | null> {
    try {
      const configData = await fs.readFile(ConfigManager.CONFIG_FILE, 'utf-8');
      this.config = JSON.parse(configData) as Config;
      return this.config;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async saveConfig(config: Config): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(ConfigManager.CONFIG_FILE, JSON.stringify(config, null, 2));
    this.config = config;
  }

  getConfig(): Config | null {
    return this.config;
  }

  async updateConfig(updates: Partial<Config>): Promise<void> {
    if (!this.config) {
      throw new Error('No config loaded. Load or create a config first.');
    }

    const updatedConfig = { ...this.config, ...updates };
    await this.saveConfig(updatedConfig);
  }

  createDefaultConfig(aiProvider: AIProviderType): Config {
    return {
      aiProvider,
      model: DEFAULT_MODELS[aiProvider],
      promptPreset: PROMPT_PRESETS.conventional,
      includeUnstagedFiles: true,
      ...(aiProvider === 'ollama' && { ollamaUrl: 'http://localhost:11434' }),
    };
  }

  validateConfig(config: Config): string[] {
    const errors: string[] = [];

    if (!config.aiProvider) {
      errors.push('AI provider is required');
    }

    if (!config.model) {
      errors.push('Model is required');
    }

    if (!config.promptPreset) {
      errors.push('Prompt preset is required');
    }

    if (config.aiProvider !== 'ollama' && !config.apiKey) {
      errors.push('API key is required for this provider');
    }

    if (config.promptPreset === 'custom' && !config.customPrompt) {
      errors.push('Custom prompt is required when using custom preset');
    }

    return errors;
  }

  async configExists(): Promise<boolean> {
    try {
      await fs.access(ConfigManager.CONFIG_FILE);
      return true;
    } catch {
      return false;
    }
  }

  async deleteConfig(): Promise<void> {
    try {
      await fs.unlink(ConfigManager.CONFIG_FILE);
      this.config = null;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private async ensureConfigDir(): Promise<void> {
    try {
      await fs.mkdir(ConfigManager.CONFIG_DIR, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }
}
