import {
  apply,
  applyTemplates,
  chain,
  forEach,
  mergeWith,
  Rule,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { ConfigCommitlintSchema } from './schema'
import { AddPackageJsonDevDependency } from '@rxap/schematics-utilities';

export default function (options: ConfigCommitlintSchema): Rule {

  return async (host: Tree) => {

    let packageName: string;

    switch (options.extend) {

      case 'conventional':
        packageName = '@commitlint/config-conventional';
        break;

      case 'lerna':
        packageName = '@commitlint/config-lerna-scopes';
        break;

      case 'angular':
        packageName = '@commitlint/config-angular'
        break;

      default:
        throw new SchematicsException(`The extend '${options.extend}' is not supported.`);

    }

    return chain([
      AddPackageJsonDevDependency(packageName),
      AddPackageJsonDevDependency('@commitlint/cli'),
      AddPackageJsonDevDependency('husky'),
      mergeWith(apply(url('./files'), [
        applyTemplates({ packageName }),
        forEach(entry => {
          if (host.exists(entry.path)) {
            if (options.overwrite) {
              host.overwrite(entry.path, entry.content);
            }
            return null;
          }
          return entry;
        })
      ]))
    ]);

  };

}
