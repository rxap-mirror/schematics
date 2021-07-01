import { ClassDeclaration, MethodDeclarationStructure, OptionalKind } from 'ts-morph';

export function CoerceClassMethod(
  classDeclaration: ClassDeclaration,
  name: string,
  structure: Omit<OptionalKind<MethodDeclarationStructure>, 'name'>
) {

  let methodDeclaration = classDeclaration.getMethod(name)

  if (!methodDeclaration) {

    methodDeclaration = classDeclaration.addMethod({
      ...structure,
      name
    });

  }

  return methodDeclaration;

}
