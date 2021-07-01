import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';
import { AddSchematic } from '../schema';
import { strings } from '@angular-devkit/core';
import {
  CheckIfPackagesAreInstalled,
  GetProjectRoot,
  GuessProjectName,
  GuessSchematicRoot,
  HasProjectCollectionJsonFile,
  UpdateCollectionJson
} from '@rxap/schematics-utilities';
import { join, relative } from 'path';

const { dasherize } = strings;

export default function (options: AddSchematic): Rule {

  return async (host: Tree) => {

    const projectName = GuessProjectName(host, options);
    const projectRoot = GetProjectRoot(host, projectName);

    return chain([
      !HasProjectCollectionJsonFile(host, projectName) ? noop() : chain([
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
      ]),
      tree => {
        const schematicRoot = GuessSchematicRoot(tree, projectName);
        if (!schematicRoot) {
          throw new SchematicsException('The schematic root could not be determined.');
        }
        let schematicName = dasherize(options.name);
        let schematicBasePath = '';
        if (options.group) {
          schematicBasePath = dasherize(options.group);
          schematicName = [ dasherize(options.group), schematicName ].join('-');
        }
        return chain([
          mergeWith(apply(url('./files'), [
            applyTemplates({
              ...strings,
              ...options,
              schemaId: [ dasherize(projectName), dasherize(schematicName) ].join('-'),
            }),
            move(join(schematicRoot, schematicBasePath))
          ])),
          UpdateCollectionJson(collection => {

            if (!collection.schematics) {
              collection.schematics = {};
            }

            collection.schematics[schematicName] = {
              description: options.description,
              factory: `./${join(relative(projectRoot, schematicRoot), schematicBasePath)}/${dasherize(options.name)}/index`,
              schema: `./${join(relative(projectRoot, schematicRoot), schematicBasePath)}/${dasherize(options.name)}/schema.json`
            };

          }, { projectName }),
        ])
      },
    ]);

  };

}
