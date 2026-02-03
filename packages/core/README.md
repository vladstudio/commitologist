# @commitologist/core

Core library for intelligent commit message generation using AI providers.

## Overview

`@commitologist/core` provides platform-agnostic functionality for analyzing git repositories and generating commit messages using various AI providers. This package is designed to be used by both VSCode extensions and CLI tools.

## Features

- **5 AI Providers**: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
- **Git Analysis**: Comprehensive diff analysis and repository operations
- **Template System**: 4 built-in prompt presets (conventional, descriptive, concise, custom)
- **Configuration**: Abstract configuration interface for platform independence
- **Type Safety**: Full TypeScript support with strict typing

## Installation

```bash
npm install @commitologist/core
# or
bun add @commitologist/core
```

## Quick Start

```typescript
import { 
  MessageGenerator, 
  GitAnalyzer, 
  PromptManager, 
  createProvider 
} from '@commitologist/core';

// Initialize components
const gitAnalyzer = new GitAnalyzer();
const promptManager = new PromptManager();
const messageGenerator = new MessageGenerator();

// Create AI provider
const config = {
  aiProvider: 'openai',
  apiKey: 'your-api-key',
  model: 'gpt-5-mini',
  promptPreset: 'conventional'
};
const provider = createProvider(config);

// Generate commit message
const changes = await gitAnalyzer.getStagedChanges();
const prompt = promptManager.generatePrompt(changes, 'conventional');
const message = await provider.generateCommitMessage(prompt);

console.log(message);
```

## AI Providers

### OpenAI
```typescript
import { OpenAIProvider } from '@commitologist/core';

const provider = new OpenAIProvider();
await provider.validateConfig({ apiKey: 'sk-...', model: 'gpt-5-mini' });
const message = await provider.generateCommitMessage(prompt);
```

### Anthropic
```typescript
import { AnthropicProvider } from '@commitologist/core';

const provider = new AnthropicProvider();
await provider.validateConfig({ apiKey: 'sk-ant-...', model: 'claude-haiku-4-5' });
```

### Gemini
```typescript
import { GeminiProvider } from '@commitologist/core';

const provider = new GeminiProvider();
await provider.validateConfig({ apiKey: 'AI...', model: 'gemini-3-flash' });
```

### OpenRouter
```typescript
import { OpenRouterProvider } from '@commitologist/core';

const provider = new OpenRouterProvider();
await provider.validateConfig({ 
  apiKey: 'sk-or-...', 
  model: 'openai/gpt-5-mini' 
});
```

### Ollama
```typescript
import { OllamaProvider } from '@commitologist/core';

const provider = new OllamaProvider();
await provider.validateConfig({ 
  serverUrl: 'http://localhost:11434',
  model: 'llama3.3'
});
```

## Configuration

The core library uses an abstract configuration system that can be implemented for different platforms:

```typescript
import { ConfigManager, type CommitologistConfig } from '@commitologist/core';

class MyConfigAdapter extends ConfigManager {
  async getProviderConfig(provider: string) {
    // Implement platform-specific config reading
  }
  
  async setProviderConfig(provider: string, config: any) {
    // Implement platform-specific config writing
  }
}
```

## Git Analysis

```typescript
import { GitAnalyzer } from '@commitologist/core';

const git = new GitAnalyzer();

// Check if in git repository
const isRepo = await git.isGitRepository();

// Get staged changes
const staged = await git.getStagedChanges();

// Get unstaged changes
const unstaged = await git.getUnstagedChanges();

// Get file list
const files = await git.getChangedFiles();
```

## Prompt Templates

```typescript
import { PromptManager } from '@commitologist/core';

const promptManager = new PromptManager();

// Available presets: 'conventional', 'descriptive', 'concise', 'custom'
const prompt = promptManager.generatePrompt(changes, 'conventional');

// Custom template
promptManager.setCustomTemplate('My custom template: {changes}');
const customPrompt = promptManager.generatePrompt(changes, 'custom');
```

## Error Handling

All providers use standardized error handling:

```typescript
import { AIProviderError } from '@commitologist/core';

try {
  const message = await provider.generateCommitMessage(prompt);
} catch (error) {
  if (error instanceof AIProviderError) {
    console.error(`Provider error: ${error.message}`);
    console.error(`Error code: ${error.code}`);
  }
}
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```typescript
import type { 
  CommitologistConfig,
  AIProvider,
  GitChanges,
  PromptPreset 
} from '@commitologist/core';
```

## Development

```bash
# Install dependencies
bun install

# Build the package
bun run build

# Run tests
bun test

# Lint code
bun run lint
```

## License

MIT
