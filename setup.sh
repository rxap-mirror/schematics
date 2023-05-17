#!/bin/bash

if [[ -n "$SKIP_SETUP" ]]; then
  exit 0
fi

yarn nx run utilities:version

yarn --cwd dist/libs/utilities link

yarn link @rxap/schematics-utilities

yarn nx run ts-morph:version

yarn --cwd dist/libs/ts-morph link

yarn link @rxap/schematics-ts-morph

yarn nx run schematics:version

yarn --cwd dist/libs/schematics link

yarn link @rxap/schematics

yarn nx run xml-parser:version

yarn --cwd dist/libs/xml-parser link

yarn link @rxap/schematics-xml-parser

yarn nx run html:version

yarn --cwd dist/libs/html link

yarn link @rxap/schematics-html

yarn nx run form:version

yarn --cwd dist/libs/form link

yarn link @rxap/schematics-form
