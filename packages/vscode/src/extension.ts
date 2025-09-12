import {
  type AIProviderType,
  createProvider,
  GitAnalyzer,
  MessageGenerator,
  PromptManager,
} from '@commitologist/core';
import * as vscode from 'vscode';
import { ConfigAdapter } from './ConfigAdapter.js';
import {
  handleError,
  handleProviderSpecificConfig,
  insertMessageIntoGit,
  selectAIProvider,
  selectModel,
  showSuccessNotification,
} from './UIHelpers.js';

export function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  const outputChannel = vscode.window.createOutputChannel('Commitologist');
  outputChannel.appendLine('Commitologist extension is activating...');

  // Create configuration adapter
  const configAdapter = new ConfigAdapter(context);

  // Register commands
  const generateCommand = vscode.commands.registerCommand(
    'commitologist.generateMessage',
    async () => {
      await generateCommitMessage();
    }
  );

  const configureProviderCommand = vscode.commands.registerCommand(
    'commitologist.configureProvider',
    async () => {
      await configureProvider();
    }
  );

  const configurePresetCommand = vscode.commands.registerCommand(
    'commitologist.configurePreset',
    async () => {
      await configurePreset();
    }
  );

  context.subscriptions.push(
    generateCommand,
    configureProviderCommand,
    configurePresetCommand,
    outputChannel
  );

  outputChannel.appendLine('Commitologist extension activated successfully!');

  async function generateCommitMessage() {
    outputChannel.appendLine('Starting commit message generation...');
    try {
      // Show progress indicator
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating commit message...',
          cancellable: false,
        },
        async () => {
          // Get workspace folder
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            throw new Error('No workspace folder found');
          }

          // Get configuration
          outputChannel.appendLine('Loading configuration...');
          const config = await configAdapter.loadConfig();
          if (!config) {
            // If not configured, show provider config first
            outputChannel.appendLine('Configuration not found, prompting user to configure');
            vscode.window.showErrorMessage(
              'Please configure Commitologist first using "Commitologist: Configure Provider Settings"'
            );
            return;
          }
          outputChannel.appendLine(
            `Configuration loaded: provider=${config.aiProvider}, model=${config.model}`
          );

          // Create AI provider and dependencies
          const aiProvider = createProvider(config);
          const gitAnalyzer = new GitAnalyzer(workspaceFolder.uri.fsPath);
          const promptManager = new PromptManager();
          const messageGenerator = new MessageGenerator(
            aiProvider,
            gitAnalyzer,
            promptManager,
            config
          );

          // Generate commit message
          outputChannel.appendLine('Generating commit message...');
          const message = await messageGenerator.generateCommitMessage();
          outputChannel.appendLine(`Generated message: ${message}`);

          // Insert message into Source Control input
          insertMessageIntoGit(message, outputChannel);
        }
      );
    } catch (error) {
      const errorMessage = handleError(error, 'Error generating commit message');
      outputChannel.appendLine(`Error generating commit message: ${errorMessage}`);
      vscode.window.showErrorMessage(`Failed to generate commit message: ${errorMessage}`);
    }
  }

  async function configureProvider() {
    try {
      // AI Provider selection
      const aiProvider = await selectAIProvider();

      if (!aiProvider?.value) return;

      // Model selection - skip for CLI providers
      let model = '';
      if (aiProvider.value !== 'claude-cli' && aiProvider.value !== 'codex-cli') {
        const selectedModel = await selectModel(aiProvider.value as AIProviderType);
        if (!selectedModel) return;
        model = selectedModel;
      }

      // Handle provider-specific configuration
      const { apiKey, ollamaUrl } = await handleProviderSpecificConfig(aiProvider);

      // Save configuration
      await configAdapter.saveProviderConfig(aiProvider.value, model, apiKey, ollamaUrl);

      // Show success notification that auto-dismisses after 3 seconds
      showSuccessNotification('✅ Provider configuration saved successfully!');
    } catch (error) {
      const errorMessage = handleError(error, 'Error configuring provider');
      vscode.window.showErrorMessage(`Failed to configure provider: ${errorMessage}`);
    }
  }

  async function configurePreset() {
    try {
      // Prompt preset selection
      const promptPreset = await vscode.window.showQuickPick(
        [
          { label: 'Conventional Commits', value: 'conventional' },
          { label: 'Descriptive', value: 'descriptive' },
          { label: 'Concise', value: 'concise' },
          { label: 'Custom', value: 'custom' },
        ],
        {
          placeHolder: 'Select prompt preset',
        }
      );

      if (!promptPreset) return;

      let customPrompt: string | undefined;
      if (promptPreset.value === 'custom') {
        customPrompt = await vscode.window.showInputBox({
          prompt: 'Enter custom prompt template',
          placeHolder: 'Write a commit message for the following changes...',
        });
        if (!customPrompt) return;
      }

      // Include unstaged files option
      const includeUnstaged = await vscode.window.showQuickPick(
        [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        {
          placeHolder: 'Include unstaged files in analysis?',
        }
      );

      if (includeUnstaged === undefined) return;

      // Save configuration
      await configAdapter.savePresetConfig(promptPreset.value, includeUnstaged.value, customPrompt);

      // Show success notification that auto-dismisses after 3 seconds
      showSuccessNotification('✅ Preset configuration saved successfully!');
    } catch (error) {
      const errorMessage = handleError(error, 'Error configuring preset');
      vscode.window.showErrorMessage(`Failed to configure preset: ${errorMessage}`);
    }
  }
}

export function deactivate() {}
