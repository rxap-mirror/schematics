@rxap/schematics-form
======

[![npm version](https://img.shields.io/npm/v/@rxap/schematics-form?style=flat-square)](https://www.npmjs.com/package/@rxap/schematics-form)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/schematics-form)
![npm](https://img.shields.io/npm/dm/@rxap/schematics-form)
![NPM](https://img.shields.io/npm/l/@rxap/schematics-form)

> 

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

```
ng add @rxap/schematics-form
```

*Setup the package @rxap/schematics-form for the workspace.*

# Schematics

## generate-view
> Generates a form component from a template file

```
ng g @rxap/schematics-form:generate-view
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
templateBasePath | string |  | a template base path
overwrite | boolean | false | 
project | string |  | 
openApiModule | string |  | 
template | string |  | 
organizeImports | boolean | true | 
fixImports | boolean | true | 
format | boolean | true | 
skipTsFiles | boolean | false | 

| Required |
| --- |
| template |
| project |

## generate
> Generates a form definition from a xml specification

```
ng g @rxap/schematics-form:generate
```

Option | Type | Default | Description
--- | --- | --- | ---
path | string |  | 
project | string |  | 
templateBasePath | string |  | a template base path
template | string |  | 
formElement |  |  | 
openApiModule | string |  | 
name | string |  | 
flat | boolean |  | 
organizeImports | boolean | true | 
fixImports | boolean | true | 
format | boolean | true | 
overwrite | boolean | true | 
skipTsFiles | boolean | false | 


## ng-add
> Setup the package @rxap/schematics-form for the workspace.

```
ng g @rxap/schematics-form:ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---


