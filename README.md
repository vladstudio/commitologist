# Commitologist

AI-powered commit messages for VSCode and CLI.

## Features

- Generate commit messages with OpenAI, Anthropic, Gemini, OpenRouter, or Ollama
- Use as VSCode extension or CLI tool
- Choose from preset prompts or create custom ones
- Include/exclude unstaged files, pick your model
- Built with TypeScript and Bun

## Supported AI Providers

**OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5  
**Anthropic**: Claude 4, Claude 3.7, Claude 3.5  
**Google**: Gemini 2.5/2.0/1.5 models  
**OpenRouter**: 400+ models (OpenAI, Anthropic, Meta, Amazon)  
**Ollama**: Local models (Llama 3, Codellama, Mistral, etc.)

## Installation

**CLI**: `npm install -g commitologist` or `npx commitologist`  
**VSCode**: Search "Commitologist" in marketplace

## Usage

**CLI**: Run `commitologist` to generate, `commitologist config` to configure  
**VSCode**: Click Commitologist button in Source Control panel

## Configuration

First run walks you through setup: provider, API key, model, prompt style.

**Prompt presets**:
- **Conventional**: `type(scope): description` format
- **Descriptive**: Detailed explanations 
- **Concise**: Single-line messages
- **Custom**: Your own template

**Options**: provider, API key, model, prompt preset, include unstaged files, Ollama URL

## Development

Requires [Bun](https://bun.sh/) and Node.js.

```bash
git clone https://github.com/your-username/commitologist.git
cd commitologist
bun install
bun run build
```

Commands: `bun run dev`, `bun test`, `bun run lint`, `bun run format`

## Contributing

Fork → branch → commit → push → PR

## License

MIT

---
