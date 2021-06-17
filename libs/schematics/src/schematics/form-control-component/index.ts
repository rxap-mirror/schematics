import { apply, chain, mergeWith, move, Rule, template, Tree, url } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { join } from 'path';
import { buildDefaultPath, getWorkspace } from '../utilities';

export interface FormControlOptions {
  name: string;
  path: string;
  project: string;
  prefix: string;
}

export default function(options: FormControlOptions): Rule {
  return async (host: Tree) => {

    const workspace = await getWorkspace(host);
    const project   = workspace.projects.get(options.project as string);

    let basePath = options.path;

    if (basePath === undefined && project) {
      basePath = buildDefaultPath(project);
    }

    if (project) {
      options.prefix = project.prefix || options.prefix;
    }

    return chain([
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options
          }),
          move(join(basePath, strings.dasherize(options.name) + '-control'))
        ])
      )
    ]);

  };
}
