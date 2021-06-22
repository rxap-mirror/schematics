#!/bin/bash

LATEST_TAG=$(git describe --abbrev=0 --tags)

echo "Run target 'readme' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target readme

echo "Run target 'update-package-group' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target update-package-group

echo "Run target 'update-peer-dependencies' for each affected project"
nx affected --base="$LATEST_TAG" --head="HEAD" --target update-peer-dependencies

git add .
