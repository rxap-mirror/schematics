import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { join, relative } from 'path';
import { Angular, AngularProject, GetAngularJson } from './angular-json-file';
import { PackageJson } from './package-json';
import { GetPackageJson } from './package-json-file';
import { CollectionJson } from './collection-json';
import { GetJsonFile } from './json-file';

export function GetProject(host: Tree, projectName: string): AngularProject {

  const angularJson = new Angular(GetAngularJson(host));

  if (!angularJson.projects.has(projectName)) {
    throw new SchematicsException(`The project '${projectName}' does not exists.`);
  }

  return angularJson.projects.get(projectName)!;
}

export function GetProjectPrefix(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const prefix = project.prefix;

  if (!prefix) {
    throw new SchematicsException(`The project '${projectName}' does not have a prefix`);
  }

  return prefix;

}

export function GetProjectRoot(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const root = project.root;

  if (!root) {
    throw new SchematicsException(`The project '${projectName}' does not have a root path`);
  }

  return root;

}

export function GetProjectType(host: Tree, projectName: string): 'library' | 'application' {

  const project = GetProject(host, projectName);
  const projectType = project.projectType;

  if (!projectType) {
    throw new SchematicsException(`The project '${projectName}' does not have a project type`);
  }

  if (projectType !== 'library' && projectType !== 'application') {
    throw new SchematicsException(`The project '${projectName}' has unknown type '${projectType}'`)
  }

  return projectType;

}

export function GetProjectSourceRoot(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const sourceRoot = project.sourceRoot;

  if (!sourceRoot) {
    throw new SchematicsException(`The project '${projectName}' does not have a source root path`);
  }

  return sourceRoot;

}

export function GetRelativePathToProjectRoot(host: Tree, projectName: string): string {

  const projectRoot = GetProjectRoot(host, projectName);

  return relative(projectRoot, '/');

}

export function GetProjectPackageJson(host: Tree, projectName: string): PackageJson {

  const projectRoot = GetProjectRoot(host, projectName);

  return GetPackageJson(host, projectRoot);

}

export function IsProjectType(host: Tree, projectName: string, type: 'library' | 'application'): boolean {
  return GetProjectType(host, projectName) === type;
}

export function AssertProjectType(host: Tree, projectName: string, type: 'library' | 'application'): void {
  if (!IsProjectType(host, projectName, type)) {
    throw new SchematicsException(`The project '${projectName}' has not the type '${type}'.`);
  }
}

export function GetProjectCollectionJson(host: Tree, projectName: string): CollectionJson {

  const projectPackageJson = GetProjectPackageJson(host, projectName);
  const projectRoot = GetProjectRoot(host, projectName);

  if (projectPackageJson.schematics) {
    const collectionJsonPath = join(projectRoot, projectPackageJson.schematics);
    if (host.exists(collectionJsonPath)) {
      return GetJsonFile(host, collectionJsonPath);
    } else {
      throw new SchematicsException(`The collection.json path for the project '${projectName}' does not exists`);
    }
  } else {
    throw new SchematicsException(`The project '${projectName}' does not have a schematics property in the package.json`);
  }

}

export function GetProjectPeerDependencies(host: Tree, projectName: string): Record<string, string> {

  const projectPackageJson = GetProjectPackageJson(host, projectName);

  return projectPackageJson.peerDependencies ?? {};

}