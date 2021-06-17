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
      if(err) {
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
        packageJson.dependencies![ packageName ] = packageVersion;
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
        packageJson.devDependencies![ packageName ] = packageVersion;
      },
      options,
    );

  };
}
