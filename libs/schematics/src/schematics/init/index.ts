import {
  apply,
  chain,
  externalSchematic,
  forEach,
  MergeStrategy,
  mergeWith,
  noop,
  Rule,
  schematic,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import {
  addPackageJsonDependencies,
  addPackageJsonScripts,
  readAngularJsonFile,
  writeAngularJsonFile,
} from '../utilities';
import { InitSchema } from './schema';

function updateAngularJson(): Rule {
  return (tree: Tree) => {

    const angularJson = readAngularJsonFile(tree);

    if (!angularJson.cli) {
      angularJson.cli = {};
    }

    angularJson.cli.packageManager    = 'yarn';
    angularJson.cli.defaultCollection = '@rxap/schematics';

    if (!angularJson.schematics) {
      angularJson.schematics = {};
    }

    if (!angularJson.schematics.hasOwnProperty('@nrwl/angular:application')) {
      angularJson.schematics[ '@nrwl/angular:application' ] = {
        unitTestRunner: 'jest',
        e2eTestRunner:  'cypress'
      };
    }

    if (!angularJson.schematics.hasOwnProperty('@nrwl/angular:library')) {
      angularJson.schematics[ '@nrwl/angular:library' ] = {
        unitTestRunner: 'jest'
      };
    }

    angularJson.schematics[ '@nrwl/angular:library' ].linter = 'eslint';

    if (!angularJson.schematics[ '@schematics/angular:component' ]) {
      angularJson.schematics[ '@schematics/angular:component' ] = {};
    }

    angularJson.schematics[ '@schematics/angular:component' ].changeDetection = 'OnPush';
    angularJson.schematics[ '@schematics/angular:component' ].skipTests       = true;

    if (!angularJson.schematics[ '@schematics/angular:module' ]) {
      angularJson.schematics[ '@schematics/angular:module' ] = {};
    }

    angularJson.schematics[ '@schematics/angular:module' ].skipTests = true;

    writeAngularJsonFile(tree, angularJson);

  };
}

export default function(options: InitSchema): Rule {

  return async (host: Tree) => {

    const port = Math.floor(Math.random() * 1000) + 4000;

    return chain([
      (tree) => tree.delete('.gitignore'),
      (tree) => tree.delete('README.md'),
      externalSchematic('@nrwl/angular', 'init', {
        unitTestRunner: 'jest',
        e2eTestRunner:  'cypress',
      }),
      (tree) => tree.delete('jest.config.js'),
      mergeWith(apply(url('./files'), [
        template({}),
        forEach(entry => {
          if (host.exists(entry.path)) {
            host.overwrite(entry.path, entry.content);
          }
          return entry;
        }),
      ]), MergeStrategy.Overwrite),
      updateAngularJson(),
      schematic('pwa-init', {}),
      schematic('library-shared', {}),
      options.storybook ? schematic('storybook-configuration', {}) : noop(),
      addPackageJsonDependencies(
        NodeDependencyType.Dev,
        '!webpack-extension-reloader@1',
        '!jest-extended@0',
        '!commitizen@*',
        '!@commitlint/cli@*',
        '!@commitlint/config-angular@*',
        '!@commitlint/config-conventional@*',
        '!@commitlint/prompt@*',
        '!husky@*',
      ),
      addPackageJsonScripts({
        'start:browser':                  `chromium --allow-file-access-from-files --disable-web-security --user-data-dir="./chromium-user-data" http://localhost:${port}`,
        'start':                          `nx serve --port ${port}`,
        'build:documenation:shared:json': 'compodoc -p ./libs/shared/tsconfig.json -e json -d .',
        'prebuild:storybook':             'yarn build:documenation:shared:json',
        'prestart:storybook':             'yarn build:documenation:shared:json',
        'build:storybook':                'nx run shared:build-storybook',
        'start:storybook':                'nx run shared:storybook',
        'jest':                           'jest',
        'compodoc': 'compodoc'
      }),
      options.zeplin ? schematic('zeplin-configuration', {
        url: options.zeplinConnectUrl,
        project: options.zeplinProject,
        styleguide: options.zeplinStyleguide
      }) : noop(),
    ]);

  };

}
