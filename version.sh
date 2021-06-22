#!/bin/bash

LATEST_TAG=$(git describe --abbrev=0 --tags)

echo "Run target 'readme' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target readme --parallel --maxParallel 8

git add "*/README.md"
git commit -m "docs: generate README.md"

echo "Run target 'update-package-group' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target update-package-group --parallel --maxParallel 8

git add "*/package.json"
git commit -m "chore: update ng-update package group"

echo "Run target 'update-peer-dependencies' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target update-peer-dependencies --parallel --maxParallel 8

git add "*/package.json"
git commit -m "chore: update package.json peer dependencies"

echo "Run target 'pack' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target pack
