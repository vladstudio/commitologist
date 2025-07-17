import { ConfigManager } from '../core/ConfigManager.js';
import { PromptManager } from '../core/PromptManager.js';
import type { Config } from '../core/types.js';
import { prompt } from './utils.js';

const AI_PROVIDERS = [
  { name: 'OpenAI', value: 'openai' },
  { name: 'Anthropic', value: 'anthropic' },
  { name: 'Google Gemini', value: 'gemini' },
  { name: 'OpenRouter', value: 'openrouter' },
  { name: 'Ollama (Local)', value: 'ollama' },
] as const;

const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-latest',
  gemini: 'gemini-2.5-flash',
  openrouter: 'openai/gpt-4o-mini',
  ollama: 'llama3.2',
} as const;

export async function setupWizard(): Promise<void> {
  console.log('🔧 Commitologist Setup Wizard');
  console.log('================================\n');

  const configManager = new ConfigManager();
  const promptManager = new PromptManager();

  try {
    // Select AI Provider
    console.log('1. Select your AI provider:');
    AI_PROVIDERS.forEach((provider, index) => {
      console.log(`   ${index + 1}. ${provider.name}`);
    });

    const providerChoice = await prompt('\nEnter your choice (1-5): ');
    const providerIndex = parseInt(providerChoice) - 1;

    if (providerIndex < 0 || providerIndex >= AI_PROVIDERS.length) {
      console.error('❌ Invalid choice. Please run setup again.');
      return;
    }

    const selectedProvider = AI_PROVIDERS[providerIndex];
    if (!selectedProvider) {
      console.error('❌ Invalid choice. Please run setup again.');
      return;
    }

    const aiProvider = selectedProvider.value;

    console.log(`✅ Selected: ${selectedProvider.name}\n`);

    let apiKey: string | undefined;
    let model: string = DEFAULT_MODELS[aiProvider];
    let ollamaUrl: string | undefined;

    // Get API key (if not Ollama)
    if (aiProvider !== 'ollama') {
      apiKey = await prompt(`2. Enter your ${selectedProvider.name} API key: `);
      if (!apiKey.trim()) {
        console.error('❌ API key is required. Please run setup again.');
        return;
      }
    } else {
      ollamaUrl = await prompt(
        '2. Enter Ollama URL (press Enter for default http://localhost:11434): '
      );
      if (!ollamaUrl.trim()) {
        ollamaUrl = 'http://localhost:11434';
      }
    }

    // Select model
    console.log('\n3. Select model:');
    console.log(`   Recommended: ${DEFAULT_MODELS[aiProvider]}`);
    const modelInput = await prompt(`   Enter model name (press Enter for default): `);
    model = modelInput.trim() || DEFAULT_MODELS[aiProvider];

    // Select prompt preset
    console.log('\n4. Select commit message style:');
    const presets = promptManager.getAvailablePresets();
    presets.forEach((preset, index) => {
      console.log(`   ${index + 1}. ${preset} - ${promptManager.getPresetDescription(preset)}`);
    });

    const presetChoice = await prompt(`\nEnter your choice (1-${presets.length}): `);
    const presetIndex = parseInt(presetChoice) - 1;

    if (presetIndex < 0 || presetIndex >= presets.length) {
      console.error('❌ Invalid choice. Please run setup again.');
      return;
    }

    const selectedPreset = presets[presetIndex] || 'conventional';

    // Include unstaged files
    console.log('\n5. Include unstaged changes in analysis?');
    const includeUnstaged = await prompt('   (y/n, default: y): ');
    const includeUnstagedFiles = includeUnstaged.toLowerCase() !== 'n';

    // Create configuration
    const config: Config = {
      aiProvider,
      model,
      promptPreset: selectedPreset,
      includeUnstagedFiles,
    };

    if (apiKey) {
      config.apiKey = apiKey;
    }

    if (ollamaUrl) {
      config.ollamaUrl = ollamaUrl;
    }

    await configManager.saveConfig(config);

    console.log('\n✅ Configuration saved successfully!');
    console.log('🚀 You can now run `commitologist` to generate commit messages.');
    console.log('💡 Use `commitologist config` to modify settings later.');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}
