import {
  apply,
  applyTemplates,
  chain,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  schematic,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { ConfigPluginNgAddSchema } from './schema'
import { GetProjectPackageJson, GuessSchematicRoot } from '@rxap/schematics-utilities';
import { strings } from '@angular-devkit/core';

const { dasherize } = strings;

export default function (options: ConfigPluginNgAddSchema): Rule {

  return async (host: Tree) => {

    const projectPackageJson = GetProjectPackageJson(host, options.project);

    return chain([
      schematic('config-ng-add', {
        project: options.project,
        save: options.save,
      }),
      tree => {
        const schematicRoot = GuessSchematicRoot(tree, options.project);
        if (!schematicRoot) {
          throw new SchematicsException('The schematic root could not be determined.');
        }
        return mergeWith(apply(url('./files'), [
          applyTemplates({
            packageName: projectPackageJson.name,
            schemaId: [ dasherize(options.project), dasherize('ng-add') ].join('-'),
          }),
          move(schematicRoot),
          forEach(entry => {
            if (host.exists(entry.path)) {
              host.overwrite(entry.path, entry.content);
              return null
            }
            return entry;
          })
        ]), MergeStrategy.Overwrite)
      },
    ]);

  };

}
