import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { ComponentHostListenerSchema } from './schema';
import { normalize, strings } from '@angular-devkit/core';
import {
  DecoratorStructure,
  ImportDeclarationStructure,
  IndentationText,
  MethodDeclarationStructure,
  OptionalKind,
  Project,
  Scope,
  StructureKind
} from 'ts-morph';
import { addImportsToSourceFile } from '../utilities';

const { dasherize } = strings;

function addComponentHostBinding(options: ComponentHostListenerSchema): Rule {
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

    const instanceMethods = componentClass.getInstanceMethods();

    const existingMethod = instanceMethods.find(instanceProperty => instanceProperty.getName() === options.property);

    const decoratorStructure: OptionalKind<DecoratorStructure> = {
      name:      'HostListener',
      arguments: [ `'${options.eventName}'`, `['$event']` ],
      kind:      StructureKind.Decorator
    };

    if (existingMethod) {
      const existingDecorator = existingMethod.getDecorators().find(dec => dec.getName() === 'HostListener');
      if (existingDecorator) {
        const firstArgument = existingDecorator.getArguments()[ 0 ];
        if (firstArgument && firstArgument.getFullText() !== `'${options.eventName}'`) {
          existingMethod.addDecorator(decoratorStructure);
        }
      } else {
        existingMethod.addDecorator(decoratorStructure);
      }
    } else {
      const methodStructure: OptionalKind<MethodDeclarationStructure> = {
        kind:       StructureKind.Method,
        returnType: 'void',
        name:       options.property,
        scope:      Scope.Public,
        decorators: [ decoratorStructure ]
      };

      if (options.description) {
        methodStructure.docs = [ `\n${options.description}` ];
      }

      componentClass.addMethod(methodStructure);
    }

    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        kind:            StructureKind.ImportDeclaration,
        namedImports:    [
          {
            name: 'HostListener',
            kind: StructureKind.ImportSpecifier
          }
        ],
        moduleSpecifier: '@angular/core'
      }
    ];

    addImportsToSourceFile(sourceFile, importStructures);

    host.overwrite(componentFilePath, sourceFile.getFullText());

  };
}

export default function(options: ComponentHostListenerSchema): Rule {

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
