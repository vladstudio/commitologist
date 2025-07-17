# Commitologist

A tool that helps you write better commit messages using AI. Available as both a VSCode extension and CLI tool.

## Features

- 🤖 **AI-Powered**: Generate intelligent commit messages using various AI providers
- 🎯 **Multiple Providers**: Support for OpenAI, Anthropic, Gemini, OpenRouter, and Ollama
- 🛠️ **Dual Interface**: Works as both VSCode extension and CLI tool
- 📝 **Customizable Prompts**: Choose from presets or create custom prompts
- 🔧 **Flexible Configuration**: Include/exclude unstaged files, model selection
- 🚀 **Fast & Efficient**: Built with TypeScript and modern tooling

## Supported AI Providers

### OpenAI
- **GPT-4.1 Series**: `gpt-4.1`, `gpt-4.1-mini`, `gpt-4.1-nano`
- **GPT-4o Series**: `gpt-4o`, `gpt-4o-mini`, `chatgpt-4o-latest`
- **GPT-4 Turbo**: `gpt-4-turbo`, `gpt-4-turbo-2024-04-09`
- **GPT-3.5**: `gpt-3.5-turbo`, `gpt-3.5-turbo-0125`

### Anthropic
- **Claude 4**: `claude-opus-4-20250514`, `claude-sonnet-4-20250514`
- **Claude 3.7**: `claude-3-7-sonnet-20250219`, `claude-3-7-sonnet-latest`
- **Claude 3.5**: `claude-3-5-sonnet-20241022`, `claude-3-5-sonnet-latest`

### Google Gemini
- **Gemini 2.5**: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`
- **Gemini 2.0**: `gemini-2.0-flash`, `gemini-2.0-flash-lite`
- **Gemini 1.5**: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-1.5-flash-8b`

### OpenRouter
Access to 400+ models including:
- OpenAI: `openai/gpt-4o-mini`, `openai/gpt-3.5-turbo`
- Anthropic: `anthropic/claude-3.5-sonnet`, `anthropic/claude-3-haiku`
- Meta: `meta-llama/llama-3.1-8b-instruct`
- Amazon: `amazon/nova-lite-v1`, `amazon/nova-pro-v1`

### Ollama (Local)
- **Llama 3**: `llama3.3`, `llama3.2`, `llama3.1`
- **Code Models**: `codellama`, `qwen2.5-coder`
- **Other**: `mistral`, `deepseek-r1`, `phi-4`, `gemma3`

## Installation

### CLI Tool
```bash
# Install globally
npm install -g commitologist

# Or use with npx
npx commitologist
```

### VSCode Extension
Search for "Commitologist" in the VSCode marketplace and install.

## Usage

### CLI Usage
```bash
# Generate commit message
commitologist

# Configure settings
commitologist config

# Show help
commitologist --help
```

### VSCode Extension
1. Open the Source Control panel
2. Click the Commitologist button
3. Generated commit message appears in the message field
4. Edit if needed and commit

## Configuration

### First-time Setup
On first run, you'll be prompted to configure:
- AI Provider (OpenAI, Anthropic, Gemini, OpenRouter, Ollama)
- API Key (not required for Ollama)
- Model selection
- Prompt preset

### Prompt Presets
- **Conventional**: Follows conventional commit format (`type(scope): description`)
- **Descriptive**: Detailed, human-readable messages with explanations
- **Concise**: Brief, to-the-point single-line messages
- **Custom**: Define your own prompt template

### Configuration Options
- **AI Provider**: Choose your preferred AI service
- **API Key**: Required for cloud providers (OpenAI, Anthropic, Gemini, OpenRouter)
- **Model**: Select from supported models for your provider
- **Prompt Preset**: Choose message style or use custom prompt
- **Include Unstaged Files**: Whether to analyze unstaged changes (default: yes)
- **Ollama URL**: Local Ollama instance URL (default: http://localhost:11434)

## Development

### Prerequisites
- [Bun](https://bun.sh/) (package manager and runtime)
- Node.js (for compatibility)

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/commitologist.git
cd commitologist

# Install dependencies
bun install

# Build the project
bun run build

# Run in development mode
bun run dev

# Run tests
bun test

# Lint and format
bun run lint
bun run format
```

### Project Structure
```
src/
├── core/           # Shared business logic
├── providers/      # AI provider implementations
├── extension/      # VSCode extension
├── cli/           # CLI application
└── index.ts       # Main entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the documentation
- Join our community discussions

---

**Note**: This project is currently in development. The CLI tool and VSCode extension are being actively developed. Stay tuned for releases!