#!/bin/bash
set -e

# Configure to use yarn registry
echo "Configuring registry..."
pnpm config set registry https://registry.yarnpkg.com
pnpm config set strict-ssl false

# Install dependencies
echo "Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build sandbox-manager first
echo "Building sandbox-manager..."
cd packages/sandbox-manager
pnpm build

# Build PWA
echo "Building bigbox-pwa..."
cd ../bigbox-pwa
pnpm build

echo "Build completed successfully!" 