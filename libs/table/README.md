@rxap/schematics-table
======

[![npm version](https://img.shields.io/npm/v/@rxap/schematics-table?style=flat-square)](https://www.npmjs.com/package/@rxap/schematics-table)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/schematics-table)
![npm](https://img.shields.io/npm/dm/@rxap/schematics-table)
![NPM](https://img.shields.io/npm/l/@rxap/schematics-table)

> 

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

```
ng add @rxap/schematics-table
```

*Setup the package @rxap/schematics-table for the workspace.*

# Schematics

## generate
> Generates a table component from a template

```
ng g @rxap/schematics-table:generate
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The component name for the table component
path | string |  | 
templateBasePath | string |  | The base path to search for included templates
skipTests | boolean | true | When true, does not create &quot;spec.ts&quot; test files for the new component.
stories | boolean | false | 
flat | boolean | false | 
overwrite | boolean | false | Whether existing files and properties should be overwritten
skipTsFiles | boolean | false | Skip the creation or update of typescript files
project | string |  | The name of the project where the table component should be generated.
template | string |  | 
openApiModule | string |  | The project name for the OpenApi RemoteMethods and Directives
organizeImports | boolean | true | 
fixImports | boolean | true | 
format | boolean | true | 

| Required |
| --- |
| template |

## ng-add
> Setup the package @rxap/schematics-table for the workspace.

```
ng g @rxap/schematics-table:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---


