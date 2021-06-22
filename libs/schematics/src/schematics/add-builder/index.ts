import { apply, applyTemplates, chain, mergeWith, move, Rule, Tree, url, } from '@angular-devkit/schematics';
import { AddBuilderSchema } from './schema'
import { GetProjectRoot, GuessBuilderRoot, GuessProjectName, UpdateBuildersJson } from '@rxap/schematics-utilities';
import { relative } from 'path';
import { strings } from '@angular-devkit/core';

const { dasherize } = strings;

export default function (options: AddBuilderSchema): Rule {

  return async (host: Tree) => {

    const projectName = GuessProjectName(host, options);
    const buildersRoot = GuessBuilderRoot(host, projectName);
    const projectRoot = GetProjectRoot(host, projectName);

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates({
          ...strings,
          ...options,
          schemaId: [ dasherize(projectName), dasherize(options.name) ].join('-'),
        }),
        move(buildersRoot)
      ])),
      UpdateBuildersJson(collection => {

        if (!collection.builders) {
          collection.builders = {};
        }

        collection.builders[dasherize(options.name)] = {
          description: options.description,
          implementation: `./${relative(projectRoot, buildersRoot)}/${dasherize(options.name)}/index`,
          schema: `./${relative(projectRoot, buildersRoot)}/${dasherize(options.name)}/schema.json`
        };

      }, { projectName }),
    ]);

  };

}
