import { apply, applyTemplates, chain, mergeWith, move, Rule, Tree, url } from '@angular-devkit/schematics';
import { AddSchematic } from '../schema';
import { strings } from '@angular-devkit/core';
import { GuessProjectName, GuessSchematicRoot, UpdateCollectionJson } from '@rxap/schematics-utilities';

const { dasherize } = strings;

export default function(options: AddSchematic): Rule {

  return async (host: Tree) => {

    const projectName = GuessProjectName(host, options);
    const schematicRoot = GuessSchematicRoot(host, projectName);

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
          factory: `./${dasherize(options.name)}/index`,
          schema: `./${dasherize(options.name)}/schema.json`
        };

      }, { projectName }),
    ]);

  };

}
