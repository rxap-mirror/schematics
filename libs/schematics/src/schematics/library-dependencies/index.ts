import { chain, Rule, Tree, } from '@angular-devkit/schematics';
import { join } from 'path';
import depcheck from 'depcheck';
import { LibraryDependenciesSchema } from './schema';

export interface PackageDependencies {
  name: string;
}

export interface PackageJson {
  peerDependencies?: { [ key: string ]: string };
  dependencies: { [ key: string ]: string }
}

export default function (options: LibraryDependenciesSchema): Rule {
  return async (host: Tree) => {

    const path = options.path;

    return chain([
      async (tree: Tree) => {

        const packageJsonPath = join('libs', path, 'package.json');
        const root            = (host as any)[ '_backend' ][ '_root' ];

        const packageJsonFile = tree.get(packageJsonPath);

        if (!packageJsonFile) {
          throw new Error(`Could not read package json file from: ${packageJsonPath}`);
        }

        // read the library package.json
        const packageJson: PackageJson = JSON.parse(packageJsonFile.content.toString('utf-8'));

        const rootPackageJsonFile = tree.get('package.json');

        if (!rootPackageJsonFile) {
          throw new Error(`Could not read package json file from: /package.json`);
        }

        // read the root project package.json
        const rootPackageJson: PackageJson = JSON.parse(rootPackageJsonFile.content.toString('utf-8'));

        if (!packageJson.peerDependencies) {
          packageJson.peerDependencies = {};
        }

        const depCheckResult = await depcheck(join(root, 'libs', path), {});

        const peerDependencies: { [ key: string ]: string } = {};

        const ignorePattern = [
          /\.sandbox\.ts$/,
          /\.spec\.ts$/,
          /\.stories\.ts$/,
          /tslint\.json$/,
          /test-setup\.ts$/,
        ];

        const using: { [ key: string ]: string[] } = depCheckResult.using;

        const missing: string[] = [];

        for (const [ dependency, files ] of Object.entries(using)) {

          if (files.every(file => ignorePattern.some(pattern => file.match(pattern)))) {
            continue;
          }

          if (dependency.match(/@rxap/)) {

            const libMatch = dependency.match(/@rxap\/([^\/]+)/);

            const lib = libMatch![ 1 ];

            const depRxapLibraryPackageJsonFilePath = join('libs', 'rxap', lib, 'package.json');

            const depRxapLibraryPackageJsonFile = tree.get(depRxapLibraryPackageJsonFilePath);

            if (!depRxapLibraryPackageJsonFile) {
              throw new Error(`Could not find sub rxap pacakge: ${lib} in path: ${depRxapLibraryPackageJsonFilePath}`);
            }

            peerDependencies[ `@rxap/${lib}` ] = '~' + JSON.parse(depRxapLibraryPackageJsonFile.content.toString('utf-8')).version;

          } else {

            const version = rootPackageJson.dependencies[ dependency ];

            if (!version) {
              // console.log(depCheckResult.using[ dependency ]);
              missing.push(dependency);
              // throw new Error(`Could not find version for package '${dependency}'!`);
            } else {

              peerDependencies[ dependency ] = version;

            }

          }

        }

        if (missing.length) {
          console.log('Some dependencies are not installed:', missing);
        }


        packageJson.peerDependencies = peerDependencies;

        host.overwrite(packageJsonPath, JSON.stringify(packageJson, undefined, 2));

      }
    ]);

  };
}
