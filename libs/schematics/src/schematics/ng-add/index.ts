import { chain, noop, Rule } from '@angular-devkit/schematics';
import { AddPackageJsonDevDependency, InstallPeerDependencies } from '@rxap/schematics-utilities';
import { NgAddSchema } from './schema';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

export default function (options: NgAddSchema): Rule {

  return chain([
    InstallPeerDependencies(),
    options.init ? chain([
      AddPackageJsonDevDependency('@nrwl/angular'),
      (_, context) => {
        const installTaskId = context.addTask(new NodePackageInstallTask());
        context.addTask(new RunSchematicTask('init', { overwrite: options.overwrite }), [ installTaskId ])
      },
    ]) : noop(),
  ]);

}
