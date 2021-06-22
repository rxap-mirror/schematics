import { Rule, Tree } from '@angular-devkit/schematics';
import { CoerceFile } from './coerce-file';
import { equals, IsFunction } from '@rxap/utilities';

export function GetJsonFile<T = any>(host: Tree, filePath: string, create: boolean = false): T {

  if (!host.exists(filePath)) {
    if (!create) {
      throw new Error(`A json file at path '${filePath}' does not exists`);
    } else {
      host.create(filePath, '{}');
    }
  }

  return JSON.parse(host.read(filePath)!.toString());
}

export interface UpdateJsonFileOptions {
  space?: string | number;
  create?: boolean;
}

export function UpdateJsonFile<T extends Record<string, any> = Record<string, any>>(
  updaterOrJsonFile: T | ((jsonFile: T) => void | PromiseLike<void>),
  filePath: string,
  options?: UpdateJsonFileOptions,
): Rule {
  return async tree => {

    let jsonFile: T;

    if (IsFunction(updaterOrJsonFile)) {
      jsonFile = GetJsonFile<T>(tree, filePath, options?.create);
      await updaterOrJsonFile(jsonFile);
    } else if (typeof updaterOrJsonFile === 'function') {
      throw new Error('FATAL: the update function was not a function');
    } else {
      jsonFile = updaterOrJsonFile;
    }

    const currentJsonFile = GetJsonFile<T>(tree, filePath, options?.create);

    if (!equals(jsonFile, currentJsonFile)) {
      CoerceFile(tree, filePath, JSON.stringify(jsonFile, undefined, options?.space ?? 2));
    }

  }
}
