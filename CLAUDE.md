# Commitologist Development Guide

## Project Overview
Commitologist is a monorepo containing a published VSCode extension (v0.1.9) and CLI utility that generate intelligent commit messages using AI providers. Both tools share a common core library and are actively maintained.

## Monorepo Architecture
- **Core Package** (`packages/core/`): Shared business logic and AI provider integrations
- **VSCode Extension** (`packages/vscode/`): Complete VSCode integration with UI helpers
- **CLI Utility** (`packages/cli/`): Command-line tool for commit message generation
- **Workspace Root**: Shared tooling, configuration, and documentation

## Technology Stack
- **Runtime**: Bun (package manager and runtime)
- **Language**: TypeScript with strict configuration (ES2020/Node16)
- **Linting/Formatting**: Biome 2.1.3
- **VSCode API**: v1.102.0+
- **Build Output**: CommonJS modules in `dist/`

## Development Commands
```bash
# Build all packages
bun run build

# Build specific package
bun run build:core
bun run build:vscode
bun run build:cli

# Development mode with watch
bun run dev

# Run tests
bun test

# Lint all packages
bun run lint

# Fix linting issues
bun run lint:fix

# Format all packages
bun run format

# Clean build artifacts
bun run clean

# VSCode extension packaging
bun run package:vscode

# CLI packaging
bun run package:cli
```

## Monorepo Structure
```
packages/
├── core/                   # @commitologist/core
│   ├── src/
│   │   ├── AIProvider.ts         # Abstract AI provider base class
│   │   ├── ConfigManager.ts      # Configuration management abstraction
│   │   ├── GitAnalyzer.ts        # Git diff analysis & repository validation
│   │   ├── MessageGenerator.ts   # Commit message orchestration
│   │   ├── PromptManager.ts      # Prompt template management (4 presets)
│   │   ├── ProviderUtils.ts      # Provider utility functions
│   │   ├── types.ts             # Core type definitions & constants
│   │   ├── providers/           # AI provider implementations
│   │   │   ├── index.ts         # Provider factory
│   │   │   ├── openai.ts        # OpenAI provider
│   │   │   ├── anthropic.ts     # Anthropic provider
│   │   │   ├── gemini.ts        # Google Gemini provider
│   │   │   ├── openrouter.ts    # OpenRouter provider
│   │   │   └── ollama.ts        # Ollama provider (local)
│   │   └── index.ts            # Core package exports
│   ├── package.json            # Core package configuration
│   └── tsconfig.json          # Core TypeScript config
├── vscode/                 # commitologist (VSCode extension)
│   ├── src/
│   │   ├── extension.ts        # VSCode extension entry point
│   │   ├── ConfigAdapter.ts    # VSCode settings adapter
│   │   └── UIHelpers.ts       # VSCode UI utilities
│   ├── package.json           # VSCode extension manifest
│   ├── tsconfig.json         # VSCode TypeScript config
│   ├── icon.svg              # Extension icons
│   ├── icon-dark.svg
│   └── logo.png
└── cli/                    # @commitologist/cli
    ├── src/
    │   ├── cli.ts             # CLI entry point
    │   ├── ConfigAdapter.ts   # Filesystem config adapter
    │   └── utils.ts           # CLI utility functions
    ├── package.json          # CLI package configuration
    └── tsconfig.json        # CLI TypeScript config
```

## Package Features

### VSCode Extension (`packages/vscode/`)
- **Commands**: 3 registered commands (generate, configure provider, configure preset)
- **UI Integration**: Source Control panel button, command palette
- **Git Integration**: Direct insertion into commit message input
- **Configuration**: VSCode settings with 6 configurable properties
- **Error Handling**: Comprehensive error handling with progress notifications

### CLI Utility (`packages/cli/`)
- **Simple Usage**: `commitologist` command generates commit message to stdout
- **Configuration**: Reads from `~/.commitologist/config.json`
- **Non-Interactive**: Designed for scripting and automation
- **Git Integration**: Works with any git repository
- **Error Handling**: Proper exit codes and stderr output

### Core Library (`packages/core/`)
- **AI Providers**: 5 providers (OpenAI, Anthropic, Gemini, OpenRouter, Ollama)
- **Platform Agnostic**: Works with both VSCode and CLI
- **Configuration Management**: Abstract configuration interface
- **Git Analysis**: Comprehensive diff analysis and repository operations
- **Message Generation**: Template-based prompt system with 4 presets

## Configuration

### VSCode Extension Configuration
- **Storage**: VSCode workspace/user settings
- **UI**: Built-in configuration commands
- **Migration**: Automatic migration from legacy settings

### CLI Configuration
- **Storage**: `~/.commitologist/config.json`
- **Format**: JSON configuration file
- **Creation**: Manual file creation or future config utility

### Shared Configuration Options
- **Supported Providers**: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
- **Default Models**: 
  - OpenAI: `gpt-5-mini`
  - Anthropic: `claude-haiku-4-5`
  - Gemini: `gemini-3-flash`
  - OpenRouter: `openai/gpt-5-mini`
  - Ollama: `llama3.3` (configurable server URL)
- **Prompt Presets**: conventional, descriptive, concise, custom
- **Features**: Unstaged file inclusion toggle, custom prompt support

## Current Status
**✅ MONOREPO MIGRATION COMPLETE**
- **Core Package** (`@commitologist/core`): Shared business logic extracted and published
- **VSCode Extension** (`commitologist`): Maintains v0.1.9 functionality, now uses core library
- **CLI Utility** (`@commitologist/cli`): New command-line tool with full feature parity
- **Infrastructure**: Bun workspaces, shared tooling, coordinated builds
- **Distribution**: Core and CLI published to npm, VSCode extension on marketplace

## Code Style
- **TypeScript**: Strict configuration with comprehensive compiler options
- **Module System**: Node16 with ES modules (`.js` extensions in imports)
- **Formatting**: Biome 2.1.3 with automated formatting
- **Node.js Imports**: Use `node:` protocol for Node.js modules
- **Architecture**: Composition over inheritance, single-responsibility principle
- **Dependencies**: Minimal external dependencies (vscode, @types only)

## Core Components

### GitAnalyzer (`packages/core/src/GitAnalyzer.ts`)
- Staged/unstaged changes analysis (`git diff --cached`, `git diff`)
- File listing and repository validation
- Git command execution with error handling
- Branch and commit history access

### AI Provider System (`packages/core/src/providers/`)
**Base Interface** (`AIProvider.ts`):
- `validateConfig()`: API key and configuration validation
- `generateCommitMessage(prompt)`: Core message generation
- `getSupportedModels()`: Available model listing
- Standardized error handling with `AIProviderError`

**Implemented Providers**:
- **OpenAI**: GPT models with token usage tracking
- **Anthropic**: Claude models with message API
- **Gemini**: Google AI with generation config
- **OpenRouter**: Multi-provider proxy with extended model support
- **Ollama**: Local inference server with configurable endpoint

### Configuration System (`packages/core/src/ConfigManager.ts`)
- Abstract configuration interface for platform independence
- Provider-specific configuration management
- Runtime configuration validation
- Platform adapters in VSCode and CLI packages

### Message Generation Pipeline
1. **Git Analysis**: Extract staged/unstaged diffs
2. **Prompt Construction**: Apply preset templates with context
3. **AI Processing**: Provider-specific API calls
4. **UI Integration**: Direct insertion into VSCode Source Control

## Development Workflow
```bash
# Standard development cycle (all packages)
bun run lint     # Check code quality across all packages
bun run build    # Compile all packages
bun test         # Run test suites

# Package-specific development
cd packages/core && bun run build    # Build core package
cd packages/vscode && bun run dev    # VSCode extension development
cd packages/cli && bun run build     # Build CLI utility

# Workspace operations
bun run dev      # Watch mode for all packages
bun install      # Install dependencies for all packages
```

## Testing Strategy
- **Core Package**: Unit tests for business logic, AI provider mocking
- **VSCode Extension**: Extension testing with VSCode test runner
- **CLI Package**: Integration tests for stdin/stdout, exit codes, config reading
- **Cross-Package**: End-to-end workflow testing
- **Git Scenarios**: Repository state testing across all environments

## Security Considerations
- **API Keys**: Secure storage via VSCode settings
- **Input Sanitization**: Git diff parsing with validation
- **Command Execution**: Safe git command execution
- **Data Privacy**: No sensitive data in generated commits
- **Error Handling**: Secure error reporting without key exposure
