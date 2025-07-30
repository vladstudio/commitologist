# @commitologist/cli

Command-line utility for intelligent commit message generation using AI providers.

## Overview

`@commitologist/cli` is a simple, non-interactive command-line tool that analyzes your staged git changes and generates meaningful commit messages using various AI providers. Perfect for automation, scripting, and developers who prefer terminal workflows.

## Features

- **5 AI Providers**: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
- **Non-Interactive**: Designed for scripting and automation
- **Simple Usage**: Single command outputs commit message to stdout
- **Flexible Configuration**: JSON configuration file
- **4 Prompt Presets**: Conventional, descriptive, concise, and custom templates
- **Error Handling**: Proper exit codes and stderr output

## Installation

```bash
# Install globally via npm
npm install -g @commitologist/cli

# Or via bun
bun install -g @commitologist/cli

# Or via yarn
yarn global add @commitologist/cli
```

## Quick Start

1. **Install the CLI**:
   ```bash
   npm install -g @commitologist/cli
   ```

2. **Configure AI Provider**:
   ```bash
   # Create config directory
   mkdir -p ~/.commitologist
   
   # Create configuration file
   cat > ~/.commitologist/config.json << EOF
   {
     "provider": "openai",
     "apiKey": "your-api-key-here",
     "model": "gpt-4o-mini",
     "promptPreset": "conventional"
   }
   EOF
   ```

3. **Generate Commit Message**:
   ```bash
   # Stage your changes
   git add .
   
   # Generate commit message
   commitologist
   
   # Use the output
   git commit -m "$(commitologist)"
   ```

## Usage

### Basic Usage

```bash
# Generate commit message for staged changes
commitologist

# Output example:
# feat: add user authentication system with JWT support
```

### Integration Examples

**Direct commit:**
```bash
git commit -m "$(commitologist)"
```

**Review before commit:**
```bash
# Generate and save to variable
MESSAGE=$(commitologist)
echo "Generated message: $MESSAGE"

# Edit if needed, then commit
git commit -m "$MESSAGE"
```

**Script automation:**
```bash
#!/bin/bash
git add .
if [ $? -eq 0 ]; then
  MESSAGE=$(commitologist)
  echo "Committing with message: $MESSAGE"
  git commit -m "$MESSAGE"
fi
```

**Git alias:**
```bash
# Add to ~/.gitconfig
[alias]
  smart-commit = !git add . && git commit -m \"$(commitologist)\"

# Usage
git smart-commit
```

## Configuration

### Configuration File

Create `~/.commitologist/config.json`:

```json
{
  "provider": "openai",
  "apiKey": "your-api-key",
  "model": "gpt-4o-mini",
  "promptPreset": "conventional",
  "includeUnstagedChanges": false,
  "maxChanges": 50,
  "timeout": 30,
  "customPrompt": "Write a commit message for: {changes}"
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | string | `"openai"` | AI provider (openai/anthropic/gemini/openrouter/ollama) |
| `apiKey` | string | - | API key for the provider |
| `model` | string | Provider default | Model to use |
| `promptPreset` | string | `"conventional"` | Preset (conventional/descriptive/concise/custom) |
| `includeUnstagedChanges` | boolean | `false` | Include unstaged changes |
| `maxChanges` | number | `50` | Maximum files to analyze |
| `timeout` | number | `30` | Request timeout in seconds |
| `customPrompt` | string | - | Custom prompt template (when preset is "custom") |

### Provider-Specific Configuration

**OpenAI:**
```json
{
  "provider": "openai",
  "apiKey": "sk-...",
  "model": "gpt-4o-mini"
}
```

**Anthropic:**
```json
{
  "provider": "anthropic", 
  "apiKey": "sk-ant-...",
  "model": "claude-3-5-sonnet-latest"
}
```

**Google Gemini:**
```json
{
  "provider": "gemini",
  "apiKey": "AI...",
  "model": "gemini-2.5-flash"
}
```

**OpenRouter:**
```json
{
  "provider": "openrouter",
  "apiKey": "sk-or-...",
  "model": "openai/gpt-4o-mini"
}
```

**Ollama:**
```json
{
  "provider": "ollama",
  "serverUrl": "http://localhost:11434",
  "model": "llama3.2"
}
```

## Prompt Presets

**Conventional** - Follows [Conventional Commits](https://conventionalcommits.org/):
```
feat: add user authentication system
fix: resolve memory leak in data processor  
docs: update API documentation
```

**Descriptive** - Detailed explanations:
```
Add comprehensive user authentication system with JWT tokens
Fix memory leak in data processor by implementing proper cleanup
Update API documentation to reflect new endpoint changes
```

**Concise** - Short, direct messages:
```
Add auth system
Fix memory leak
Update docs
```

**Custom** - Use your own template:
```json
{
  "promptPreset": "custom",
  "customPrompt": "Commit: {changes}\n\nSummary of changes in this commit."
}
```

## Exit Codes

- `0` - Success, commit message generated
- `1` - General error (invalid config, no changes, etc.)
- `2` - Not in a git repository
- `3` - No staged changes found
- `4` - API/Provider error
- `5` - Configuration error

## Error Handling

Errors are written to stderr, allowing you to handle them in scripts:

```bash
# Capture both output and errors
if MESSAGE=$(commitologist 2>&1); then
  echo "Success: $MESSAGE"
  git commit -m "$MESSAGE"
else
  echo "Error: $MESSAGE" >&2
  exit 1
fi
```

## Environment Variables

You can override configuration with environment variables:

```bash
export COMMITOLOGIST_PROVIDER=anthropic
export COMMITOLOGIST_API_KEY=sk-ant-...
export COMMITOLOGIST_MODEL=claude-3-5-sonnet-latest

commitologist
```

## Advanced Usage

### Git Hooks

**Pre-commit hook** (`.git/hooks/pre-commit`):
```bash
#!/bin/bash
# Auto-generate commit message template
commitologist > .git/COMMIT_EDITMSG 2>/dev/null || true
```

**Prepare commit message hook** (`.git/hooks/prepare-commit-msg`):
```bash
#!/bin/bash
# Auto-generate commit message if none provided
if [ -z "$2" ]; then
  commitologist > "$1" 2>/dev/null || true
fi
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Generate commit message
  run: |
    npm install -g @commitologist/cli
    echo "COMMIT_MSG=$(commitologist)" >> $GITHUB_ENV
  env:
    COMMITOLOGIST_API_KEY: ${{ secrets.OPENAI_API_KEY }}

- name: Commit changes
  run: git commit -m "${{ env.COMMIT_MSG }}"
```

## Troubleshooting

**Command not found**
```bash
# Check if installed globally
npm list -g @commitologist/cli

# Verify PATH includes npm global bin
npm config get prefix
```

**No staged changes**
```bash
# Check git status
git status

# Stage changes
git add .
```

**Configuration errors**
```bash
# Check config exists
cat ~/.commitologist/config.json

# Validate JSON
python -m json.tool ~/.commitologist/config.json
```

**API errors**
```bash
# Test with verbose output
commitologist 2>&1

# Check API key is valid
curl -H "Authorization: Bearer $YOUR_API_KEY" https://api.openai.com/v1/models
```

## Development

Built using [@commitologist/core](https://www.npmjs.com/package/@commitologist/core).

```bash
# Clone repository
git clone https://github.com/commitologist/commitologist.git
cd commitologist

# Install dependencies
bun install

# Build CLI
cd packages/cli
bun run build

# Test locally
node dist/cli.js
```

## Related Tools

- [commitologist VSCode Extension](https://marketplace.visualstudio.com/items?itemName=commitologist)
- [@commitologist/core](https://www.npmjs.com/package/@commitologist/core) - Core library

## License

MIT