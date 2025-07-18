import * as vscode from 'vscode';
import { GitAnalyzer } from './GitAnalyzer.js';
import { MessageGenerator } from './MessageGenerator.js';
import { PromptManager } from './PromptManager.js';
import { createProvider } from './providers/index.js';
import { type AIProviderType, type Config } from './types.js';

export function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  const outputChannel = vscode.window.createOutputChannel('Commitologist');
  outputChannel.appendLine('Commitologist extension is activating...');

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
        async (progress) => {
          progress.report({ increment: 0 });

          // Get workspace folder
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) {
            throw new Error('No workspace folder found');
          }

          progress.report({ increment: 20 });

          // Get configuration
          outputChannel.appendLine('Loading configuration...');
          const config = await getVSCodeConfig();
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

          progress.report({ increment: 40 });

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

          progress.report({ increment: 60 });

          // Generate commit message
          outputChannel.appendLine('Generating commit message...');
          const message = await messageGenerator.generateCommitMessage();
          outputChannel.appendLine(`Generated message: ${message}`);

          progress.report({ increment: 80 });

          // Insert message into Source Control input
          const gitExtension = vscode.extensions.getExtension('vscode.git');
          if (gitExtension?.isActive) {
            const git = gitExtension.exports.getAPI(1);
            const repository = git.repositories[0];
            if (repository) {
              repository.inputBox.value = message;
              outputChannel.appendLine('Commit message inserted into Source Control input');
            } else {
              outputChannel.appendLine('No Git repository found');
            }
          } else {
            outputChannel.appendLine('Git extension not active');
          }

          progress.report({ increment: 100 });
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      outputChannel.appendLine(`Error generating commit message: ${errorMessage}`);
      if (error instanceof Error && error.stack) {
        outputChannel.appendLine(`Stack trace: ${error.stack}`);
      }
      vscode.window.showErrorMessage(`Failed to generate commit message: ${errorMessage}`);
    }
  }

  async function configureProvider() {
    try {
      // AI Provider selection
      const aiProvider = await vscode.window.showQuickPick(
        [
          { label: 'OpenAI', value: 'openai' },
          { label: 'Anthropic', value: 'anthropic' },
          { label: 'Google Gemini', value: 'gemini' },
          { label: 'OpenRouter', value: 'openrouter' },
          { label: 'Ollama (Local)', value: 'ollama' },
        ],
        {
          placeHolder: 'Select AI provider',
        }
      );

      if (!aiProvider) return;

      // Model selection - show recommended models + Other option
      const tempProvider = createProvider({
        aiProvider: aiProvider.value as AIProviderType,
        model: 'temp', // Temporary, just to get the provider instance
        promptPreset: 'conventional',
        includeUnstagedFiles: true,
      });

      const recommendedModels = tempProvider.getRecommendedModels();
      const modelOptions = [
        ...recommendedModels.map((model) => ({ label: model, value: model })),
        { label: 'Other (Custom)', value: 'OTHER' },
      ];

      const selectedModelOption = await vscode.window.showQuickPick(modelOptions, {
        placeHolder: 'Select a model or choose "Other" for custom',
      });

      if (!selectedModelOption) return;

      let model: string;
      if (selectedModelOption.value === 'OTHER') {
        const customModel = await vscode.window.showInputBox({
          prompt: 'Enter custom model ID',
          placeHolder: 'e.g., custom-model-name',
        });
        if (!customModel) return;
        model = customModel;
      } else {
        model = selectedModelOption.value;
      }

      // API Key (if needed)
      let apiKey: string | undefined;
      if (aiProvider.value !== 'ollama') {
        apiKey = await vscode.window.showInputBox({
          prompt: `Enter ${aiProvider.label} API key`,
          password: true,
        });
        if (!apiKey) return;
      }

      // Ollama URL (if needed)
      let ollamaUrl: string | undefined;
      if (aiProvider.value === 'ollama') {
        ollamaUrl = await vscode.window.showInputBox({
          prompt: 'Enter Ollama server URL',
          value: 'http://localhost:11434',
        });
        if (!ollamaUrl) return;
      }

      // Save configuration
      const config = vscode.workspace.getConfiguration('commitologist');
      await config.update('aiProvider', aiProvider.value, vscode.ConfigurationTarget.Global);
      await config.update('model', model, vscode.ConfigurationTarget.Global);

      if (apiKey) {
        await context.secrets.store(`commitologist.${aiProvider.value}.apiKey`, apiKey);
      }

      if (ollamaUrl) {
        await config.update('ollamaUrl', ollamaUrl, vscode.ConfigurationTarget.Global);
      }

      // Show success notification that auto-dismisses after 3 seconds
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '✅ Provider configuration saved successfully!',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 100 });
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
      const config = vscode.workspace.getConfiguration('commitologist');
      await config.update('promptPreset', promptPreset.value, vscode.ConfigurationTarget.Global);
      await config.update(
        'includeUnstagedFiles',
        includeUnstaged.value,
        vscode.ConfigurationTarget.Global
      );

      if (customPrompt) {
        await config.update('customPrompt', customPrompt, vscode.ConfigurationTarget.Global);
      }

      // Show success notification that auto-dismisses after 3 seconds
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: '✅ Preset configuration saved successfully!',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 100 });
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      vscode.window.showErrorMessage(`Failed to configure preset: ${errorMessage}`);
    }
  }

  async function getVSCodeConfig(): Promise<Config | null> {
    const config = vscode.workspace.getConfiguration('commitologist');

    const aiProvider = config.get<AIProviderType>('aiProvider');
    const model = config.get<string>('model');
    const promptPreset = config.get<string>('promptPreset');
    const customPrompt = config.get<string>('customPrompt');
    const includeUnstagedFiles = config.get<boolean>('includeUnstagedFiles');
    const ollamaUrl = config.get<string>('ollamaUrl');

    if (!aiProvider || !model || !promptPreset) {
      return null;
    }

    let apiKey: string | undefined;
    if (aiProvider !== 'ollama') {
      apiKey = await context.secrets.get(`commitologist.${aiProvider}.apiKey`);
      if (!apiKey) {
        return null;
      }
    }

    return {
      aiProvider,
      model,
      promptPreset,
      customPrompt,
      includeUnstagedFiles: includeUnstagedFiles ?? true,
      ollamaUrl,
      apiKey,
    } as Config;
  }
}

export function deactivate() {}
