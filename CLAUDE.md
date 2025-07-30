# Commitologist Development Guide

## Project Overview
Commitologist is a published VSCode extension (v0.1.9) that generates intelligent commit messages using AI providers. The extension is actively maintained and available on the VSCode marketplace.

## Architecture
- **Core Library** (`src/`): Shared business logic and utilities
- **AI Providers** (`src/providers/`): AI service integrations (5 providers implemented)
- **VSCode Extension** (`src/extension.ts`): Complete VSCode integration with UI helpers
- **Distribution**: Built to `dist/` for VSCode extension packaging

## Technology Stack
- **Runtime**: Bun (package manager and runtime)
- **Language**: TypeScript with strict configuration (ES2020/Node16)
- **Linting/Formatting**: Biome 2.1.3
- **VSCode API**: v1.102.0+
- **Build Output**: CommonJS modules in `dist/`

## Development Commands
```bash
# Build the project (TypeScript compilation)
bun run build

# Development mode with watch
bun run dev
bun run watch   # Alternative watch command

# Run tests
bun test

# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Clean build artifacts
bun run clean

# VSCode extension packaging
npm run compile
npm run vscode:prepublish
```

## Project Structure
```
src/
├── AIProvider.ts            # Abstract AI provider base class
├── ConfigManager.ts         # Configuration persistence (VSCode settings)
├── GitAnalyzer.ts           # Git diff analysis & repository validation
├── MessageGenerator.ts      # Commit message orchestration
├── PromptManager.ts         # Prompt template management (4 presets)
├── ProviderUtils.ts         # Provider utility functions
├── types.ts                # Core type definitions & constants
├── extension.ts            # VSCode extension entry point with UI helpers
├── providers/              # AI provider implementations (complete)
│   ├── index.ts            # Provider factory
│   ├── openai.ts           # OpenAI provider
│   ├── anthropic.ts        # Anthropic provider
│   ├── gemini.ts           # Google Gemini provider
│   ├── openrouter.ts       # OpenRouter provider (w/ moonshotai support)
│   └── ollama.ts           # Ollama provider (local)
└── index.ts               # Main entry point
```

## VSCode Extension Features
- **Commands**: 3 registered commands (generate, configure provider, configure preset)
- **UI Integration**: Source Control panel button, command palette
- **Git Integration**: Direct insertion into commit message input
- **Configuration**: VSCode settings with 6 configurable properties
- **Error Handling**: Comprehensive error handling with progress notifications

## Configuration
- **Storage**: VSCode workspace/user settings
- **Supported Providers**: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
- **Default Models**: 
  - OpenAI: `gpt-4o-mini`
  - Anthropic: `claude-3-5-sonnet-latest`
  - Gemini: `gemini-2.5-flash`
  - OpenRouter: `openai/gpt-4o-mini` (includes moonshotai/kimi-k2)
  - Ollama: `llama3.2` (configurable server URL)
- **Prompt Presets**: conventional, descriptive, concise, custom
- **Features**: Unstaged file inclusion toggle, custom prompt support

## Current Status (v0.1.9)
**✅ COMPLETE - Production Ready**
- All core infrastructure implemented
- All 5 AI providers fully integrated
- VSCode extension complete with full UI
- Published and distributed extension
- Error handling and progress indicators
- Recent improvements: UI helpers extraction, error handling refinement

## Code Style
- **TypeScript**: Strict configuration with comprehensive compiler options
- **Module System**: Node16 with ES modules (`.js` extensions in imports)
- **Formatting**: Biome 2.1.3 with automated formatting
- **Node.js Imports**: Use `node:` protocol for Node.js modules
- **Architecture**: Composition over inheritance, single-responsibility principle
- **Dependencies**: Minimal external dependencies (vscode, @types only)

## Core Components

### GitAnalyzer (`src/GitAnalyzer.ts`)
- Staged/unstaged changes analysis (`git diff --cached`, `git diff`)
- File listing and repository validation
- Git command execution with error handling
- Branch and commit history access

### AI Provider System (`src/providers/`)
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

### Configuration System (`src/ConfigManager.ts`)
- VSCode settings integration
- Secure API key storage
- Provider-specific configuration management
- Runtime configuration validation

### Message Generation Pipeline
1. **Git Analysis**: Extract staged/unstaged diffs
2. **Prompt Construction**: Apply preset templates with context
3. **AI Processing**: Provider-specific API calls
4. **UI Integration**: Direct insertion into VSCode Source Control

## Development Workflow
```bash
# Standard development cycle
bun run lint     # Check code quality
bun run build    # Compile TypeScript
bun test         # Run test suite (when implemented)

# Extension development
bun run watch    # Watch mode for development
```

## Testing Strategy
- **Target**: Unit tests for core business logic
- **Integration**: AI provider testing with mock responses  
- **Manual**: User workflow testing in VSCode
- **Git Scenarios**: Repository state testing

## Security Considerations
- **API Keys**: Secure storage via VSCode settings
- **Input Sanitization**: Git diff parsing with validation
- **Command Execution**: Safe git command execution
- **Data Privacy**: No sensitive data in generated commits
- **Error Handling**: Secure error reporting without key exposure