#!/bin/bash
set -e

bun run build

cd packages/vscode && vsce publish patch --no-dependencies
cd packages/core && npm publish --access public && cd ../..
cd packages/cli && npm publish --access public && cd ../..
