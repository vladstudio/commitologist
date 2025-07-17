import { ConfigManager } from '../core/ConfigManager.js';
import type { Config } from '../core/types.js';
import { setupWizard } from './setup.js';
import { prompt } from './utils.js';

interface ConfigOptions {
  provider?: string;
  apiKey?: string;
  model?: string;
  reset?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.loadConfig();

  try {
    if (options.reset) {
      await configManager.deleteConfig();
      console.log('✅ Configuration reset. Run `commitologist setup` to reconfigure.');
      return;
    }

    // If no options provided, show current config and run interactive mode
    if (!options.provider && !options.apiKey && !options.model) {
      await showCurrentConfig(configManager);
      console.log('\nWhat would you like to do?');
      console.log('1. Run full setup wizard');
      console.log('2. View current configuration');
      console.log('3. Reset configuration');
      console.log('4. Exit');

      const choice = await prompt('\nEnter your choice (1-4): ');

      switch (choice) {
        case '1':
          await setupWizard();
          break;
        case '2':
          await showCurrentConfig(configManager);
          break;
        case '3':
          await configManager.deleteConfig();
          console.log('✅ Configuration reset.');
          break;
        case '4':
          console.log('👋 Goodbye!');
          break;
        default:
          console.log('❌ Invalid choice.');
      }
      return;
    }

    // Handle individual options
    let config = configManager.getConfig();
    if (!config) {
      config = configManager.createDefaultConfig('openai');
    }

    if (options.provider) {
      const validProviders = ['openai', 'anthropic', 'gemini', 'openrouter', 'ollama'];
      if (!validProviders.includes(options.provider)) {
        console.error(`❌ Invalid provider. Must be one of: ${validProviders.join(', ')}`);
        return;
      }
      config.aiProvider = options.provider as Config['aiProvider'];
      console.log(`✅ AI Provider set to: ${options.provider}`);
    }

    if (options.apiKey) {
      config.apiKey = options.apiKey;
      console.log('✅ API Key updated');
    }

    if (options.model) {
      config.model = options.model;
      console.log(`✅ Model set to: ${options.model}`);
    }

    await configManager.saveConfig(config);
    console.log('✅ Configuration saved successfully!');
  } catch (error) {
    console.error('❌ Configuration failed:', error);
    process.exit(1);
  }
}

async function showCurrentConfig(configManager: ConfigManager): Promise<void> {
  const config = await configManager.getConfig();

  if (!config) {
    console.log('📝 No configuration found. Run `commitologist setup` to get started.');
    return;
  }

  console.log('\n📋 Current Configuration:');
  console.log('========================');
  console.log(`AI Provider: ${config.aiProvider}`);
  console.log(`Model: ${config.model}`);
  console.log(`Prompt Preset: ${config.promptPreset}`);
  console.log(`Include Unstaged Files: ${config.includeUnstagedFiles ? 'Yes' : 'No'}`);

  if (config.ollamaUrl) {
    console.log(`Ollama URL: ${config.ollamaUrl}`);
  }

  if (config.apiKey) {
    const maskedKey = `${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`;
    console.log(`API Key: ${maskedKey}`);
  }
}
