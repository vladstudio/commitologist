# Commitologist VSCode Extension

This is the VSCode extension implementation of Commitologist, providing intelligent commit message generation using AI.

## Features

- **AI-Powered Commit Messages**: Generate contextually appropriate commit messages using various AI providers
- **Multiple AI Providers**: Support for OpenAI, Anthropic, Google Gemini, OpenRouter, and Ollama
- **Flexible Configuration**: Configure through VSCode settings or interactive setup wizard
- **Git Integration**: Seamless integration with VSCode's built-in Git functionality
- **Source Control Panel**: Generate commit messages directly from the Source Control panel

## Setup

1. **Configure AI Provider**: Run the "Configure Commitologist" command from the command palette
2. **Select Provider**: Choose from OpenAI, Anthropic, Gemini, OpenRouter, or Ollama
3. **Enter API Key**: Provide your API key (not needed for Ollama)
4. **Choose Model**: Select the AI model to use
5. **Set Prompt Preset**: Choose from conventional, descriptive, concise, or custom prompts

## Usage

### Method 1: Source Control Panel
1. Stage your changes in the Source Control panel
2. Click the "Generate Commit Message" button (📝 icon)
3. The generated message will appear in the commit message input field
4. Review and edit if needed, then commit

### Method 2: Command Palette
1. Stage your changes
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run "Commitologist: Generate Commit Message"
4. The message will be inserted into the commit input field

## Configuration

The extension can be configured through VSCode settings:

- `commitologist.aiProvider`: AI provider to use (openai, anthropic, gemini, openrouter, ollama)
- `commitologist.model`: AI model to use for generation
- `commitologist.promptPreset`: Prompt style (conventional, descriptive, concise, custom)
- `commitologist.customPrompt`: Custom prompt template (when using custom preset)
- `commitologist.includeUnstagedFiles`: Include unstaged files in analysis
- `commitologist.ollamaUrl`: Ollama server URL (for Ollama provider)

## Building

From the project root:

```bash
# Build the extension
bun run build:extension

# Watch for changes
bun run watch:extension
```

## Architecture

The extension integrates with the core Commitologist library and provides:

- **Command Registration**: Registers VSCode commands for message generation and configuration
- **Settings Integration**: Integrates with VSCode's settings system
- **Secret Storage**: Securely stores API keys using VSCode's secret storage
- **Progress Indicators**: Shows progress during message generation
- **Error Handling**: Provides user-friendly error messages

## Development

The extension is built using:

- **TypeScript**: Strongly typed JavaScript
- **VSCode API**: Integration with VSCode's extension API
- **Shared Core**: Uses the same core library as the CLI tool
- **CommonJS**: Built as CommonJS module for VSCode compatibility

## Files

- `extension.ts`: Main extension entry point
- `package.json`: VSCode extension manifest
- `tsconfig.json`: TypeScript configuration
- `README.md`: This documentation