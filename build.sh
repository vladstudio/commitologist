#!/bin/bash
set -e
codium --uninstall-extension vladstudio.commitologist || true
rm commitologist-*.vsix
bun run build
vsce package
codium --install-extension commitologist-*.vsix
