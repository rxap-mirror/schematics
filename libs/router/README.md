@rxap/schematics-router
======

[![npm version](https://img.shields.io/npm/v/@rxap/schematics-router?style=flat-square)](https://www.npmjs.com/package/@rxap/schematics-router)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/schematics-router)
![npm](https://img.shields.io/npm/dm/@rxap/schematics-router)
![NPM](https://img.shields.io/npm/l/@rxap/schematics-router)

> 

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

```
ng add @rxap/schematics-router
```

*Setup the package @rxap/schematics-router for the workspace.*

# Schematics

## generate
> Generates a the router and feature module configuration

```
ng g @rxap/schematics-router:generate
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
template | string | templates/routing.xml | 
overwrite | boolean | false | 
organizeImports | boolean | true | 
openApiModule | string |  | 
fixImports | boolean | true | 
format | boolean | true | 
skipTsFiles | boolean | false | 
feature | string |  | 

| Required |
| --- |
| template |
| project |

## ng-add
> Setup the package @rxap/schematics-router for the workspace.

```
ng g @rxap/schematics-router:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---


