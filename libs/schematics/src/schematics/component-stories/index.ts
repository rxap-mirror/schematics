import { apply, applyTemplates, chain, mergeWith, move, Rule, Tree, url } from '@angular-devkit/schematics';
import { createDefaultPath, getWorkspace } from '@schematics/angular/utility/workspace';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { AddStorySchema } from './schema';

export default function(options: AddStorySchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = await createDefaultPath(host, options.project as string);

    if (!options.path) {
      options.path = projectRootPath;
    } else if (options.path[ 0 ] === '/') {
      options.path = join(projectRootPath, options.path);
    }

    if (!options.prefix && options.project) {
      const workspace = await getWorkspace(host);
      if (workspace) {
        const project = workspace.projects.get(options.project);
        if (!project) {
          throw new Error(`Could not find project '${options.project}' in workspace.`);
        }
        options.prefix = project.prefix;
      }
    }

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates({
          ...strings,
          ...options
        }),
        move(options.path)
      ]))
    ]);

  };

}
