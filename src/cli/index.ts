#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from '../core/ConfigManager.js';
import { generateCommitMessage } from './generate.js';
import { presetCommand } from './preset.js';
import { providerCommand } from './provider.js';
import { setupWizard } from './setup.js';

const program = new Command();

program
  .name('commitologist')
  .description('Generate intelligent commit messages using AI')
  .version('0.1.0');

program
  .command('generate')
  .description('Generate a commit message for staged changes')
  .option('-a, --approve', 'Automatically approve and commit the generated message')
  .option('-d, --dry-run', 'Show what would be committed without actually committing')
  .action(async (options) => {
    await generateCommitMessage(options);
  });

program
  .command('setup')
  .description('Run the interactive setup wizard')
  .action(async () => {
    await setupWizard();
  });

program
  .command('provider')
  .description('Configure AI provider settings')
  .option(
    '-p, --provider <provider>',
    'Set AI provider (openai, anthropic, gemini, openrouter, ollama)'
  )
  .option('-k, --api-key <key>', 'Set API key')
  .option('-m, --model <model>', 'Set model')
  .option('-u, --ollama-url <url>', 'Set Ollama server URL')
  .action(async (options) => {
    await providerCommand(options);
  });

program
  .command('preset')
  .description('Configure prompt preset and behavior settings')
  .option('-p, --preset <preset>', 'Set prompt preset (conventional, descriptive, concise, custom)')
  .option('-c, --custom-prompt <prompt>', 'Set custom prompt template')
  .option('--include-unstaged', 'Include unstaged files in analysis')
  .option('--no-include-unstaged', 'Exclude unstaged files from analysis')
  .action(async (options) => {
    await presetCommand(options);
  });

// Default command when no subcommand is provided
program.action(async () => {
  // Check if configuration exists
  const configManager = new ConfigManager();
  await configManager.loadConfig();
  const config = configManager.getConfig();

  if (!config) {
    console.log('🚀 Welcome to Commitologist!');
    console.log("Let's set up your configuration first...\n");
    await setupWizard();
    return;
  }

  // Generate commit message
  await generateCommitMessage({ approve: false, dryRun: false });
});

program.parse();
