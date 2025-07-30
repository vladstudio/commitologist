#!/usr/bin/env node

import process from 'node:process';
import {
  GitAnalyzer,
  MessageGenerator,
  PromptManager,
  createProvider,
  type Config,
} from '@commitologist/core';
import { ConfigAdapter } from './ConfigAdapter.js';
import { handleError, showHelp } from './utils.js';

async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    // Show help if requested
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }

    // Check if we're in a git repository
    const currentDir = process.cwd();
    const gitAnalyzer = new GitAnalyzer(currentDir);

    // Load configuration
    const configAdapter = new ConfigAdapter();
    const config = await configAdapter.loadConfig();
    
    if (!config) {
      console.error('Error: No configuration found.');
      console.error('Please create ~/.commitologist/config.json with your AI provider settings.');
      console.error('Example configuration:');
      console.error(JSON.stringify({
        aiProvider: 'openai',
        model: 'gpt-4o-mini',
        promptPreset: 'conventional',
        includeUnstagedFiles: true,
        apiKey: 'your-api-key-here'
      }, null, 2));
      process.exit(1);
    }

    // At this point, config is guaranteed to be non-null
    // TypeScript doesn't understand that process.exit(1) prevents execution from continuing
    const validConfig = config as Config;

    // Create AI provider and dependencies
    const aiProvider = createProvider(validConfig);
    const promptManager = new PromptManager();
    const messageGenerator = new MessageGenerator(
      aiProvider,
      gitAnalyzer,
      promptManager,
      validConfig
    );

    // Generate commit message
    const message = await messageGenerator.generateCommitMessage();
    
    // Output to stdout (the only output)
    console.log(message);

  } catch (error) {
    const errorMessage = handleError(error);
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});