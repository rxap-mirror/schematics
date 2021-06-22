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
import { GetProjectPackageJson, GetSchematicRoot } from '@rxap/schematics-utilities';

export default function (options: ConfigPluginNgAddSchema): Rule {

  return async (host: Tree) => {

    const projectPackageJson = GetProjectPackageJson(host, options.project);

    return chain([
      schematic('config-ng-add', {}),
      tree => {
        const schematicRoot = GetSchematicRoot(tree, options.project);
        if (!schematicRoot) {
          throw new SchematicsException('The schematic root could not be determined.');
        }
        return mergeWith(apply(url('./files'), [
          applyTemplates({
            packageName: projectPackageJson.name,
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
