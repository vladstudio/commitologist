#!/bin/bash
set -e
code --uninstall-extension vladstudio.commitologist || true
rm -f commitologist-*.vsix
bun run build
vsce package
code --install-extension commitologist-*.vsix
