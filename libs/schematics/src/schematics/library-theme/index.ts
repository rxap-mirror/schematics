import { apply, applyTemplates, chain, mergeWith, move, noop, Rule, Tree, url, } from '@angular-devkit/schematics';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { ModuleThemeSchema } from './schema';
import { AddPackageJsonDevDependency } from '@rxap/schematics-utilities';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

export default function (options: ModuleThemeSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    const indexScssPath = join(projectRootPath, '../');
    const indexScssFilePath = join(indexScssPath, '_index.scss');

    return chain([
      !host.exists(indexScssFilePath) ? mergeWith(apply(url('./files'), [
        applyTemplates({ ...options }),
        move(indexScssPath)
      ])) : noop(),
      options.bundle ? chain([
        AddPackageJsonDevDependency('@rxap/plugin-scss-bundle'),
        (_, context) => {
          const installTaskId = context.addTask(new NodePackageInstallTask());
          context.addTask(new RunSchematicTask('@rxap/plugin-scss-bundle', 'ng-add', { project: options.project }), [ installTaskId ]);
        }
      ]) : noop(),
    ]);

  };

}
