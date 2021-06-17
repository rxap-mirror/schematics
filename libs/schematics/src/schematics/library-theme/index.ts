import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  noop,
  Rule,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { addPackageJsonDependencies } from '../utilities';
import { ModuleThemeSchema } from './schema';
import { LatestVersions } from '../latest-versions';

export default function(options: ModuleThemeSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    const indexScssPath     = join(projectRootPath, '../');
    const indexScssFilePath = join(indexScssPath, '_index.scss');

    return chain([
      !host.exists(indexScssFilePath) ? mergeWith(apply(url('./files'), [
        applyTemplates({ ...options }),
        move(indexScssPath)
      ])) : noop(),
      options.bundle ? addPackageJsonDependencies(
        NodeDependencyType.Dev,
        '!@rxap/plugin-scss-bundle@' + LatestVersions.pluginScssBundle,
      ) : noop(),
      options.bundle ? externalSchematic('@rxap/plugin-scss-bundle', 'config', {
        project: options.project,
      }) : noop(),
      // TODO : move to @rxap/plugin-scss-bundle
      options.bundle ? addPackageJsonDependencies(
        NodeDependencyType.Dev,
        '!scss-bundle@3.1',
      ) : noop(),
    ]);

  };

}
