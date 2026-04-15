#!/bin/bash
set -e
bun run build
vsce package
code --install-extension commitologist-*.vsix
