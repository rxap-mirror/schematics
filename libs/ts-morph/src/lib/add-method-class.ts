import {
  ConstructorDeclarationStructure,
  DecoratorStructure,
  ImportDeclarationStructure,
  OptionalKind,
  Scope,
  SourceFile,
  StatementStructures,
  TypeParameteredNodeStructure,
  WriterFunction
} from 'ts-morph';
import { CoerceSuffix } from '@rxap/utilities';

export interface AddMethodClassOptions extends TypeParameteredNodeStructure {
  structures?: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>;
  returnType?: string;
  parameterType?: string;
  isAsync?: boolean;
  statements?: (string | WriterFunction | StatementStructures)[] | string | WriterFunction | null;
  implements?: string[];
  decorators?: OptionalKind<DecoratorStructure>[];
  ctors?: OptionalKind<ConstructorDeclarationStructure>[]
}

export const DEFAULT_ADD_METHOD_CLASS_OPTIONS: Required<AddMethodClassOptions> = {
  structures: [],
  returnType: 'any',
  parameterType: 'any',
  isAsync: false,
  statements: null,
  implements: [],
  typeParameters: [],
  decorators: [],
  ctors: [],
};

export function AddMethodClass(
  sourceFile: SourceFile,
  name: string,
  options: AddMethodClassOptions = {}
): void {

  const parameters: Required<AddMethodClassOptions> = Object.assign({}, DEFAULT_ADD_METHOD_CLASS_OPTIONS, options);

  name = CoerceSuffix(name, 'Method');

  const decorators = options.decorators ?? [];

  if (!decorators.some(d => d.name === 'Injectable')) {
    decorators.push({
      name: 'Injectable',
      arguments: []
    });
  }

  sourceFile.addClass({
    name: name,
    isExported: true,
    decorators,
    typeParameters: parameters.typeParameters,
    implements: [
      `Method<${parameters.returnType}, ${parameters.parameterType}>`,
      ...parameters.implements,
    ],
    ctors: parameters.ctors,
    methods: [
      {
        name: 'call',
        isAsync: parameters.isAsync,
        scope: Scope.Public,
        parameters: [ { name: 'parameters', type: parameters.parameterType } ],
        returnType: parameters.isAsync ? `Promise<${parameters.returnType}>` : parameters.returnType,
        statements: parameters.statements ?? []
      }
    ]
  });
  sourceFile.addImportDeclarations([
    {
      namedImports:    [ 'Injectable' ],
      moduleSpecifier: '@angular/core'
    },
    {
      namedImports:    [ 'Method' ],
      moduleSpecifier: '@rxap/utilities/rxjs'
    }
  ]);
  sourceFile.addImportDeclarations(parameters.structures);

}
