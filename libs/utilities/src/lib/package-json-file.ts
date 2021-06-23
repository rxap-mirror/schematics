import { chain, externalSchematic, Rule, Tree } from '@angular-devkit/schematics';
import { PackageJson } from './package-json';
import { dirname, join } from 'path';
import { GetJsonFile, UpdateJsonFile, UpdateJsonFileOptions } from './json-file';
import { CoerceProperty } from '@rxap/utilities';
import { exec } from 'child_process';
import gt from 'semver/functions/gt';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { CollectionJson } from './collection-json';

export function GetPackageJson(host: Tree, basePath: string = ''): PackageJson {
  return GetJsonFile(host, join(basePath, 'package.json'));
}

export interface UpdatePackageJsonOptions extends UpdateJsonFileOptions {
  basePath?: string;
}


export function UpdatePackageJson(
  updaterOrJsonFile: PackageJson | ((packageJson: PackageJson) => void | PromiseLike<void>),
  options?: UpdatePackageJsonOptions,
): Rule {
  return UpdateJsonFile(updaterOrJsonFile, join(options?.basePath ?? '', 'package.json'), options);
}

export function AddPackageJsonScript(
  scriptName: string,
  script: string,
  options?: UpdatePackageJsonOptions,
): Rule {
  return UpdatePackageJson(
    packageJson => {
      CoerceProperty(packageJson, 'scripts', {});
      packageJson.scripts![scriptName] = script;
    },
    options
  );
}

export function GetLatestPackageVersion(packageName: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(`npm view ${packageName} version`, (err, stdout, stderr) => {
      if (err) {
        reject(stderr);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export interface AddPackageJsonDependencyOptions extends UpdatePackageJsonOptions {
  /**
   * true - only update the dependency if not already exists or greater then the current version
   */
  soft?: boolean;
}

export function AddPackageJsonDependency(
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options?: AddPackageJsonDependencyOptions,
): Rule {
  return async () => {
    if (packageVersion === 'latest') {
      packageVersion = await GetLatestPackageVersion(packageName);
    }

    return UpdatePackageJson(
      packageJson => {
        CoerceProperty(packageJson, 'dependencies', {});
        if (options?.soft) {
          if (packageJson.dependencies![packageName]) {
            if (gt(packageJson.dependencies![packageName], packageVersion)) {
              return;
            }
          }
        }
        packageJson.dependencies![packageName] = packageVersion;
      },
      options
    );
  };
}

export function AddPackageJsonDevDependency(
  packageName: string,
  packageVersion: string | 'latest' = 'latest',
  options?: AddPackageJsonDependencyOptions,
): Rule {
  return async () => {

    if (packageVersion === 'latest') {
      packageVersion = await GetLatestPackageVersion(packageName);
    }

    return UpdatePackageJson(
      packageJson => {
        CoerceProperty(packageJson, 'devDependencies', {});
        if (options?.soft) {
          if (packageJson.dependencies![packageName]) {
            if (gt(packageJson.dependencies![packageName], packageVersion)) {
              return;
            }
          }
        }
        packageJson.devDependencies![packageName] = packageVersion;
      },
      options,
    );

  };
}

export function InstallPeerDependencies(): Rule {
  return (host, context) => {
    const packageJson = require(join(context.schematic.description.collection.name, 'package.json'));

    const peerDependencies = packageJson.peerDependencies ?? {};

    return chain([
      chain(Object.entries(peerDependencies as Record<string, string>).map(([ name, version ]: [ string, string ]) => {
        if (packageJson['ng-add']?.save === 'devDependency') {
          return AddPackageJsonDevDependency(name, version);
        } else {
          return AddPackageJsonDependency(name, version);
        }
      })),
      (_, context) => {
        context.addTask(new NodePackageInstallTask());
      },
      chain(Object.keys(peerDependencies).map(name => (tree) => {
        const peerPackageDirname = dirname(require.resolve(join(name, 'package.json')));
        const peerPackageJson = require(join(name, 'package.json'));
        if (peerPackageJson.schematics) {
          const peerCollectionJsonFilePath = join(peerPackageDirname, peerPackageJson.schematics);
          if (tree.exists(peerCollectionJsonFilePath)) {
            const collectionJson = GetJsonFile<CollectionJson>(tree, peerCollectionJsonFilePath);
            if (collectionJson.schematics['ng-add']) {
              return externalSchematic(name, 'ng-add', {});
            }
          }
        }
      }))
    ]);
  }
}

