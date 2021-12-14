import {
  apply,
  chain,
  externalSchematic,
  forEach,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import { StorybookConfigurationSchema } from './schema';
import { createDefaultPath } from '@schematics/angular/utility/workspace';
import {
  join,
  relative
} from 'path';
import { UpdateAngularJson } from '@rxap/schematics-utilities';
import { strings } from '@angular-devkit/core';

const { dasherize } = strings;

export default function(options: StorybookConfigurationSchema): Rule {

  return async (host: Tree) => {

    const projectRootPath = (await createDefaultPath(host, options.name)).replace(/\/src\/lib$/, '');

    const relativePathToProjectRoot = relative(projectRootPath, '/');
    const pathToProjectStorybook = join(relativePathToProjectRoot, '..', '.storybook');

    return chain([
      externalSchematic(
        '@nrwl/angular',
        'storybook-configuration',
        options
      ),
      UpdateAngularJson(workspace => {

        const project = workspace.projects.get(options.name);

        if (!project) {
          throw new Error(`Could not find project '${project}' in workspace`);
        }

        const storybook = project.targets.get('storybook');

        if (!storybook) {
          throw new Error('Could not find project target storybook.');
        }

        if (!storybook.options) {
          throw new Error('FATAL: this state should never be reached.');
        }

        storybook.options.staticDir = [ './.storybook/public' ];

        const buildStorybook = project.targets.get('build-storybook');

        if (!buildStorybook) {
          throw new Error('Could not find project target build-storybook.');
        }

        if (!buildStorybook.options) {
          throw new Error('FATAL: this state should never be reached.');
        }

        buildStorybook.options.staticDir = [ './.storybook/public' ];

      }),
      mergeWith(apply(url('./files'), [
        template({
          pathToProjectStorybook,
          projectName: dasherize(options.name)
        }),
        move(projectRootPath),
        forEach(entry => {
          if (host.exists(entry.path)) {
            host.overwrite(entry.path, entry.content);
          }
          return entry;
        })
      ]), MergeStrategy.Overwrite)
    ]);

  };

}
