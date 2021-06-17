import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { buildDefaultPath, getWorkspace } from '../utilities';
import { join } from 'path';

export interface ViewComponentOptions {
  name: string;
  path: string;
  project: string;
  prefix: string;
}

export default function(schema: ViewComponentOptions): Rule {

  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const project   = workspace.projects.get(schema.project as string);

    let basePath = schema.path;

    if (basePath === undefined && project) {
      basePath = buildDefaultPath(project);
    }


    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...schema
          }),
          move(join(basePath, strings.dasherize(schema.name) + '-view'))
        ])
      )

    ]);

  };
}
