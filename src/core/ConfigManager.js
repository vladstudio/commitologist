var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.ConfigManager = void 0;
const node_fs_1 = require('node:fs');
const os = __importStar(require('node:os'));
const path = __importStar(require('node:path'));
const types_js_1 = require('./types.js');
class ConfigManager {
  constructor() {
    this.config = null;
  }
  async loadConfig() {
    try {
      const configData = await node_fs_1.promises.readFile(ConfigManager.CONFIG_FILE, 'utf-8');
      this.config = JSON.parse(configData);
      return this.config;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }
  async saveConfig(config) {
    await this.ensureConfigDir();
    await node_fs_1.promises.writeFile(ConfigManager.CONFIG_FILE, JSON.stringify(config, null, 2));
    this.config = config;
  }
  getConfig() {
    return this.config;
  }
  async updateConfig(updates) {
    if (!this.config) {
      throw new Error('No config loaded. Load or create a config first.');
    }
    const updatedConfig = { ...this.config, ...updates };
    await this.saveConfig(updatedConfig);
  }
  createDefaultConfig(aiProvider) {
    return {
      aiProvider,
      model: types_js_1.DEFAULT_MODELS[aiProvider],
      promptPreset: types_js_1.PROMPT_PRESETS.conventional,
      includeUnstagedFiles: true,
      ...(aiProvider === 'ollama' && { ollamaUrl: 'http://localhost:11434' }),
    };
  }
  validateConfig(config) {
    const errors = [];
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
  async configExists() {
    try {
      await node_fs_1.promises.access(ConfigManager.CONFIG_FILE);
      return true;
    } catch {
      return false;
    }
  }
  async deleteConfig() {
    try {
      await node_fs_1.promises.unlink(ConfigManager.CONFIG_FILE);
      this.config = null;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  async ensureConfigDir() {
    try {
      await node_fs_1.promises.mkdir(ConfigManager.CONFIG_DIR, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}
exports.ConfigManager = ConfigManager;
ConfigManager.CONFIG_DIR = path.join(os.homedir(), '.commitologist');
ConfigManager.CONFIG_FILE = path.join(ConfigManager.CONFIG_DIR, 'config.json');
//# sourceMappingURL=ConfigManager.js.map
