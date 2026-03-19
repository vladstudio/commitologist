#!/bin/bash
# Bump the version in packages/vscode/package.json manually
set -e
bun run build
cd packages/vscode && vsce publish
cd ../core && npm publish --access public
cd ../cli && npm publish --access public
