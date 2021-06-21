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

export function GetProjectCollectionJsonFilePath(host: Tree, projectName: string): string {

  const projectPackageJson = GetProjectPackageJson(host, projectName);
  const projectRoot = GetProjectRoot(host, projectName);

  if (projectPackageJson.schematics) {
    const collectionJsonPath = join(projectRoot, projectPackageJson.schematics);
    if (host.exists(collectionJsonPath)) {
      return collectionJsonPath;
    } else {
      throw new SchematicsException(`The collection.json path for the project '${projectName}' does not exists`);
    }
  } else {
    throw new SchematicsException(`The project '${projectName}' does not have a schematics property in the package.json`);
  }

}

export function GetProjectCollectionJson(host: Tree, projectName: string): CollectionJson {

  const collectionJsonFilePath = GetProjectCollectionJsonFilePath(host, projectName);

  return GetJsonFile(host, collectionJsonFilePath);

}

export interface UpdateCollectionJsonOptions extends UpdateJsonFileOptions {
  projectName: string;
}

export function UpdateCollectionJson(
  updater: (collection: CollectionJson) => void | PromiseLike<void>,
  options: UpdateCollectionJsonOptions
): Rule {
  return tree => {

    const collectionJsonFilePath = GetProjectCollectionJsonFilePath(tree, options.projectName);

    return UpdateJsonFile(updater, collectionJsonFilePath, options);

  }
}
