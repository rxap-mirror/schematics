import { Schema } from './schema';
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
  url
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import {
  AssertProjectType,
  GetProjectPackageJson,
  GetProjectRoot,
  GuessSchematicRoot,
  UpdatePackageJson
} from '@rxap/schematics-utilities';

const { dasherize } = strings;

export default function (options: Schema): Rule {
  return (host) => {

    AssertProjectType(host, options.project, 'library');

    const projectRoot = GetProjectRoot(host, options.project);

    const projectPackageJson = GetProjectPackageJson(host, options.project);

    return chain([
      schematic('add-schematic', {
        name: 'ng-add',
        project: options.project,
        description: `Setup the package ${projectPackageJson.name} for the workspace.`
      }),
      tree => {
        const schematicRoot = GuessSchematicRoot(tree, options.project);
        if (!schematicRoot) {
          throw new SchematicsException('The schematic root could not be determined.');
        }
        return mergeWith(apply(url('./files'), [
          applyTemplates({
            schemaId: [ dasherize(options.project), dasherize('ng-add') ].join('-'),
          }),
          move(schematicRoot),
          forEach(entry => {
            if (host.exists(entry.path)) {
              host.overwrite(entry.path, entry.content)
              return null
            }
            return entry;
          })
        ]), MergeStrategy.Overwrite);
      },
      UpdatePackageJson(packageJson => {

        if (!packageJson['ng-add']) {
          packageJson['ng-add'] = {};
        }

        if (options.save === 'false') {
          packageJson['ng-add'].save = false;
        } else {
          packageJson['ng-add'].save = options.save ?? true;
        }

      }, {
        basePath: projectRoot
      })
    ]);

  }
}
