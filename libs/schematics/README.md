@rxap/schematics
======

[![npm version](https://img.shields.io/npm/v/@rxap/schematics?style=flat-square)](https://www.npmjs.com/package/@rxap/schematics)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/schematics)
![npm](https://img.shields.io/npm/dm/@rxap/schematics)
![NPM](https://img.shields.io/npm/l/@rxap/schematics)

> A collection of utility schematics for RxAP.

- [Installation](#installation)
- [Schematics](#schematics)

# Installation

```
yarn add @rxap/schematics
```

# Schematics

## config-ng-add
> Add required configs and files to a project for ng add support.

```
ng g @rxap/schematics:config-ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The project name.
save | string | dependencies | 

| Required |
| --- |
| project |

## schematic-project
> Creates a project for schematic distribution.

```
ng g @rxap/schematics:schematic-project
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Library name
project | string |  | Only update an exiting schematic project
directory | string |  | A directory where the lib is placed
linter | string | eslint | The tool to use for running lint checks.
unitTestRunner | string | jest | Test runner to use for unit tests
tags | string |  | Add tags to the library (used for linting)
skipFormat | boolean | false | Skip formatting files
skipTsConfig | boolean | false | Do not update tsconfig.base.json for development experience.
importPath | string |  | The library name used to import it, like @myorg/my-awesome-lib. Must be a valid npm name.
rootDir | string |  | Sets the rootDir for TypeScript compilation. When not defined, it uses the project&#x27;s root property, or srcRootForCompilationRoot if it is defined.
testEnvironment | string | jsdom | The test environment to use if unitTestRunner is set to jest
babelJest | boolean | false | Use babel instead ts-jest
pascalCaseFiles | boolean | false | Use pascal case file names.
js | boolean | false | Generate JavaScript files rather than TypeScript files.
strict | boolean | false | Whether to enable tsconfig strict mode or not.
builders | boolean | false | Whether the project should have builders
overwrite | boolean |  | Whether to overwrite existing files.


## component-module
> Creates a new generic component module in the given or default project.

```
ng g @rxap/schematics:component-module
```

Option | Type | Default | Description
--- | --- | --- | ---
path | string |  | The path at which to create the component file, relative to the current workspace. Default is a folder with the same name as the component in the project root.
project | string |  | The name of the project.
routing | boolean |  | Whether the created component should be added to the declaring module
route | string |  | The route for this component
name | string |  | The name of the component.
stories | boolean | true | 
inlineStyle | boolean | false | When true, includes styles inline in the component.ts file. Only CSS styles can be included inline. By default, an external styles file is created and referenced in the component.ts file.
inlineTemplate | boolean | false | When true, includes template inline in the component.ts file. By default, an external template file is created and referenced in the component.ts file.
viewEncapsulation | string |  | The view encapsulation strategy to use in the new component.
changeDetection | string | OnPush | The change detection strategy to use in the new component.
prefix | string |  | The prefix to apply to the generated component selector.
style | string | scss | The file extension or preprocessor to use for style files.
type | string | Component | Adds a developer-defined type to the filename, in the format &quot;name.type.ts&quot;.
debug | boolean | false | If in debug mode. the resulting component will be printed to stout
theme | boolean | true | Whether this component has a theme scss
themeImport | boolean | true | Whether the component theme file should be imported by the _index.scss
input | array |  | A list of component inputs
output | array |  | A list of component outputs
hostBinding | array |  | A list of component host bindings
hostListener | array |  | A list of component host listener
import | array |  | A list of module imports
template | string |  | The initial component template
astTransformer |  |  | 
inputOutput | array |  | A list of component 2 way data binding input/output&#x27;s
skipTests | boolean | false | When true, does not create &quot;spec.ts&quot; test files for the new component.
flat | boolean | false | When true, creates the new files at the top level of the current project.
selector | string |  | The HTML selector to use for this component.
skipSelector | boolean | false | Specifies if the component should have a selector or not.
module | string |  | The declaring NgModule.
entryComponent | boolean | false | When true, the new component is the entry component of the declaring NgModule.
lintFix | boolean | false | When true, applies lint fixes after generating the component.
commonModule | boolean | false | When true, the new NgModule imports &quot;CommonModule&quot;. 

| Required |
| --- |
| name |

## formControlComponent
> Creates a new generic form control component module in the given or default project.

```
ng g @rxap/schematics:formControlComponent
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Form control component name
path | string |  | The path at which to create the form control component file, relative to the current workspace.
project | string |  | The name of the project.
prefix | string |  | Form control component name

| Required |
| --- |
| name |

## viewComponent
> Creates a new generic view component with module for the view system in the given or default project.

```
ng g @rxap/schematics:viewComponent
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Form control name
path | string |  | The path at which to create the view component file, relative to the current workspace.
project | string |  | The name of the project.
prefix | string |  | View component name

| Required |
| --- |
| name |

## ideaRunConfig
> Create Idea lib run configurations

```
ng g @rxap/schematics:ideaRunConfig
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Project name
basePath | string |  | Project name

| Required |
| --- |
| name |

## packageScript
> Add all build scripts to lib package.json

```
ng g @rxap/schematics:packageScript
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Project name
scss-bundle | boolean | false | Whether the project has custom themes

| Required |
| --- |
| name |

## libraryDependencies
> Updates the package peer dependencies

```
ng g @rxap/schematics:libraryDependencies
```

Option | Type | Default | Description
--- | --- | --- | ---
path | string |  | Project path

| Required |
| --- |
| path |

## addSubPackage
> Creates a sub ngPackage

```
ng g @rxap/schematics:addSubPackage
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name package
path | string |  | The path at which to create the component file, relative to the current workspace. Default is a folder with the same name as the component in the project root.
project | string |  | The name of the project.


## addSchematic
> Add a new schematic to the collection

```
ng g @rxap/schematics:addSchematic
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of the new schematic
path | string |  | The absolute path to the schematic folder or the relative path from the project root
project | string |  | The project where the schematic should be added
group | string |  | The group name of the schematic
description | string |  | The description of the new schematic

| Required |
| --- |
| name |
| description |

## component-stories
> add a story book file to the component

```
ng g @rxap/schematics:component-stories
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
project | string |  | 
prefix | string |  | The prefix to apply to the generated component selector.


## feature-module
> Create a new feature module. Adds a new nx library and setup the routing

```
ng g @rxap/schematics:feature-module
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
parentModule | string | apps/pwa/src/app/app-routing.module.ts | 
storybook | boolean | false | 

| Required |
| --- |
| name |

## shared-module
> Create a new shared module. Adds a new nx library if not already created

```
ng g @rxap/schematics:shared-module
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of the component shared module
component | boolean | false | Whether the new module is a component module
selector | string |  | The HTML selector to use for this component.
input | array |  | A list of component inputs
output | array |  | A list of component outputs
import | array |  | A list of module imports
template | string |  | The initial component template
inputOutput | array |  | A list of component 2 way data binding input/output&#x27;s
hostBinding | array |  | A list of component host bindings
hostListener | array |  | A list of component host listener
zeplinName | array |  | 
storybook | boolean | true | 

| Required |
| --- |
| name |

## library-storybook-configuration
> Add a storybook configuration to a library

```
ng g @rxap/schematics:library-storybook-configuration
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Library name
configureCypress | boolean | false | Run the cypress-configure schematic
generateStories | boolean | false | Automatically generate *.stories.ts files for components declared in this library
generateCypressSpecs | boolean | false | Automatically generate *.spec.ts files in the cypress e2e app generated by the cypress-configure schematic

| Required |
| --- |
| name |

## link-component-to-zeplin
> Add the specified component to the zeplin components.json.

```
ng g @rxap/schematics:link-component-to-zeplin
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
project | string |  | 
zeplinName | array |  | 

| Required |
| --- |
| name |

## component-theme
> add the component scss theme

```
ng g @rxap/schematics:component-theme
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
project | string |  | 
prefix | string |  | The component prefix


## component-input
> Add an input to the specified component

```
ng g @rxap/schematics:component-input
```

Option | Type | Default | Description
--- | --- | --- | ---
component | string |  | 
property | string |  | 
type | string |  | 
typeImport | string |  | 
description | string |  | The component input description
path | string |  | 
project | string |  | 
initial | string |  | 

| Required |
| --- |
| component |
| property |
| type |

## component-output
> Add an output to the specified component

```
ng g @rxap/schematics:component-output
```

Option | Type | Default | Description
--- | --- | --- | ---
component | string |  | 
property | string |  | 
type | string |  | 
typeImport | string |  | 
description | string |  | The component input description
path | string |  | 
project | string |  | 


## component-input-output
> Add an 2 way databinding input/output to the specified component

```
ng g @rxap/schematics:component-input-output
```

Option | Type | Default | Description
--- | --- | --- | ---
component | string |  | 
property | string |  | 
type | string |  | 
typeImport | string |  | 
description | string |  | The component input description
path | string |  | 
project | string |  | 
initial | string |  | 

| Required |
| --- |
| component |
| property |
| type |

## component-host-binding
> adds a host binding to the component

```
ng g @rxap/schematics:component-host-binding
```

Option | Type | Default | Description
--- | --- | --- | ---
component | string |  | 
property | string |  | 
hostPropertyName | string |  | 
type | string |  | 
typeImport | string |  | 
path | string |  | 
initial | string |  | 
project | string |  | 

| Required |
| --- |
| component |
| property |
| hostPropertyName |
| type |
| initial |

## component-host-listener
> adds a host listner to the component

```
ng g @rxap/schematics:component-host-listener
```

Option | Type | Default | Description
--- | --- | --- | ---
component | string |  | 
property | string |  | 
eventName | string |  | 
description | string |  | 
path | string |  | 
project | string |  | 

| Required |
| --- |
| component |
| property |
| eventName |

## init
> create a new angular workspace

```
ng g @rxap/schematics:init
```

Option | Type | Default | Description
--- | --- | --- | ---
zeplin | boolean | false | Add zeplin support
storybook | boolean | false | Add storybook support
zeplinProject | array |  | A list of zeplin project ids
zeplinStyleguide | array |  | A list of zeplin styleguide ids
zeplinConnectUrl | string |  | The zeplin connect url of the storybook


## library-theme
> add index theme to library

```
ng g @rxap/schematics:library-theme
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
bundle | boolean | false | Add the scss-bundle target


## zeplin-configuration
> adds zeplin connect support to the porject

```
ng g @rxap/schematics:zeplin-configuration
```

Option | Type | Default | Description
--- | --- | --- | ---
project | array |  | A list of zeplin project ids
styleguide | array |  | A list of zeplin styleguide ids
url | string |  | The zeplin connect url of the storybook


## storybook-configuration
> adds storybook support to the project

```
ng g @rxap/schematics:storybook-configuration
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
path | string |  | 
project | string |  | 


## library-shared
> adds the shared library

```
ng g @rxap/schematics:library-shared
```

Option | Type | Default | Description
--- | --- | --- | ---
storybook | boolean | false | Add storybook support


## pwa-init
> Init a application for pwa use

```
ng g @rxap/schematics:pwa-init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string | pwa | Project name


## library
> Adds an angular library project

```
ng g @rxap/schematics:library
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | 
importPath | string |  | 
theming | boolean | false | 
directory | string |  | 

| Required |
| --- |
| name |
| importPath |

## plugin-project
> Adds a plugin project to the workspace.

```
ng g @rxap/schematics:plugin-project
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Library name
project | string |  | Only update an exiting schematic project
directory | string |  | A directory where the lib is placed
linter | string | eslint | The tool to use for running lint checks.
unitTestRunner | string | jest | Test runner to use for unit tests
tags | string |  | Add tags to the library (used for linting)
skipFormat | boolean | false | Skip formatting files
skipTsConfig | boolean | false | Do not update tsconfig.base.json for development experience.
importPath | string |  | The library name used to import it, like @myorg/my-awesome-lib. Must be a valid npm name.
rootDir | string |  | Sets the rootDir for TypeScript compilation. When not defined, it uses the project&#x27;s root property, or srcRootForCompilationRoot if it is defined.
testEnvironment | string | jsdom | The test environment to use if unitTestRunner is set to jest
babelJest | boolean | false | Use babel instead ts-jest
pascalCaseFiles | boolean | false | Use pascal case file names.
js | boolean | false | Generate JavaScript files rather than TypeScript files.
strict | boolean | false | Whether to enable tsconfig strict mode or not.
defaultBuilder | string |  | The name of the default builder
defaultTarget | string |  | The name of the default target
overwrite | boolean |  | Whether to overwrite existing files.
defaultBuilderDescription | string |  | The description for the default builder


## add-plugin-config-schematic
> Adds the default plugin builder config schematic to the project.

```
ng g @rxap/schematics:add-plugin-config-schematic
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string | config | The name of the new schematic
path | string |  | The absolute path to the schematic folder or the relative path from the project root
project | string |  | The project where the schematic should be added
description | string |  | The description of the new schematic
defaultBuilder | string |  | The name of the default builder
defaultTarget | string |  | The name of the default target

| Required |
| --- |
| name |
| defaultBuilder |
| defaultTarget |

## add-builder
> Adds a builder to the specified project.

```
ng g @rxap/schematics:add-builder
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of the new builder
path | string |  | The absolute path to the builder folder or the relative path from the project root
project | string |  | The project where the builder should be added
description | string |  | The description of the new builder

| Required |
| --- |
| name |
| description |

## config-plugin-ng-add
> Add required configs and files to a project for ng add support specific for plugins.

```
ng g @rxap/schematics:config-plugin-ng-add
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The project name.
save | string | dependencies | 


## config-package-json
> Updates the project package.json.

```
ng g @rxap/schematics:config-package-json
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The project name.

| Required |
| --- |
| project |

## angular-library-project
> Adds an angular library project to the workspace.

```
ng g @rxap/schematics:angular-library-project
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | Library name
project | string |  | Only update an exiting angular library project
overwrite | boolean |  | Whether to overwrite existing files.
directory | string |  | A directory where the lib is placed
prefix | string |  | The prefix to apply to generated selectors.
skipFormat | boolean | false | Skip formatting files
simpleModuleName | boolean | false | Keep the module name simple (when using --directory)
addModuleSpec | boolean | false | Add a module spec file.
skipPackageJson | boolean | false | Do not add dependencies to package.json.
skipTsConfig | boolean | false | Do not update tsconfig.json for development experience.
tags | string |  | Add tags to the library (used for linting)
unitTestRunner | string | jest | Test runner to use for unit tests
importPath | string |  | The library name used to import it, like @myorg/my-awesome-lib. Must be a valid npm name.
strict | boolean | true | Creates a library with stricter type checking and build optimization options.
linter | string | eslint | The tool to use for running lint checks.
enableIvy | boolean | false | Enable Ivy for library in tsconfig.lib.prod.json. Should not be used with publishable libraries.


