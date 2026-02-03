# Commitologist VSCode Extension

Intelligent commit message generation directly in VSCode using AI providers.

## Overview

Commitologist is a VSCode extension that analyzes your staged git changes and generates meaningful commit messages using various AI providers. It integrates seamlessly with VSCode's Source Control panel and provides an intuitive interface for configuration and usage.

## Features

- **5 AI Providers**: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
- **Source Control Integration**: Generate messages directly in the commit input
- **4 Prompt Presets**: Conventional, descriptive, concise, and custom templates
- **Flexible Configuration**: Configure providers and settings through VSCode
- **Unstaged Changes**: Option to include unstaged changes in analysis
- **Progress Indicators**: Visual feedback during message generation

## Installation

Install from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=vladstudio.commitologist):

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Commitologist"
4. Click Install

## Quick Start

1. **Configure AI Provider**: 
   - Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)  
   - Run `Commitologist: Configure Provider`
   - Select your preferred AI provider and enter API key

2. **Generate Commit Message**:
   - Stage your changes in Source Control panel
   - Click the ✨ button next to the commit message input
   - Or use Command Palette: `Commitologist: Generate Commit Message`

3. **Review and Commit**:
   - Review the generated message
   - Edit if needed
   - Commit your changes

## Configuration

### AI Providers

**OpenAI**
- Requires API key from [OpenAI Platform](https://platform.openai.com/)
- Default model: `gpt-5-mini`
- Supports all GPT models

**Anthropic**  
- Requires API key from [Anthropic Console](https://console.anthropic.com/)
- Default model: `claude-haiku-4-5`
- Supports Claude 4 family models

**Google Gemini**
- Requires API key from [Google AI Studio](https://aistudio.google.com/)
- Default model: `gemini-3-flash`
- Supports Gemini Flash models

**OpenRouter**
- Requires API key from [OpenRouter](https://openrouter.ai/)
- Default model: `openai/gpt-5-mini`
- Access to 200+ models including Claude, GPT, and others

**Ollama**
- Requires local Ollama installation
- Default model: `llama3.3`
- Default server: `http://localhost:11434`
- Supports all locally installed models

### Settings

Configure through VSCode settings (File → Preferences → Settings → Extensions → Commitologist):

- **commitologist.provider**: Active AI provider
- **commitologist.promptPreset**: Message style (conventional/descriptive/concise/custom)
- **commitologist.includeUnstagedChanges**: Include unstaged files in analysis
- **commitologist.customPrompt**: Custom prompt template
- **commitologist.maxChanges**: Maximum files to analyze (default: 50)
- **commitologist.timeout**: Request timeout in seconds (default: 30)

## Commands

- **Commitologist: Generate Commit Message** - Generate message for staged changes
- **Commitologist: Configure Provider** - Set up AI provider and API key
- **Commitologist: Configure Preset** - Choose message style template

## Prompt Presets

**Conventional**: Follows [Conventional Commits](https://conventionalcommits.org/) specification
```
feat: add user authentication system
fix: resolve memory leak in data processor
docs: update API documentation
```

**Descriptive**: Detailed explanations of changes
```
Add comprehensive user authentication system with JWT tokens
Fix memory leak in data processor by implementing proper cleanup
Update API documentation to reflect new endpoint changes
```

**Concise**: Short, direct messages
```
Add auth system
Fix memory leak  
Update docs
```

**Custom**: Use your own template with placeholders:
- `{changes}` - List of changed files
- `{diff}` - Actual git diff content

## Keyboard Shortcuts

Default shortcuts (can be customized in Keyboard Shortcuts settings):

- **Ctrl+Shift+G** (Cmd+Shift+G): Generate commit message
- **Ctrl+Shift+P** → "Commitologist": Access all commands

## Usage Tips

1. **Stage Relevant Changes**: Only staged changes are analyzed by default
2. **Review Generated Messages**: Always review and edit messages as needed
3. **Use Appropriate Presets**: Choose preset based on your project's conventions
4. **Include Context**: For better results, stage related changes together
5. **Custom Templates**: Create templates specific to your workflow

## Troubleshooting

**"No staged changes found"**
- Ensure you have staged files in the Source Control panel
- Check if you're in a git repository

**"API key not configured"**
- Run `Commitologist: Configure Provider` command
- Ensure API key is valid and has sufficient credits/quota

**"Request timeout"**
- Check your internet connection
- Increase timeout in settings for large changesets
- Consider reducing number of files being analyzed

**"Provider error"**
- Verify API key is correct and active
- Check provider service status
- Try switching to a different model

## Privacy & Security

- API keys are securely stored in VSCode settings
- Git diffs are sent to AI providers for analysis
- No code or data is stored by the extension
- Consider data policies of your chosen AI provider

## Development

This extension is built using the [@commitologist/core](https://www.npmjs.com/package/@commitologist/core) library.

## Support

- [GitHub Issues](https://github.com/vladstudio/commitologist/issues)
- [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=vladstudio.commitologist)

## License

MIT
