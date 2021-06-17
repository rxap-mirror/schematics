import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { ComponentInputSchema } from './schema';
import { normalize, strings } from '@angular-devkit/core';
import {
  ImportDeclarationStructure,
  ImportSpecifierStructure,
  IndentationText,
  Node,
  OptionalKind,
  Project,
  PropertyAssignmentStructure,
  PropertyDeclarationStructure,
  Scope,
  StructureKind
} from 'ts-morph';
import { addImportsToSourceFile } from '../utilities';

const { dasherize } = strings;

function addComponentInput(
  options: ComponentInputSchema,
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

function addToSandbox(options: ComponentInputSchema): Rule {
  return (host: Tree) => {

    const componentFilePath = normalize(join(options.path, `${dasherize(options.component)}.component.stories.ts`));

    if (!host.exists(componentFilePath)) {
      throw new Error(`Could not find component with path '${componentFilePath}'`);
    }

    const text       = host.read(componentFilePath)!;
    const sourceText = text.toString();

    const project    = new Project({ manipulationSettings: { indentationText: IndentationText.TwoSpaces } });
    const sourceFile = project.createSourceFile(componentFilePath, sourceText);

    const basicStory = sourceFile.getVariableDeclarations().find(vd => vd.getName() === 'basic');

    if (basicStory) {

      const basicStoryInit = basicStory.getInitializer();

      if (basicStoryInit && Node.isArrowFunction(basicStoryInit)) {
        const body = basicStoryInit.getBody();
        if (Node.isParenthesizedExpression(body)) {
          const objectLiteral = body.getExpression();
          if (Node.isObjectLiteralExpression(objectLiteral)) {
            const propsPropertyAss = objectLiteral.getProperty('props');
            if (propsPropertyAss && Node.isPropertyAssignment(propsPropertyAss)) {
              const propsProperty = propsPropertyAss.getInitializer();
              if (propsProperty && Node.isObjectLiteralExpression(propsProperty)) {
                const structure: PropertyAssignmentStructure = {
                  kind:        StructureKind.PropertyAssignment,
                  name:        options.property,
                  initializer: ''
                };
                const namedImport: ImportSpecifierStructure  = {
                  name: 'text',
                  kind: StructureKind.ImportSpecifier
                };

                switch (options.type) {

                  case 'string':
                    structure.initializer = `text('${options.property}', ${options.initial === undefined ? 'null' : `${options.initial}`})`;
                    namedImport.name      = 'text';
                    break;

                  case 'number':
                    structure.initializer = `number('${options.property}', ${options.initial === undefined ? 'null' : `${options.initial}`})`;
                    namedImport.name      = 'number';

                    break;

                  case 'boolean':
                    structure.initializer = `boolean('${options.property}', ${options.initial === undefined ? 'null' : `${options.initial}`})`;
                    namedImport.name      = 'boolean';
                    break;

                  default:
                    structure.initializer = `object('${options.property}', ${options.initial === undefined ? 'null' : `${options.initial}`})`;
                    namedImport.name      = 'object';
                    break;

                }

                addImportsToSourceFile(sourceFile, [
                  {
                    kind:            StructureKind.ImportDeclaration,
                    namedImports:    [ namedImport ],
                    moduleSpecifier: '@storybook/addon-knobs'
                  }
                ]);
                propsProperty.addProperty(structure);
              }
            }
          }
        }
      } else {
        throw new Error('Could not find array function');
      }

    }

    host.overwrite(componentFilePath, sourceFile.getFullText());

  };
}

export default function(options: ComponentInputSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    const propertyStructure: OptionalKind<PropertyDeclarationStructure> = {
      name:        options.property,
      type:        options.initial === undefined ? options.type + ' | null' : options.type,
      kind:        StructureKind.Property,
      scope:       Scope.Public,
      decorators:  [
        { name: 'Input', arguments: [], kind: StructureKind.Decorator }
      ],
      initializer: options.initial ?? 'null'
    };

    if (options.description) {
      propertyStructure.docs = [ '\n' + options.description ];
    }

    const importStructures: Array<OptionalKind<ImportDeclarationStructure>> = [
      {
        kind:            StructureKind.ImportDeclaration,
        namedImports:    [
          {
            name: 'Input',
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
      addComponentInput(options, propertyStructure, importStructures),
      addToSandbox(options)
    ]);

  };

}
