/**
 * CLI utility functions
 */

/**
 * Handle errors consistently
 */
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}

/**
 * Show help information
 */
export function showHelp(): void {
  console.log(`
Commitologist CLI - Generate intelligent commit messages using AI

USAGE:
  commitologist [OPTIONS]

OPTIONS:
  -h, --help    Show this help message

DESCRIPTION:
  Analyzes the current git repository's staged changes and generates an
  intelligent commit message using AI. The generated message is output
  to stdout.

CONFIGURATION:
  Commitologist reads configuration from ~/.commitologist/config.json
  
  Example configuration:
  {
    "aiProvider": "openai",
    "model": "gpt-4o-mini", 
    "promptPreset": "conventional",
    "includeUnstagedFiles": true,
    "apiKey": "your-api-key-here"
  }

  Example CLI provider configuration:
  {
    "aiProvider": "claude-cli",
    "model": "",
    "promptPreset": "conventional",
    "includeUnstagedFiles": true
  }

  Supported AI providers:
  - openai (requires apiKey)
  - anthropic (requires apiKey)
  - gemini (requires apiKey)
  - openrouter (requires apiKey)
  - ollama (requires ollamaUrl, defaults to http://localhost:11434)
  - claude-cli (requires Claude Code CLI installation)
  - codex-cli (requires Codex CLI installation)

  Supported prompt presets:
  - conventional: Conventional Commits format
  - descriptive: Detailed description format
  - concise: Brief, concise format
  - custom: Use customPrompt field

EXAMPLES:
  # Generate commit message for staged changes
  commitologist

  # Use in git workflow
  git add .
  git commit -m "$(commitologist)"

  # Save to file
  commitologist > commit-message.txt

REPOSITORY:
  https://github.com/vladstudio/commitologist
`);
}
