import {
  apply,
  applyTemplates,
  chain,
  forEach,
  MergeStrategy,
  mergeWith,
  noop,
  Rule,
  schematic,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { InitSchema } from './schema';
import {
  AddPackageJsonDevDependency,
  AddPackageJsonScript,
  InstallNodePackages,
  MergeWithEnvFile,
  UpdateAngularJson
} from '@rxap/schematics-utilities';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

export default function(options: InitSchema): Rule {

  return async (host: Tree) => {

    return chain([
      options.preset === 'angular' ? chain([
        AddPackageJsonDevDependency('@nrwl/angular'),
        (_, context) => {
          const installTaskId = context.addTask(new NodePackageInstallTask());
          context.addTask(new RunSchematicTask('@nrwl/angular', 'init', {
            unitTestRunner: 'jest',
            e2eTestRunner: 'cypress',
            style: 'scss'
          }), [ installTaskId ])
        },
      ]) : noop(),
      options.preset === 'nest' ? chain([
        AddPackageJsonDevDependency('@nrwl/nest'),
        (_, context) => {
          const installTaskId = context.addTask(new NodePackageInstallTask());
          context.addTask(new RunSchematicTask('@nrwl/nest', 'init', {
            unitTestRunner: 'jest'
          }), [ installTaskId ])
        },
      ]) : noop(),
      AddPackageJsonDevDependency('webpack-extension-reloader'),
      AddPackageJsonDevDependency('env-cmd'),
      AddPackageJsonDevDependency('jest-junit'),
      schematic('config-commitlint', { overwrite: options.overwrite }),
      schematic('config-renovate', { overwrite: options.overwrite }),
      schematic('config-semantic-release', { overwrite: options.overwrite }),
      schematic('config-gitlab-ci', { overwrite: options.overwrite }),
      mergeWith(apply(url('./files'), [
        applyTemplates({}),
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
      MergeWithEnvFile({
        'NX_WORKSPACE_ROOT_PATH': process.cwd()
      }),
      InstallNodePackages(),
    ]);

  };

}
