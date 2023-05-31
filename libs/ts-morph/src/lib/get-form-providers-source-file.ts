import {
  Project,
  SourceFile
} from 'ts-morph';
import { AddToArray } from './add-to-array';
import {CoerceImports} from "./ts-morph/index";

export function GetFormProvidersFile(project: Project): SourceFile {
  const formProviderSourceFilePath = 'form.providers';
  return project.getSourceFile(formProviderSourceFilePath + '.ts') ?? project.createSourceFile(formProviderSourceFilePath + '.ts');
}

export function AddToFormProviders(project: Project, value: string, overwrite: boolean = false): SourceFile {
  const sourceFile = GetFormProvidersFile(project);
  CoerceImports(sourceFile,{
    moduleSpecifier: '@angular/core',
    namedImports:    [ 'Provider' ]
  });
  AddToArray(sourceFile, 'FormProviders', value, 'Provider[]', overwrite);
  return sourceFile;
}
