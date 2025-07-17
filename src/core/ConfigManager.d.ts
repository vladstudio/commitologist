import { type AIProviderType, type Config } from './types.js';
export declare class ConfigManager {
    private static readonly CONFIG_DIR;
    private static readonly CONFIG_FILE;
    private config;
    loadConfig(): Promise<Config | null>;
    saveConfig(config: Config): Promise<void>;
    getConfig(): Config | null;
    updateConfig(updates: Partial<Config>): Promise<void>;
    createDefaultConfig(aiProvider: AIProviderType): Config;
    validateConfig(config: Config): string[];
    configExists(): Promise<boolean>;
    deleteConfig(): Promise<void>;
    private ensureConfigDir;
}
//# sourceMappingURL=ConfigManager.d.ts.map