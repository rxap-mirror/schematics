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
import { relative } from 'path';

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
        return chain([
          mergeWith(apply(url('./files'), [
            applyTemplates({
              ...strings,
              ...options,
              schemaId: [ dasherize(projectName), dasherize(options.name) ].join('-'),
            }),
            move(schematicRoot)
          ])),
          UpdateCollectionJson(collection => {

            if (!collection.schematics) {
              collection.schematics = {};
            }

            collection.schematics[dasherize(options.name)] = {
              description: options.description,
              factory: `./${relative(projectRoot, schematicRoot)}/${dasherize(options.name)}/index`,
              schema: `./${relative(projectRoot, schematicRoot)}/${dasherize(options.name)}/schema.json`
            };

          }, { projectName }),
        ])
      },
    ]);

  };

}
