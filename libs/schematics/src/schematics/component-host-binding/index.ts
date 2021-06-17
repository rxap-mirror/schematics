import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { ComponentHostBindingSchema } from './schema';
import { normalize, strings } from '@angular-devkit/core';
import {
  DecoratorStructure,
  ImportDeclarationStructure,
  IndentationText,
  OptionalKind,
  Project,
  Scope,
  StructureKind
} from 'ts-morph';
import { addImportsToSourceFile } from '../utilities';

const { dasherize } = strings;

function addComponentHostBinding(options: ComponentHostBindingSchema): Rule {
  return (host: Tree) => {

    const componentFilePath = normalize(join(options.path, `${dasherize(options.component)}.component.ts`));

    if (!host.exists(componentFilePath)) {
      throw new Error(`Could not find component with path '${componentFilePath}'`);
    }

    const text       = host.read(componentFilePath)!;
    const sourceText = text.toString();

    const project    = new Project({ manipulationSettings: { indentationText: IndentationText.TwoSpaces } });
    const sourceFile = project.createSourceFile(componentFilePath, sourceText);

    const classes = sourceFile.getClasses();

    const componentClass = classes.find(cls => cls.getDecorators().some(dec => dec.getName() === 'Component'));

    if (!componentClass) {
      throw new Error('Could not find component class');
    }

    const instanceProperties = componentClass.getInstanceProperties();

    const existingControlProperty = instanceProperties.find(instanceProperty => instanceProperty.getName() === options.property);

    const decoratorStructure: OptionalKind<DecoratorStructure> = {
      name:      'HostBinding',
      arguments: [ `'${options.hostPropertyName}'` ],
      kind:      StructureKind.Decorator
    };

    if (existingControlProperty) {
      const existingDecorator = existingControlProperty.getDecorators().find(dec => dec.getName() === 'HostBinding');
      if (existingDecorator) {
        const firstArgument = existingDecorator.getArguments()[ 0 ];
        if (firstArgument && firstArgument.getFullText() !== `'${options.hostPropertyName}'`) {
          existingControlProperty.addDecorator(decoratorStructure);
        }
      } else {
        existingControlProperty.addDecorator(decoratorStructure);
      }
    } else {
      componentClass.addProperty({
        kind:        StructureKind.Property,
        type:        options.type,
        name:        options.property,
        scope:       Scope.Public,
        decorators:  [ decoratorStructure ],
        initializer: options.initial
      });
    }

    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        kind:            StructureKind.ImportDeclaration,
        namedImports:    [
          {
            name: 'HostBinding',
            kind: StructureKind.ImportSpecifier
          }
        ],
        moduleSpecifier: '@angular/core'
      }
    ];

    if (options.typeImport) {
      importStructures.push({
        kind:            StructureKind.ImportDeclaration,
        namedImports:    [
          {
            name: options.type,
            kind: StructureKind.ImportSpecifier
          }
        ],
        moduleSpecifier: options.typeImport
      });
    }

    addImportsToSourceFile(sourceFile, importStructures);

    host.overwrite(componentFilePath, sourceFile.getFullText());

  };
}

export default function(options: ComponentHostBindingSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    return chain([
      addComponentHostBinding(options)
    ]);

  };

}
