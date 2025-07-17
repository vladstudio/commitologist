#!/usr/bin/env node

import { Command } from 'commander';
import { ConfigManager } from '../core/ConfigManager.js';
import { configCommand } from './config.js';
import { generateCommitMessage } from './generate.js';
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
  .command('config')
  .description('Configure Commitologist settings')
  .option(
    '-p, --provider <provider>',
    'Set AI provider (openai, anthropic, gemini, openrouter, ollama)'
  )
  .option('-k, --api-key <key>', 'Set API key')
  .option('-m, --model <model>', 'Set model')
  .option('-r, --reset', 'Reset configuration to defaults')
  .action(async (options) => {
    await configCommand(options);
  });

program
  .command('setup')
  .description('Run the interactive setup wizard')
  .action(async () => {
    await setupWizard();
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
