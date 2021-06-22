import { Schema } from './schema';
import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  forEach,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  url
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import {
  AssertProjectType,
  CheckIfPackagesAreInstalled,
  GetProjectPackageJson,
  GetProjectRoot,
  GetSchematicRoot,
  UpdatePackageJson
} from '@rxap/schematics-utilities';
import { dirname, join } from 'path';

export default function (options: Schema): Rule {
  return (host, context) => {

    console.log(join(dirname(require.resolve(join(context.schematic.description.collection.name, 'package.json'))), 'package.json'));

    AssertProjectType(host, options.project, 'library');

    const projectRoot = GetProjectRoot(host, options.project);

    const projectPackageJson = GetProjectPackageJson(host, options.project);

    let schematicRoot: string | null = GetSchematicRoot(host, options.project);

    if (schematicRoot) {
      console.log(`The project ${options.project} has schematics. The ng-add schematic will be added if not exists.`);
    }

    return chain([
      schematicRoot ? noop() : chain([
        CheckIfPackagesAreInstalled([
          '@rxap/plugin-library'
        ]),
        externalSchematic(
          '@rxap/plugin-library',
          'config-schematics',
          {
            project: options.project,
            type: 'schematics'
          }
        ),
        tree => {
          schematicRoot = GetSchematicRoot(tree, options.project);
          if (!schematicRoot) {
            throw new SchematicsException('The schematic root could not be determined.');
          }
        }
      ]),
      mergeWith(apply(url('./files'), [
        applyTemplates({
          id: strings.dasherize(projectPackageJson.name!),
        }),
        move(schematicRoot!),
        forEach(entry => {
          if (host.exists(entry.path)) {
            return null
          }
          return entry;
        })
      ])),
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
