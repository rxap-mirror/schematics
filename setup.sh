#!/bin/bash

yarn nx run utilities:pack

yarn --cwd dist/libs/utilities link

yarn link @rxap/schematics-utilities

yarn nx run schematics:pack

yarn --cwd dist/libs/schematics link

yarn link @rxap/schematics
