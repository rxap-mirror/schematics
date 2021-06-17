# RxAP

## Project structure

### Applications

### Libraries

#### Feature

The feature libraries contain all features that can be used in the pwa.

To add a new feature to the project use the schematic: `@rxap/schematics:feature-module`.
The schematic creates a new angular library project 

##### Examples

**command**

```bash
nx g @rxap/schematics:feature-module \
[feature-name]
```

#### Shared

The shared library contains all internal shared modules.

To add a new shared module to the shared library use the schematic: `@rxap/schematics:shared-module`. 

##### Examples

###### A shared module without a component module

**command:**

```bash
nx g @rxap/schematics:shared-module \
[shared-module-name]
```

**created files:**

```
libs/shared/src/lib
| - [shared-module-name]
    | - [shared-module-name].module.ts
```

###### A shared module with a component module

**command:**

```bash
nx g @rxap/schematics:shared-module \
[shared-module-name] \
--component
```

**created files:**

```
libs/shared/src/lib
| - [shared-module-name]
    | - [shared-module-name].component.ts
    | - [shared-module-name].component.module.ts
    | - [shared-module-name].component.stories.ts
    | - [shared-module-name].component.scss
    | - [shared-module-name].component.html
    | - _[shared-module-name].component.theme.scss
```
