#!/bin/bash

yarn nx run utilities:pack

yarn --cwd dist/libs/utilities link

yarn link @rxap/schematics-utilities

yarn nx run ts-morph:pack

yarn --cwd dist/libs/ts-morph link

yarn link @rxap/schematics-ts-morph

yarn nx run schematics:pack

yarn --cwd dist/libs/schematics link

yarn link @rxap/schematics

yarn nx run xml-parser:pack

yarn --cwd dist/libs/xml-parser link

yarn link @rxap/schematics-xml-parser

yarn nx run html:pack

yarn --cwd dist/libs/html link

yarn link @rxap/schematics-html

yarn nx run form:pack

yarn --cwd dist/libs/form link

yarn link @rxap/schematics-form
