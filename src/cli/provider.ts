import { ConfigManager } from '../core/ConfigManager.js';
import type { Config } from '../core/types.js';
import { prompt } from './utils.js';

interface ProviderOptions {
  provider?: string;
  apiKey?: string;
  model?: string;
  ollamaUrl?: string;
}

export async function providerCommand(options: ProviderOptions): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.loadConfig();

  try {
    // If no options provided, show interactive mode
    if (!options.provider && !options.apiKey && !options.model && !options.ollamaUrl) {
      await showProviderConfig(configManager);

      console.log('\nWhat would you like to do?');
      console.log('1. Configure provider settings');
      console.log('2. View current provider configuration');
      console.log('3. Exit');

      const choice = await prompt('\nEnter your choice (1-3): ');

      switch (choice) {
        case '1':
          await configureProviderInteractive(configManager);
          break;
        case '2':
          await showProviderConfig(configManager);
          break;
        case '3':
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

    if (options.ollamaUrl) {
      config.ollamaUrl = options.ollamaUrl;
      console.log(`✅ Ollama URL set to: ${options.ollamaUrl}`);
    }

    await configManager.saveConfig(config);
    console.log('✅ Provider configuration saved successfully!');
  } catch (error) {
    console.error('❌ Provider configuration failed:', error);
    process.exit(1);
  }
}

async function showProviderConfig(configManager: ConfigManager): Promise<void> {
  const config = await configManager.getConfig();

  if (!config) {
    console.log('📝 No configuration found. Run `commitologist setup` to get started.');
    return;
  }

  console.log('\n🔧 Provider Configuration:');
  console.log('==========================');
  console.log(`AI Provider: ${config.aiProvider}`);
  console.log(`Model: ${config.model}`);

  if (config.ollamaUrl) {
    console.log(`Ollama URL: ${config.ollamaUrl}`);
  }

  if (config.apiKey) {
    const maskedKey = `${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`;
    console.log(`API Key: ${maskedKey}`);
  }
}

async function configureProviderInteractive(configManager: ConfigManager): Promise<void> {
  let config = configManager.getConfig();
  if (!config) {
    config = configManager.createDefaultConfig('openai');
  }

  // Provider selection
  console.log('\n🤖 Select AI Provider:');
  console.log('1. OpenAI');
  console.log('2. Anthropic');
  console.log('3. Google Gemini');
  console.log('4. OpenRouter');
  console.log('5. Ollama (Local)');

  const providerChoice = await prompt('\nEnter your choice (1-5): ');
  const providerMap = {
    '1': 'openai',
    '2': 'anthropic',
    '3': 'gemini',
    '4': 'openrouter',
    '5': 'ollama',
  };

  const selectedProvider = providerMap[providerChoice as keyof typeof providerMap];
  if (!selectedProvider) {
    console.log('❌ Invalid provider selection.');
    return;
  }

  config.aiProvider = selectedProvider as Config['aiProvider'];

  // Model configuration
  const defaultModel = getDefaultModel(selectedProvider);
  const model = await prompt(`\n🎯 Enter model name (default: ${defaultModel}): `);
  config.model = model || defaultModel;

  // API Key for non-Ollama providers
  if (selectedProvider !== 'ollama') {
    const apiKey = await prompt(`\n🔑 Enter ${selectedProvider} API key: `);
    if (apiKey) {
      config.apiKey = apiKey;
    }
  }

  // Ollama URL if needed
  if (selectedProvider === 'ollama') {
    const ollamaUrl = await prompt(
      '\n🌐 Enter Ollama server URL (default: http://localhost:11434): '
    );
    config.ollamaUrl = ollamaUrl || 'http://localhost:11434';
  }

  await configManager.saveConfig(config);
  console.log('✅ Provider configuration saved successfully!');
}

function getDefaultModel(provider: string): string {
  const defaultModels = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-latest',
    gemini: 'gemini-2.5-flash',
    openrouter: 'openai/gpt-4o-mini',
    ollama: 'llama3.2',
  };
  return defaultModels[provider as keyof typeof defaultModels] || 'gpt-4o-mini';
}
