#!/bin/bash
set -e

echo "Building VitePress..."
npm install
npm run docs:build

echo "Preparing dist..."
mkdir -p dist
cp -r docs/.vitepress/dist/* dist/

echo "Build complete!"
