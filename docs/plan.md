# Commitologist - Technical Implementation Plan

## Overview
Commitologist is a dual-platform tool (VSCode extension + CLI) that generates intelligent commit messages using various AI providers. The tool analyzes git diff output and generates contextually appropriate commit messages.

## Architecture

### Core Components

#### 1. Shared Core Library (`/src/core/`)
- **Purpose**: Common business logic shared between VSCode extension and CLI
- **Components**:
  - `AIProvider` - Abstract base class for AI integrations
  - `ConfigManager` - Configuration handling and persistence
  - `GitAnalyzer` - Git diff analysis and staging area inspection
  - `MessageGenerator` - Commit message generation orchestration
  - `PromptManager` - Prompt template management and customization

#### 2. AI Provider Integrations (`/src/providers/`)
- **OpenAI Provider** (`openai.ts`)
  - **GPT-4.1 Series** (Latest - April 2025):
    - `gpt-4.1` - Standard model with 1M token context
    - `gpt-4.1-mini` - Cost-effective variant
    - `gpt-4.1-nano` - Fastest and cheapest option
  - **GPT-4o Series**:
    - `gpt-4o` - Standard model
    - `gpt-4o-mini` - Lightweight version
    - `chatgpt-4o-latest` - Latest chat-optimized variant
  - **GPT-4 Turbo Series**:
    - `gpt-4-turbo` - Latest turbo model
    - `gpt-4-turbo-2024-04-09` - Specific version
  - **GPT-3.5 Series**:
    - `gpt-3.5-turbo` - Standard model
    - `gpt-3.5-turbo-0125` - Latest version
  - API key authentication
  - Rate limiting and error handling
- **Anthropic Provider** (`anthropic.ts`)
  - **Claude 4 Series** (Latest):
    - `claude-opus-4-20250514` - Most capable model
    - `claude-sonnet-4-20250514` - Balanced performance
  - **Claude 3.7 Series**:
    - `claude-3-7-sonnet-20250219` - Hybrid reasoning model
    - `claude-3-7-sonnet-latest` - Auto-updated alias
  - **Claude 3.5 Series**:
    - `claude-3-5-sonnet-20241022` - Latest version
    - `claude-3-5-sonnet-20240620` - Previous version
    - `claude-3-5-sonnet-latest` - Auto-updated alias
  - API key authentication
- **Google Gemini Provider** (`gemini.ts`)
  - **Gemini 2.5 Series** (Latest):
    - `gemini-2.5-pro` - State-of-the-art reasoning model
    - `gemini-2.5-flash` - Best price-performance balance
    - `gemini-2.5-flash-lite` - Most cost-effective
  - **Gemini 2.0 Series**:
    - `gemini-2.0-flash` - Next-gen features, 1M token context
    - `gemini-2.0-flash-lite` - Optimized for cost efficiency
  - **Gemini 1.5 Series** (Limited availability):
    - `gemini-1.5-pro` - Professional-grade model
    - `gemini-1.5-flash` - Fast multimodal model
    - `gemini-1.5-flash-8b` - Small model for simple tasks
  - API key authentication
- **OpenRouter Provider** (`openrouter.ts`)
  - **OpenAI Models**:
    - `openai/gpt-4o-mini`
    - `openai/gpt-3.5-turbo`
  - **Anthropic Models**:
    - `anthropic/claude-3.5-sonnet`
    - `anthropic/claude-3-haiku`
    - `anthropic/claude-3-opus`
  - **Meta Models**:
    - `meta-llama/llama-3.1-8b-instruct`
  - **Google Models**:
    - `google/gemini-pro-1.5`
  - **Amazon Models**:
    - `amazon/nova-lite-v1`
    - `amazon/nova-micro-v1`
    - `amazon/nova-pro-v1`
  - **Other Models**:
    - `mistralai/mistral-7b-instruct`
  - API key authentication
  - Access to 400+ models through single API
- **Ollama Provider** (`ollama.ts`)
  - **Llama 3 Series**:
    - `llama3.3` - Latest version (70B, 8B variants)
    - `llama3.2` - Stable version
    - `llama3.1` - Previous version (8B, 70B)
  - **Code-Specialized Models**:
    - `codellama` - Base code generation model
    - `codellama:7b-code` - Code completion
    - `codellama:7b-instruct` - Instruction-tuned
    - `codellama:34b` - Larger parameter variant
    - `qwen2.5-coder` - Alibaba's coding models (1.5B, 7B, 32B)
  - **Mistral Series**:
    - `mistral:7b` - Standard 7B model
    - `mistral:7b-instruct` - Instruction-tuned
  - **Other Popular Models**:
    - `deepseek-r1` - Open reasoning model
    - `phi-4` - Microsoft's latest
    - `gemma3` - Google's updated model
    - `qwen2.5` - Alibaba's general models
  - No API key required
  - Connection to local Ollama instance

#### 3. VSCode Extension (`/src/extension/`)
- **Main Extension File** (`extension.ts`)
  - Extension activation/deactivation
  - Command registration
  - Settings integration
- **UI Components**:
  - Command palette integration
  - Source Control panel button
  - Settings page integration
  - Progress indicators
- **VSCode API Integration**:
  - Git extension API usage
  - Workspace configuration
  - Output channel for logging

#### 4. CLI Application (`/src/cli/`)
- **Main CLI File** (`index.ts`)
  - Command line argument parsing
  - Interactive prompts for first-time setup
  - Configuration command handling
- **UI Components**:
  - Interactive configuration wizard
  - Progress spinners
  - Commit approval prompt
  - Colored output formatting

## Data Flow

### VSCode Extension Flow
1. User clicks Commitologist button in Source Control panel
2. Extension reads git staging area via VSCode Git API
3. Extension checks for existing configuration
4. If first run, prompt for AI provider, API key, model, and prompt preset
5. Core library generates commit message using configured AI provider
6. Generated message is inserted into commit message field
7. User can edit and commit as usual

### CLI Flow
1. User runs `commitologist` command
2. CLI reads git staging area using git commands
3. CLI checks for existing configuration in `~/.commitologist/config.json`
4. If first run, interactive setup wizard guides user through configuration
5. Core library generates commit message using configured AI provider
6. Generated message is displayed in terminal
7. User is prompted to approve/edit/reject the commit
8. If approved, commit is executed automatically

## Configuration Management

### Configuration Schema
```typescript
interface Config {
  aiProvider: 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'ollama';
  apiKey?: string; // Not required for Ollama
  model: string; // Specific model ID from provider lists above
  promptPreset: string;
  customPrompt?: string;
  ollamaUrl?: string; // For Ollama provider (default: http://localhost:11434)
  includeUnstagedFiles: boolean; // Default: true
}
```

### Recommended Default Models by Provider
```typescript
const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini', // Best balance of cost and performance
  anthropic: 'claude-3-5-sonnet-latest', // Auto-updated latest version
  gemini: 'gemini-2.5-flash', // Best price-performance
  openrouter: 'openai/gpt-4o-mini', // Familiar OpenAI model via OpenRouter
  ollama: 'llama3.2' // Stable, well-rounded local model
};
```

### Storage Locations
- **VSCode**: VSCode workspace/user settings
- **CLI**: `~/.commitologist/config.json`

### Prompt Presets
- **Conventional**: Follows conventional commit format
- **Descriptive**: Detailed, human-readable messages
- **Concise**: Brief, to-the-point messages
- **Custom**: User-defined prompt template

## Implementation Details

### Git Analysis
- Use `git diff --staged` to analyze staged changes
- Optionally use `git diff` to analyze unstaged changes (based on `includeUnstagedFiles` setting)
- Parse diff output to extract:
  - Modified files
  - Added/removed lines
  - File types
  - Change patterns (refactor, feature, bugfix, etc.)
- Combine staged and unstaged changes when `includeUnstagedFiles` is enabled

### AI Provider Integration
- Common interface for all providers
- Standardized request/response format
- Error handling and retry logic
- Rate limiting compliance
- Timeout handling

### Error Handling
- Network connectivity issues
- API rate limiting
- Invalid API keys
- Git repository detection
- Malformed configurations

### Security Considerations
- API keys stored securely (VSCode secrets API, encrypted CLI storage)
- No sensitive data in generated commits
- Input sanitization for git diff parsing
- Safe handling of git command execution

## File Structure
```
commitologist/
├── src/
│   ├── core/
│   │   ├── AIProvider.ts
│   │   ├── ConfigManager.ts
│   │   ├── GitAnalyzer.ts
│   │   ├── MessageGenerator.ts
│   │   └── PromptManager.ts
│   ├── providers/
│   │   ├── openai.ts
│   │   ├── anthropic.ts
│   │   ├── gemini.ts
│   │   ├── openrouter.ts
│   │   └── ollama.ts
│   ├── extension/
│   │   ├── extension.ts
│   │   ├── commands.ts
│   │   └── ui/
│   └── cli/
│       ├── index.ts
│       ├── config.ts
│       └── ui/
├── package.json
├── tsconfig.json
├── webpack.config.js (for extension)
└── README.md
```

## Development Phases

### Phase 1: Core Infrastructure
- Set up TypeScript project structure
- Implement core interfaces and abstractions
- Create configuration management system
- Basic git diff analysis

### Phase 2: AI Provider Integration
- Implement OpenAI provider
- Implement Anthropic provider
- Add error handling and retry logic
- Create prompt template system

### Phase 3: CLI Implementation
- Command line interface
- Interactive configuration wizard
- Commit approval workflow
- Configuration management command
- Loading and error messages

### Phase 4: VSCode Extension
- Extension manifest and activation
- Source Control panel integration
- Settings page integration
- Command palette commands
- Loading and error notifications

### Phase 5: Additional Providers
- Google Gemini integration
- OpenRouter integration
- Ollama integration
- Provider-specific optimizations

### Phase 6: Polish and Testing
- Comprehensive error handling
- Unit and integration tests
- Performance optimization
- Documentation and examples

## Testing Strategy

### Unit Tests
- Core business logic
- AI provider integrations
- Configuration management
- Git analysis functions

### Integration Tests
- End-to-end CLI workflows
- VSCode extension integration
- AI provider API interactions
- Git repository operations

### Manual Testing
- First-time setup experience
- Different git scenarios
- Various AI provider responses
- Error condition handling

## Deployment

### VSCode Extension
- Package using `vsce`
- Publish to VSCode Marketplace
- Automated CI/CD pipeline

### CLI Tool
- Package as npm module
- Publish to npm registry
- Support for multiple platforms (Windows, macOS, Linux)

## Monitoring and Analytics
- Usage metrics (anonymized)
- Error reporting
- Performance monitoring
- User feedback collection