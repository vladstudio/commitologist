# Commitologist

AI-powered commit messages for VSCode and command line.

## Features

- Generate commit messages with OpenAI, Anthropic, Gemini, OpenRouter, or Ollama
- Available as both VSCode extension and CLI tool
- Choose from preset prompts or create custom ones
- Include/exclude unstaged files, pick your model
- Built with TypeScript and Bun in a monorepo architecture

## Supported AI Providers

**OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5  
**Anthropic**: Claude 3.5 Sonnet, Claude 3 Haiku  
**Google**: Gemini 2.5/2.0/1.5 models  
**OpenRouter**: 400+ models (OpenAI, Anthropic, Meta, Amazon)  
**Ollama**: Local models (Llama 3, Codellama, Mistral, etc.)

## Installation

### VSCode Extension
Search "Commitologist" in the VSCode marketplace or install from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=vladstudio.commitologist).

### CLI Tool
```bash
npm install -g @commitologist/cli
```

## Usage

### VSCode Extension
Click the Commitologist button in the Source Control panel or use Command Palette → "Commitologist: Generate Commit Message".

### CLI Tool
```bash
# Generate commit message for staged changes
commitologist

# Use in git workflow
git add .
git commit -m "$(commitologist)"

# Show help
commitologist --help
```

## Configuration

### VSCode Extension
First run walks you through setup: provider, API key, model, prompt style. Configuration is stored in VSCode settings.

### CLI Tool
Create `~/.commitologist/config.json`:

```json
{
  "aiProvider": "openai",
  "apiKey": "your-api-key-here",
  "model": "gpt-4o-mini",
  "promptPreset": "conventional",
  "includeUnstagedFiles": true
}
```

For Ollama:
```json
{
  "aiProvider": "ollama",
  "model": "llama3.2",
  "promptPreset": "conventional",
  "ollamaUrl": "http://localhost:11434"
}
```

### Prompt Presets
- **Conventional**: `type(scope): description` format following Conventional Commits
- **Descriptive**: Detailed explanations with context
- **Concise**: Brief, single-line messages
- **Custom**: Your own template using `customPrompt` field

### Configuration Options
- `aiProvider`: "openai" | "anthropic" | "gemini" | "openrouter" | "ollama"
- `apiKey`: Your API key (required for cloud providers)
- `model`: Model name (provider-specific)
- `promptPreset`: "conventional" | "descriptive" | "concise" | "custom"
- `customPrompt`: Custom prompt template (when using "custom" preset)
- `includeUnstagedFiles`: Include unstaged changes in analysis
- `ollamaUrl`: Ollama server URL (defaults to "http://localhost:11434")

## Development

This is a monorepo containing three packages:

- `packages/core/` - Shared business logic (@commitologist/core)
- `packages/vscode/` - VSCode extension (commitologist)
- `packages/cli/` - CLI tool (@commitologist/cli)

### Prerequisites
- [Bun](https://bun.sh/) 1.0+ (package manager and runtime)
- Node.js 16+ (for VSCode extension development)

### Setup
```bash
git clone https://github.com/vladstudio/commitologist.git
cd commitologist
bun install
```

### Build Commands
```bash
# Build all packages
bun run build

# Build specific packages
bun run build:core     # Build shared core library
bun run build:vscode   # Build VSCode extension
bun run build:cli      # Build CLI tool

# Development mode with watch
bun run dev

# Clean all build artifacts
bun run clean
```

### Testing and Quality
```bash
# Run tests
bun test

# Lint all packages
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format
```

### Package Development

#### Core Package (`@commitologist/core`)
Shared library containing AI providers, git analysis, and message generation logic.

#### VSCode Extension (`commitologist`)
```bash
cd packages/vscode
bun run build        # Build extension
bun run package      # Create .vsix package
```

#### CLI Tool (`@commitologist/cli`)
```bash
cd packages/cli
bun run build        # Build CLI
npm install -g .     # Install globally for testing
```

### Local Development Installation

#### CLI Development
```bash
# Build and install CLI locally
bun run build:core && bun run build:cli
cd packages/cli && npm install -g .

# Test the CLI
commitologist --help
```

#### VSCode Extension Development
1. Build the extension: `bun run build:vscode`
2. Open VSCode and press F5 to launch Extension Development Host
3. Test the extension in the new VSCode window

### Publishing

#### Core Package
```bash
cd packages/core
npm publish
```

#### CLI Package
```bash
cd packages/cli
npm publish
```

#### VSCode Extension
```bash
cd packages/vscode
vsce package
vsce publish
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `bun run lint` and `bun run build`
6. Commit using conventional commit format
7. Push and create a Pull Request

## License

MIT

---

**Repository**: https://github.com/vladstudio/commitologist  
**VSCode Extension**: https://marketplace.visualstudio.com/items?itemName=vladstudio.commitologist  
**CLI Package**: https://www.npmjs.com/package/@commitologist/cli