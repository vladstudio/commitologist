# Commitologist

VSCode extension that generates commit messages via Tetra's local HTTP API.

## How it works

1. Gets the git diff (staged changes; unstaged only if nothing is staged)
2. POSTs to `http://localhost:24100/transform` with command "Commit message"
3. Inserts the result into the Source Control input box

## Structure

```
src/extension.ts    # VSCode integration: command, git repos, Tetra HTTP call
src/diff.ts         # Pure diff parsing/truncation helpers (unit tested)
src/diff.test.ts    # bun tests for diff.ts
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
