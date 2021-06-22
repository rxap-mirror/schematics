import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  schematic,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { AddPluginConfigSchematicSchema } from './schema'
import { strings } from '@angular-devkit/core';
import { GetProjectPackageJson, GuessProjectName, GuessSchematicRoot } from '@rxap/schematics-utilities';

export default function (options: AddPluginConfigSchematicSchema): Rule {

  return async (host: Tree) => {

    const projectName = GuessProjectName(host, options);
    const projectPackageJson = GetProjectPackageJson(host, projectName);

    return chain([
      schematic('add-schematic', {
        project: options.project,
        name: options.name,
        path: options.path,
        description: options.description ?? `Adds the builder ${projectPackageJson.name}:${options.defaultBuilder} to the specified project`,
      }),
      tree => {
        const schematicRoot = GuessSchematicRoot(tree, projectName);
        if (!schematicRoot) {
          throw new SchematicsException('The schematic root could not be determined.');
        }
        return mergeWith(apply(url('./files'), [
          applyTemplates({
            ...strings,
            ...options,
            packageName: projectPackageJson.name,
          }),
          move(schematicRoot)
        ]), MergeStrategy.Overwrite);
      }
    ]);

  };

}
