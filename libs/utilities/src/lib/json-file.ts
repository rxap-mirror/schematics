import { Rule, Tree } from '@angular-devkit/schematics';
import { CoerceFile } from './coerce-file';
import { IsFunction } from '@rxap/utilities';

export function GetJsonFile<T = any>(host: Tree, filePath: string): T {

  if (!host.exists(filePath)) {
    throw new Error(`A json file at path '${filePath}' does not exists`);
  }

  return JSON.parse(host.read(filePath)!.toString());
}

export interface UpdateJsonFileOptions {
  space?: string | number;
}

export function UpdateJsonFile<T extends Record<string, any> = Record<string, any>>(
  updaterOrJsonFile: T | ((jsonFile: T) => void | PromiseLike<void>),
  filePath: string,
  options?: UpdateJsonFileOptions,
): Rule {
  return async tree => {

    let jsonFile: T;

    if (IsFunction(updaterOrJsonFile)) {
      jsonFile = GetJsonFile<T>(tree, filePath);
      await updaterOrJsonFile(jsonFile);
    } else if (typeof updaterOrJsonFile === 'function') {
      throw new Error('FATAL: the update function was not a function');
    } else {
      jsonFile = updaterOrJsonFile;
    }

    CoerceFile(tree, filePath, JSON.stringify(jsonFile, undefined, options?.space ?? 2));

  }
}
