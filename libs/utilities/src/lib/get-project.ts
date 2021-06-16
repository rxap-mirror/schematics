import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { relative } from 'path';
import { Angular, AngularProject, GetAngularJson } from './angular-json-file';

export function GetProject(host: Tree, projectName: string): AngularProject {

  const angularJson = new Angular(GetAngularJson(host));

  if (!angularJson.projects.has(projectName)) {
    throw new SchematicsException(`The project '${projectName}' does not exists.`);
  }

  return angularJson.projects.get(projectName);
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

export function GetProjectType(host: Tree, projectName: string): string {

  const project = GetProject(host, projectName);
  const projectType = project.projectType;

  if (!projectType) {
    throw new SchematicsException(`The project '${projectName}' does not have a project type`);
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
