import { ConfigManager, type Config } from '@commitologist/core';

/**
 * ConfigAdapter for CLI - uses filesystem-based configuration
 * This adapter directly uses the core ConfigManager which already
 * supports filesystem configuration at ~/.commitologist/config.json
 */
export class ConfigAdapter {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = new ConfigManager();
  }

  /**
   * Load configuration from ~/.commitologist/config.json
   */
  async loadConfig(): Promise<Config | null> {
    return await this.configManager.loadConfig();
  }

  /**
   * Save configuration to ~/.commitologist/config.json
   */
  async saveConfig(config: Config): Promise<void> {
    await this.configManager.saveConfig(config);
  }

  /**
   * Update partial configuration
   */
  async updateConfig(updates: Partial<Config>): Promise<void> {
    await this.configManager.updateConfig(updates);
  }

  /**
   * Check if configuration file exists
   */
  async configExists(): Promise<boolean> {
    return await this.configManager.configExists();
  }

  /**
   * Delete configuration file
   */
  async deleteConfig(): Promise<void> {
    await this.configManager.deleteConfig();
  }

  /**
   * Get currently loaded configuration
   */
  getConfig(): Config | null {
    return this.configManager.getConfig();
  }

  /**
   * Validate configuration
   */
  validateConfig(config: Config): string[] {
    return this.configManager.validateConfig(config);
  }
}