import {
  Project,
  SourceFile
} from 'ts-morph';
import { classify } from '@rxap/schematics-utilities';

export function FindComponentModuleSourceFile(name: string, project: Project): SourceFile {
  return project.getSourceFileOrThrow(sourceFile => !!sourceFile.getClass(classify(name) + 'ComponentModule'));
}
