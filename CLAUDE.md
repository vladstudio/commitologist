# Commitologist Development Guide

## Project Overview
Commitologist is a TypeScript tool that generates intelligent commit messages using AI providers. It's designed to work as both a VSCode extension and CLI tool.

## Architecture
- **Core Library** (`src/core/`): Shared business logic
- **AI Providers** (`src/providers/`): AI service integrations
- **VSCode Extension** (`src/extension/`): VSCode integration
- **CLI Tool** (`src/cli/`): Command line interface

## Technology Stack
- **Runtime**: Bun (package manager and runtime)
- **Language**: TypeScript with strict configuration
- **Linting/Formatting**: Biome 2.1.1
- **Dependencies**: Commander.js for CLI argument parsing

## Development Commands
```bash
# Build the project
bun run build

# Development mode with watch
bun run dev

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
```

## Project Structure
```
src/
├── core/                    # Shared business logic
│   ├── AIProvider.ts        # Abstract AI provider base class
│   ├── ConfigManager.ts     # Configuration persistence
│   ├── GitAnalyzer.ts       # Git diff analysis
│   ├── MessageGenerator.ts  # Commit message orchestration
│   ├── PromptManager.ts     # Prompt template management
│   ├── types.ts            # Type definitions
│   └── index.ts            # Core exports
├── providers/              # AI provider implementations
├── extension/              # VSCode extension
├── cli/                    # CLI application
└── index.ts               # Main entry point
```

## Configuration
- **Storage**: `~/.commitologist/config.json` (CLI) or VSCode settings
- **Supported Providers**: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
- **Default Models**: 
  - OpenAI: `gpt-4o-mini`
  - Anthropic: `claude-3-5-sonnet-latest`
  - Gemini: `gemini-2.5-flash`
  - OpenRouter: `openai/gpt-4o-mini`
  - Ollama: `llama3.2`

## Development Status
**Phase 1: Core Infrastructure** ✅ Complete
- TypeScript project setup with Bun + Biome
- Core interfaces and type definitions
- Configuration management system
- Git analysis functionality
- Prompt template system
- Message generation orchestration

**Next Phases**:
- Phase 2: AI Provider Integration
- Phase 3: CLI Implementation
- Phase 4: VSCode Extension
- Phase 5: Additional Providers
- Phase 6: Polish and Testing

## Code Style
- Use strict TypeScript configuration
- Follow Biome formatting rules
- Import Node.js modules with `node:` protocol
- Use ES modules with `.js` extensions in imports
- Prefer composition over inheritance
- Keep components focused and single-responsibility

## Git Analysis
The `GitAnalyzer` class provides:
- Staged changes analysis (`git diff --cached`)
- Unstaged changes analysis (`git diff`)
- File listing for both staged and unstaged
- Git repository validation
- Branch and commit history access

## AI Provider Interface
All providers must implement:
- `validateConfig()`: Validate API keys and settings
- `generateCommitMessage(prompt)`: Generate commit message
- `getSupportedModels()`: List available models
- Error handling with standardized format

## Testing Strategy
- Unit tests for core business logic
- Integration tests for AI providers
- Manual testing for user workflows
- Git repository scenario testing

## Security Considerations
- API keys stored securely
- Input sanitization for git diff parsing
- Safe git command execution
- No sensitive data in generated commits