import { chain, Rule, Tree, } from '@angular-devkit/schematics';
import { join } from 'path';
import { strings } from '@angular-devkit/core';

const dasherize = strings.dasherize;

export interface PackageScript {
  name: string;
  'scss-bundle': string;
}

export interface PackageJson {
  scripts?: { [ key: string ]: string };
}

export default function(options: PackageScript): Rule {
  return async (host: Tree) => {

    const name = options.name;

    return chain([
      (tree: Tree) => {

        const path = join('libs', dasherize(name), 'package.json');

        const packageJson: PackageJson = JSON.parse(tree.get(path)!.content.toString('utf-8'));

        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }

        const scripts: { [ key: string ]: string } = {
          'prebuild:prod':           'yarn update-dependencies',
          'prebuild:prod:with-deps': 'yarn update-dependencies',
          'pretest':                 'yarn build',
          'pretest:prod':            'yarn build:prod',
          'pretest:with-deps':       'yarn build:with-deps',
          'pretest:prod:with-deps':  'yarn build:prod:with-deps',
          'predeploy':               'yarn test:prod',
          'predeploy:with-deps':     'yarn test:prod:with-deps',

          'build:base':           `yarn --cwd ../../ nx run ${dasherize(name)}:build`,
          'build':                'yarn build:base',
          'build:prod':           'yarn build:base --prod',
          'build:with-deps':      'yarn build:base --with-deps',
          'build:prod:with-deps': 'yarn build:base --prod --with-deps',

          'test:base':           `yarn --cwd ../../ nx run ${dasherize(name)}:test`,
          'test':                'yarn test:base',
          'test:prod':           'yarn test:base --prod',
          'test:with-deps':      'yarn test:base --with-deps',
          'test:prod:with-deps': 'yarn test:base --prod --with-deps',

          'update-dependencies': `yarn --cwd ../../ nx workspace-schematic library-dependencies ${dasherize(name)}`,

          'deploy:base':      `yarn --cwd ../../dist/libs/${dasherize(name)} publish`,
          'deploy':           'yarn deploy:base',
          'deploy:with-deps': 'yarn deploy:base',
        };

        if (options[ 'scss-bundle' ]) {
          scripts[ 'postbuild:base' ] = 'yarn scss-bundle';
          scripts[ 'scss-bundle' ]
                                      = `yarn --cwd ../../ scss-bundle --outFile dist/libs/${dasherize(name)}/_theming.scss --rootDir libs/${dasherize(name)}/src --ignoreImports ~@angular/.* --entryFile libs/${dasherize(
            name)}/src/_index.scss --project ./`;
        }

        packageJson.scripts = Object.assign({}, packageJson.scripts, scripts);

        host.overwrite(path, JSON.stringify(packageJson, undefined, 2));

      }
    ]);

  };
}
