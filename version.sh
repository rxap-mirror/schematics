#!/bin/bash

LATEST_TAG=$(git describe --abbrev=0 --tags)

echo "Run target 'readme' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target readme

git add "*/README.md"
git commit -m "docs: generate README.md"

echo "Run target 'update-package-group' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target update-package-group

git add "*/package.json"
git commit -m "chore: update ng-update package group"

echo "Run target 'update-peer-dependencies' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target update-peer-dependencies

git add "*/package.json"
git commit -m "chore: update package.json peer dependencies"
