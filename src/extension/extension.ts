import * as vscode from 'vscode';
import { GitAnalyzer } from '../core/GitAnalyzer.js';
import { MessageGenerator } from '../core/MessageGenerator.js';
import { PromptManager } from '../core/PromptManager.js';
import { type AIProviderType, type Config, DEFAULT_MODELS } from '../core/types.js';
import { createProvider } from '../providers/index.js';

export function activate(context: vscode.ExtensionContext) {
  console.log('Commitologist extension is activating...');

  // Register commands
  const generateCommand = vscode.commands.registerCommand(
    'commitologist.generateMessage',
    async () => {
      await generateCommitMessage();
    }
  );

  const configureCommand = vscode.commands.registerCommand('commitologist.configure', async () => {
    await configureCommitologist();
  });

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
    configureCommand,
    configureProviderCommand,
    configurePresetCommand
  );

  console.log('Commitologist extension activated successfully!');

  async function generateCommitMessage() {
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
          const config = await getVSCodeConfig();
          if (!config) {
            // If not configured, show config wizard
            await configureCommitologist();
            return;
          }

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
          const message = await messageGenerator.generateCommitMessage();

          progress.report({ increment: 80 });

          // Insert message into Source Control input
          const gitExtension = vscode.extensions.getExtension('vscode.git');
          if (gitExtension?.isActive) {
            const git = gitExtension.exports.getAPI(1);
            const repository = git.repositories[0];
            if (repository) {
              repository.inputBox.value = message;
            }
          }

          progress.report({ increment: 100 });
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      vscode.window.showErrorMessage(`Failed to generate commit message: ${errorMessage}`);
    }
  }

  async function configureCommitologist() {
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

      // Model selection
      const defaultModel = DEFAULT_MODELS[aiProvider.value as AIProviderType];
      const model = await vscode.window.showInputBox({
        prompt: `Enter model name (default: ${defaultModel})`,
        value: defaultModel,
      });

      if (!model) return;

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
      await config.update('promptPreset', promptPreset.value, vscode.ConfigurationTarget.Global);

      if (customPrompt) {
        await config.update('customPrompt', customPrompt, vscode.ConfigurationTarget.Global);
      }

      if (apiKey) {
        await context.secrets.store(`commitologist.${aiProvider.value}.apiKey`, apiKey);
      }

      if (ollamaUrl) {
        await config.update('ollamaUrl', ollamaUrl, vscode.ConfigurationTarget.Global);
      }

      // Configuration success notification will auto-dismiss
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      vscode.window.showErrorMessage(`Failed to configure Commitologist: ${errorMessage}`);
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

      // Model selection
      const defaultModel = DEFAULT_MODELS[aiProvider.value as AIProviderType];
      const model = await vscode.window.showInputBox({
        prompt: `Enter model name (default: ${defaultModel})`,
        value: defaultModel,
      });

      if (!model) return;

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

      vscode.window.showInformationMessage('✅ Provider configuration saved successfully!');
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

      vscode.window.showInformationMessage('✅ Preset configuration saved successfully!');
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
