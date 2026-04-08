# Commitologist

Generate commit messages in VSCode using [Tetra](https://apps.vlad.studio/tetra).

Click the Commitologist button in the Source Control panel (or Command Palette → "Commitologist: Generate Commit Message"). The extension sends your git diff to Tetra's local HTTP API, which runs the "Commit message" command and returns the result into the commit input box.

## Requirements

- [Tetra](https://apps.vlad.studio/tetra) running on `localhost:24100`
- A `Commit message` command in `~/.config/tetra/commands/`

## Installation

Search "Commitologist" in the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=vladstudio.commitologist) and click Install.

## Troubleshooting

Check the Output panel (select "Commitologist" from the dropdown) for error details.

## License

MIT
