import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { ComponentOutputSchema } from './schema';
import { normalize, strings } from '@angular-devkit/core';
import {
  ImportDeclarationStructure,
  IndentationText,
  OptionalKind,
  Project,
  PropertyDeclarationStructure,
  Scope,
  StructureKind
} from 'ts-morph';
import { addImportsToSourceFile } from '../utilities';

const { dasherize } = strings;

function addComponentOutput(
  options: ComponentOutputSchema,
  propertyStructure: OptionalKind<PropertyDeclarationStructure>,
  importStructures: Array<OptionalKind<ImportDeclarationStructure>>
): Rule {
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

    if (existingControlProperty) {
      componentClass.insertProperty(existingControlProperty.getChildIndex(), propertyStructure);
    } else {
      componentClass.addProperty(propertyStructure);
    }

    addImportsToSourceFile(sourceFile, importStructures);

    host.overwrite(componentFilePath, sourceFile.getFullText());

  };
}

export default function(options: ComponentOutputSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    const propertyStructure: OptionalKind<PropertyDeclarationStructure> = {
      name:        options.property,
      initializer: `new EventEmitter<${options.type}>()`,
      kind:        StructureKind.Property,
      scope:       Scope.Public,
      decorators:  [
        { name: 'Output', arguments: [], kind: StructureKind.Decorator }
      ]
    };

    if (options.description) {
      propertyStructure.docs = [ '\n' + options.description ];
    }

    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        kind:            StructureKind.ImportDeclaration,
        namedImports:    [
          {
            name: 'Output',
            kind: StructureKind.ImportSpecifier
          },
          {
            name: 'EventEmitter',
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

    return chain([
      addComponentOutput(options, propertyStructure, importStructures)
    ]);

  };

}
