import { ConfigManager } from '../core/ConfigManager.js';
import { prompt } from './utils.js';

interface PresetOptions {
  preset?: string;
  customPrompt?: string;
  includeUnstaged?: boolean;
}

export async function presetCommand(options: PresetOptions): Promise<void> {
  const configManager = new ConfigManager();
  await configManager.loadConfig();

  try {
    // If no options provided, show interactive mode
    if (!options.preset && !options.customPrompt && options.includeUnstaged === undefined) {
      await showPresetConfig(configManager);

      console.log('\nWhat would you like to do?');
      console.log('1. Configure preset settings');
      console.log('2. View current preset configuration');
      console.log('3. Exit');

      const choice = await prompt('\nEnter your choice (1-3): ');

      switch (choice) {
        case '1':
          await configurePresetInteractive(configManager);
          break;
        case '2':
          await showPresetConfig(configManager);
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

    if (options.preset) {
      const validPresets = ['conventional', 'descriptive', 'concise', 'custom'];
      if (!validPresets.includes(options.preset)) {
        console.error(`❌ Invalid preset. Must be one of: ${validPresets.join(', ')}`);
        return;
      }
      config.promptPreset = options.preset;
      console.log(`✅ Prompt preset set to: ${options.preset}`);
    }

    if (options.customPrompt) {
      config.customPrompt = options.customPrompt;
      config.promptPreset = 'custom';
      console.log('✅ Custom prompt updated');
    }

    if (options.includeUnstaged !== undefined) {
      config.includeUnstagedFiles = options.includeUnstaged;
      console.log(`✅ Include unstaged files set to: ${options.includeUnstaged ? 'Yes' : 'No'}`);
    }

    await configManager.saveConfig(config);
    console.log('✅ Preset configuration saved successfully!');
  } catch (error) {
    console.error('❌ Preset configuration failed:', error);
    process.exit(1);
  }
}

async function showPresetConfig(configManager: ConfigManager): Promise<void> {
  const config = await configManager.getConfig();

  if (!config) {
    console.log('📝 No configuration found. Run `commitologist setup` to get started.');
    return;
  }

  console.log('\n📝 Preset Configuration:');
  console.log('========================');
  console.log(`Prompt Preset: ${config.promptPreset}`);
  console.log(`Include Unstaged Files: ${config.includeUnstagedFiles ? 'Yes' : 'No'}`);

  if (config.customPrompt) {
    console.log(`Custom Prompt: ${config.customPrompt}`);
  }
}

async function configurePresetInteractive(configManager: ConfigManager): Promise<void> {
  let config = configManager.getConfig();
  if (!config) {
    config = configManager.createDefaultConfig('openai');
  }

  // Preset selection
  console.log('\n📝 Select Prompt Preset:');
  console.log('1. Conventional Commits');
  console.log('2. Descriptive');
  console.log('3. Concise');
  console.log('4. Custom');

  const presetChoice = await prompt('\nEnter your choice (1-4): ');
  const presetMap = {
    '1': 'conventional',
    '2': 'descriptive',
    '3': 'concise',
    '4': 'custom',
  };

  const selectedPreset = presetMap[presetChoice as keyof typeof presetMap];
  if (!selectedPreset) {
    console.log('❌ Invalid preset selection.');
    return;
  }

  config.promptPreset = selectedPreset;

  // Custom prompt if needed
  if (selectedPreset === 'custom') {
    const customPrompt = await prompt('\n✍️ Enter custom prompt template: ');
    if (customPrompt) {
      config.customPrompt = customPrompt;
    }
  }

  // Include unstaged files option
  const includeUnstaged = await prompt('\n📁 Include unstaged files in analysis? (y/n): ');
  config.includeUnstagedFiles =
    includeUnstaged.toLowerCase() === 'y' || includeUnstaged.toLowerCase() === 'yes';

  await configManager.saveConfig(config);
  console.log('✅ Preset configuration saved successfully!');
}
