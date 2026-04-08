# Commitologist

Generate commit messages in VSCode using [Tetra](https://apps.vlad.studio/tetra).

## How it works

Click the Commitologist button in the Source Control panel (or Command Palette → "Commitologist: Generate Commit Message"). The extension sends your git diff to Tetra's local HTTP API, which runs the "Commit message" command and returns the result into the commit input box.

## Requirements

- [Tetra](https://apps.vlad.studio/tetra) running on `localhost:24100`
- A `Commit message` command in `~/.config/tetra/commands/`

## Installation

Search "Commitologist" in the VSCode marketplace or install from [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=vladstudio.commitologist).

## Development

```bash
git clone https://github.com/vladstudio/commitologist.git
cd commitologist
bun install
bun run build:vscode
```

Press F5 in VSCode to launch the Extension Development Host.

## License

MIT
