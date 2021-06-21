import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { join } from 'path';
import {
  GetJsonFile,
  GetProjectPackageJson,
  GetProjectRoot,
  UpdateJsonFile,
  UpdateJsonFileOptions
} from '@rxap/schematics-utilities';
import { CollectionJson } from './collection-json';

export enum CollectionJsonType {
  SCHEMATICS = 'schematics',
  MIGRATIONS = 'migrations'
}

export function GetProjectCollectionJsonFilePath(host: Tree, projectName: string, type: CollectionJsonType = CollectionJsonType.SCHEMATICS): string {

  const projectPackageJson = GetProjectPackageJson(host, projectName);
  const projectRoot = GetProjectRoot(host, projectName);

  let collectionPath: string | undefined = undefined;

  switch (type) {
    case CollectionJsonType.SCHEMATICS:
      collectionPath = projectPackageJson.schematics;
      break;
    case CollectionJsonType.MIGRATIONS:
      collectionPath = projectPackageJson['ng-update']?.migrations;
      break;

    default:
      throw new SchematicsException(`The collection json type '${type}' is not supported`);

  }

  if (collectionPath) {
    const collectionJsonPath = join(projectRoot, collectionPath);
    if (host.exists(collectionJsonPath)) {
      return collectionJsonPath;
    } else {
      throw new SchematicsException(`The collection json path of type '${type}' for the project '${projectName}' does not exists`);
    }
  } else {
    throw new SchematicsException(`The project '${projectName}' does not have a '${type}' property in the package.json`);
  }

}

export function GetProjectCollectionJson(host: Tree, projectName: string, type: CollectionJsonType = CollectionJsonType.SCHEMATICS): CollectionJson {

  const collectionJsonFilePath = GetProjectCollectionJsonFilePath(host, projectName, type);

  return GetJsonFile(host, collectionJsonFilePath);

}

export interface UpdateCollectionJsonOptions extends UpdateJsonFileOptions {
  projectName: string;
  type?: CollectionJsonType;
}

export function UpdateCollectionJson(
  updater: (collection: CollectionJson) => void | PromiseLike<void>,
  options: UpdateCollectionJsonOptions
): Rule {
  return tree => {

    const collectionJsonFilePath = GetProjectCollectionJsonFilePath(tree, options.projectName, options.type);

    return UpdateJsonFile(updater, collectionJsonFilePath, options);

  }
}
