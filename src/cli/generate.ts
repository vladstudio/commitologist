import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { ConfigManager } from '../core/ConfigManager.js';
import { GitAnalyzer } from '../core/GitAnalyzer.js';
import { MessageGenerator } from '../core/MessageGenerator.js';
import { PromptManager } from '../core/PromptManager.js';
import { createProvider } from '../providers/index.js';
import { setupWizard } from './setup.js';
import { prompt, spinner } from './utils.js';

const execAsync = promisify(exec);

interface GenerateOptions {
  approve?: boolean;
  dryRun?: boolean;
}

export async function generateCommitMessage(options: GenerateOptions): Promise<void> {
  const configManager = new ConfigManager();
  const gitAnalyzer = new GitAnalyzer();
  await configManager.loadConfig();

  try {
    // Check if we're in a git repository
    try {
      await gitAnalyzer.analyzeChanges(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Not in a git repository')) {
        console.error(
          '❌ Not in a git repository. Please run this command from within a git repository.'
        );
        return;
      }
      throw error;
    }

    // Check for configuration
    const config = configManager.getConfig();
    if (!config) {
      console.log('🚀 Welcome to Commitologist!');
      console.log("No configuration found. Let's set up your configuration first...\n");
      await setupWizard();
      return;
    }

    // Check for staged changes
    const hasStagedChanges = await gitAnalyzer.hasStagedChanges();
    if (!hasStagedChanges) {
      console.log('📝 No staged changes found.');
      console.log('💡 Stage some changes with `git add` and try again.');
      return;
    }

    const gitDiff = await gitAnalyzer.analyzeChanges(config.includeUnstagedFiles);
    const stagedFiles = gitDiff.stagedFiles;

    console.log(`📁 Found ${stagedFiles.length} staged file(s):`);
    stagedFiles.forEach((file) => console.log(`   • ${file}`));
    console.log();

    // Generate commit message
    const stopSpinner = spinner('🤖 Generating commit message...');

    try {
      const aiProvider = createProvider(config);
      const promptManager = new PromptManager();
      const messageGenerator = new MessageGenerator(aiProvider, gitAnalyzer, promptManager, config);

      const commitMessage = await messageGenerator.generateCommitMessage();
      stopSpinner();

      console.log('✨ Generated commit message:');
      console.log('━'.repeat(50));
      console.log(commitMessage);
      console.log('━'.repeat(50));

      if (options.dryRun) {
        console.log('🔍 Dry run mode - no commit will be made.');
        return;
      }

      // Handle approval
      if (options.approve) {
        await commitChanges(commitMessage);
      } else {
        await handleApproval(commitMessage);
      }
    } catch (error) {
      stopSpinner();
      console.error('❌ Failed to generate commit message:', error);

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          console.log('💡 Check your API key configuration with `commitologist config`');
        } else if (error.message.includes('model')) {
          console.log('💡 Check your model configuration with `commitologist config`');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function handleApproval(commitMessage: string): Promise<void> {
  console.log('\nWhat would you like to do?');
  console.log('1. Commit with this message');
  console.log('2. Edit the message');
  console.log('3. Regenerate message');
  console.log('4. Cancel');

  const choice = await prompt('\nEnter your choice (1-4): ');

  switch (choice) {
    case '1':
      await commitChanges(commitMessage);
      break;
    case '2': {
      const editedMessage = await prompt('Enter your edited message: ');
      if (editedMessage.trim()) {
        await commitChanges(editedMessage);
      } else {
        console.log('❌ Empty message. Commit cancelled.');
      }
      break;
    }
    case '3':
      await generateCommitMessage({ approve: false, dryRun: false });
      break;
    case '4':
      console.log('❌ Commit cancelled.');
      break;
    default:
      console.log('❌ Invalid choice. Commit cancelled.');
  }
}

async function commitChanges(message: string): Promise<void> {
  const stopSpinner = spinner('📝 Committing changes...');

  try {
    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`);
    stopSpinner();
    console.log('✅ Changes committed successfully!');

    // Show commit info
    const { stdout: commitInfo } = await execAsync('git log -1 --oneline');
    console.log(`📋 Commit: ${commitInfo.trim()}`);
  } catch (error) {
    stopSpinner();
    console.error('❌ Failed to commit:', error);
  }
}
