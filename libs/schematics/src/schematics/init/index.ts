import {
  apply,
  chain,
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
import { InitSchema } from './schema';
import {
  AddPackageJsonDevDependency,
  AddPackageJsonScript,
  InstallNodePackages,
  UpdateAngularJson
} from '@rxap/schematics-utilities';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

export default function(options: InitSchema): Rule {

  return async (host: Tree) => {

    return chain([
      AddPackageJsonDevDependency('webpack-extension-reloader'),
      AddPackageJsonDevDependency('env-cmd'),
      schematic('config-commitlint', { overwrite: options.overwrite }),
      schematic('config-renovate', { overwrite: options.overwrite }),
      schematic('config-semantic-release', { overwrite: options.overwrite }),
      schematic('config-gitlab-ci', { overwrite: options.overwrite }),
      mergeWith(apply(url('./files'), [
        template({}),
        forEach(entry => {
          if (host.exists(entry.path)) {
            host.overwrite(entry.path, entry.content);
            return null;
          }
          return entry;
        }),
      ]), MergeStrategy.Overwrite),
      UpdateAngularJson(angular => {

        angular.cli.packageManager = 'yarn';
        angular.cli.defaultCollection = '@rxap/schematics';

        if (!angular.schematics['@schematics/angular:component']) {
          angular.schematics['@schematics/angular:component'] = {};
        }

        angular.schematics['@schematics/angular:component'].changeDetection = 'OnPush';

        if (!angular.schematics['@schematics/angular:module']) {
          angular.schematics['@schematics/angular:module'] = {};
        }

        angular.schematics['@schematics/angular:module'].skipTests = true;

      }),
      AddPackageJsonScript('jest', 'jest'),
      AddPackageJsonScript('ng', 'env-cmd ng'),
      tree => {
        if (!tree.exists('.env')) {
          tree.create('.env', '');
        }
      },
      InstallNodePackages(),
      options.preset === 'angular' ? chain([
        AddPackageJsonDevDependency('@nrwl/angular'),
        (_, context) => {
          const installTaskId = context.addTask(new NodePackageInstallTask());
          context.addTask(new RunSchematicTask('@nrwl/angular', 'init', {
            unitTestRunner: 'jest',
            e2eTestRunner: 'cypress',
          }), [ installTaskId ])
        },
      ]) : noop(),
    ]);

  };

}
