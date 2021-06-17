import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';
import { AddSchematic } from '../schema';
import { strings } from '@angular-devkit/core';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import { join } from 'path';

const { dasherize } = strings;

export default function(options: AddSchematic): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = join(projectRootPath.replace(/\/src\/lib$/, ''), 'schematics');
    } else if (options.path[0] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates({
          ...strings,
          ...options
        }),
        move(options.path)
      ])),
      (tree) => {

        const collectionJsonPath = join(options.path!, 'collection.json');

        if (!tree.exists(collectionJsonPath)) {
          throw new SchematicsException(`Could not find collection.json in '${options.path}'`);
        }

        const collectionJson = JSON.parse(tree.read(collectionJsonPath)!.toString());

        collectionJson.schematics[ dasherize(options.name) ] = {
          description: options.description,
          factory:     `./${dasherize(options.name)}/index`,
          schema:      `./${dasherize(options.name)}/schema.json`
        };

        tree.overwrite(collectionJsonPath, JSON.stringify(collectionJson, null, 2));

      }
    ]);

  };

}
