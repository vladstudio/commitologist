#!/bin/bash
set -e
bun run build
cd packages/vscode && vsce publish
