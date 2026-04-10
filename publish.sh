#!/bin/bash
set -e
bun run build
vsce publish
