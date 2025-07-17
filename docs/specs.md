Commitologist is a tool that helps you write better commit messages.
Available as a VSCode extension and a CLI tool.

## VSCode extension user journey:

- install Commitologist extension from VSCode marketplace
- open Changes view in Source Control panel
- click Commitologist button
- (first run) select AI Provider
- (first run) enter API key for selected provider
- (first run) select model
- (first run) select commit message prompt preset
- wait
- commit message is generated and inserted into the commit message field.

- open Settings, search for Commitologist
- available settings:
  - AI Provider: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
  - API key (required for OpenAI, Anthropic, Gemini, OpenRouter)
  - Model (required for OpenAI, Anthropic, Gemini, OpenRouter)
  - Commit message prompt (select from preset or enter custom prompt)
  - Include unstaged files: yes/no (default: yes)

## CLI user journey:
- install Commitologist CLI
- run `commitologist`
- (first run) select AI Provider
- (first run) enter API key for selected provider
- (first run) select model
- (first run) select commit message prompt preset
- wait
- commit message is generated and rendered in the terminal.
- ask for approval, commit.

- run `commitologist config`
- available settings:
  - AI Provider: OpenAI, Anthropic, Gemini, OpenRouter, Ollama
  - API key (required for OpenAI, Anthropic, Gemini, OpenRouter)
  - Model (required for OpenAI, Anthropic, Gemini, OpenRouter)
  - Commit message prompt (select from preset or enter custom prompt)
  - Include unstaged files: yes/no (default: yes)

