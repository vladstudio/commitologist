# Commitologist

VSCode extension that generates commit messages via Tetra's local HTTP API.

## How it works

1. Gets git diff (staged + unstaged) from the workspace
2. POSTs to `http://localhost:24100/transform` with command "AI Generate commit message"
3. Inserts the result into the Source Control input box

## Structure

```
src/extension.ts    # Entire extension (~100 lines)
package.json        # Extension manifest
dist/extension.js   # Built by esbuild
```

## Development

```bash
bun install
bun run build        # Build extension
```

Press F5 in VSCode to launch Extension Development Host.

## Publishing

```bash
./publish.sh         # Build + vsce publish
```
